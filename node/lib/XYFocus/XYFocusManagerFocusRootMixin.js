﻿"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var isElementVisible_1 = require('./Foundation/isElementVisible');
var XYDirections = require('./XYDirections');
function XYFocusManagerFocusRootMixin(XYFocusManager) {
    return (function (_super) {
        __extends(XYFocusManagerFocusRoot, _super);
        function XYFocusManagerFocusRoot(focusManager, xyInputManager) {
            _super.call(this, focusManager, xyInputManager);
            this._currFocusRoot = null;
            this._currFocusEl = null;
            // Prevent clicks and touches on the document from taking focus away from the
            // current focus root. This will only occur if the body of the web page is
            // really short and there is blank space below the body in the browser.
            document.documentElement.addEventListener('mousedown', function (event) {
                if (event.eventPhase === 2 /* AT_TARGET */) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                }
            });
            var self = this;
            this.focusManager.addEventListener('focuschanged', function (event) {
                if (event.focusElement === self._currFocusEl)
                    return;
                var focusRoot = getFocusRoot(event.focusElement);
                if (focusRoot === self._currFocusRoot || !self._currFocusRoot) {
                    self._currFocusEl = event.focusElement;
                    self._currFocusRoot = focusRoot;
                }
                else {
                    event.stopImmediatePropagation();
                    self.focusManager.setCurrentFocusElement(self._currFocusEl);
                }
            });
            document.body.tabIndex = -1;
            document.body.dataset['focusRoot'] = '';
            var nextFocusEl = this.getFirstFocusableChild(document.body);
            this.focusManager.setCurrentFocusElement(nextFocusEl);
        }
        XYFocusManagerFocusRoot.prototype.currentFocusRoot = function () {
            return this._currFocusRoot;
        };
        XYFocusManagerFocusRoot.prototype.currentFocusElement = function () {
            return this._currFocusEl;
        };
        XYFocusManagerFocusRoot.prototype.getFirstFocusableChild = function (parentEl) {
            return [].slice.call(parentEl.childNodes)
                .filter(this.focusManager.isElementFocusable.bind(this.focusManager))
                .filter(isElementVisible_1.default)
                .shift();
        };
        XYFocusManagerFocusRoot.prototype.getFocusRoot = function (el) {
            el = el.parentNode;
            while (el && el.dataset && el.dataset['focusRoot'] !== '') {
                el = el.parentNode;
            }
            if (el && el.dataset && el.dataset['focusRoot'] === '')
                return el;
            return null;
        };
        // Overriddes
        XYFocusManagerFocusRoot.prototype.getNextFocusElementPositionOverride = function (xyDirection, el) {
            var isFocusRoot = el.dataset['focusRoot'] === '';
            var rect = el.getBoundingClientRect();
            if (isFocusRoot) {
                switch (xyDirection) {
                    case XYDirections.DIR_RIGHT:
                        return { x: rect.left + rect.width, y: rect.top };
                    case XYDirections.DIR_DOWN:
                        return { x: rect.left, y: rect.top + rect.height };
                }
            }
            return { x: rect.left, y: rect.top };
        };
        XYFocusManagerFocusRoot.prototype.getNextFocusElement = function (xyDirection) {
            var nextFocusEl = _super.prototype.getNextFocusElement.call(this, xyDirection);
            if (nextFocusEl) {
                var focusRoot = this.getFocusRoot(nextFocusEl);
                if (focusRoot !== this._currFocusRoot) {
                    // Find the next tabbable element that is in our current focus root.
                    // We get here when the next focusable element is inside a different focus root
                    // than our current focus root. So we are effectively trying to skip over the
                    // next focus root.
                    do {
                        var offset = (xyDirection === XYDirections.DIR_RIGHT || xyDirection === XYDirections.DIR_DOWN) ? 1 : -1;
                        nextFocusEl = getNextTabbableElement(nextFocusEl, offset);
                    } while (nextFocusEl && this.getFocusRoot(nextFocusEl) !== this._currFocusRoot);
                }
            }
            return nextFocusEl;
        };
        return XYFocusManagerFocusRoot;
    }(XYFocusManager));
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = XYFocusManagerFocusRootMixin;
