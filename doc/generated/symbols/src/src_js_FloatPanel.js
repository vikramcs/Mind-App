  1 /**
  2  * Creates a new FloatPanelFactory. This factory object can create new instances
  3  * of mindmaps.FloatPanel that are constrained inside the container.
  4  * 
  5  * @constructor
  6  * @param container
  7  */
  8 mindmaps.FloatPanelFactory = function(container) {
  9 	var $container = container.getContent();
 10 	var dialogs = [];
 11 	var paddingRight = 15;
 12 	var paddingTop = 5;
 13 
 14 	function setPosition(dialog) {
 15 		// reposition dialog on window resize
 16 		container.subscribe(mindmaps.CanvasContainer.Event.RESIZED, function() {
 17 			dialogs.forEach(function(dialog) {
 18 				if (dialog.visible) {
 19 					dialog.ensurePosition();
 20 				}
 21 			});
 22 		});
 23 
 24 		var ccw = $container.outerWidth();
 25 		var hh = $container.offset().top;
 26 		var dw = dialog.width();
 27 		var dh = dialog.height();
 28 		var heightOffset = dialogs.reduce(function(memo, dialog) {
 29 			return memo + dialog.height() + paddingTop;
 30 		}, 0);
 31 
 32 		dialog.setPosition(ccw - dw - paddingRight, hh + paddingTop
 33 				+ heightOffset);
 34 	}
 35 
 36 	/**
 37 	 * Creates a new FloatPanel.
 38 	 * 
 39 	 * @param {String} caption the float panel title
 40 	 * @param {jQuery} $content the content as a jquery object
 41 	 * @returns {mindmaps.FloatPanel}
 42 	 */
 43 	this.create = function(caption, $content) {
 44 		var dialog = new mindmaps.FloatPanel(caption, $container, $content);
 45 		setPosition(dialog);
 46 		dialogs.push(dialog);
 47 		return dialog;
 48 	};
 49 };
 50 
 51 /**
 52  * A reusable, draggable panel gui element. The panel is contained within the
 53  * container. When a $hideTarget is set, the hide/show animations will show a
 54  * transfer effect.
 55  * 
 56  * @constructor
 57  * @param {String} caption the float panel title
 58  * @param {jQuery} $container the surrounding container jquery object
 59  * @param {jQuery} $content the content as a jquery object
 60  */
 61 mindmaps.FloatPanel = function(caption, $container, $content) {
 62 	var self = this;
 63 	var animating = false;
 64 
 65 	this.caption = caption;
 66 	this.visible = false;
 67 	this.animationDuration = 400;
 68 
 69 	/**
 70 	 * Replaces the content in the panel.
 71 	 * 
 72 	 * @param {jQuery} $content
 73 	 */
 74 	this.setContent = function($content) {
 75 		this.clearContent();
 76 		$("div.ui-dialog-content", this.$widget).append($content);
 77 	};
 78 
 79 	/**
 80 	 * Clears the content of the panel.
 81 	 */
 82 	this.clearContent = function() {
 83 		$("div.ui-dialog-content", this.$widget).children().detach();
 84 	};
 85 
 86 	/**
 87 	 * @private
 88 	 */
 89 	this.$widget = (function() {
 90 		var $panel = $("#template-float-panel").tmpl({
 91 			title : caption
 92 		});
 93 		
 94 		// hide button
 95 		$panel.find(".ui-dialog-titlebar-close").click(function() {
 96 			self.hide();
 97 		});
 98 
 99 		// add content panel
100 		if ($content) {
101 			$panel.find(".ui-dialog-content").append($content);
102 		}
103 		
104 		// make draggable, hide, append to container
105 		$panel.draggable({
106 			containment : "parent",
107 			handle : "div.ui-dialog-titlebar",
108 			opacity : 0.75
109 		}).hide().appendTo($container);
110 		
111 		return $panel;
112 	})();
113 
114 	/**
115 	 * Hides the panel. Will show transfer effect if $hideTarget is set.
116 	 */
117 	this.hide = function() {
118 		if (!animating && this.visible) {
119 			this.visible = false;
120 			this.$widget.fadeOut(this.animationDuration * 1.5);
121 
122 			// show transfer effect is hide target is set
123 			if (this.$hideTarget) {
124 				this.transfer(this.$widget, this.$hideTarget);
125 			}
126 		}
127 	};
128 
129 	/**
130 	 * Shows the panel. Will show transfer effect if $hideTarget is set.
131 	 */
132 	this.show = function() {
133 		if (!animating && !this.visible) {
134 			this.visible = true;
135 			this.$widget.fadeIn(this.animationDuration * 1.5);
136 			this.ensurePosition();
137 
138 			// show transfer effect is hide target is set
139 			if (this.$hideTarget) {
140 				this.transfer(this.$hideTarget, this.$widget);
141 			}
142 		}
143 	};
144 
145 	/**
146 	 * Shows or hides the panel.
147 	 */
148 	this.toggle = function() {
149 		if (this.visible) {
150 			this.hide();
151 		} else {
152 			this.show();
153 		}
154 	};
155 
156 	/**
157 	 * Shows a transfer effect.
158 	 * 
159 	 * @private
160 	 * @param {jQuery} $from
161 	 * @param {jQuery} $to
162 	 */
163 	this.transfer = function($from, $to) {
164 		animating = true;
165 		var endPosition = $to.offset(), animation = {
166 			top : endPosition.top,
167 			left : endPosition.left,
168 			height : $to.innerHeight(),
169 			width : $to.innerWidth()
170 		}, startPosition = $from.offset(), transfer = $(
171 				'<div class="ui-effects-transfer"></div>').appendTo(
172 				document.body).css({
173 			top : startPosition.top,
174 			left : startPosition.left,
175 			height : $from.innerHeight(),
176 			width : $from.innerWidth(),
177 			position : 'absolute'
178 		}).animate(animation, this.animationDuration, "linear", function() {
179 			// end
180 			transfer.remove();
181 			animating = false;
182 		});
183 	};
184 
185 	/**
186 	 * 
187 	 * @returns {Number} the width.
188 	 */
189 	this.width = function() {
190 		return this.$widget.outerWidth();
191 	};
192 
193 	/**
194 	 * 
195 	 * @returns {Number} the height.
196 	 */
197 	this.height = function() {
198 		return this.$widget.outerHeight();
199 	};
200 
201 	/**
202 	 * 
203 	 * @returns {Object} the offset
204 	 */
205 	this.offset = function() {
206 		return this.$widget.offset();
207 	};
208 
209 	/**
210 	 * Sets the position of the panel relative to the container.
211 	 * 
212 	 * @param {Number} x
213 	 * @param {Number} y
214 	 */
215 	this.setPosition = function(x, y) {
216 		this.$widget.offset({
217 			left : x,
218 			top : y
219 		});
220 	};
221 
222 	/**
223 	 * Moves panel into view port if position exceeds the bounds of the
224 	 * container.
225 	 * 
226 	 * @private
227 	 */
228 	this.ensurePosition = function() {
229 		var cw = $container.outerWidth();
230 		var ch = $container.outerHeight();
231 		var col = $container.offset().left;
232 		var cot = $container.offset().top;
233 		var dw = this.width();
234 		var dh = this.height();
235 		var dol = this.offset().left;
236 		var dot = this.offset().top;
237 
238 		// window width is too small for current dialog position but bigger than
239 		// dialog width
240 		if (cw + col < dw + dol && cw >= dw) {
241 			this.setPosition(cw + col - dw, dot);
242 		}
243 
244 		// window height is too small for current dialog position but bigger
245 		// than dialog height
246 		if (ch + cot < dh + dot && ch >= dh) {
247 			this.setPosition(dol, ch + cot - dh);
248 		}
249 	};
250 
251 	/**
252 	 * Sets the hide target for the panel.
253 	 * 
254 	 * @param {jQuery} $target
255 	 */
256 	this.setHideTarget = function($target) {
257 		this.$hideTarget = $target;
258 	};
259 };
