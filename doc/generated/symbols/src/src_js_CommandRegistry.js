  1 /**
  2  * Creates a new CommandRegistry.
  3  * 
  4  * @constructor
  5  * @param {mindmaps.ShortcutController} [shortcutController]
  6  */
  7 mindmaps.CommandRegistry = function(shortcutController) {
  8 	this.commands = {};
  9 
 10 	function registerShortcut(command) {
 11 		if (command.shortcut && command.execute) {
 12 			shortcutController.register(command.shortcut, command.execute
 13 					.bind(command));
 14 		}
 15 	}
 16 
 17 	function unregisterShortcut(command) {
 18 		if (command.shortcut) {
 19 			shortcutController.unregister(command.shortcut);
 20 		}
 21 	}
 22 
 23 	/**
 24 	 * Returns a command object for the given command type.
 25 	 * 
 26 	 * @param commandType
 27 	 * @returns {mindmaps.Command} a command object.
 28 	 */
 29 	this.get = function(commandType) {
 30 		var command = this.commands[commandType];
 31 		if (!command) {
 32 			command = new commandType;
 33 			this.commands[commandType] = command;
 34 
 35 			if (shortcutController) {
 36 				registerShortcut(command);
 37 			}
 38 		}
 39 		return command;
 40 	};
 41 
 42 	/**
 43 	 * Removes the command object for the given command type.
 44 	 * 
 45 	 * @param commandType
 46 	 */
 47 	this.remove = function(commandType) {
 48 		// TODO remove by object
 49 		var command = this.commands[commandType];
 50 		if (!command) {
 51 			return;
 52 		}
 53 
 54 		delete this.commands[commandType];
 55 
 56 		if (shortcutController) {
 57 			unregisterShortcut(command);
 58 		}
 59 	};
 60 };
