import * as __WEBPACK_EXTERNAL_MODULE__wordpress_interactivity_8e89b257__ from "@wordpress/interactivity";
/******/ var __webpack_modules__ = ({

/***/ "@wordpress/interactivity":
/*!*******************************************!*\
  !*** external "@wordpress/interactivity" ***!
  \*******************************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE__wordpress_interactivity_8e89b257__;

/***/ }),

/***/ "@wordpress/interactivity-router":
/*!**************************************************!*\
  !*** external "@wordpress/interactivity-router" ***!
  \**************************************************/
/***/ ((module) => {

module.exports = import("@wordpress/interactivity-router");;

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
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!*********************!*\
  !*** ./src/view.js ***!
  \*********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/interactivity */ "@wordpress/interactivity");
/**
 * WordPress dependencies
 */


// Doesn't support modules
const {
  _n
} = wp.i18n;

// Enter key code.
const enterKeyCode = 13;

// Store
const {
  state,
  actions,
  helpers
} = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.store)('to-dos', {
  state: {
    init: true,
    editingToDo: 0,
    toDos: [],
    get hasToDos() {
      return state.toDos.length > 0;
    },
    get toDosLeft() {
      return state.toDos.filter(toDo => !toDo.completed).length;
    },
    get itemsLeft() {
      return ` ${_n('item', 'items', state.toDosLeft, 'to-do-mvc')} left`;
    },
    get hasCompletedTodos() {
      return state.toDos.some(toDo => toDo.completed);
    },
    get isBeingEdited() {
      const {
        item: {
          id
        }
      } = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      return state.editingToDo == parseInt(id);
    },
    get todosToDisplay() {
      switch (state.view) {
        case 'active':
          return state.toDos.filter(toDo => !toDo.completed);
        case 'completed':
          return state.toDos.filter(toDo => toDo.completed);
        default:
          return state.toDos;
      }
    },
    get checkViewState() {
      const {
        attributes: {
          'data-status': status
        }
      } = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getElement)();
      return state.view === status;
    }
  },
  actions: {
    saveEditsForTodo: e => {
      switch (e.keyCode) {
        case enterKeyCode:
          {
            helpers.saveEditsForTodo();
          }
      }
    },
    onKeyDown: e => {
      switch (e.keyCode) {
        case enterKeyCode:
          {
            // Gets the element that is bound to the action.
            const {
              ref
            } = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getElement)();
            if (state.editingToDo === 0) {
              // Add the new to-do to the list.
              state.toDos = [...state.toDos, {
                id: state.toDos.length + 1,
                title: ref.value,
                completed: false
              }];

              // Clear the input field.
              ref.value = '';
            }
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
    },
    editTodo: e => {
      const {
        item: {
          id
        }
      } = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();

      // Setting the todo id that is being edited.
      state.editingToDo = parseInt(id);

      // Works to set the focus on the clicked todo. We need to delay slightly to allow the todo edit input to be focused.
      setTimeout((0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.withScope)(() => {
        const {
          ref
        } = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getElement)();
        ref.closest('li').querySelector('.edit').focus();
      }), 0);
    },
    focused: e => {
      console.log(e);
    },
    editBlur: () => {
      helpers.saveEditsForTodo();
    },
    showAllTodos: e => {
      state.view = 'all';
      actions.navigate(e);
    },
    showActiveTodos: e => {
      state.view = 'active';
      actions.navigate(e);
    },
    showCompletedTodos: e => {
      state.view = 'completed';
      actions.navigate(e);
    },
    *navigate(e) {
      e.preventDefault();
      const {
        actions
      } = yield Promise.resolve(/*! import() */).then(__webpack_require__.bind(__webpack_require__, /*! @wordpress/interactivity-router */ "@wordpress/interactivity-router"));
      yield actions.navigate(e.target.href);
    }
  },
  callbacks: {
    saveTodos: () => {
      if (!state.init) {
        localStorage.setItem('toDos', JSON.stringify(state.toDos));
      }
    },
    loadTodos: () => {
      const toDos = localStorage.getItem('toDos');
      if (toDos) {
        state.toDos = JSON.parse(toDos);
      }
      state.init = false;
    },
    initCounterSection: () => {
      const {
        ref
      } = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getElement)();
      state.counterElement = ref;
    },
    updateCounterSection: () => {
      state.counterElement.innerHTML = `<strong>${state.toDosLeft}</strong>${state.itemsLeft}`;
    }
  },
  // This name is arbitrary.
  helpers: {
    saveEditsForTodo: () => {
      const {
        ref
      } = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getElement)();
      const {
        item: {
          id
        }
      } = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      if (state.editingToDo === id) {
        state.toDos = [...state.toDos.map(toDo => {
          if (toDo.id === parseInt(id)) {
            toDo.title = ref.value;
          }
          return toDo;
        })];
        state.editingToDo = 0;
      }
    }
  }
});

/**
 * Helper to log the data in a readable format. Useful for debugging parts of the store.
 *
 * Use console.log for non-store values.
 *
 * @param {*} data
 * @returns
 */
const debugLog = (data, message = 'Debug:') => console.log(message, JSON.parse(JSON.stringify(data)));
})();


//# sourceMappingURL=view.js.map