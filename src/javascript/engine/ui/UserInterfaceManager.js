/**
 * @file Interface for entire ui-handling. This prototype is used in stages to
 * access ui-based logic and to create ui-entities.
 * 
 * @author Human Interactive
 */

"use strict";

var eventManager = require( "../messaging/EventManager" );
var TOPIC = require( "../messaging/Topic" );

var system = require( "../core/System" );

var developmentPanel = require( "./DevelopmentPanel" );
var performanceMonitor = require( "./PerformanceMonitor" );
var informationPanel = require( "./InformationPanel" );
var interactionLabel = require( "./InteractionLabel" );
var loadingScreen = require( "./LoadingScreen" );
var menu = require( "./Menu" );
var textScreen = require( "./TextScreen" );
var modalDialog = require( "./ModalDialog" );
var chat = require( "./Chat" );

var self;

/**
 * Creates the user interface manager.
 * 
 * @constructor
 */
function UserInterfaceManager() {

	Object.defineProperties( this, {
		_$uiContainer : {
			value : null,
			configurable : false,
			enumerable : false,
			writable : true
		}
	} );
	
	self = this;
}

/**
 * Initializes the user interface manager.
 */
UserInterfaceManager.prototype.init = function() {

	// get reference to central ui-container
	this._$uiContainer = global.document.querySelector( "#ui-container" );

	// init controls
	informationPanel.init();
	interactionLabel.init();
	loadingScreen.init();
	menu.init();
	textScreen.init();
	modalDialog.init();
	chat.init();

	// add development information
	if ( system.isDevModeActive === true )
	{
		performanceMonitor.init();

		developmentPanel.init();
	}

	// eventing
	this._mapGlobalEventsToTopics();
	this._initGlobalEventHandler();
};

/**
 * Updates the UserInterface-Logic, called from render-loop.
 */
UserInterfaceManager.prototype.update = function() {

	if ( system.isDevModeActive === true )
	{
		performanceMonitor.update();
	}
};

/**
 * Sets the text of the information panel.
 * 
 * @param {string} textKey - The text-content of the information panel.
 */
UserInterfaceManager.prototype.setInformationPanelText = function( textKey ) {

	informationPanel.setText( textKey );
};

/**
 * Shows the interaction label.
 * 
 * @param {string} textKey - The label of the corresponding action.
 */
UserInterfaceManager.prototype.showInteractionLabel = function( textKey ) {

	interactionLabel.show( textKey );
};

/**
 * Hides the interaction label.
 */
UserInterfaceManager.prototype.hideInteractionLabel = function() {

	interactionLabel.hide();
};

/**
 * Shows the menu.
 * 
 */
UserInterfaceManager.prototype.showMenu = function() {

	menu.show();
};

/**
 * Hides the menu.
 */
UserInterfaceManager.prototype.hideMenu = function() {

	menu.hide();
};

/**
 * Shows the text screen.
 * 
 * @param {object} textObject - The conversation of the text screen.
 * @param {function} completeCallback - This function is executed, when all
 * texts are shown and the ui-element is going to hide.
 */
UserInterfaceManager.prototype.showTextScreen = function( textKeys, completeCallback ) {

	textScreen.show( textKeys, completeCallback );
};

/**
 * Hides the text screen.
 */
UserInterfaceManager.prototype.hideTextScreen = function() {

	textScreen.hide();
};

/**
 * Shows the loading screen.
 * 
 * @param {function} callback - This function is executed, when the loading
 * screen is shown.
 */
UserInterfaceManager.prototype.showLoadingScreen = function( callback ) {

	loadingScreen.show( callback );
};

/**
 * Hides the loading screen.
 */
UserInterfaceManager.prototype.hideLoadingScreen = function() {

	loadingScreen.hide();
};

/**
 * Shows the modal dialog.
 * 
 * @param {object} textKeys - The texts to display.
 */
UserInterfaceManager.prototype.showModalDialog = function( textKeys ) {

	modalDialog.show( textKeys );
};

/**
 * Hides the modal dialog.
 */
UserInterfaceManager.prototype.hideModalDialog = function() {

	modalDialog.hide();
};

/**
 * Handles the press of the space-key.
 */
UserInterfaceManager.prototype.handleUiInteraction = function() {

	if ( textScreen.isActive === true )
	{
		textScreen.complete();
	}
	else if ( loadingScreen.isActive === true && loadingScreen.isReady === true )
	{
		eventManager.publish( TOPIC.STAGE.START, undefined );
		loadingScreen.hide();
	}
};

/**
 * Maps global events to topics.
 */
UserInterfaceManager.prototype._mapGlobalEventsToTopics = function() {

	global.window.addEventListener( "resize", function() {

		eventManager.publish( TOPIC.APPLICATION.RESIZE, undefined );
	} );
};

/**
 * Initializes global event handlers.
 */
UserInterfaceManager.prototype._initGlobalEventHandler = function() {

	global.window.addEventListener( "contextmenu", this._onContextMenu );
	global.window.addEventListener( "keydown", this._onKeyDown );
};

/**
 * This method prevents the display of the contextmenu.
 * 
 * @param {object} event - The event object.
 */
UserInterfaceManager.prototype._onContextMenu = function( event ) {

	// disable contextmenu
	event.preventDefault();
};

/**
 * Executes, when a key is pressed down.
 * 
 * @param {object} event - Default event object.
 */
UserInterfaceManager.prototype._onKeyDown = function( event ) {

	switch ( event.keyCode )
	{
		// enter
		case 13:
			
			event.preventDefault();

			if ( textScreen.isActive === false && 
			     modalDialog.isActive === false && 
			     developmentPanel.isActive === false && 
			     menu.isActive === false && 
			     loadingScreen.isActive === false )
			{
				chat.toggle();
			}

			break;

		// space
		case 32:

			if ( chat.isActive === false )
			{
				// prevent scrolling
				event.preventDefault();

				// because pressing the space key can cause different actions,
				// the logic for this key handling is placed in a separate method
				self.handleUiInteraction();
			}

			break;

		// f
		case 70:

			if ( system.isDevModeActive === true && ( chat.isActive === false && 
													  menu.isActive === false && 
													  loadingScreen.isActive === false ) )
			{
				performanceMonitor.toggle();
			}

			break;
			
		// m
		case 77:
			
			if ( system.isDevModeActive === true && ( textScreen.isActive === false && 
													  modalDialog.isActive === false && 
													  chat.isActive === false && 
													  menu.isActive === false && 
													  loadingScreen.isActive === false ) )
			{
				developmentPanel.toggle();
			}
			
			break;
	}
};

module.exports = new UserInterfaceManager();