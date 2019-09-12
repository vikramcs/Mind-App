  1 /**
  2  * Events that the event bus carries.
  3  * 
  4  * @namespace
  5  */
  6 mindmaps.Event = {
  7 	/**
  8 	 * @event
  9 	 * @param {mindmaps.Document} document
 10 	 */
 11 	DOCUMENT_OPENED : "DocumentOpenedEvent",
 12 
 13 	/**
 14 	 * @event
 15 	 * @param {mindmaps.Document} document
 16 	 */
 17 	DOCUMENT_SAVED : "DocumentSavedEvent",
 18 
 19 	/**
 20 	 * @event
 21 	 * @param {mindmaps.Document} document
 22 	 */
 23 	DOCUMENT_CLOSED : "DocumentClosedEvent",
 24 
 25 	/**
 26 	 * @event
 27 	 * @param {mindmaps.Node} node
 28 	 * @param {mindmaps.Node} oldSelectedNode
 29 	 */
 30 	NODE_SELECTED : "NodeSelectedEvent",
 31 
 32 	/**
 33 	 * @event
 34 	 * @param {mindmaps.Node} node
 35 	 */
 36 	NODE_DESELECTED : "NodeDeselectedEvent",
 37 
 38 	/**
 39 	 * @event
 40 	 * @param {mindmaps.Node} node
 41 	 */
 42 	NODE_MOVED : "NodeMovedEvent",
 43 
 44 	/**
 45 	 * @event
 46 	 * @param {mindmaps.Node} node
 47 	 */
 48 	NODE_TEXT_CAPTION_CHANGED : "NodeTextCaptionChangedEvent",
 49 
 50 	/**
 51 	 * Some parameter of the node font attribute has changed.
 52 	 * 
 53 	 * @event
 54 	 * @param {mindmaps.Node} node
 55 	 */
 56 	NODE_FONT_CHANGED : "NodeFontChangedEvent",
 57 
 58 	/**
 59 	 * @event
 60 	 * @param {mindmaps.Node} node
 61 	 */
 62 	NODE_BRANCH_COLOR_CHANGED : "NodeBranchColorChangedEvent",
 63 
 64 	/**
 65 	 * @event
 66 	 * @param {mindmaps.Node} node
 67 	 */
 68 	NODE_CREATED : "NodeCreatedEvent",
 69 
 70 	/**
 71 	 * @event
 72 	 * @param {mindmaps.Node} node
 73 	 * @param {mindmaps.Node} parent
 74 	 */
 75 	NODE_DELETED : "NodeDeletedEvent",
 76 
 77 	/**
 78 	 * @event
 79 	 * @param {mindmaps.Node} node
 80 	 */
 81 	NODE_OPENED : "NodeOpenedEvent",
 82 
 83 	/**
 84 	 * @event
 85 	 * @param {mindmaps.Node} node
 86 	 */
 87 	NODE_CLOSED : "NodeClosedEvent",
 88 
 89 	/**
 90 	 * @event
 91 	 * @param {Number} zoomFactor
 92 	 */
 93 	ZOOM_CHANGED : "ZoomChangedEvent",
 94 	
 95 	/**
 96 	 * @event
 97 	 * @param {String} message
 98 	 */
 99 	NOTIFICATION_INFO: "NotificationInfoEvent",
100 	
101 	/**
102 	 * @event
103 	 * @param {String} message
104 	 */
105 	NOTIFICATION_WARN: "NotificationWarnEvent",
106 	
107 	/**
108 	 * @event
109 	 * @param {String} message
110 	 */
111 	NOTIFICATION_ERROR: "NotificationErrorEvent"
112 };
113 
114 /**
115  * Simple Event bus powered by EventEmitter.
116  * 
117  * @constructor
118  * @augments EventEmitter
119  * 
120  */
121 mindmaps.EventBus = EventEmitter;
122 
123 if (mindmaps.DEBUG) {
124 	// overwrite publish func and display amount of listeners
125 	var old = mindmaps.EventBus.prototype.emit;
126 	mindmaps.EventBus.prototype.publish = function(type) {
127 		var l = this.listeners(type).length;
128 		console.log("EventBus > publish: " + type, "(Listeners: " + l + ")");
129 
130 		old.apply(this, arguments);
131 	};
132 }
