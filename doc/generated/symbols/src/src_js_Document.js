  1 /**
  2  * Creates a new Document.
  3  * 
  4  * @constructor
  5  */
  6 mindmaps.Document = function() {
  7 	this.id = mindmaps.Util.createUUID();
  8 	this.title = "New Document";
  9 	this.mindmap = new mindmaps.MindMap();
 10 	this.dates = {
 11 		created : new Date(),
 12 		modified : null
 13 	};
 14 	
 15 	this.dimensions = new mindmaps.Point(4000, 2000);
 16 };
 17 
 18 /**
 19  * Creates a new document object from a JSON string.
 20  * 
 21  * @static
 22  * @param {String} json
 23  * @returns {mindmaps.Document}
 24  */
 25 mindmaps.Document.fromJSON = function(json) {
 26 	return mindmaps.Document.fromObject(JSON.parse(json));
 27 };
 28 
 29 /**
 30  * Creates a new document object from a generic object.
 31  * 
 32  * @static
 33  * @param {Object} json
 34  * @returns {mindmaps.Document}
 35  */
 36 mindmaps.Document.fromObject = function(obj) {
 37 	var doc = new mindmaps.Document();
 38 	doc.id = obj.id;
 39 	doc.title = obj.title;
 40 	doc.mindmap = mindmaps.MindMap.fromObject(obj.mindmap);
 41 	doc.dates = {
 42 		created : new Date(obj.dates.created),
 43 		modified : obj.dates.modified ? new Date(obj.dates.modified) : null
 44 	};
 45 
 46 	doc.dimensions = mindmaps.Point.fromObject(obj.dimensions);
 47 
 48 	return doc;
 49 };
 50 
 51 /**
 52  * Called by JSON.stringify().
 53  * 
 54  * @private
 55  */
 56 mindmaps.Document.prototype.toJSON = function() {
 57 	// store dates in milliseconds since epoch
 58 	var dates = {
 59 		created : this.dates.created.getTime()
 60 	};
 61 
 62 	if (this.dates.modified) {
 63 		dates.modified = this.dates.modified.getTime();
 64 	}
 65 
 66 	return {
 67 		id : this.id,
 68 		title : this.title,
 69 		mindmap : this.mindmap,
 70 		dates : dates,
 71 		dimensions : this.dimensions
 72 	};
 73 };
 74 
 75 /**
 76  * Returns a JSON representation of the object.
 77  * 
 78  * @returns {String} the json.
 79  */
 80 mindmaps.Document.prototype.serialize = function() {
 81 	return JSON.stringify(this);
 82 };
 83 
 84 /**
 85  * Sort function for Array.sort().
 86  * 
 87  * @static
 88  * @param {mindmaps.Document} doc1
 89  * @param {mindmaps.Document} doc2
 90  */
 91 mindmaps.Document.sortByModifiedDateDescending = function(doc1, doc2) {
 92 	if (doc1.dates.modified > doc2.dates.modified) {
 93 		return -1;
 94 	}
 95 	if (doc1.dates.modified < doc2.dates.modified) {
 96 		return 1;
 97 	}
 98 	return 0;
 99 };
100 
101 /**
102  * Tells whether this document considerd as "new", that is has not been saved
103  * yet.
104  * 
105  * @returns {Boolean}
106  */
107 mindmaps.Document.prototype.isNew = function() {
108 	return this.dates.modified === null;
109 };
110 
111 /**
112  * Returns the created date.
113  * 
114  * @returns {Date}
115  */
116 mindmaps.Document.prototype.getCreatedDate = function() {
117 	return this.dates.created;
118 };
