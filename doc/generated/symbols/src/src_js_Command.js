  1 /**
  2  * Creates a new command. Base class for all commands
  3  * 
  4  * @constructor
  5  * @borrows EventEmitter
  6  */
  7 mindmaps.Command = function() {
  8 	this.id = "BASE_COMMAND";
  9 	this.shortcut = null;
 10 	/**
 11 	 * The handler function.
 12 	 * 
 13 	 * @private
 14 	 * @function
 15 	 */
 16 	this.handler = null;
 17 	this.label = null;
 18 	this.description = null;
 19 
 20 	/**
 21 	 * @private
 22 	 */
 23 	this.enabled = false;
 24 };
 25 
 26 /**
 27  * Events that can be emitted by a command object.
 28  * @namespace
 29  */
 30 mindmaps.Command.Event = {
 31 	HANDLER_REGISTERED : "HandlerRegisteredCommandEvent",
 32 	HANDLER_REMOVED : "HandlerRemovedCommandEvent",
 33 	ENABLED_CHANGED : "EnabledChangedCommandEvent"
 34 };
 35 
 36 mindmaps.Command.prototype = {
 37 	/**
 38 	 * Executes the command. Tries to call the handler function.
 39 	 */
 40 	execute : function() {
 41 		if (this.handler) {
 42 			this.handler();
 43 			if (mindmaps.DEBUG) {
 44 				console.log("handler called for", this.id);
 45 			}
 46 		} else {
 47 			if (mindmaps.DEBUG) {
 48 				console.log("no handler found for", this.id);
 49 			}
 50 		}
 51 	},
 52 
 53 	/**
 54 	 * Registers a new handler.
 55 	 * 
 56 	 * @param {Function} handler
 57 	 */
 58 	setHandler : function(handler) {
 59 		this.removeHandler();
 60 		this.handler = handler;
 61 		this.publish(mindmaps.Command.Event.HANDLER_REGISTERED);
 62 	},
 63 
 64 	/**
 65 	 * Removes the current handler.
 66 	 */
 67 	removeHandler : function() {
 68 		this.handler = null;
 69 		this.publish(mindmaps.Command.Event.HANDLER_REMOVED);
 70 	},
 71 
 72 	/**
 73 	 * Sets the enabled state of the command.
 74 	 * 
 75 	 * @param {Boolean} enabled
 76 	 */
 77 	setEnabled : function(enabled) {
 78 		this.enabled = enabled;
 79 		this.publish(mindmaps.Command.Event.ENABLED_CHANGED, enabled);
 80 	}
 81 };
 82 /**
 83  * Mixin EventEmitter into command objects.
 84  */
 85 EventEmitter.mixin(mindmaps.Command);
 86 
 87 /**
 88  * Node commands
 89  */
 90 
 91 /**
 92  * Creates a new CreateNodeCommand.
 93  * 
 94  * @constructor
 95  * @augments mindmaps.Command
 96  */
 97 mindmaps.CreateNodeCommand = function() {
 98 	this.id = "CREATE_NODE_COMMAND";
 99 	this.shortcut = "insert";
100 	this.label = "Add";
101 	this.icon = "ui-icon-plusthick";
102 	this.description = "Creates a new node";
103 };
104 mindmaps.CreateNodeCommand.prototype = new mindmaps.Command();
105 
106 /**
107  * Creates a new DeleteNodeCommand.
108  * 
109  * @constructor
110  * @augments mindmaps.Command
111  */
112 mindmaps.DeleteNodeCommand = function() {
113 	this.id = "DELETE_NODE_COMMAND";
114 	this.shortcut = "del";
115 	this.label = "Delete";
116 	this.icon = "ui-icon-minusthick";
117 	this.description = "Deletes a new node";
118 };
119 mindmaps.DeleteNodeCommand.prototype = new mindmaps.Command();
120 
121 /**
122  * Creates a new EditNodeCaptionCommand.
123  * 
124  * @constructor
125  * @augments mindmaps.Command
126  */
127 mindmaps.EditNodeCaptionCommand = function() {
128 	this.id = "EDIT_NODE_CAPTION_COMMAND";
129 	this.shortcut = "F2";
130 	this.label = "Edit node caption";
131 	this.description = "Edits the node text";
132 };
133 mindmaps.EditNodeCaptionCommand.prototype = new mindmaps.Command();
134 
135 /**
136  * Creates a new ToggleNodeFoldedCommand.
137  * 
138  * @constructor
139  * @augments mindmaps.Command
140  */
141 mindmaps.ToggleNodeFoldedCommand = function() {
142 	this.id = "TOGGLE_NODE_FOLDED_COMMAND";
143 	this.shortcut = "space";
144 	this.description = "Show or hide the node's children";
145 };
146 mindmaps.ToggleNodeFoldedCommand.prototype = new mindmaps.Command();
147 
148 /**
149  * Undo commands
150  */
151 
152 /**
153  * Creates a new UndoCommand.
154  * 
155  * @constructor
156  * @augments mindmaps.Command
157  */
158 mindmaps.UndoCommand = function() {
159 	this.id = "UNDO_COMMAND";
160 	this.shortcut = "ctrl+z";
161 	this.label = "Undo";
162 	this.icon = "ui-icon-arrowreturnthick-1-w";
163 	this.description = "Undo";
164 };
165 mindmaps.UndoCommand.prototype = new mindmaps.Command();
166 
167 /**
168  * Creates a new RedoCommand.
169  * 
170  * @constructor
171  * @augments mindmaps.Command
172  */
173 mindmaps.RedoCommand = function() {
174 	this.id = "REDO_COMMAND";
175 	this.shortcut = "ctrl+y";
176 	this.label = "Redo";
177 	this.icon = "ui-icon-arrowreturnthick-1-e";
178 	this.description = "Redo";
179 };
180 mindmaps.RedoCommand.prototype = new mindmaps.Command();
181 
182 /**
183  * Clipboard commands
184  */
185 
186 /**
187  * Creates a new CopyNodeCommand.
188  * 
189  * @constructor
190  * @augments mindmaps.Command
191  */
192 mindmaps.CopyNodeCommand = function() {
193 	this.id = "COPY_COMMAND";
194 	this.shortcut = "ctrl+c";
195 	this.label = "Copy";
196 	this.icon = "ui-icon-copy";
197 	this.description = "Copy a branch";
198 };
199 mindmaps.CopyNodeCommand.prototype = new mindmaps.Command();
200 
201 /**
202  * Creates a new CutNodeCommand.
203  * 
204  * @constructor
205  * @augments mindmaps.Command
206  */
207 mindmaps.CutNodeCommand = function() {
208 	this.id = "CUT_COMMAND";
209 	this.shortcut = "ctrl+x";
210 	this.label = "Cut";
211 	this.icon = "ui-icon-scissors";
212 	this.description = "Cut a branch";
213 };
214 mindmaps.CutNodeCommand.prototype = new mindmaps.Command();
215 
216 /**
217  * Creates a new PasteNodeCommand.
218  * 
219  * @constructor
220  * @augments mindmaps.Command
221  */
222 mindmaps.PasteNodeCommand = function() {
223 	this.id = "PASTE_COMMAND";
224 	this.shortcut = "ctrl+v";
225 	this.label = "Paste";
226 	this.icon = "ui-icon-clipboard";
227 	this.description = "Paste a branch";
228 };
229 mindmaps.PasteNodeCommand.prototype = new mindmaps.Command();
230 
231 /**
232  * Document commands
233  */
234 
235 /**
236  * Creates a new NewDocumentCommand.
237  * 
238  * @constructor
239  * @augments mindmaps.Command
240  */
241 mindmaps.NewDocumentCommand = function() {
242 	this.id = "NEW_DOCUMENT_COMMAND";
243 	this.label = "New";
244 	this.shortcut = "alt+ctrl+n";
245 	this.icon = "ui-icon-document-b";
246 	this.description = "Start working on a new mind map";
247 };
248 mindmaps.NewDocumentCommand.prototype = new mindmaps.Command();
249 
250 /**
251  * Creates a new OpenDocumentCommand.
252  * 
253  * @constructor
254  * @augments mindmaps.Command
255  */
256 mindmaps.OpenDocumentCommand = function() {
257 	this.id = "OPEN_DOCUMENT_COMMAND";
258 	this.label = "Open...";
259 	this.shortcut = "alt+ctrl+o";
260 	this.icon = "ui-icon-folder-open";
261 	this.description = "Open an existing mind map";
262 };
263 mindmaps.OpenDocumentCommand.prototype = new mindmaps.Command();
264 
265 /**
266  * Creates a new SaveDocumentCommand.
267  * 
268  * @constructor
269  * @augments mindmaps.Command
270  */
271 mindmaps.SaveDocumentCommand = function() {
272 	this.id = "SAVE_DOCUMENT_COMMAND";
273 	this.label = "Save As...";
274 	this.shortcut = "alt+ctrl+s";
275 	this.icon = "ui-icon-disk";
276 	this.description = "Save the mind map";
277 };
278 mindmaps.SaveDocumentCommand.prototype = new mindmaps.Command();
279 
280 /**
281  * Creates a new CloseDocumentCommand.
282  * 
283  * @constructor
284  * @augments mindmaps.Command
285  */
286 mindmaps.CloseDocumentCommand = function() {
287 	this.id = "CLOSE_DOCUMENT_COMMAND";
288 	this.label = "Close";
289 	this.shortcut = "alt+ctrl+w";
290 	this.icon = "ui-icon-close";
291 	this.description = "Close the mind map";
292 };
293 mindmaps.CloseDocumentCommand.prototype = new mindmaps.Command();
294 
295 /**
296  * Creates a new HelpCommand.
297  * 
298  * @constructor
299  * @augments mindmaps.Command
300  */
301 mindmaps.HelpCommand = function() {
302 	this.id = "HELP_COMMAND";
303 	this.enabled = true;
304 	this.icon = "ui-icon-help";
305 	this.label = "Help";
306 	this.shortcut = "F1";
307 	this.description = "Get help!";
308 };
309 mindmaps.HelpCommand.prototype = new mindmaps.Command();
