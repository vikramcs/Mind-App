  1 /**
  2  * Creates a new ClipboardController.
  3  * Handles copy, cut and paste commands.
  4  * 
  5  * @constructor
  6  * 
  7  * @param {mindmaps.EventBus} eventBus
  8  * @param {mindmaps.CommandRegistry} commandRegistry
  9  * @param {mindmaps.MindMapModel} mindmapModel
 10  */
 11 mindmaps.ClipboardController = function(eventBus, commandRegistry, mindmapModel) {
 12 	var node, copyCommand, cutCommand, pasteCommand;
 13 
 14 	function init() {
 15 		copyCommand = commandRegistry.get(mindmaps.CopyNodeCommand);
 16 		copyCommand.setHandler(doCopy);
 17 
 18 		cutCommand = commandRegistry.get(mindmaps.CutNodeCommand);
 19 		cutCommand.setHandler(doCut);
 20 
 21 		pasteCommand = commandRegistry.get(mindmaps.PasteNodeCommand);
 22 		pasteCommand.setHandler(doPaste);
 23 		pasteCommand.setEnabled(false);
 24 
 25 		eventBus.subscribe(mindmaps.Event.DOCUMENT_CLOSED, function() {
 26 			copyCommand.setEnabled(false);
 27 			cutCommand.setEnabled(false);
 28 			pasteCommand.setEnabled(false);
 29 		});
 30 
 31 		eventBus.subscribe(mindmaps.Event.DOCUMENT_OPENED, function() {
 32 			copyCommand.setEnabled(true);
 33 			cutCommand.setEnabled(true);
 34 			pasteCommand.setEnabled(node != null);
 35 		});
 36 
 37 	}
 38 
 39 	function copySelectedNode() {
 40 		node = mindmapModel.selectedNode.clone();
 41 		pasteCommand.setEnabled(true);
 42 	}
 43 
 44 	function doCopy() {
 45 		copySelectedNode();
 46 	}
 47 
 48 	function doCut() {
 49 		copySelectedNode();
 50 		mindmapModel.deleteNode(mindmapModel.selectedNode);
 51 	}
 52 
 53 	function doPaste() {
 54 		if (!node) {
 55 			return;
 56 		}
 57 
 58 		// send a cloned copy of our node, so we can paste multiple times
 59 		mindmapModel.createNode(node.clone(), mindmapModel.selectedNode);
 60 	}
 61 
 62 	init();
 63 };
