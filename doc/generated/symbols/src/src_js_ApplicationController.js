  1 /**
  2  * Creates a new Application Controller.
  3  * 
  4  * @constructor
  5  */
  6 mindmaps.ApplicationController = function() {
  7 	var eventBus = new mindmaps.EventBus();
  8 	var shortcutController = new mindmaps.ShortcutController();
  9 	var commandRegistry = new mindmaps.CommandRegistry(shortcutController);
 10 	var undoController = new mindmaps.UndoController(eventBus, commandRegistry);
 11 	var mindmapModel = new mindmaps.MindMapModel(eventBus, commandRegistry);
 12 	var clipboardController = new mindmaps.ClipboardController(eventBus,
 13 			commandRegistry, mindmapModel);
 14 	var helpController = new mindmaps.HelpController(eventBus, commandRegistry);
 15 
 16 	/**
 17 	 * Handles the new document command.
 18 	 */
 19 	function doNewDocument() {
 20 		// close old document first
 21 		var doc = mindmapModel.getDocument();
 22 		doCloseDocument();
 23 
 24 		var presenter = new mindmaps.NewDocumentPresenter(eventBus,
 25 				mindmapModel, new mindmaps.NewDocumentView());
 26 		presenter.go();
 27 	}
 28 
 29 	/**
 30 	 * Handles the save document command.
 31 	 */
 32 	function doSaveDocument() {
 33 		var presenter = new mindmaps.SaveDocumentPresenter(eventBus,
 34 				mindmapModel, new mindmaps.SaveDocumentView());
 35 		presenter.go();
 36 	}
 37 
 38 	/**
 39 	 * Handles the close document command.
 40 	 */
 41 	function doCloseDocument() {
 42 		var doc = mindmapModel.getDocument();
 43 		if (doc) {
 44 			// TODO for now simply publish events, should be intercepted by
 45 			// someone
 46 			mindmapModel.setDocument(null);
 47 		}
 48 	}
 49 
 50 	/**
 51 	 * Handles the open document command.
 52 	 */
 53 	function doOpenDocument() {
 54 		var presenter = new mindmaps.OpenDocumentPresenter(eventBus,
 55 				mindmapModel, new mindmaps.OpenDocumentView());
 56 		presenter.go();
 57 	}
 58 
 59 	/**
 60 	 * Initializes the controller, registers for all commands and subscribes to
 61 	 * event bus.
 62 	 */
 63 	this.init = function() {
 64 		var newDocumentCommand = commandRegistry
 65 				.get(mindmaps.NewDocumentCommand);
 66 		newDocumentCommand.setHandler(doNewDocument);
 67 		newDocumentCommand.setEnabled(true);
 68 
 69 		var openDocumentCommand = commandRegistry
 70 				.get(mindmaps.OpenDocumentCommand);
 71 		openDocumentCommand.setHandler(doOpenDocument);
 72 		openDocumentCommand.setEnabled(true);
 73 
 74 		var saveDocumentCommand = commandRegistry
 75 				.get(mindmaps.SaveDocumentCommand);
 76 		saveDocumentCommand.setHandler(doSaveDocument);
 77 
 78 		var closeDocumentCommand = commandRegistry
 79 				.get(mindmaps.CloseDocumentCommand);
 80 		closeDocumentCommand.setHandler(doCloseDocument);
 81 
 82 		eventBus.subscribe(mindmaps.Event.DOCUMENT_CLOSED, function() {
 83 			saveDocumentCommand.setEnabled(false);
 84 			closeDocumentCommand.setEnabled(false);
 85 		});
 86 
 87 		eventBus.subscribe(mindmaps.Event.DOCUMENT_OPENED, function() {
 88 			saveDocumentCommand.setEnabled(true);
 89 			closeDocumentCommand.setEnabled(true);
 90 		});
 91 
 92 		// connect undo events emitted from mindmap model with undo controller
 93 		mindmapModel.undoEvent = undoController.addUndo.bind(undoController);
 94 	};
 95 
 96 	/**
 97 	 * Launches the main view controller.
 98 	 */
 99 	this.go = function() {
100 		var viewController = new mindmaps.MainViewController(eventBus,
101 				mindmapModel, commandRegistry);
102 		viewController.go();
103 
104 		doNewDocument();
105 	};
106 
107 	this.init();
108 };
