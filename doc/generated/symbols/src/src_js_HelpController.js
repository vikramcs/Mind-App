  1 /**
  2  * <pre>
  3  * Listens to HELP_COMMAND and displays notifications.
  4  * Provides interactive tutorial for first time users.
  5  * </pre>
  6  * 
  7  * @constructor
  8  * @param {mindmaps.EventBus} eventBus
  9  * @param {mindmaps.commandRegistry} commandRegistry
 10  */
 11 mindmaps.HelpController = function(eventBus, commandRegistry) {
 12 
 13 	/**
 14 	 * Prepare tutorial guiders.
 15 	 */
 16 	function setupInteractiveMode() {
 17 		if (isTutorialDone()) {
 18 			console.debug("skipping tutorial");
 19 			return;
 20 		}
 21 
 22 		var notifications = [];
 23 		var interactiveMode = true;
 24 
 25 		// start tutorial after a short delay
 26 		eventBus.once(mindmaps.Event.DOCUMENT_OPENED, function() {
 27 			setTimeout(start, 1000);
 28 		});
 29 
 30 		function closeAllNotifications() {
 31 			notifications.forEach(function(n) {
 32 				n.close();
 33 			});
 34 		}
 35 
 36 		var helpMain, helpRoot;
 37 		function start() {
 38 			helpMain = new mindmaps.Notification(
 39 					"#toolbar",
 40 					{
 41 						position : "bottomMiddle",
 42 						maxWidth : 550,
 43 						title : "Welcome to mindmaps",
 44 						content : "Hello there, it seems like you are new here! These bubbles "
 45 								+ "will guide you through the app. Or they won't if you want to skip this tutorial and <a class='skip-tutorial link'>click here<a/>."
 46 					});
 47 			notifications.push(helpMain);
 48 			helpMain.$().find("a.skip-tutorial").click(function() {
 49 				interactiveMode = false;
 50 				closeAllNotifications();
 51 				tutorialDone();
 52 			});
 53 			setTimeout(theRoot, 2000);
 54 		}
 55 
 56 		function theRoot() {
 57 			if (isTutorialDone())
 58 				return;
 59 
 60 			helpRoot = new mindmaps.Notification(
 61 					".node-caption.root",
 62 					{
 63 						position : "bottomMiddle",
 64 						closeButton : true,
 65 						maxWidth : 350,
 66 						title : "This is where you start - your main idea",
 67 						content : "Double click the idea to change what it says. This will be the main topic of your mind map."
 68 					});
 69 			notifications.push(helpRoot);
 70 
 71 			eventBus.once(mindmaps.Event.NODE_TEXT_CAPTION_CHANGED, function() {
 72 				helpRoot.close();
 73 				setTimeout(theNub, 900);
 74 			});
 75 		}
 76 
 77 		function theNub() {
 78 			if (isTutorialDone())
 79 				return;
 80 
 81 			var helpNub = new mindmaps.Notification(
 82 					".node-caption.root",
 83 					{
 84 						position : "bottomMiddle",
 85 						closeButton : true,
 86 						maxWidth : 350,
 87 						padding : 20,
 88 						title : "Creating new ideas",
 89 						content : "Now it's time to build your mind map.<br/> Move your mouse over the idea, click and then drag"
 90 								+ " the <span style='color:red'>red circle</span> away from the root. This is how you create a new branch."
 91 					});
 92 			notifications.push(helpNub);
 93 			eventBus.once(mindmaps.Event.NODE_CREATED, function() {
 94 				helpMain.close();
 95 				helpNub.close();
 96 				setTimeout(newNode, 900);
 97 			});
 98 		}
 99 
100 		function newNode() {
101 			if (isTutorialDone())
102 				return;
103 
104 			var helpNewNode = new mindmaps.Notification(
105 					".node-container.root > .node-container:first",
106 					{
107 						position : "bottomMiddle",
108 						closeButton : true,
109 						maxWidth : 350,
110 						title : "Your first branch",
111 						content : "Great! This is easy, right? The red circle is your most important tool. Now, you can move your idea"
112 								+ " around by dragging it or double click to change the text again."
113 					});
114 			notifications.push(helpNewNode);
115 			setTimeout(inspector, 2000);
116 
117 			eventBus.once(mindmaps.Event.NODE_MOVED, function() {
118 				helpNewNode.close();
119 				setTimeout(navigate, 0);
120 				setTimeout(toolbar, 15000);
121 				setTimeout(menu, 10000);
122 				setTimeout(tutorialDone, 20000);
123 			});
124 		}
125 
126 		function navigate() {
127 			if (isTutorialDone())
128 				return;
129 
130 			var helpNavigate = new mindmaps.Notification(
131 					".float-panel:has(#navigator)",
132 					{
133 						position : "bottomRight",
134 						closeButton : true,
135 						maxWidth : 350,
136 						expires : 10000,
137 						title : "Navigation",
138 						content : "You can click and drag the background of the map to move around. Use your mousewheel or slider over there to zoom in and out."
139 					});
140 			notifications.push(helpNavigate);
141 		}
142 
143 		function inspector() {
144 			if (isTutorialDone())
145 				return;
146 
147 			var helpInspector = new mindmaps.Notification(
148 					"#inspector",
149 					{
150 						position : "leftBottom",
151 						closeButton : true,
152 						maxWidth : 350,
153 						padding : 20,
154 						title : "Don't like the colors?",
155 						content : "Use these controls to change the appearance of your ideas. "
156 								+ "Try clicking the icon in the upper right corner to minimize this panel."
157 					});
158 			notifications.push(helpInspector);
159 		}
160 
161 		function toolbar() {
162 			if (isTutorialDone())
163 				return;
164 
165 			var helpToolbar = new mindmaps.Notification(
166 					"#toolbar .buttons-left",
167 					{
168 						position : "bottomLeft",
169 						closeButton : true,
170 						maxWidth : 350,
171 						padding : 20,
172 						title : "The tool bar",
173 						content : "Those buttons do what they say. You can use them or work with keyboard shortcuts. "
174 								+ "Hover over the buttons for the key combinations."
175 					});
176 			notifications.push(helpToolbar);
177 		}
178 
179 		function menu() {
180 			if (isTutorialDone())
181 				return;
182 
183 			var helpMenu = new mindmaps.Notification(
184 					"#toolbar .buttons-right",
185 					{
186 						position : "leftTop",
187 						closeButton : true,
188 						maxWidth : 350,
189 						title : "Save your work",
190 						content : "The button to the right opens a menu where you can save your mind map or start working "
191 								+ "on another one if you like."
192 					});
193 			notifications.push(helpMenu);
194 		}
195 
196 		function isTutorialDone() {
197 			return mindmaps.LocalStorage.get("mindmaps.tutorial.done") == 1;
198 		}
199 
200 		function tutorialDone() {
201 			mindmaps.LocalStorage.put("mindmaps.tutorial.done", 1);
202 		}
203 
204 	}
205 
206 	/**
207 	 * Prepares notfications to show for help command.
208 	 */
209 	function setupHelpButton() {
210 		var command = commandRegistry.get(mindmaps.HelpCommand);
211 		command.setHandler(showHelp);
212 
213 		var notifications = [];
214 		function showHelp() {
215 			// true if atleast one notifications is still on screen
216 			var displaying = notifications.some(function(noti) {
217 				return noti.isVisible();
218 			});
219 
220 			// hide notifications if visible
221 			if (displaying) {
222 				notifications.forEach(function(noti) {
223 					noti.close();
224 				});
225 				notifications.length = 0;
226 				return;
227 			}
228 
229 			// show notifications
230 			var helpRoot = new mindmaps.Notification(
231 					".node-caption.root",
232 					{
233 						position : "bottomLeft",
234 						closeButton : true,
235 						maxWidth : 350,
236 						title : "This is your main idea",
237 						content : "Double click an idea to edit its text. Move the mouse over "
238 								+ "an idea and drag the red circle to create a new idea."
239 					});
240 
241 			var helpNavigator = new mindmaps.Notification(
242 					"#navigator",
243 					{
244 						position : "leftTop",
245 						closeButton : true,
246 						maxWidth : 350,
247 						padding : 20,
248 						title : "This is the navigator",
249 						content : "Use this panel to get an overview of your map. "
250 								+ "You can navigate around by dragging the red rectangle or change the zoom by clicking on the magnifier buttons."
251 					});
252 
253 			var helpInspector = new mindmaps.Notification(
254 					"#inspector",
255 					{
256 						position : "leftTop",
257 						closeButton : true,
258 						maxWidth : 350,
259 						padding : 20,
260 						title : "This is the inspector",
261 						content : "Use these controls to change the appearance of your ideas. "
262 								+ "Try clicking the icon in the upper right corner to minimize this panel."
263 					});
264 
265 			var helpToolbar = new mindmaps.Notification(
266 					"#toolbar .buttons-left",
267 					{
268 						position : "bottomLeft",
269 						closeButton : true,
270 						maxWidth : 350,
271 						title : "This is your toolbar",
272 						content : "Those buttons do what they say. You can use them or work with keyboard shortcuts. "
273 								+ "Hover over the buttons for the key combinations."
274 					});
275 
276 			notifications.push(helpRoot, helpNavigator, helpInspector,
277 					helpToolbar);
278 		}
279 	}
280 
281 	setupInteractiveMode();
282 	setupHelpButton();
283 };
284 
