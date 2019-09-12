  1 // TODO take container as argument,c reate drawing area dynamically. remove on
  2 // clear();, recreate on init()
  3 
  4 /**
  5  * Creates a new CanvasView. This is the base class for all canvas view
  6  * implementations.
  7  * 
  8  * @constructor
  9  */
 10 mindmaps.CanvasView = function() {
 11 	/**
 12 	 * Returns the element that used to draw the map upon.
 13 	 * 
 14 	 * @returns {jQuery}
 15 	 */
 16 	this.$getDrawingArea = function() {
 17 		return $("#drawing-area");
 18 	};
 19 
 20 	/**
 21 	 * Returns the element that contains the drawing area.
 22 	 * 
 23 	 * @returns {jQuery}
 24 	 */
 25 	this.$getContainer = function() {
 26 		return $("#canvas-container");
 27 	};
 28 
 29 	/**
 30 	 * Scrolls the container to show the center of the drawing area.
 31 	 */
 32 	this.center = function() {
 33 		var c = this.$getContainer();
 34 		var area = this.$getDrawingArea();
 35 		var w = area.width() - c.width();
 36 		var h = area.height() - c.height();
 37 		this.scroll(w / 2, h / 2);
 38 	};
 39 
 40 	/**
 41 	 * Scrolls the container.
 42 	 * 
 43 	 * @param {Number} x
 44 	 * @param {Number} y
 45 	 */
 46 	this.scroll = function(x, y) {
 47 		var c = this.$getContainer();
 48 		c.scrollLeft(x).scrollTop(y);
 49 	};
 50 
 51 	/**
 52 	 * Changes the size of the drawing area to match with with the new zoom
 53 	 * factor and scrolls the container to adjust the view port.
 54 	 */
 55 	this.applyViewZoom = function() {
 56 		var delta = this.zoomFactorDelta;
 57 		// console.log(delta);
 58 
 59 		var c = this.$getContainer();
 60 		var sl = c.scrollLeft();
 61 		var st = c.scrollTop();
 62 
 63 		var cw = c.width();
 64 		var ch = c.height();
 65 		var cx = cw / 2 + sl;
 66 		var cy = ch / 2 + st;
 67 
 68 		cx *= this.zoomFactorDelta;
 69 		cy *= this.zoomFactorDelta;
 70 
 71 		sl = cx - cw / 2;
 72 		st = cy - ch / 2;
 73 		// console.log(sl, st);
 74 
 75 		var drawingArea = this.$getDrawingArea();
 76 		var width = drawingArea.width();
 77 		var height = drawingArea.height();
 78 		drawingArea.width(width * delta).height(height * delta);
 79 
 80 		// scroll only after drawing area's width was set.
 81 		this.scroll(sl, st);
 82 
 83 		// adjust background size
 84 		var backgroundSize = parseFloat(drawingArea.css("background-size"));
 85 		if (isNaN(backgroundSize)) {
 86 			// parsing could possibly fail in the future.
 87 			console.warn("Could not set background-size!");
 88 		}
 89 		drawingArea.css("background-size", backgroundSize * delta);
 90 	};
 91 
 92 	/**
 93 	 * Applies the new size according to current zoom factor.
 94 	 * 
 95 	 * @param {Integer} width
 96 	 * @param {Integer} height
 97 	 */
 98 	this.setDimensions = function(width, height) {
 99 		width = width * this.zoomFactor;
100 		height = height * this.zoomFactor;
101 
102 		var drawingArea = this.$getDrawingArea();
103 		drawingArea.width(width).height(height);
104 	};
105 
106 	/**
107 	 * Sets the new zoom factor and stores the delta to the old one.
108 	 * 
109 	 * @param {Number} zoomFactor
110 	 */
111 	this.setZoomFactor = function(zoomFactor) {
112 		this.zoomFactorDelta = zoomFactor / (this.zoomFactor || 1);
113 		this.zoomFactor = zoomFactor;
114 	};
115 };
116 
117 /**
118  * Should draw the mind map onto the drawing area.
119  * 
120  * @param {mindmaps.MindMap} map
121  */
122 mindmaps.CanvasView.prototype.drawMap = function(map) {
123 	throw new Error("Not implemented");
124 };
125 
126 /**
127  * Creates a new DefaultCanvasView. This is the reference implementation for
128  * drawing mind maps.
129  * 
130  * @extends mindmaps.CanvasView
131  * @constructor
132  */
133 mindmaps.DefaultCanvasView = function() {
134 	var self = this;
135 	var nodeDragging = false;
136 	var creator = new Creator(this);
137 	var captionEditor = new CaptionEditor(this);
138 	var textMetrics = new TextMetrics(this);
139 
140 	captionEditor.commit = function(text) {
141 		self.nodeCaptionEditCommitted(text);
142 	};
143 
144 	/**
145 	 * Enables dragging of the map with the mouse.
146 	 */
147 	function makeDraggable() {
148 		self.$getContainer().dragscrollable({
149 			dragSelector : "#drawing-area, canvas.line-canvas",
150 			acceptPropagatedEvent : false,
151 			delegateMode : true,
152 			preventDefault : true
153 		});
154 	}
155 
156 	function $getNodeCanvas(node) {
157 		return $("#node-canvas-" + node.id);
158 	}
159 
160 	function $getNode(node) {
161 		return $("#node-" + node.id);
162 	}
163 
164 	function $getNodeCaption(node) {
165 		return $("#node-caption-" + node.id);
166 	}
167 
168 	/**
169 	 * Draws the line connection (the branch) between two nodes onto the canvas
170 	 * object.
171 	 * 
172 	 * @param {jQuery} $canvas
173 	 * @param {Integer} depth
174 	 * @param {Number} offsetX
175 	 * @param {Number} offsetY
176 	 * @param {jQuery} $node
177 	 * @param {jQuery} $parent
178 	 * @param {String} color
179 	 */
180 	function drawLineCanvas($canvas, depth, offsetX, offsetY, $node, $parent,
181 			color) {
182 		var zoomFactor = self.zoomFactor;
183 		offsetX = offsetX * zoomFactor;
184 		offsetY = offsetY * zoomFactor;
185 
186 		var pw = $parent.width();
187 		var nw = $node.width();
188 		var pih = $parent.innerHeight();
189 		var nih = $node.innerHeight();
190 
191 		// line is drawn from node to parent
192 		// draw direction
193 		var leftToRight, topToBottom;
194 		
195 		// node overlaps with parent above or delow
196 		var overlap = false;
197 		
198 		// canvas attributes
199 		var left, top, width, height;
200 		var bColor;
201 		
202 		// position relative to parent
203 		var nodeLeft = offsetX + nw / 2 < pw / 2;
204 		if (nodeLeft) {
205 			var aOffsetX = Math.abs(offsetX);
206 			if (aOffsetX > nw) {
207 				// normal left
208 				
209 				// make it one pixel too wide to fix firefox rounding issues
210 				width = aOffsetX - nw + 1;
211 				left = nw;
212 				leftToRight = true;
213 
214 				//bColor = "red";
215 			} else {
216 				// left overlap
217 				left = -offsetX;
218 				width = nw + offsetX;
219 				leftToRight = false;
220 				overlap = true;
221 
222 				//bColor = "orange";
223 			}
224 		} else {
225 			if (offsetX > pw) {
226 				// normal right
227 				
228 				// make it one pixel too wide to fix firefox rounding issues
229 				width = offsetX - pw + 1; 
230 				left = pw - offsetX;
231 				leftToRight = false;
232 
233 				//bColor = "green";
234 			} else {
235 				// right overlap
236 				width = pw - offsetX;
237 				left = 0;
238 				leftToRight = true;
239 				overlap = true;
240 
241 				//bColor = "yellow";
242 			}
243 		}
244 
245 
246 		var lineWidth = self.getLineWidth(depth);
247 		var halfLineWidth = lineWidth / 2;
248 		
249 		// avoid zero widths
250 		if (width < lineWidth) {
251 			width = lineWidth;
252 		}
253 
254 		var nodeAbove = offsetY + nih < pih;
255 		if (nodeAbove) {
256 			top = nih;
257 			height = $parent.outerHeight() - offsetY - top;
258 
259 			topToBottom = true;
260 		} else {
261 			top = pih - offsetY;
262 			height = $node.outerHeight() - top;
263 
264 			topToBottom = false;
265 		}
266 
267 		// position canvas
268 		$canvas.attr({
269 			width : width,
270 			height : height
271 		}).css({
272 			left : left,
273 			top : top
274 		// ,border: "1px solid " + bColor
275 		});
276 
277 		// determine start and end coordinates
278 		var startX, startY, endX, endY;
279 		if (leftToRight) {
280 			startX = 0;
281 			endX = width;
282 		} else {
283 			startX = width;
284 			endX = 0;
285 		}
286 
287 		// calculate difference in line width to parent node
288 		// and position line vertically centered to parent line
289 		var pLineWidth = self.getLineWidth(depth - 1);
290 		var diff = (pLineWidth - lineWidth)/2;
291 		
292 		if (topToBottom) {
293 			startY = 0 + halfLineWidth;
294 			endY = height - halfLineWidth - diff;
295 		} else {
296 			startY = height - halfLineWidth;
297 			endY = 0 + halfLineWidth + diff;
298 		}
299 
300 		// calculate bezier points
301 		if (!overlap) {
302 			var cp2x = startX > endX ? startX / 5 : endX - (endX / 5);
303 			var cp2y = endY;
304 
305 			var cp1x = Math.abs(startX - endX) / 2;
306 			var cp1y = startY;
307 		} else {
308 			// node overlaps with parent
309 			
310 			// take left and right a bit away so line fits fully in canvas
311 			if (leftToRight) {
312 				startX += halfLineWidth;
313 				endX -= halfLineWidth;
314 			} else {
315 				startX -= halfLineWidth;
316 				endX += halfLineWidth;
317 			}
318 
319 			// reversed bezier for overlap
320 			var cp1x = startX;
321 			var cp1y = Math.abs(startY - endY) / 2;
322 
323 			var cp2x = endX;
324 			var cp2y = startY > endY ? startY / 5 : endY - (endY / 5);
325 		}
326 
327 		// draw
328 		var canvas = $canvas[0];
329 		var ctx = canvas.getContext("2d");
330 		ctx.lineWidth = lineWidth;
331 		ctx.strokeStyle = color;
332 		ctx.fillStyle = color;
333 		
334 		ctx.beginPath();
335 		ctx.moveTo(startX, startY);
336 		ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
337 		ctx.stroke();
338 
339 		var drawControlPoints = false;
340 		if (drawControlPoints) {
341 			// control points
342 			ctx.beginPath();
343 			ctx.fillStyle = "red";
344 			ctx.arc(cp1x, cp1y, 4, 0, Math.PI * 2);
345 			ctx.fill();
346 			ctx.beginPath();
347 			ctx.fillStyle = "green";
348 			ctx.arc(cp2x, cp2y, 4, 0, Math.PI * 2);
349 			ctx.fill();
350 		}
351 	}
352 
353 
354 	this.init = function() {
355 		makeDraggable();
356 		this.center();
357 
358 		var $drawingArea = this.$getDrawingArea();
359 		$drawingArea.addClass("mindmap");
360 
361 		// setup delegates
362 		$drawingArea.delegate("div.node-caption", "mousedown", function(e) {
363 			var node = $(this).parent().data("node");
364 			if (self.nodeMouseDown) {
365 				self.nodeMouseDown(node);
366 			}
367 		});
368 
369 		$drawingArea.delegate("div.node-caption", "mouseup", function(e) {
370 			var node = $(this).parent().data("node");
371 			if (self.nodeMouseUp) {
372 				self.nodeMouseUp(node);
373 			}
374 		});
375 
376 		$drawingArea.delegate("div.node-caption", "dblclick", function(e) {
377 			var node = $(this).parent().data("node");
378 			if (self.nodeDoubleClicked) {
379 				self.nodeDoubleClicked(node);
380 			}
381 		});
382 
383 		$drawingArea.delegate("div.node-container", "mouseover", function(e) {
384 			if (e.target === this) {
385 				var node = $(this).data("node");
386 				if (self.nodeMouseOver) {
387 					self.nodeMouseOver(node);
388 				}
389 			}
390 			return false;
391 		});
392 
393 		$drawingArea.delegate("div.node-caption", "mouseover", function(e) {
394 			if (e.target === this) {
395 				var node = $(this).parent().data("node");
396 				if (self.nodeCaptionMouseOver) {
397 					self.nodeCaptionMouseOver(node);
398 				}
399 			}
400 			return false;
401 		});
402 
403 		// mouse wheel listener
404 		this.$getContainer().bind("mousewheel", function(e, delta) {
405 			if (self.mouseWheeled) {
406 				self.mouseWheeled(delta);
407 			}
408 		});
409 	};
410 
411 	/**
412 	 * Clears the drawing area.
413 	 */
414 	this.clear = function() {
415 		var drawingArea = this.$getDrawingArea();
416 		drawingArea.children().remove();
417 		drawingArea.width(0).height(0);
418 	};
419 
420 	/**
421 	 * Calculates the width of a branch for a node for the given depth
422 	 * 
423 	 * @param {Integer} depth the depth of the node
424 	 * @returns {Number}
425 	 */
426 	this.getLineWidth = function(depth) {
427 		// var width = this.zoomFactor * (10 - depth);
428 		var width = this.zoomFactor * (12 - depth * 2);
429 
430 		if (width < 2) {
431 			width = 2;
432 		}
433 
434 		return width;
435 	};
436 
437 	/**
438 	 * Draws the complete map onto the drawing area. This should only be called
439 	 * once for a mind map.
440 	 */
441 	this.drawMap = function(map) {
442 		var now = new Date().getTime();
443 		var $drawingArea = this.$getDrawingArea();
444 
445 		// clear map first
446 		$drawingArea.children().remove();
447 
448 		var root = map.root;
449 
450 		// 1.5. do NOT detach for now since DIV dont have widths and heights,
451 		// and loading maps draws wrong canvases (or create nodes and then draw
452 		// canvases)
453 
454 		var detach = false;
455 		if (detach) {
456 			// detach drawing area during map creation to avoid unnecessary DOM
457 			// repaint events. (binary7 is 3 times faster)
458 			var $parent = $drawingArea.parent();
459 			$drawingArea.detach();
460 			self.createNode(root, $drawingArea);
461 			$drawingArea.appendTo($parent);
462 		} else {
463 			self.createNode(root, $drawingArea);
464 		}
465 
466 		console.debug("draw map ms: ", new Date().getTime() - now);
467 	};
468 
469 	/**
470 	 * Inserts a new node including all of its children into the DOM.
471 	 * 
472 	 * @param {mindmaps.Node} node - The model of the node.
473 	 * @param {jQuery} [$parent] - optional jquery parent object the new node is
474 	 *            appended to. Usually the parent node. If argument is omitted,
475 	 *            the getParent() method of the node is called to resolve the
476 	 *            parent.
477 	 * @param {Integer} [depth] - Optional. The depth of the tree relative to
478 	 *            the root. If argument is omitted the getDepth() method of the
479 	 *            node is called to resolve the depth.
480 	 */
481 	this.createNode = function(node, $parent, depth) {
482 		var parent = node.getParent();
483 		var $parent = $parent || $getNode(parent);
484 		var depth = depth || node.getDepth();
485 		var offsetX = node.offset.x;
486 		var offsetY = node.offset.y;
487 
488 		// div node container
489 		var $node = $("<div/>", {
490 			id : "node-" + node.id,
491 			"class" : "node-container"
492 		}).data({
493 			node : node
494 		}).css({
495 			"font-size" : node.text.font.size
496 		});
497 		$node.appendTo($parent);
498 
499 		if (node.isRoot()) {
500 			var w = this.getLineWidth(depth);
501 			$node.css("border-bottom-width", w);
502 		}
503 
504 		if (!node.isRoot()) {
505 			// draw border and position manually only non-root nodes
506 			var bThickness = this.getLineWidth(depth);
507 			var bColor = node.branchColor;
508 			var bb = bThickness + "px solid " + bColor;
509 
510 			$node.css({
511 				left : this.zoomFactor * offsetX,
512 				top : this.zoomFactor * offsetY,
513 				"border-bottom" : bb
514 			});
515 
516 			// node drag behaviour
517 			/**
518 			 * Only attach the drag handler once we mouse over it. this speeds
519 			 * up loading of big maps.
520 			 */
521 			$node.one("mouseenter", function() {
522 				$node.draggable({
523 					// could be set
524 					// revert: true,
525 					// revertDuration: 0,
526 					handle : "div.node-caption:first",
527 					start : function() {
528 						nodeDragging = true;
529 					},
530 					drag : function(e, ui) {
531 						// reposition and draw canvas while dragging
532 						var offsetX = ui.position.left / self.zoomFactor;
533 						var offsetY = ui.position.top / self.zoomFactor;
534 						var color = node.branchColor;
535 						var $canvas = $getNodeCanvas(node);
536 
537 						drawLineCanvas($canvas, depth, offsetX, offsetY, $node,
538 								$parent, color);
539 
540 						// fire dragging event
541 						if (self.nodeDragging) {
542 							self.nodeDragging();
543 						}
544 					},
545 					stop : function(e, ui) {
546 						nodeDragging = false;
547 						var pos = new mindmaps.Point(ui.position.left
548 								/ self.zoomFactor, ui.position.top
549 								/ self.zoomFactor);
550 
551 						// fire dragged event
552 						if (self.nodeDragged) {
553 							self.nodeDragged(node, pos);
554 						}
555 					}
556 				});
557 			});
558 		}
559 
560 		// text caption
561 		var font = node.text.font;
562 		var $text = $("<div/>", {
563 			id : "node-caption-" + node.id,
564 			"class" : "node-caption node-text-behaviour",
565 			text : node.text.caption
566 		}).css({
567 			"color" : font.color,
568 			"font-size" : this.zoomFactor * 100 + "%",
569 			"font-weight" : font.weight,
570 			"font-style" : font.style,
571 			"text-decoration" : font.decoration
572 		}).appendTo($node);
573 
574 		var metrics = textMetrics.getTextMetrics(node);
575 		$text.css(metrics);
576 
577 		// create fold button for parent if he hasn't one already
578 		var parentAlreadyHasFoldButton = $parent.data("foldButton");
579 		var nodeOrParentIsRoot = node.isRoot() || parent.isRoot();
580 		if (!parentAlreadyHasFoldButton && !nodeOrParentIsRoot) {
581 			this.createFoldButton(parent);
582 		}
583 
584 		if (!node.isRoot()) {
585 			// toggle visibility
586 			if (parent.foldChildren) {
587 				$node.hide();
588 			} else {
589 				$node.show();
590 			}
591 
592 			// draw canvas to parent if node is not a root
593 			var $canvas = $("<canvas/>", {
594 				id : "node-canvas-" + node.id,
595 				"class" : "line-canvas"
596 			});
597 
598 			// position and draw connection
599 			drawLineCanvas($canvas, depth, offsetX, offsetY, $node, $parent,
600 					node.branchColor);
601 			$canvas.appendTo($node);
602 		}
603 
604 		if (node.isRoot()) {
605 			$node.children().andSelf().addClass("root");
606 		}
607 
608 		// draw child nodes
609 		node.forEachChild(function(child) {
610 			self.createNode(child, $node, depth + 1);
611 		});
612 	};
613 
614 	/**
615 	 * Removes a node from the view and with it all its children and the branch
616 	 * leading to the parent.
617 	 * 
618 	 * @param {mindmaps.Node} node
619 	 */
620 	this.deleteNode = function(node) {
621 		// detach creator first, we need still him
622 		// creator.detach();
623 
624 		// delete all DOM below
625 		var $node = $getNode(node);
626 		$node.remove();
627 	};
628 
629 	/**
630 	 * Highlights a node to show that it is selected.
631 	 * 
632 	 * @param {mindmaps.Node} node
633 	 */
634 	this.highlightNode = function(node) {
635 		var $text = $getNodeCaption(node);
636 		$text.addClass("selected");
637 	};
638 
639 	/**
640 	 * Removes the hightlight of a node.
641 	 * 
642 	 * @param {mindmaps.Node} node
643 	 */
644 	this.unhighlightNode = function(node) {
645 		var $text = $getNodeCaption(node);
646 		$text.removeClass("selected");
647 	};
648 
649 	/**
650 	 * Hides all children of a node.
651 	 * 
652 	 * @param {mindmaps.Node} node
653 	 */
654 	this.closeNode = function(node) {
655 		var $node = $getNode(node);
656 		$node.children(".node-container").hide();
657 
658 		var $foldButton = $node.children(".button-fold").first();
659 		$foldButton.removeClass("open").addClass("closed");
660 	};
661 
662 	/**
663 	 * Shows all children of a node.
664 	 * 
665 	 * @param {mindmaps.Node} node
666 	 */
667 	this.openNode = function(node) {
668 		var $node = $getNode(node);
669 		$node.children(".node-container").show();
670 
671 		var $foldButton = $node.children(".button-fold").first();
672 		$foldButton.removeClass("closed").addClass("open");
673 	};
674 
675 	/**
676 	 * Creates the fold button for a node that shows/hides its children.
677 	 * 
678 	 * @param {mindmaps.Node} node
679 	 */
680 	this.createFoldButton = function(node) {
681 		var position = node.offset.x > 0 ? " right" : " left";
682 		var openClosed = node.foldChildren ? " closed" : " open";
683 		var $foldButton = $("<div/>", {
684 			"class" : "button-fold no-select" + openClosed + position
685 		}).click(function(e) {
686 			// fire event
687 			if (self.foldButtonClicked) {
688 				self.foldButtonClicked(node);
689 			}
690 
691 			e.preventDefault();
692 			return false;
693 		});
694 
695 		// remember that foldButton was set and attach to node
696 		var $node = $getNode(node);
697 		$node.data({
698 			foldButton : true
699 		}).append($foldButton);
700 	};
701 
702 	/**
703 	 * Removes the fold button.
704 	 * 
705 	 * @param {mindmaps.Node} node
706 	 */
707 	this.removeFoldButton = function(node) {
708 		var $node = $getNode(node);
709 		$node.data({
710 			foldButton : false
711 		}).children(".button-fold").remove();
712 	};
713 
714 	/**
715 	 * Goes into edit mode for a node.
716 	 * 
717 	 * @param {mindmaps.Node} node
718 	 */
719 	this.editNodeCaption = function(node) {
720 		captionEditor.edit(node, this.$getDrawingArea());
721 	};
722 
723 	/**
724 	 * Stops the current edit mode.
725 	 */
726 	this.stopEditNodeCaption = function() {
727 		captionEditor.stop();
728 	};
729 
730 	/**
731 	 * Updates the text caption for a node.
732 	 * 
733 	 * @param {mindmaps.Node} node
734 	 * @param {String} value
735 	 */
736 	this.setNodeText = function(node, value) {
737 		var $text = $getNodeCaption(node);
738 		var metrics = textMetrics.getTextMetrics(node, value);
739 		$text.css(metrics).text(value);
740 	};
741 
742 	/**
743 	 * Get a reference to the creator tool.
744 	 * 
745 	 * @returns {Creator}
746 	 */
747 	this.getCreator = function() {
748 		return creator;
749 	};
750 
751 	/**
752 	 * Returns whether a node is currently being dragged.
753 	 * 
754 	 * @returns {Boolean}
755 	 */
756 	this.isNodeDragging = function() {
757 		return nodeDragging;
758 	};
759 
760 	/**
761 	 * Redraws a node's branch to its parent.
762 	 * 
763 	 * @param {mindmaps.Node} node
764 	 */
765 	function drawNodeCanvas(node) {
766 		var parent = node.getParent();
767 		var depth = node.getDepth();
768 		var offsetX = node.offset.x;
769 		var offsetY = node.offset.y;
770 		var color = node.branchColor;
771 
772 		var $node = $getNode(node);
773 		var $parent = $getNode(parent);
774 		var $canvas = $getNodeCanvas(node);
775 
776 		drawLineCanvas($canvas, depth, offsetX, offsetY, $node, $parent, color);
777 	}
778 
779 	/**
780 	 * Redraws all branches that a node is connected to.
781 	 * 
782 	 * @param {mindmaps.Node} node
783 	 */
784 	this.redrawNodeConnectors = function(node) {
785 
786 		// redraw canvas to parent
787 		if (!node.isRoot()) {
788 			drawNodeCanvas(node);
789 		}
790 
791 		// redraw all child canvases
792 		if (!node.isLeaf()) {
793 			node.forEachChild(function(child) {
794 				drawNodeCanvas(child);
795 			});
796 		}
797 	};
798 
799 	/**
800 	 * Does a complete visual update of a node to reflect all of its attributes.
801 	 * 
802 	 * @param {mindmaps.Node} node
803 	 */
804 	this.updateNode = function(node) {
805 		var $node = $getNode(node);
806 		var $text = $getNodeCaption(node);
807 		var font = node.text.font;
808 		$node.css({
809 			"font-size" : font.size,
810 			"border-bottom-color" : node.branchColor
811 		});
812 
813 		var metrics = textMetrics.getTextMetrics(node);
814 
815 		$text.css({
816 			"color" : font.color,
817 			"font-weight" : font.weight,
818 			"font-style" : font.style,
819 			"text-decoration" : font.decoration
820 		}).css(metrics);
821 
822 		this.redrawNodeConnectors(node);
823 	};
824 
825 	/**
826 	 * Moves the node a new position.
827 	 * 
828 	 * @param {mindmaps.Node} node
829 	 */
830 	this.positionNode = function(node) {
831 		var $node = $getNode(node);
832 		// TODO try animate
833 		// position
834 		$node.css({
835 			left : this.zoomFactor * node.offset.x,
836 			top : this.zoomFactor * node.offset.y
837 		});
838 
839 		// redraw canvas to parent
840 		drawNodeCanvas(node);
841 	};
842 
843 	/**
844 	 * Redraws the complete map to adapt to a new zoom factor.
845 	 */
846 	this.scaleMap = function() {
847 		var zoomFactor = this.zoomFactor;
848 		var $root = this.$getDrawingArea().children().first();
849 		var root = $root.data("node");
850 
851 		var w = this.getLineWidth(0);
852 		$root.css("border-bottom-width", w);
853 
854 		// handle root differently
855 		var $text = $getNodeCaption(root);
856 		var metrics = textMetrics.getTextMetrics(root);
857 		$text.css({
858 			"font-size" : zoomFactor * 100 + "%",
859 			"left" : zoomFactor * -TextMetrics.ROOT_CAPTION_MIN_WIDTH / 2
860 		}).css(metrics);
861 
862 		root.forEachChild(function(child) {
863 			scale(child, 1);
864 		});
865 
866 		function scale(node, depth) {
867 			var $node = $getNode(node);
868 
869 			// draw border and position manually
870 			var bWidth = self.getLineWidth(depth);
871 
872 			$node.css({
873 				left : zoomFactor * node.offset.x,
874 				top : zoomFactor * node.offset.y,
875 				"border-bottom-width" : bWidth
876 			});
877 
878 			var $text = $getNodeCaption(node);
879 			$text.css({
880 				"font-size" : zoomFactor * 100 + "%"
881 			});
882 
883 			var metrics = textMetrics.getTextMetrics(node);
884 			$text.css(metrics);
885 
886 			// redraw canvas to parent
887 			drawNodeCanvas(node);
888 
889 			// redraw all child canvases
890 			if (!node.isLeaf()) {
891 				node.forEachChild(function(child) {
892 					scale(child, depth + 1);
893 				});
894 			}
895 		}
896 	};
897 
898 	/**
899 	 * Creates a new CaptionEditor. This tool offers an inline editor component
900 	 * to change a node's caption.
901 	 * 
902 	 * @constructor
903 	 * @param {mindmaps.CanvasView} view
904 	 */
905 	function CaptionEditor(view) {
906 		var self = this;
907 		var attached = false;
908 
909 		// text input for node edits.
910 		var $editor = $("<textarea/>", {
911 			id : "caption-editor",
912 			"class" : "node-text-behaviour"
913 		}).bind("keydown", "esc", function() {
914 			self.stop();
915 		}).bind("keydown", "return", function() {
916 			if (self.commit) {
917 				self.commit($editor.val());
918 			}
919 		}).mousedown(function(e) {
920 			// avoid premature canceling
921 			e.stopPropagation();
922 		}).blur(function() {
923 			self.stop();
924 		}).bind("input", function() {
925 			var metrics = textMetrics.getTextMetrics(self.node, $editor.val());
926 			$editor.css(metrics);
927 
928 			// slightly defer execution for better performance on slow browsers
929 			setTimeout(function() {
930 				view.redrawNodeConnectors(self.node);
931 			}, 1);
932 		});
933 
934 		/**
935 		 * Attaches the textarea to the node and temporarily removes the
936 		 * original node caption.
937 		 * 
938 		 * @param {mindmaps.Node} node
939 		 * @param {jQuery} $cancelArea
940 		 */
941 		this.edit = function(node, $cancelArea) {
942 			if (attached) {
943 				return;
944 			}
945 			this.node = node;
946 			attached = true;
947 
948 			// TODO put text into span and hide()
949 			this.$text = $getNodeCaption(node);
950 			this.$cancelArea = $cancelArea;
951 
952 			this.text = this.$text.text();
953 
954 			this.$text.css({
955 				width : "auto",
956 				height : "auto"
957 			}).empty().addClass("edit");
958 
959 			$cancelArea.bind("mousedown.editNodeCaption", function(e) {
960 				self.stop();
961 			});
962 
963 			var metrics = textMetrics.getTextMetrics(self.node, this.text);
964 			$editor.attr({
965 				value : this.text
966 			}).css(metrics).appendTo(this.$text).select();
967 
968 		};
969 
970 		/**
971 		 * Removes the editor from the node and restores its old text value.
972 		 */
973 		this.stop = function() {
974 			if (attached) {
975 				attached = false;
976 				this.$text.removeClass("edit");
977 				$editor.detach();
978 				this.$cancelArea.unbind("mousedown.editNodeCaption");
979 				view.setNodeText(this.node, this.text);
980 			}
981 
982 		};
983 	}
984 
985 	/**
986 	 * Creates a new Creator. This tool is used to drag out new branches to
987 	 * create new nodes.
988 	 * 
989 	 * @constructor
990 	 * @param {mindmaps.CanvasView} view
991 	 * @returns {Creator}
992 	 */
993 	function Creator(view) {
994 		var self = this;
995 		var dragging = false;
996 
997 		this.node = null;
998 		this.lineColor = null;
999 
1000 		var $wrapper = $("<div/>", {
1001 			id : "creator-wrapper"
1002 		}).bind("remove", function(e) {
1003 			// detach the creator when some removed the node or opened a new map
1004 			self.detach();
1005 			// and avoid removing from DOM
1006 			e.stopImmediatePropagation();
1007 
1008 			console.debug("creator detached.");
1009 			return false;
1010 		});
1011 
1012 		// red dot creator element
1013 		var $nub = $("<div/>", {
1014 			id : "creator-nub"
1015 		}).appendTo($wrapper);
1016 
1017 		var $fakeNode = $("<div/>", {
1018 			id : "creator-fakenode"
1019 		}).appendTo($nub);
1020 
1021 		// canvas used by the creator tool to draw new lines
1022 		var $canvas = $("<canvas/>", {
1023 			id : "creator-canvas",
1024 			"class" : "line-canvas"
1025 		}).hide().appendTo($wrapper);
1026 
1027 		// make it draggable
1028 		$wrapper.draggable({
1029 			revert : true,
1030 			revertDuration : 0,
1031 			start : function() {
1032 				dragging = true;
1033 				// show creator canvas
1034 				$canvas.show();
1035 				if (self.dragStarted) {
1036 					self.lineColor = self.dragStarted(self.node);
1037 				}
1038 			},
1039 			drag : function(e, ui) {
1040 				// update creator canvas
1041 				var offsetX = ui.position.left / view.zoomFactor;
1042 				var offsetY = ui.position.top / view.zoomFactor;
1043 
1044 				// set depth+1 because we are drawing the canvas for the child
1045 				var $node = $getNode(self.node);
1046 				drawLineCanvas($canvas, self.depth + 1, offsetX, offsetY,
1047 						$fakeNode, $node, self.lineColor);
1048 			},
1049 			stop : function(e, ui) {
1050 				dragging = false;
1051 				// remove creator canvas, gets replaced by real canvas
1052 				$canvas.hide();
1053 				if (self.dragStopped) {
1054 					var $wp = $wrapper.position();
1055 					var $wpLeft = $wp.left / view.zoomFactor;
1056 					var $wpTop = $wp.top / view.zoomFactor;
1057 					var nubLeft = ui.position.left / view.zoomFactor;
1058 					var nubTop = ui.position.top / view.zoomFactor;
1059 
1060 					var distance = mindmaps.Util.distance($wpLeft - nubLeft,
1061 							$wpTop - nubTop);
1062 					self.dragStopped(self.node, nubLeft, nubTop, distance);
1063 				}
1064 
1065 				// remove any positioning that the draggable might have caused
1066 				$wrapper.css({
1067 					left : "",
1068 					top : ""
1069 				});
1070 			}
1071 		});
1072 
1073 		/**
1074 		 * Attaches the tool to a node.
1075 		 * 
1076 		 * @param {mindmaps.Node} node
1077 		 */
1078 		this.attachToNode = function(node) {
1079 			if (this.node === node) {
1080 				return;
1081 			}
1082 			this.node = node;
1083 
1084 			// position the nub correctly
1085 			$wrapper.removeClass("left right");
1086 			if (node.offset.x > 0) {
1087 				$wrapper.addClass("right");
1088 			} else if (node.offset.x < 0) {
1089 				$wrapper.addClass("left");
1090 			}
1091 
1092 			// set border on our fake node for correct line drawing
1093 			this.depth = node.getDepth();
1094 			var w = view.getLineWidth(this.depth + 1);
1095 			$fakeNode.css("border-bottom-width", w);
1096 
1097 			var $node = $getNode(node);
1098 			$wrapper.appendTo($node);
1099 		};
1100 
1101 		/**
1102 		 * Removes the tool from the current node.
1103 		 */
1104 		this.detach = function() {
1105 			$wrapper.detach();
1106 			this.node = null;
1107 		};
1108 
1109 		/**
1110 		 * Returns whether the tool is currently in use being dragged.
1111 		 * 
1112 		 * @returns {Boolean}
1113 		 */
1114 		this.isDragging = function() {
1115 			return dragging;
1116 		};
1117 	}
1118 
1119 	/**
1120 	 * Utitility object that calculates how much space a text would take up in a
1121 	 * node. This is done through a dummy div that has the same formatting as
1122 	 * the node and gets the text injected.
1123 	 * 
1124 	 * @constructor
1125 	 * @param {mindmaps.CanvasView} view
1126 	 */
1127 	function TextMetrics(view) {
1128 		var $div = $("<div/>", {
1129 			id : "text-metrics-dummy",
1130 			"class" : "node-text-behaviour"
1131 		}).css({
1132 			position : "absolute",
1133 			visibility : "hidden",
1134 			height : "auto",
1135 			width : "auto"
1136 		}).appendTo(view.$getContainer());
1137 
1138 		/**
1139 		 * Calculates the width and height a node would have to provide to show
1140 		 * the text.
1141 		 * 
1142 		 * @param {mindmaps.Node} node the node whose text is to be measured.
1143 		 * @param {mindmaps.Node} [text] use this instead of the text of node
1144 		 * @returns {Object} object with properties width and height.
1145 		 */
1146 		this.getTextMetrics = function(node, text) {
1147 			text = text || node.getCaption();
1148 			var font = node.text.font;
1149 			var minWidth = node.isRoot() ? TextMetrics.ROOT_CAPTION_MIN_WIDTH
1150 					: TextMetrics.NODE_CAPTION_MIN_WIDTH;
1151 			var maxWidth = TextMetrics.NODE_CAPTION_MAX_WIDTH;
1152 
1153 			$div.css({
1154 				"font-size" : view.zoomFactor * font.size,
1155 				"min-width" : view.zoomFactor * minWidth,
1156 				"max-width" : view.zoomFactor * maxWidth,
1157 				"font-weight" : font.weight
1158 			}).text(text);
1159 
1160 			// add some safety pixels for firefox, otherwise it doesnt render
1161 			// right on textareas
1162 			var w = $div.width() + 2;
1163 			var h = $div.height() + 2;
1164 
1165 			return {
1166 				width : w,
1167 				height : h
1168 			};
1169 		};
1170 	}
1171 	/**
1172 	 * @constant
1173 	 */
1174 	TextMetrics.ROOT_CAPTION_MIN_WIDTH = 100;
1175 
1176 	/**
1177 	 * @constant
1178 	 */
1179 	TextMetrics.NODE_CAPTION_MIN_WIDTH = 70;
1180 
1181 	/**
1182 	 * @constant
1183 	 */
1184 	TextMetrics.NODE_CAPTION_MAX_WIDTH = 150;
1185 };
1186 
1187 // inherit from base canvas view
1188 mindmaps.DefaultCanvasView.prototype = new mindmaps.CanvasView();
