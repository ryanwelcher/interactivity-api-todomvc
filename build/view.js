import * as __WEBPACK_EXTERNAL_MODULE__wordpress_interactivity_8e89b257__ from "@wordpress/interactivity";
/******/ var __webpack_modules__ = ({

/***/ "@wordpress/interactivity":
/*!*******************************************!*\
  !*** external "@wordpress/interactivity" ***!
  \*******************************************/
/***/ ((module) => {

var x = (y) => {
	var x = {}; __webpack_require__.d(x, y); return x
} 
var y = (x) => (() => (x))
module.exports = __WEBPACK_EXTERNAL_MODULE__wordpress_interactivity_8e89b257__;

/***/ })

/******/ });
/************************************************************************/
/******/ // The module cache
/******/ var __webpack_module_cache__ = {};
/******/ 
/******/ // The require function
/******/ function __webpack_require__(moduleId) {
/******/ 	// Check if module is in cache
/******/ 	var cachedModule = __webpack_module_cache__[moduleId];
/******/ 	if (cachedModule !== undefined) {
/******/ 		return cachedModule.exports;
/******/ 	}
/******/ 	// Create a new module (and put it into the cache)
/******/ 	var module = __webpack_module_cache__[moduleId] = {
/******/ 		// no module.id needed
/******/ 		// no module.loaded needed
/******/ 		exports: {}
/******/ 	};
/******/ 
/******/ 	// Execute the module function
/******/ 	__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/make namespace object */
/******/ (() => {
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = (exports) => {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/ })();
/******/ 
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!*********************!*\
  !*** ./src/view.js ***!
  \*********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/interactivity */ "@wordpress/interactivity");
/**
 * WordPress dependencies
 */


// import apiFetch from '@wordpress/api-fetch'; // Won't work.
// const apiFetch = wp.apiFetch;

const enterKeyCode = 13;
const {
  state
} = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.store)('to-dos', {
  state: {
    toDos: [],
    get hasToDos() {
      return state.toDos.length > 0;
    },
    get toDosLeft() {
      return state.toDos.filter(toDo => !toDo.completed).length;
    },
    get hasCompletedTodos() {
      return state.toDos.some(toDo => toDo.completed);
    },
    get capsSalutation() {
      return (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)().item.toLocaleUpperCase();
    }
  },
  actions: {
    onKeyDown: e => {
      switch (e.keyCode) {
        case enterKeyCode:
          {
            //??
            e.preventDefault();
            // Gets the element that is bound to the action.
            const {
              ref
            } = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getElement)();
            // Add the new to-do to the list.
            state.toDos.push({
              id: state.toDos.length + 1,
              text: ref.value,
              completed: false
            });
            // Clear the input field.
            ref.value = '';
          }
      }
    },
    toggleCompleted: () => {
      const {
        ref: {
          dataset: {
            id
          }
        }
      } = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getElement)();
      state.toDos = state.toDos.map(toDo => {
        if (toDo.id === parseInt(id)) {
          toDo.completed = !toDo.completed;
        }
        return toDo;
      });
    },
    clearCompletedTodos: () => {
      state.toDos = state.toDos.filter(toDo => !toDo.completed);
    },
    markAllComplete: () => {
      const allCompleted = state.toDos.every(toDo => toDo.completed);
      state.toDos = state.toDos.map(toDo => {
        toDo.completed = !allCompleted;
        return toDo;
      });
    },
    deleteTodo: () => {
      const {
        ref: {
          dataset: {
            id
          }
        }
      } = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getElement)();
      state.toDos = state.toDos.filter(toDo => toDo.id !== parseInt(id));
    }
  },
  callbacks: {}
});

/**
 * Helper to log the data in a readable format. Useful for debugging parts of the store.
 *
 * Use console.log for non-store values.
 *
 * @param {*} data
 * @returns
 */
const debugLog = data => console.log(JSON.parse(JSON.stringify(data)));
})();


//# sourceMappingURL=view.js.map