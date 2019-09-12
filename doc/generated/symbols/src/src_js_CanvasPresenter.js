  1 /**
  2  * Creates a new CanvasPresenter. The canvas presenter is responsible for drawing the mind map onto a
  3  * canvas view and reacting to user input on the map (e.g. dragging a node, double clicking it etc.)
  4  * 
  5  * @constructor
  6  * @param {mindmaps.EventBus} eventBus
  7  * @param {mindmaps.CommandRegistry} commandRegistry
  8  * @param {mindmaps.MindMapModel} mindmapModel
  9  * @param {mindmaps.CanvasView} view
 10  * @param {mindmaps.ZoomController} zoomController
 11  */
 12 mindmaps.CanvasPresenter = function(eventBus, commandRegistry, mindmapModel,
 13 		view, zoomController) {
 14 	var self = this;
 15 	var creator = view.getCreator();
 16 
 17 	/**
 18 	 * Initializes this presenter.
 19 	 */
 20 	this.init = function() {
 21 		var editCaptionCommand = commandRegistry
 22 				.get(mindmaps.EditNodeCaptionCommand);
 23 		editCaptionCommand.setHandler(this.editNodeCaption.bind(this));
 24 
 25 		var toggleNodeFoldedCommand = commandRegistry
 26 				.get(mindmaps.ToggleNodeFoldedCommand);
 27 		toggleNodeFoldedCommand.setHandler(toggleFold);
 28 	};
 29 
 30 	/**
 31 	 * Handles the edit caption command. Tells view to start edit mode for node.
 32 	 * 
 33 	 * @param {mindmaps.Node} node
 34 	 */
 35 	this.editNodeCaption = function(node) {
 36 		if (!node) {
 37 			node = mindmapModel.selectedNode;
 38 		}
 39 		view.editNodeCaption(node);
 40 	};
 41 
 42 	/**
 43 	 * Toggles the fold state of a node.
 44 	 * 
 45 	 * @param {mindmaps.Node} node
 46 	 */
 47 	var toggleFold = function(node) {
 48 		if (!node) {
 49 			node = mindmapModel.selectedNode;
 50 		}
 51 
 52 		// toggle node visibility
 53 		var action = new mindmaps.action.ToggleNodeFoldAction(node);
 54 		mindmapModel.executeAction(action);
 55 	};
 56 
 57 	/**
 58 	 * Tells the view to select a node.
 59 	 * 
 60 	 * @param {mindmaps.Node} selectedNode
 61 	 * @param {mindmaps.Node} oldSelectedNode
 62 	 */
 63 	var selectNode = function(selectedNode, oldSelectedNode) {
 64 
 65 		// deselect old node
 66 		if (oldSelectedNode) {
 67 			view.unhighlightNode(oldSelectedNode);
 68 		}
 69 		view.highlightNode(selectedNode);
 70 	};
 71 
 72 	// listen to events from view
 73 	/**
 74 	 * View callback: Zoom on mouse wheel.
 75 	 * 
 76 	 * @ignore
 77 	 */
 78 	view.mouseWheeled = function(delta) {
 79 		view.stopEditNodeCaption();
 80 
 81 		if (delta > 0) {
 82 			zoomController.zoomIn();
 83 		} else {
 84 			zoomController.zoomOut();
 85 		}
 86 	};
 87 
 88 	/**
 89 	 * View callback: Attach creator to node if mouse hovers over node.
 90 	 * 
 91 	 * @ignore
 92 	 */
 93 	view.nodeMouseOver = function(node) {
 94 		if (view.isNodeDragging() || creator.isDragging()) {
 95 			// dont relocate the creator if we are dragging
 96 		} else {
 97 			creator.attachToNode(node);
 98 		}
 99 	};
100 
101 	/**
102 	 * View callback: Attach creator to node if mouse hovers over node caption.
103 	 * 
104 	 * @ignore
105 	 */
106 	view.nodeCaptionMouseOver = function(node) {
107 		if (view.isNodeDragging() || creator.isDragging()) {
108 			// dont relocate the creator if we are dragging
109 		} else {
110 			creator.attachToNode(node);
111 		}
112 	};
113 
114 	/**
115 	 * View callback: Select node if mouse was pressed.
116 	 * 
117 	 * @ignore
118 	 */
119 	view.nodeMouseDown = function(node) {
120 		mindmapModel.selectNode(node);
121 		// show creator
122 		creator.attachToNode(node);
123 	};
124 
125 	// view.nodeMouseUp = function(node) {
126 	// };
127 
128 	/**
129 	 * View callback: Go into edit mode when node was double clicked.
130 	 * 
131 	 * @ignore
132 	 */
133 	view.nodeDoubleClicked = function(node) {
134 		view.editNodeCaption(node);
135 	};
136 
137 	// view.nodeDragging = function() {
138 	// };
139 
140 	/**
141 	 * View callback: Execute MoveNodeAction when node was dragged.
142 	 * 
143 	 * @ignore
144 	 */
145 	view.nodeDragged = function(node, offset) {
146 		// view has updated itself
147 
148 		// update model
149 		var action = new mindmaps.action.MoveNodeAction(node, offset);
150 		mindmapModel.executeAction(action);
151 	};
152 
153 	/**
154 	 * View callback: Toggle fold mode when fold button was clicked.
155 	 * 
156 	 * @ignore
157 	 */
158 	view.foldButtonClicked = function(node) {
159 		toggleFold(node);
160 	};
161 
162 	// CREATOR TOOL
163 	/**
164 	 * View callback: Return new random color to view when creator tool was
165 	 * started to drag.
166 	 * 
167 	 * @ignore
168 	 */
169 	creator.dragStarted = function(node) {
170 		// set edge color for new node. inherit from parent or random when root
171 		var color = node.isRoot() ? mindmaps.Util.randomColor()
172 				: node.branchColor;
173 		return color;
174 	};
175 
176 	/**
177 	 * View callback: Create a new node when creator tool was stopped.
178 	 * 
179 	 * @ignore
180 	 */
181 	creator.dragStopped = function(parent, offsetX, offsetY, distance) {
182 		// disregard if the creator was only dragged a bit
183 		if (distance < 50) {
184 			return;
185 		}
186 
187 		// update the model
188 		var node = new mindmaps.Node();
189 		node.branchColor = creator.lineColor;
190 		node.offset = new mindmaps.Point(offsetX, offsetY);
191 		// indicate that we want to set this nodes caption after creation
192 		node.shouldEditCaption = true;
193 
194 		mindmapModel.createNode(node, parent);
195 	};
196 
197 	/**
198 	 * View callback: Change node caption when text change was committed in
199 	 * view.
200 	 * 
201 	 * @ignore
202 	 * @param {String} str
203 	 */
204 	view.nodeCaptionEditCommitted = function(str) {
205 		// avoid whitespace only strings
206 		var str = $.trim(str);
207 		if (!str) {
208 			return;
209 		}
210 
211 		view.stopEditNodeCaption();
212 		mindmapModel.changeNodeCaption(null, str);
213 	};
214 
215 	this.go = function() {
216 		view.init();
217 	};
218 
219 	/**
220 	 * Draw the mind map on the canvas.
221 	 * 
222 	 * @param {mindmaps.Document} doc
223 	 */
224 	function showMindMap(doc) {
225 		view.setZoomFactor(zoomController.DEFAULT_ZOOM);
226 		var dimensions = doc.dimensions;
227 		view.setDimensions(dimensions.x, dimensions.y);
228 		var map = doc.mindmap;
229 		view.drawMap(map);
230 		view.center();
231 
232 		mindmapModel.selectNode(map.root);
233 	}
234 
235 	/**
236 	 * Hook up with EventBus.
237 	 */
238 	function bind() {
239 		// listen to global events
240 		eventBus.subscribe(mindmaps.Event.DOCUMENT_OPENED, function(doc,
241 				newDocument) {
242 			showMindMap(doc);
243 
244 			// if (doc.isNew()) {
245 			// // edit root node on start
246 			// var root = doc.mindmap.root;
247 			// view.editNodeCaption(root);
248 			// }
249 		});
250 
251 		eventBus.subscribe(mindmaps.Event.DOCUMENT_CLOSED, function(doc) {
252 			view.clear();
253 		});
254 
255 		eventBus.subscribe(mindmaps.Event.NODE_MOVED, function(node) {
256 			view.positionNode(node);
257 		});
258 
259 		eventBus.subscribe(mindmaps.Event.NODE_TEXT_CAPTION_CHANGED, function(
260 				node) {
261 			view.setNodeText(node, node.getCaption());
262 
263 			// redraw node in case height has changed
264 			// TODO maybe only redraw if height has changed
265 			view.redrawNodeConnectors(node);
266 		});
267 
268 		eventBus.subscribe(mindmaps.Event.NODE_CREATED, function(node) {
269 			view.createNode(node);
270 
271 			// edit node caption immediately if requested
272 			if (node.shouldEditCaption) {
273 				delete node.shouldEditCaption;
274 				// open parent node when creating a new child and the other
275 				// children are hidden
276 				var parent = node.getParent();
277 				if (parent.foldChildren) {
278 					var action = new mindmaps.action.OpenNodeAction(parent);
279 					mindmapModel.executeAction(action);
280 				}
281 
282 				// select and go into edit mode on new node
283 				mindmapModel.selectNode(node);
284 				// attach creator manually, sometimes the mouseover listener wont fire
285 				creator.attachToNode(node);
286 				view.editNodeCaption(node);
287 			}
288 		});
289 
290 		eventBus.subscribe(mindmaps.Event.NODE_DELETED, function(node, parent) {
291 			// select parent if we are deleting a selected node or a descendant
292 			var selected = mindmapModel.selectedNode;
293 			if (node === selected || node.isDescendant(selected)) {
294 				// deselectCurrentNode();
295 				mindmapModel.selectNode(parent);
296 			}
297 
298 			// update view
299 			view.deleteNode(node);
300 			if (parent.isLeaf()) {
301 				view.removeFoldButton(parent);
302 			}
303 		});
304 
305 		eventBus.subscribe(mindmaps.Event.NODE_SELECTED, selectNode);
306 		
307 		eventBus.subscribe(mindmaps.Event.NODE_OPENED, function(node) {
308 			view.openNode(node);
309 		});
310 		eventBus.subscribe(mindmaps.Event.NODE_CLOSED, function(node) {
311 			view.closeNode(node);
312 		});
313 		eventBus.subscribe(mindmaps.Event.NODE_FONT_CHANGED, function(node) {
314 			view.updateNode(node);
315 		});
316 		eventBus.subscribe(mindmaps.Event.NODE_BRANCH_COLOR_CHANGED, function(
317 				node) {
318 			view.updateNode(node);
319 		});
320 		eventBus.subscribe(mindmaps.Event.ZOOM_CHANGED, function(zoomFactor) {
321 			view.setZoomFactor(zoomFactor);
322 			view.applyViewZoom();
323 			view.scaleMap();
324 		});
325 	}
326 
327 	bind();
328 	this.init();
329 };
