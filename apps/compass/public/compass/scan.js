'use client';
(function (exports) {
  'use strict';

  var _documentCurrentScript = typeof document !== 'undefined' ? document.currentScript : null;
  /**
   * Copyright 2024 Aiden Bai, Million Software, Inc.
   *
   * Permission is hereby granted, free of charge, to any person obtaining a copy of this software
   * and associated documentation files (the “Software”), to deal in the Software without restriction,
   * including without limitation the rights to use, copy, modify, merge, publish, distribute,
   * sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
   * furnished to do so, subject to the following conditions:
   *
   * The above copyright notice and this permission notice shall be included in all copies or
   * substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
   * BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
   * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
   * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
   */

  // ../../node_modules/.pnpm/bippy@0.2.7/node_modules/bippy/dist/chunk-ZF32UKFC.js
  var version = "0.2.7";
  var BIPPY_INSTRUMENTATION_STRING = `bippy-${version}`;
  var NO_OP = () => {
  };
  var checkDCE = (fn2) => {
    try {
      const code = Function.prototype.toString.call(fn2);
      if (code.indexOf("^_^") > -1) {
        setTimeout(() => {
          throw new Error(
            "React is running in production mode, but dead code elimination has not been applied. Read how to correctly configure React for production: https://reactjs.org/link/perf-use-production-build"
          );
        });
      }
    } catch {
    }
  };
  var isRealReactDevtools = (rdtHook2 = getRDTHook()) => {
    return "getFiberRoots" in rdtHook2;
  };
  var isReactRefreshOverride = false;
  var isReactRefresh = (rdtHook2 = getRDTHook()) => {
    if (isReactRefreshOverride) return true;
    return !("checkDCE" in rdtHook2);
  };
  var installRDTHook = (onActive) => {
    const renderers = /* @__PURE__ */ new Map();
    let i5 = 0;
    const rdtHook2 = {
      checkDCE,
      supportsFiber: true,
      supportsFlight: true,
      hasUnsupportedRendererAttached: false,
      renderers,
      onCommitFiberRoot: NO_OP,
      onCommitFiberUnmount: NO_OP,
      onPostCommitFiberRoot: NO_OP,
      inject(renderer) {
        const nextID = ++i5;
        renderers.set(nextID, renderer);
        if (!rdtHook2._instrumentationIsActive) {
          rdtHook2._instrumentationIsActive = true;
          onActive?.();
        }
        return nextID;
      },
      _instrumentationSource: BIPPY_INSTRUMENTATION_STRING,
      _instrumentationIsActive: false
    };
    try {
      Object.defineProperty(globalThis, "__REACT_DEVTOOLS_GLOBAL_HOOK__", {
        value: rdtHook2
      });
    } catch {
      patchRDTHook(onActive);
    }
    return rdtHook2;
  };
  var patchRDTHook = (onActive) => {
    try {
      const rdtHook2 = globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__;
      if (!rdtHook2._instrumentationSource) {
        isReactRefreshOverride = isReactRefresh(rdtHook2);
        rdtHook2.checkDCE = checkDCE;
        rdtHook2.supportsFiber = true;
        rdtHook2.supportsFlight = true;
        rdtHook2.hasUnsupportedRendererAttached = false;
        rdtHook2._instrumentationSource = BIPPY_INSTRUMENTATION_STRING;
        rdtHook2._instrumentationIsActive = true;
      }
    } catch {
    }
    onActive?.();
  };
  var hasRDTHook = () => {
    return Object.prototype.hasOwnProperty.call(
      globalThis,
      "__REACT_DEVTOOLS_GLOBAL_HOOK__"
    );
  };
  var getRDTHook = (onActive) => {
    if (!hasRDTHook()) {
      return installRDTHook(onActive);
    }
    patchRDTHook(onActive);
    return globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  };
  var isRegistered = false;
  try {
    if (typeof window !== "undefined" && // @ts-expect-error `document` may not be defined in some enviroments
    (window.document?.createElement || window.navigator?.product === "ReactNative")) {
      installRDTHook();
      if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
        navigator.serviceWorker.register(new URL("./sw.js", (_documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === 'SCRIPT' && _documentCurrentScript.src || new URL('auto.global.js', document.baseURI).href))).then(() => {
          isRegistered = true;
        }).catch(() => {
        });
      }
    }
  } catch {
  }
  var FunctionComponentTag = 0;
  var ClassComponentTag = 1;
  var HostRootTag = 3;
  var HostComponentTag = 5;
  var HostTextTag = 6;
  var FragmentTag = 7;
  var ContextConsumerTag = 9;
  var ForwardRefTag = 11;
  var SuspenseComponentTag = 13;
  var MemoComponentTag = 14;
  var SimpleMemoComponentTag = 15;
  var DehydratedSuspenseComponentTag = 18;
  var OffscreenComponentTag = 22;
  var LegacyHiddenComponentTag = 23;
  var HostHoistableTag = 26;
  var HostSingletonTag = 27;
  var CONCURRENT_MODE_NUMBER = 60111;
  var CONCURRENT_MODE_SYMBOL_STRING = "Symbol(react.concurrent_mode)";
  var DEPRECATED_ASYNC_MODE_SYMBOL_STRING = "Symbol(react.async_mode)";
  var PerformedWork = 1;
  var Placement = 2;
  var Hydrating = 4096;
  var Update = 4;
  var Cloned = 8;
  var ChildDeletion = 16;
  var ContentReset = 32;
  var Snapshot = 1024;
  var Visibility = 8192;
  var MutationMask = Placement | Update | ChildDeletion | ContentReset | Hydrating | Visibility | Snapshot;
  var isHostFiber = (fiber) => {
    switch (fiber.tag) {
      case HostComponentTag:
      // @ts-expect-error: it exists
      case HostHoistableTag:
      // @ts-expect-error: it exists
      case HostSingletonTag:
        return true;
      default:
        return typeof fiber.type === "string";
    }
  };
  var isCompositeFiber = (fiber) => {
    switch (fiber.tag) {
      case FunctionComponentTag:
      case ClassComponentTag:
      case SimpleMemoComponentTag:
      case MemoComponentTag:
      case ForwardRefTag:
        return true;
      default:
        return false;
    }
  };
  var didFiberRender = (fiber) => {
    const nextProps = fiber.memoizedProps;
    const prevProps = fiber.alternate?.memoizedProps || {};
    const flags = fiber.flags ?? fiber.effectTag ?? 0;
    switch (fiber.tag) {
      case ClassComponentTag:
      case FunctionComponentTag:
      case ContextConsumerTag:
      case ForwardRefTag:
      case MemoComponentTag:
      case SimpleMemoComponentTag: {
        return (flags & PerformedWork) === PerformedWork;
      }
      default:
        if (!fiber.alternate) return true;
        return prevProps !== nextProps || fiber.alternate.memoizedState !== fiber.memoizedState || fiber.alternate.ref !== fiber.ref;
    }
  };
  var didFiberCommit = (fiber) => {
    return Boolean(
      (fiber.flags & (MutationMask | Cloned)) !== 0 || (fiber.subtreeFlags & (MutationMask | Cloned)) !== 0
    );
  };
  var shouldFilterFiber = (fiber) => {
    switch (fiber.tag) {
      case DehydratedSuspenseComponentTag:
        return true;
      case HostTextTag:
      case FragmentTag:
      case LegacyHiddenComponentTag:
      case OffscreenComponentTag:
        return true;
      case HostRootTag:
        return false;
      default: {
        const symbolOrNumber = typeof fiber.type === "object" && fiber.type !== null ? fiber.type.$$typeof : fiber.type;
        const typeSymbol = typeof symbolOrNumber === "symbol" ? symbolOrNumber.toString() : symbolOrNumber;
        switch (typeSymbol) {
          case CONCURRENT_MODE_NUMBER:
          case CONCURRENT_MODE_SYMBOL_STRING:
          case DEPRECATED_ASYNC_MODE_SYMBOL_STRING:
            return true;
          default:
            return false;
        }
      }
    }
  };
  var getNearestHostFibers = (fiber) => {
    const hostFibers = [];
    const stack = [];
    if (isHostFiber(fiber)) {
      hostFibers.push(fiber);
    } else if (fiber.child) {
      stack.push(fiber.child);
    }
    while (stack.length) {
      const currentNode = stack.pop();
      if (!currentNode) break;
      if (isHostFiber(currentNode)) {
        hostFibers.push(currentNode);
      } else if (currentNode.child) {
        stack.push(currentNode.child);
      }
      if (currentNode.sibling) {
        stack.push(currentNode.sibling);
      }
    }
    return hostFibers;
  };
  var traverseFiber = (fiber, selector, ascending = false) => {
    if (!fiber) return null;
    if (selector(fiber) === true) return fiber;
    let child = ascending ? fiber.return : fiber.child;
    while (child) {
      const match = traverseFiber(child, selector, ascending);
      if (match) return match;
      child = ascending ? null : child.sibling;
    }
    return null;
  };
  var getTimings = (fiber) => {
    const totalTime = fiber?.actualDuration ?? 0;
    let selfTime = totalTime;
    let child = fiber?.child ?? null;
    while (totalTime > 0 && child != null) {
      selfTime -= child.actualDuration ?? 0;
      child = child.sibling;
    }
    return { selfTime, totalTime };
  };
  var hasMemoCache = (fiber) => {
    return Boolean(
      fiber.updateQueue?.memoCache
    );
  };
  var getType = (type) => {
    const currentType = type;
    if (typeof currentType === "function") {
      return currentType;
    }
    if (typeof currentType === "object" && currentType) {
      return getType(
        currentType.type || currentType.render
      );
    }
    return null;
  };
  var getDisplayName = (type) => {
    const currentType = type;
    if (typeof currentType !== "function" && !(typeof currentType === "object" && currentType)) {
      return null;
    }
    const name = currentType.displayName || currentType.name || null;
    if (name) return name;
    const unwrappedType = getType(currentType);
    if (!unwrappedType) return null;
    return unwrappedType.displayName || unwrappedType.name || null;
  };
  var detectReactBuildType = (renderer) => {
    try {
      if (typeof renderer.version === "string" && renderer.bundleType > 0) {
        return "development";
      }
    } catch {
    }
    return "production";
  };
  var isInstrumentationActive = () => {
    const rdtHook2 = getRDTHook();
    return Boolean(rdtHook2._instrumentationIsActive) || isRealReactDevtools() || isReactRefresh();
  };
  var fiberId = 0;
  var fiberIdMap = /* @__PURE__ */ new WeakMap();
  var setFiberId = (fiber, id = fiberId++) => {
    fiberIdMap.set(fiber, id);
  };
  var getFiberId = (fiber) => {
    let id = fiberIdMap.get(fiber);
    if (!id && fiber.alternate) {
      id = fiberIdMap.get(fiber.alternate);
    }
    if (!id) {
      id = fiberId++;
      setFiberId(fiber, id);
    }
    return id;
  };
  var mountFiberRecursively = (onRender2, firstChild, traverseSiblings) => {
    let fiber = firstChild;
    while (fiber != null) {
      if (!fiberIdMap.has(fiber)) {
        getFiberId(fiber);
      }
      const shouldIncludeInTree = !shouldFilterFiber(fiber);
      if (shouldIncludeInTree && didFiberRender(fiber)) {
        onRender2(fiber, "mount");
      }
      if (fiber.tag === SuspenseComponentTag) {
        const isTimedOut = fiber.memoizedState !== null;
        if (isTimedOut) {
          const primaryChildFragment = fiber.child;
          const fallbackChildFragment = primaryChildFragment ? primaryChildFragment.sibling : null;
          if (fallbackChildFragment) {
            const fallbackChild = fallbackChildFragment.child;
            if (fallbackChild !== null) {
              mountFiberRecursively(onRender2, fallbackChild, false);
            }
          }
        } else {
          let primaryChild = null;
          if (fiber.child !== null) {
            primaryChild = fiber.child.child;
          }
          if (primaryChild !== null) {
            mountFiberRecursively(onRender2, primaryChild, false);
          }
        }
      } else if (fiber.child != null) {
        mountFiberRecursively(onRender2, fiber.child, true);
      }
      fiber = traverseSiblings ? fiber.sibling : null;
    }
  };
  var updateFiberRecursively = (onRender2, nextFiber, prevFiber, parentFiber) => {
    if (!fiberIdMap.has(nextFiber)) {
      getFiberId(nextFiber);
    }
    if (!prevFiber) return;
    if (!fiberIdMap.has(prevFiber)) {
      getFiberId(prevFiber);
    }
    const isSuspense = nextFiber.tag === SuspenseComponentTag;
    const shouldIncludeInTree = !shouldFilterFiber(nextFiber);
    if (shouldIncludeInTree && didFiberRender(nextFiber)) {
      onRender2(nextFiber, "update");
    }
    const prevDidTimeout = isSuspense && prevFiber.memoizedState !== null;
    const nextDidTimeOut = isSuspense && nextFiber.memoizedState !== null;
    if (prevDidTimeout && nextDidTimeOut) {
      const nextFallbackChildSet = nextFiber.child?.sibling ?? null;
      const prevFallbackChildSet = prevFiber.child?.sibling ?? null;
      if (nextFallbackChildSet !== null && prevFallbackChildSet !== null) {
        updateFiberRecursively(
          onRender2,
          nextFallbackChildSet,
          prevFallbackChildSet
        );
      }
    } else if (prevDidTimeout && !nextDidTimeOut) {
      const nextPrimaryChildSet = nextFiber.child;
      if (nextPrimaryChildSet !== null) {
        mountFiberRecursively(onRender2, nextPrimaryChildSet, true);
      }
    } else if (!prevDidTimeout && nextDidTimeOut) {
      unmountFiberChildrenRecursively(onRender2, prevFiber);
      const nextFallbackChildSet = nextFiber.child?.sibling ?? null;
      if (nextFallbackChildSet !== null) {
        mountFiberRecursively(onRender2, nextFallbackChildSet, true);
      }
    } else if (nextFiber.child !== prevFiber.child) {
      let nextChild = nextFiber.child;
      while (nextChild) {
        if (nextChild.alternate) {
          const prevChild = nextChild.alternate;
          updateFiberRecursively(
            onRender2,
            nextChild,
            prevChild
          );
        } else {
          mountFiberRecursively(onRender2, nextChild, false);
        }
        nextChild = nextChild.sibling;
      }
    }
  };
  var unmountFiber = (onRender2, fiber) => {
    const isRoot = fiber.tag === HostRootTag;
    if (isRoot || !shouldFilterFiber(fiber)) {
      onRender2(fiber, "unmount");
    }
  };
  var unmountFiberChildrenRecursively = (onRender2, fiber) => {
    const isTimedOutSuspense = fiber.tag === SuspenseComponentTag && fiber.memoizedState !== null;
    let child = fiber.child;
    if (isTimedOutSuspense) {
      const primaryChildFragment = fiber.child;
      const fallbackChildFragment = primaryChildFragment?.sibling ?? null;
      child = fallbackChildFragment?.child ?? null;
    }
    while (child !== null) {
      if (child.return !== null) {
        unmountFiber(onRender2, child);
        unmountFiberChildrenRecursively(onRender2, child);
      }
      child = child.sibling;
    }
  };
  var commitId = 0;
  var rootInstanceMap = /* @__PURE__ */ new WeakMap();
  var traverseRenderedFibers = (root, onRender2) => {
    const fiber = "current" in root ? root.current : root;
    let rootInstance = rootInstanceMap.get(root);
    if (!rootInstance) {
      rootInstance = { prevFiber: null, id: commitId++ };
      rootInstanceMap.set(root, rootInstance);
    }
    const { prevFiber } = rootInstance;
    if (!fiber) {
      unmountFiber(onRender2, fiber);
    } else if (prevFiber !== null) {
      const wasMounted = prevFiber && prevFiber.memoizedState != null && prevFiber.memoizedState.element != null && // A dehydrated root is not considered mounted
      prevFiber.memoizedState.isDehydrated !== true;
      const isMounted = fiber.memoizedState != null && fiber.memoizedState.element != null && // A dehydrated root is not considered mounted
      fiber.memoizedState.isDehydrated !== true;
      if (!wasMounted && isMounted) {
        mountFiberRecursively(onRender2, fiber, false);
      } else if (wasMounted && isMounted) {
        updateFiberRecursively(onRender2, fiber, fiber.alternate);
      } else if (wasMounted && !isMounted) {
        unmountFiber(onRender2, fiber);
      }
    } else {
      mountFiberRecursively(onRender2, fiber, true);
    }
    rootInstance.prevFiber = fiber;
  };
  var instrument = (options) => {
    return getRDTHook(() => {
      const rdtHook2 = getRDTHook();
      options.onActive?.();
      rdtHook2._instrumentationSource = options.name ?? BIPPY_INSTRUMENTATION_STRING;
      const prevOnCommitFiberRoot = rdtHook2.onCommitFiberRoot;
      if (options.onCommitFiberRoot) {
        rdtHook2.onCommitFiberRoot = (rendererID, root, priority) => {
          if (prevOnCommitFiberRoot)
            prevOnCommitFiberRoot(rendererID, root, priority);
          options.onCommitFiberRoot?.(rendererID, root, priority);
        };
      }
      const prevOnCommitFiberUnmount = rdtHook2.onCommitFiberUnmount;
      if (options.onCommitFiberUnmount) {
        rdtHook2.onCommitFiberUnmount = (rendererID, root) => {
          if (prevOnCommitFiberUnmount)
            prevOnCommitFiberUnmount(rendererID, root);
          options.onCommitFiberUnmount?.(rendererID, root);
        };
      }
      const prevOnPostCommitFiberRoot = rdtHook2.onPostCommitFiberRoot;
      if (options.onPostCommitFiberRoot) {
        rdtHook2.onPostCommitFiberRoot = (rendererID, root) => {
          if (prevOnPostCommitFiberRoot)
            prevOnPostCommitFiberRoot(rendererID, root);
          options.onPostCommitFiberRoot?.(rendererID, root);
        };
      }
    });
  };

  // src/install-hook.ts
  var init = () => {
    installRDTHook();
  };
  init();

  // ../../node_modules/.pnpm/preact@10.25.1/node_modules/preact/dist/preact.module.js
  var n;
  var l;
  var u;
  var t;
  var i;
  var r;
  var o;
  var e;
  var f;
  var c;
  var s;
  var a;
  var p = {};
  var v = [];
  var y = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
  var d = Array.isArray;
  function w(n3, l5) {
    for (var u5 in l5) n3[u5] = l5[u5];
    return n3;
  }
  function _(n3) {
    n3 && n3.parentNode && n3.parentNode.removeChild(n3);
  }
  function g(l5, u5, t4) {
    var i5, r5, o4, e4 = {};
    for (o4 in u5) "key" == o4 ? i5 = u5[o4] : "ref" == o4 ? r5 = u5[o4] : e4[o4] = u5[o4];
    if (arguments.length > 2 && (e4.children = arguments.length > 3 ? n.call(arguments, 2) : t4), "function" == typeof l5 && null != l5.defaultProps) for (o4 in l5.defaultProps) void 0 === e4[o4] && (e4[o4] = l5.defaultProps[o4]);
    return m(l5, e4, i5, r5, null);
  }
  function m(n3, t4, i5, r5, o4) {
    var e4 = { type: n3, props: t4, key: i5, ref: r5, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: null == o4 ? ++u : o4, __i: -1, __u: 0 };
    return null == o4 && null != l.vnode && l.vnode(e4), e4;
  }
  function k(n3) {
    return n3.children;
  }
  function x(n3, l5) {
    this.props = n3, this.context = l5;
  }
  function C(n3, l5) {
    if (null == l5) return n3.__ ? C(n3.__, n3.__i + 1) : null;
    for (var u5; l5 < n3.__k.length; l5++) if (null != (u5 = n3.__k[l5]) && null != u5.__e) return u5.__e;
    return "function" == typeof n3.type ? C(n3) : null;
  }
  function S(n3) {
    var l5, u5;
    if (null != (n3 = n3.__) && null != n3.__c) {
      for (n3.__e = n3.__c.base = null, l5 = 0; l5 < n3.__k.length; l5++) if (null != (u5 = n3.__k[l5]) && null != u5.__e) {
        n3.__e = n3.__c.base = u5.__e;
        break;
      }
      return S(n3);
    }
  }
  function M(n3) {
    (!n3.__d && (n3.__d = true) && i.push(n3) && !P.__r++ || r !== l.debounceRendering) && ((r = l.debounceRendering) || o)(P);
  }
  function P() {
    var n3, u5, t4, r5, o4, f5, c4, s5;
    for (i.sort(e); n3 = i.shift(); ) n3.__d && (u5 = i.length, r5 = void 0, f5 = (o4 = (t4 = n3).__v).__e, c4 = [], s5 = [], t4.__P && ((r5 = w({}, o4)).__v = o4.__v + 1, l.vnode && l.vnode(r5), j(t4.__P, r5, o4, t4.__n, t4.__P.namespaceURI, 32 & o4.__u ? [f5] : null, c4, null == f5 ? C(o4) : f5, !!(32 & o4.__u), s5), r5.__v = o4.__v, r5.__.__k[r5.__i] = r5, z(c4, r5, s5), r5.__e != f5 && S(r5)), i.length > u5 && i.sort(e));
    P.__r = 0;
  }
  function $(n3, l5, u5, t4, i5, r5, o4, e4, f5, c4, s5) {
    var a4, h4, y4, d5, w4, _5, g5 = t4 && t4.__k || v, m3 = l5.length;
    for (f5 = I(u5, l5, g5, f5), a4 = 0; a4 < m3; a4++) null != (y4 = u5.__k[a4]) && (h4 = -1 === y4.__i ? p : g5[y4.__i] || p, y4.__i = a4, _5 = j(n3, y4, h4, i5, r5, o4, e4, f5, c4, s5), d5 = y4.__e, y4.ref && h4.ref != y4.ref && (h4.ref && V(h4.ref, null, y4), s5.push(y4.ref, y4.__c || d5, y4)), null == w4 && null != d5 && (w4 = d5), 4 & y4.__u || h4.__k === y4.__k ? f5 = H(y4, f5, n3) : "function" == typeof y4.type && void 0 !== _5 ? f5 = _5 : d5 && (f5 = d5.nextSibling), y4.__u &= -7);
    return u5.__e = w4, f5;
  }
  function I(n3, l5, u5, t4) {
    var i5, r5, o4, e4, f5, c4 = l5.length, s5 = u5.length, a4 = s5, h4 = 0;
    for (n3.__k = [], i5 = 0; i5 < c4; i5++) null != (r5 = l5[i5]) && "boolean" != typeof r5 && "function" != typeof r5 ? (e4 = i5 + h4, (r5 = n3.__k[i5] = "string" == typeof r5 || "number" == typeof r5 || "bigint" == typeof r5 || r5.constructor == String ? m(null, r5, null, null, null) : d(r5) ? m(k, { children: r5 }, null, null, null) : void 0 === r5.constructor && r5.__b > 0 ? m(r5.type, r5.props, r5.key, r5.ref ? r5.ref : null, r5.__v) : r5).__ = n3, r5.__b = n3.__b + 1, o4 = null, -1 !== (f5 = r5.__i = T(r5, u5, e4, a4)) && (a4--, (o4 = u5[f5]) && (o4.__u |= 2)), null == o4 || null === o4.__v ? (-1 == f5 && h4--, "function" != typeof r5.type && (r5.__u |= 4)) : f5 !== e4 && (f5 == e4 - 1 ? h4-- : f5 == e4 + 1 ? h4++ : (f5 > e4 ? h4-- : h4++, r5.__u |= 4))) : r5 = n3.__k[i5] = null;
    if (a4) for (i5 = 0; i5 < s5; i5++) null != (o4 = u5[i5]) && 0 == (2 & o4.__u) && (o4.__e == t4 && (t4 = C(o4)), q(o4, o4));
    return t4;
  }
  function H(n3, l5, u5) {
    var t4, i5;
    if ("function" == typeof n3.type) {
      for (t4 = n3.__k, i5 = 0; t4 && i5 < t4.length; i5++) t4[i5] && (t4[i5].__ = n3, l5 = H(t4[i5], l5, u5));
      return l5;
    }
    n3.__e != l5 && (l5 && n3.type && !u5.contains(l5) && (l5 = C(n3)), u5.insertBefore(n3.__e, l5 || null), l5 = n3.__e);
    do {
      l5 = l5 && l5.nextSibling;
    } while (null != l5 && 8 === l5.nodeType);
    return l5;
  }
  function L(n3, l5) {
    return l5 = l5 || [], null == n3 || "boolean" == typeof n3 || (d(n3) ? n3.some(function(n4) {
      L(n4, l5);
    }) : l5.push(n3)), l5;
  }
  function T(n3, l5, u5, t4) {
    var i5 = n3.key, r5 = n3.type, o4 = u5 - 1, e4 = u5 + 1, f5 = l5[u5];
    if (null === f5 || f5 && i5 == f5.key && r5 === f5.type && 0 == (2 & f5.__u)) return u5;
    if (("function" != typeof r5 || r5 === k || i5) && t4 > (null != f5 && 0 == (2 & f5.__u) ? 1 : 0)) for (; o4 >= 0 || e4 < l5.length; ) {
      if (o4 >= 0) {
        if ((f5 = l5[o4]) && 0 == (2 & f5.__u) && i5 == f5.key && r5 === f5.type) return o4;
        o4--;
      }
      if (e4 < l5.length) {
        if ((f5 = l5[e4]) && 0 == (2 & f5.__u) && i5 == f5.key && r5 === f5.type) return e4;
        e4++;
      }
    }
    return -1;
  }
  function A(n3, l5, u5) {
    "-" === l5[0] ? n3.setProperty(l5, null == u5 ? "" : u5) : n3[l5] = null == u5 ? "" : "number" != typeof u5 || y.test(l5) ? u5 : u5 + "px";
  }
  function F(n3, l5, u5, t4, i5) {
    var r5;
    n: if ("style" === l5) if ("string" == typeof u5) n3.style.cssText = u5;
    else {
      if ("string" == typeof t4 && (n3.style.cssText = t4 = ""), t4) for (l5 in t4) u5 && l5 in u5 || A(n3.style, l5, "");
      if (u5) for (l5 in u5) t4 && u5[l5] === t4[l5] || A(n3.style, l5, u5[l5]);
    }
    else if ("o" === l5[0] && "n" === l5[1]) r5 = l5 !== (l5 = l5.replace(f, "$1")), l5 = l5.toLowerCase() in n3 || "onFocusOut" === l5 || "onFocusIn" === l5 ? l5.toLowerCase().slice(2) : l5.slice(2), n3.l || (n3.l = {}), n3.l[l5 + r5] = u5, u5 ? t4 ? u5.u = t4.u : (u5.u = c, n3.addEventListener(l5, r5 ? a : s, r5)) : n3.removeEventListener(l5, r5 ? a : s, r5);
    else {
      if ("http://www.w3.org/2000/svg" == i5) l5 = l5.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
      else if ("width" != l5 && "height" != l5 && "href" != l5 && "list" != l5 && "form" != l5 && "tabIndex" != l5 && "download" != l5 && "rowSpan" != l5 && "colSpan" != l5 && "role" != l5 && "popover" != l5 && l5 in n3) try {
        n3[l5] = null == u5 ? "" : u5;
        break n;
      } catch (n4) {
      }
      "function" == typeof u5 || (null == u5 || false === u5 && "-" !== l5[4] ? n3.removeAttribute(l5) : n3.setAttribute(l5, "popover" == l5 && 1 == u5 ? "" : u5));
    }
  }
  function O(n3) {
    return function(u5) {
      if (this.l) {
        var t4 = this.l[u5.type + n3];
        if (null == u5.t) u5.t = c++;
        else if (u5.t < t4.u) return;
        return t4(l.event ? l.event(u5) : u5);
      }
    };
  }
  function j(n3, u5, t4, i5, r5, o4, e4, f5, c4, s5) {
    var a4, h4, p5, v5, y4, g5, m3, b3, C3, S2, M3, P4, I3, H2, L2, T4, A4, F4 = u5.type;
    if (void 0 !== u5.constructor) return null;
    128 & t4.__u && (c4 = !!(32 & t4.__u), o4 = [f5 = u5.__e = t4.__e]), (a4 = l.__b) && a4(u5);
    n: if ("function" == typeof F4) try {
      if (b3 = u5.props, C3 = "prototype" in F4 && F4.prototype.render, S2 = (a4 = F4.contextType) && i5[a4.__c], M3 = a4 ? S2 ? S2.props.value : a4.__ : i5, t4.__c ? m3 = (h4 = u5.__c = t4.__c).__ = h4.__E : (C3 ? u5.__c = h4 = new F4(b3, M3) : (u5.__c = h4 = new x(b3, M3), h4.constructor = F4, h4.render = B), S2 && S2.sub(h4), h4.props = b3, h4.state || (h4.state = {}), h4.context = M3, h4.__n = i5, p5 = h4.__d = true, h4.__h = [], h4._sb = []), C3 && null == h4.__s && (h4.__s = h4.state), C3 && null != F4.getDerivedStateFromProps && (h4.__s == h4.state && (h4.__s = w({}, h4.__s)), w(h4.__s, F4.getDerivedStateFromProps(b3, h4.__s))), v5 = h4.props, y4 = h4.state, h4.__v = u5, p5) C3 && null == F4.getDerivedStateFromProps && null != h4.componentWillMount && h4.componentWillMount(), C3 && null != h4.componentDidMount && h4.__h.push(h4.componentDidMount);
      else {
        if (C3 && null == F4.getDerivedStateFromProps && b3 !== v5 && null != h4.componentWillReceiveProps && h4.componentWillReceiveProps(b3, M3), !h4.__e && (null != h4.shouldComponentUpdate && false === h4.shouldComponentUpdate(b3, h4.__s, M3) || u5.__v === t4.__v)) {
          for (u5.__v !== t4.__v && (h4.props = b3, h4.state = h4.__s, h4.__d = false), u5.__e = t4.__e, u5.__k = t4.__k, u5.__k.some(function(n4) {
            n4 && (n4.__ = u5);
          }), P4 = 0; P4 < h4._sb.length; P4++) h4.__h.push(h4._sb[P4]);
          h4._sb = [], h4.__h.length && e4.push(h4);
          break n;
        }
        null != h4.componentWillUpdate && h4.componentWillUpdate(b3, h4.__s, M3), C3 && null != h4.componentDidUpdate && h4.__h.push(function() {
          h4.componentDidUpdate(v5, y4, g5);
        });
      }
      if (h4.context = M3, h4.props = b3, h4.__P = n3, h4.__e = false, I3 = l.__r, H2 = 0, C3) {
        for (h4.state = h4.__s, h4.__d = false, I3 && I3(u5), a4 = h4.render(h4.props, h4.state, h4.context), L2 = 0; L2 < h4._sb.length; L2++) h4.__h.push(h4._sb[L2]);
        h4._sb = [];
      } else do {
        h4.__d = false, I3 && I3(u5), a4 = h4.render(h4.props, h4.state, h4.context), h4.state = h4.__s;
      } while (h4.__d && ++H2 < 25);
      h4.state = h4.__s, null != h4.getChildContext && (i5 = w(w({}, i5), h4.getChildContext())), C3 && !p5 && null != h4.getSnapshotBeforeUpdate && (g5 = h4.getSnapshotBeforeUpdate(v5, y4)), f5 = $(n3, d(T4 = null != a4 && a4.type === k && null == a4.key ? a4.props.children : a4) ? T4 : [T4], u5, t4, i5, r5, o4, e4, f5, c4, s5), h4.base = u5.__e, u5.__u &= -161, h4.__h.length && e4.push(h4), m3 && (h4.__E = h4.__ = null);
    } catch (n4) {
      if (u5.__v = null, c4 || null != o4) if (n4.then) {
        for (u5.__u |= c4 ? 160 : 128; f5 && 8 === f5.nodeType && f5.nextSibling; ) f5 = f5.nextSibling;
        o4[o4.indexOf(f5)] = null, u5.__e = f5;
      } else for (A4 = o4.length; A4--; ) _(o4[A4]);
      else u5.__e = t4.__e, u5.__k = t4.__k;
      l.__e(n4, u5, t4);
    }
    else null == o4 && u5.__v === t4.__v ? (u5.__k = t4.__k, u5.__e = t4.__e) : f5 = u5.__e = N(t4.__e, u5, t4, i5, r5, o4, e4, c4, s5);
    return (a4 = l.diffed) && a4(u5), 128 & u5.__u ? void 0 : f5;
  }
  function z(n3, u5, t4) {
    for (var i5 = 0; i5 < t4.length; i5++) V(t4[i5], t4[++i5], t4[++i5]);
    l.__c && l.__c(u5, n3), n3.some(function(u6) {
      try {
        n3 = u6.__h, u6.__h = [], n3.some(function(n4) {
          n4.call(u6);
        });
      } catch (n4) {
        l.__e(n4, u6.__v);
      }
    });
  }
  function N(u5, t4, i5, r5, o4, e4, f5, c4, s5) {
    var a4, h4, v5, y4, w4, g5, m3, b3 = i5.props, k3 = t4.props, x3 = t4.type;
    if ("svg" === x3 ? o4 = "http://www.w3.org/2000/svg" : "math" === x3 ? o4 = "http://www.w3.org/1998/Math/MathML" : o4 || (o4 = "http://www.w3.org/1999/xhtml"), null != e4) {
      for (a4 = 0; a4 < e4.length; a4++) if ((w4 = e4[a4]) && "setAttribute" in w4 == !!x3 && (x3 ? w4.localName === x3 : 3 === w4.nodeType)) {
        u5 = w4, e4[a4] = null;
        break;
      }
    }
    if (null == u5) {
      if (null === x3) return document.createTextNode(k3);
      u5 = document.createElementNS(o4, x3, k3.is && k3), c4 && (l.__m && l.__m(t4, e4), c4 = false), e4 = null;
    }
    if (null === x3) b3 === k3 || c4 && u5.data === k3 || (u5.data = k3);
    else {
      if (e4 = e4 && n.call(u5.childNodes), b3 = i5.props || p, !c4 && null != e4) for (b3 = {}, a4 = 0; a4 < u5.attributes.length; a4++) b3[(w4 = u5.attributes[a4]).name] = w4.value;
      for (a4 in b3) if (w4 = b3[a4], "children" == a4) ;
      else if ("dangerouslySetInnerHTML" == a4) v5 = w4;
      else if (!(a4 in k3)) {
        if ("value" == a4 && "defaultValue" in k3 || "checked" == a4 && "defaultChecked" in k3) continue;
        F(u5, a4, null, w4, o4);
      }
      for (a4 in k3) w4 = k3[a4], "children" == a4 ? y4 = w4 : "dangerouslySetInnerHTML" == a4 ? h4 = w4 : "value" == a4 ? g5 = w4 : "checked" == a4 ? m3 = w4 : c4 && "function" != typeof w4 || b3[a4] === w4 || F(u5, a4, w4, b3[a4], o4);
      if (h4) c4 || v5 && (h4.__html === v5.__html || h4.__html === u5.innerHTML) || (u5.innerHTML = h4.__html), t4.__k = [];
      else if (v5 && (u5.innerHTML = ""), $(u5, d(y4) ? y4 : [y4], t4, i5, r5, "foreignObject" === x3 ? "http://www.w3.org/1999/xhtml" : o4, e4, f5, e4 ? e4[0] : i5.__k && C(i5, 0), c4, s5), null != e4) for (a4 = e4.length; a4--; ) _(e4[a4]);
      c4 || (a4 = "value", "progress" === x3 && null == g5 ? u5.removeAttribute("value") : void 0 !== g5 && (g5 !== u5[a4] || "progress" === x3 && !g5 || "option" === x3 && g5 !== b3[a4]) && F(u5, a4, g5, b3[a4], o4), a4 = "checked", void 0 !== m3 && m3 !== u5[a4] && F(u5, a4, m3, b3[a4], o4));
    }
    return u5;
  }
  function V(n3, u5, t4) {
    try {
      if ("function" == typeof n3) {
        var i5 = "function" == typeof n3.__u;
        i5 && n3.__u(), i5 && null == u5 || (n3.__u = n3(u5));
      } else n3.current = u5;
    } catch (n4) {
      l.__e(n4, t4);
    }
  }
  function q(n3, u5, t4) {
    var i5, r5;
    if (l.unmount && l.unmount(n3), (i5 = n3.ref) && (i5.current && i5.current !== n3.__e || V(i5, null, u5)), null != (i5 = n3.__c)) {
      if (i5.componentWillUnmount) try {
        i5.componentWillUnmount();
      } catch (n4) {
        l.__e(n4, u5);
      }
      i5.base = i5.__P = null;
    }
    if (i5 = n3.__k) for (r5 = 0; r5 < i5.length; r5++) i5[r5] && q(i5[r5], u5, t4 || "function" != typeof n3.type);
    t4 || _(n3.__e), n3.__c = n3.__ = n3.__e = void 0;
  }
  function B(n3, l5, u5) {
    return this.constructor(n3, u5);
  }
  function D(u5, t4, i5) {
    var r5, o4, e4, f5;
    t4 === document && (t4 = document.documentElement), l.__ && l.__(u5, t4), o4 = (r5 = "function" == typeof i5) ? null : t4.__k, e4 = [], f5 = [], j(t4, u5 = (!r5 && i5 || t4).__k = g(k, null, [u5]), o4 || p, p, t4.namespaceURI, !r5 && i5 ? [i5] : o4 ? null : t4.firstChild ? n.call(t4.childNodes) : null, e4, !r5 && i5 ? i5 : o4 ? o4.__e : t4.firstChild, r5, f5), z(e4, u5, f5);
  }
  n = v.slice, l = { __e: function(n3, l5, u5, t4) {
    for (var i5, r5, o4; l5 = l5.__; ) if ((i5 = l5.__c) && !i5.__) try {
      if ((r5 = i5.constructor) && null != r5.getDerivedStateFromError && (i5.setState(r5.getDerivedStateFromError(n3)), o4 = i5.__d), null != i5.componentDidCatch && (i5.componentDidCatch(n3, t4 || {}), o4 = i5.__d), o4) return i5.__E = i5;
    } catch (l6) {
      n3 = l6;
    }
    throw n3;
  } }, u = 0, t = function(n3) {
    return null != n3 && null == n3.constructor;
  }, x.prototype.setState = function(n3, l5) {
    var u5;
    u5 = null != this.__s && this.__s !== this.state ? this.__s : this.__s = w({}, this.state), "function" == typeof n3 && (n3 = n3(w({}, u5), this.props)), n3 && w(u5, n3), null != n3 && this.__v && (l5 && this._sb.push(l5), M(this));
  }, x.prototype.forceUpdate = function(n3) {
    this.__v && (this.__e = true, n3 && this.__h.push(n3), M(this));
  }, x.prototype.render = k, i = [], o = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, e = function(n3, l5) {
    return n3.__v.__b - l5.__v.__b;
  }, P.__r = 0, f = /(PointerCapture)$|Capture$/i, c = 0, s = O(false), a = O(true);

  // ../../node_modules/.pnpm/preact@10.25.1/node_modules/preact/hooks/dist/hooks.module.js
  var t2;
  var r2;
  var u2;
  var i2;
  var o2 = 0;
  var f2 = [];
  var c2 = l;
  var e2 = c2.__b;
  var a2 = c2.__r;
  var v2 = c2.diffed;
  var l2 = c2.__c;
  var m2 = c2.unmount;
  var s2 = c2.__;
  function d2(n3, t4) {
    c2.__h && c2.__h(r2, n3, o2 || t4), o2 = 0;
    var u5 = r2.__H || (r2.__H = { __: [], __h: [] });
    return n3 >= u5.__.length && u5.__.push({}), u5.__[n3];
  }
  function h2(n3) {
    return o2 = 1, p2(D2, n3);
  }
  function p2(n3, u5, i5) {
    var o4 = d2(t2++, 2);
    if (o4.t = n3, !o4.__c && (o4.__ = [D2(void 0, u5), function(n4) {
      var t4 = o4.__N ? o4.__N[0] : o4.__[0], r5 = o4.t(t4, n4);
      t4 !== r5 && (o4.__N = [r5, o4.__[1]], o4.__c.setState({}));
    }], o4.__c = r2, !r2.u)) {
      var f5 = function(n4, t4, r5) {
        if (!o4.__c.__H) return true;
        var u6 = o4.__c.__H.__.filter(function(n5) {
          return !!n5.__c;
        });
        if (u6.every(function(n5) {
          return !n5.__N;
        })) return !c4 || c4.call(this, n4, t4, r5);
        var i6 = o4.__c.props !== n4;
        return u6.forEach(function(n5) {
          if (n5.__N) {
            var t5 = n5.__[0];
            n5.__ = n5.__N, n5.__N = void 0, t5 !== n5.__[0] && (i6 = true);
          }
        }), c4 && c4.call(this, n4, t4, r5) || i6;
      };
      r2.u = true;
      var c4 = r2.shouldComponentUpdate, e4 = r2.componentWillUpdate;
      r2.componentWillUpdate = function(n4, t4, r5) {
        if (this.__e) {
          var u6 = c4;
          c4 = void 0, f5(n4, t4, r5), c4 = u6;
        }
        e4 && e4.call(this, n4, t4, r5);
      }, r2.shouldComponentUpdate = f5;
    }
    return o4.__N || o4.__;
  }
  function y2(n3, u5) {
    var i5 = d2(t2++, 3);
    !c2.__s && C2(i5.__H, u5) && (i5.__ = n3, i5.i = u5, r2.__H.__h.push(i5));
  }
  function A2(n3) {
    return o2 = 5, T2(function() {
      return { current: n3 };
    }, []);
  }
  function T2(n3, r5) {
    var u5 = d2(t2++, 7);
    return C2(u5.__H, r5) && (u5.__ = n3(), u5.__H = r5, u5.__h = n3), u5.__;
  }
  function q2(n3, t4) {
    return o2 = 8, T2(function() {
      return n3;
    }, t4);
  }
  function j2() {
    for (var n3; n3 = f2.shift(); ) if (n3.__P && n3.__H) try {
      n3.__H.__h.forEach(z2), n3.__H.__h.forEach(B2), n3.__H.__h = [];
    } catch (t4) {
      n3.__H.__h = [], c2.__e(t4, n3.__v);
    }
  }
  c2.__b = function(n3) {
    r2 = null, e2 && e2(n3);
  }, c2.__ = function(n3, t4) {
    n3 && t4.__k && t4.__k.__m && (n3.__m = t4.__k.__m), s2 && s2(n3, t4);
  }, c2.__r = function(n3) {
    a2 && a2(n3), t2 = 0;
    var i5 = (r2 = n3.__c).__H;
    i5 && (u2 === r2 ? (i5.__h = [], r2.__h = [], i5.__.forEach(function(n4) {
      n4.__N && (n4.__ = n4.__N), n4.i = n4.__N = void 0;
    })) : (i5.__h.forEach(z2), i5.__h.forEach(B2), i5.__h = [], t2 = 0)), u2 = r2;
  }, c2.diffed = function(n3) {
    v2 && v2(n3);
    var t4 = n3.__c;
    t4 && t4.__H && (t4.__H.__h.length && (1 !== f2.push(t4) && i2 === c2.requestAnimationFrame || ((i2 = c2.requestAnimationFrame) || w2)(j2)), t4.__H.__.forEach(function(n4) {
      n4.i && (n4.__H = n4.i), n4.i = void 0;
    })), u2 = r2 = null;
  }, c2.__c = function(n3, t4) {
    t4.some(function(n4) {
      try {
        n4.__h.forEach(z2), n4.__h = n4.__h.filter(function(n5) {
          return !n5.__ || B2(n5);
        });
      } catch (r5) {
        t4.some(function(n5) {
          n5.__h && (n5.__h = []);
        }), t4 = [], c2.__e(r5, n4.__v);
      }
    }), l2 && l2(n3, t4);
  }, c2.unmount = function(n3) {
    m2 && m2(n3);
    var t4, r5 = n3.__c;
    r5 && r5.__H && (r5.__H.__.forEach(function(n4) {
      try {
        z2(n4);
      } catch (n5) {
        t4 = n5;
      }
    }), r5.__H = void 0, t4 && c2.__e(t4, r5.__v));
  };
  var k2 = "function" == typeof requestAnimationFrame;
  function w2(n3) {
    var t4, r5 = function() {
      clearTimeout(u5), k2 && cancelAnimationFrame(t4), setTimeout(n3);
    }, u5 = setTimeout(r5, 100);
    k2 && (t4 = requestAnimationFrame(r5));
  }
  function z2(n3) {
    var t4 = r2, u5 = n3.__c;
    "function" == typeof u5 && (n3.__c = void 0, u5()), r2 = t4;
  }
  function B2(n3) {
    var t4 = r2;
    n3.__c = n3.__(), r2 = t4;
  }
  function C2(n3, t4) {
    return !n3 || n3.length !== t4.length || t4.some(function(t5, r5) {
      return t5 !== n3[r5];
    });
  }
  function D2(n3, t4) {
    return "function" == typeof t4 ? t4(n3) : t4;
  }

  // ../../node_modules/.pnpm/@preact+signals-core@1.8.0/node_modules/@preact/signals-core/dist/signals-core.module.js
  var i3 = Symbol.for("preact-signals");
  function t3() {
    if (!(s3 > 1)) {
      var i5, t4 = false;
      while (void 0 !== h3) {
        var r5 = h3;
        h3 = void 0;
        f3++;
        while (void 0 !== r5) {
          var o4 = r5.o;
          r5.o = void 0;
          r5.f &= -3;
          if (!(8 & r5.f) && c3(r5)) try {
            r5.c();
          } catch (r6) {
            if (!t4) {
              i5 = r6;
              t4 = true;
            }
          }
          r5 = o4;
        }
      }
      f3 = 0;
      s3--;
      if (t4) throw i5;
    } else s3--;
  }
  var o3 = void 0;
  var h3 = void 0;
  var s3 = 0;
  var f3 = 0;
  var v3 = 0;
  function e3(i5) {
    if (void 0 !== o3) {
      var t4 = i5.n;
      if (void 0 === t4 || t4.t !== o3) {
        t4 = { i: 0, S: i5, p: o3.s, n: void 0, t: o3, e: void 0, x: void 0, r: t4 };
        if (void 0 !== o3.s) o3.s.n = t4;
        o3.s = t4;
        i5.n = t4;
        if (32 & o3.f) i5.S(t4);
        return t4;
      } else if (-1 === t4.i) {
        t4.i = 0;
        if (void 0 !== t4.n) {
          t4.n.p = t4.p;
          if (void 0 !== t4.p) t4.p.n = t4.n;
          t4.p = o3.s;
          t4.n = void 0;
          o3.s.n = t4;
          o3.s = t4;
        }
        return t4;
      }
    }
  }
  function u3(i5) {
    this.v = i5;
    this.i = 0;
    this.n = void 0;
    this.t = void 0;
  }
  u3.prototype.brand = i3;
  u3.prototype.h = function() {
    return true;
  };
  u3.prototype.S = function(i5) {
    if (this.t !== i5 && void 0 === i5.e) {
      i5.x = this.t;
      if (void 0 !== this.t) this.t.e = i5;
      this.t = i5;
    }
  };
  u3.prototype.U = function(i5) {
    if (void 0 !== this.t) {
      var t4 = i5.e, r5 = i5.x;
      if (void 0 !== t4) {
        t4.x = r5;
        i5.e = void 0;
      }
      if (void 0 !== r5) {
        r5.e = t4;
        i5.x = void 0;
      }
      if (i5 === this.t) this.t = r5;
    }
  };
  u3.prototype.subscribe = function(i5) {
    var t4 = this;
    return E(function() {
      var r5 = t4.value, n3 = o3;
      o3 = void 0;
      try {
        i5(r5);
      } finally {
        o3 = n3;
      }
    });
  };
  u3.prototype.valueOf = function() {
    return this.value;
  };
  u3.prototype.toString = function() {
    return this.value + "";
  };
  u3.prototype.toJSON = function() {
    return this.value;
  };
  u3.prototype.peek = function() {
    var i5 = o3;
    o3 = void 0;
    try {
      return this.value;
    } finally {
      o3 = i5;
    }
  };
  Object.defineProperty(u3.prototype, "value", { get: function() {
    var i5 = e3(this);
    if (void 0 !== i5) i5.i = this.i;
    return this.v;
  }, set: function(i5) {
    if (i5 !== this.v) {
      if (f3 > 100) throw new Error("Cycle detected");
      this.v = i5;
      this.i++;
      v3++;
      s3++;
      try {
        for (var r5 = this.t; void 0 !== r5; r5 = r5.x) r5.t.N();
      } finally {
        t3();
      }
    }
  } });
  function d3(i5) {
    return new u3(i5);
  }
  function c3(i5) {
    for (var t4 = i5.s; void 0 !== t4; t4 = t4.n) if (t4.S.i !== t4.i || !t4.S.h() || t4.S.i !== t4.i) return true;
    return false;
  }
  function a3(i5) {
    for (var t4 = i5.s; void 0 !== t4; t4 = t4.n) {
      var r5 = t4.S.n;
      if (void 0 !== r5) t4.r = r5;
      t4.S.n = t4;
      t4.i = -1;
      if (void 0 === t4.n) {
        i5.s = t4;
        break;
      }
    }
  }
  function l3(i5) {
    var t4 = i5.s, r5 = void 0;
    while (void 0 !== t4) {
      var o4 = t4.p;
      if (-1 === t4.i) {
        t4.S.U(t4);
        if (void 0 !== o4) o4.n = t4.n;
        if (void 0 !== t4.n) t4.n.p = o4;
      } else r5 = t4;
      t4.S.n = t4.r;
      if (void 0 !== t4.r) t4.r = void 0;
      t4 = o4;
    }
    i5.s = r5;
  }
  function y3(i5) {
    u3.call(this, void 0);
    this.x = i5;
    this.s = void 0;
    this.g = v3 - 1;
    this.f = 4;
  }
  (y3.prototype = new u3()).h = function() {
    this.f &= -3;
    if (1 & this.f) return false;
    if (32 == (36 & this.f)) return true;
    this.f &= -5;
    if (this.g === v3) return true;
    this.g = v3;
    this.f |= 1;
    if (this.i > 0 && !c3(this)) {
      this.f &= -2;
      return true;
    }
    var i5 = o3;
    try {
      a3(this);
      o3 = this;
      var t4 = this.x();
      if (16 & this.f || this.v !== t4 || 0 === this.i) {
        this.v = t4;
        this.f &= -17;
        this.i++;
      }
    } catch (i6) {
      this.v = i6;
      this.f |= 16;
      this.i++;
    }
    o3 = i5;
    l3(this);
    this.f &= -2;
    return true;
  };
  y3.prototype.S = function(i5) {
    if (void 0 === this.t) {
      this.f |= 36;
      for (var t4 = this.s; void 0 !== t4; t4 = t4.n) t4.S.S(t4);
    }
    u3.prototype.S.call(this, i5);
  };
  y3.prototype.U = function(i5) {
    if (void 0 !== this.t) {
      u3.prototype.U.call(this, i5);
      if (void 0 === this.t) {
        this.f &= -33;
        for (var t4 = this.s; void 0 !== t4; t4 = t4.n) t4.S.U(t4);
      }
    }
  };
  y3.prototype.N = function() {
    if (!(2 & this.f)) {
      this.f |= 6;
      for (var i5 = this.t; void 0 !== i5; i5 = i5.x) i5.t.N();
    }
  };
  Object.defineProperty(y3.prototype, "value", { get: function() {
    if (1 & this.f) throw new Error("Cycle detected");
    var i5 = e3(this);
    this.h();
    if (void 0 !== i5) i5.i = this.i;
    if (16 & this.f) throw this.v;
    return this.v;
  } });
  function w3(i5) {
    return new y3(i5);
  }
  function _2(i5) {
    var r5 = i5.u;
    i5.u = void 0;
    if ("function" == typeof r5) {
      s3++;
      var n3 = o3;
      o3 = void 0;
      try {
        r5();
      } catch (t4) {
        i5.f &= -2;
        i5.f |= 8;
        g2(i5);
        throw t4;
      } finally {
        o3 = n3;
        t3();
      }
    }
  }
  function g2(i5) {
    for (var t4 = i5.s; void 0 !== t4; t4 = t4.n) t4.S.U(t4);
    i5.x = void 0;
    i5.s = void 0;
    _2(i5);
  }
  function p3(i5) {
    if (o3 !== this) throw new Error("Out-of-order effect");
    l3(this);
    o3 = i5;
    this.f &= -2;
    if (8 & this.f) g2(this);
    t3();
  }
  function b(i5) {
    this.x = i5;
    this.u = void 0;
    this.s = void 0;
    this.o = void 0;
    this.f = 32;
  }
  b.prototype.c = function() {
    var i5 = this.S();
    try {
      if (8 & this.f) return;
      if (void 0 === this.x) return;
      var t4 = this.x();
      if ("function" == typeof t4) this.u = t4;
    } finally {
      i5();
    }
  };
  b.prototype.S = function() {
    if (1 & this.f) throw new Error("Cycle detected");
    this.f |= 1;
    this.f &= -9;
    _2(this);
    a3(this);
    s3++;
    var i5 = o3;
    o3 = this;
    return p3.bind(this, i5);
  };
  b.prototype.N = function() {
    if (!(2 & this.f)) {
      this.f |= 2;
      this.o = h3;
      h3 = this;
    }
  };
  b.prototype.d = function() {
    this.f |= 8;
    if (!(1 & this.f)) g2(this);
  };
  function E(i5) {
    var t4 = new b(i5);
    try {
      t4.c();
    } catch (i6) {
      t4.d();
      throw i6;
    }
    return t4.d.bind(t4);
  }
  var s4;
  function l4(n3, i5) {
    l[n3] = i5.bind(null, l[n3] || function() {
    });
  }
  function d4(n3) {
    if (s4) s4();
    s4 = n3 && n3.S();
  }
  function p4(n3) {
    var r5 = this, f5 = n3.data, o4 = useSignal(f5);
    o4.value = f5;
    var e4 = T2(function() {
      var n4 = r5.__v;
      while (n4 = n4.__) if (n4.__c) {
        n4.__c.__$f |= 4;
        break;
      }
      r5.__$u.c = function() {
        var n5, t4 = r5.__$u.S(), f6 = e4.value;
        t4();
        if (t(f6) || 3 !== (null == (n5 = r5.base) ? void 0 : n5.nodeType)) {
          r5.__$f |= 1;
          r5.setState({});
        } else r5.base.data = f6;
      };
      return w3(function() {
        var n5 = o4.value.value;
        return 0 === n5 ? 0 : true === n5 ? "" : n5 || "";
      });
    }, []);
    return e4.value;
  }
  p4.displayName = "_st";
  Object.defineProperties(u3.prototype, { constructor: { configurable: true, value: void 0 }, type: { configurable: true, value: p4 }, props: { configurable: true, get: function() {
    return { data: this };
  } }, __b: { configurable: true, value: 1 } });
  l4("__b", function(n3, r5) {
    if ("string" == typeof r5.type) {
      var i5, t4 = r5.props;
      for (var f5 in t4) if ("children" !== f5) {
        var o4 = t4[f5];
        if (o4 instanceof u3) {
          if (!i5) r5.__np = i5 = {};
          i5[f5] = o4;
          t4[f5] = o4.peek();
        }
      }
    }
    n3(r5);
  });
  l4("__r", function(n3, r5) {
    d4();
    var i5, t4 = r5.__c;
    if (t4) {
      t4.__$f &= -2;
      if (void 0 === (i5 = t4.__$u)) t4.__$u = i5 = function(n4) {
        var r6;
        E(function() {
          r6 = this;
        });
        r6.c = function() {
          t4.__$f |= 1;
          t4.setState({});
        };
        return r6;
      }();
    }
    d4(i5);
    n3(r5);
  });
  l4("__e", function(n3, r5, i5, t4) {
    d4();
    n3(r5, i5, t4);
  });
  l4("diffed", function(n3, r5) {
    d4();
    var i5;
    if ("string" == typeof r5.type && (i5 = r5.__e)) {
      var t4 = r5.__np, f5 = r5.props;
      if (t4) {
        var o4 = i5.U;
        if (o4) for (var e4 in o4) {
          var u5 = o4[e4];
          if (void 0 !== u5 && !(e4 in t4)) {
            u5.d();
            o4[e4] = void 0;
          }
        }
        else i5.U = o4 = {};
        for (var a4 in t4) {
          var c4 = o4[a4], s5 = t4[a4];
          if (void 0 === c4) {
            c4 = _3(i5, a4, s5, f5);
            o4[a4] = c4;
          } else c4.o(s5, f5);
        }
      }
    }
    n3(r5);
  });
  function _3(n3, r5, i5, t4) {
    var f5 = r5 in n3 && void 0 === n3.ownerSVGElement, o4 = d3(i5);
    return { o: function(n4, r6) {
      o4.value = n4;
      t4 = r6;
    }, d: E(function() {
      var i6 = o4.value.value;
      if (t4[r5] !== i6) {
        t4[r5] = i6;
        if (f5) n3[r5] = i6;
        else if (i6) n3.setAttribute(r5, i6);
        else n3.removeAttribute(r5);
      }
    }) };
  }
  l4("unmount", function(n3, r5) {
    if ("string" == typeof r5.type) {
      var i5 = r5.__e;
      if (i5) {
        var t4 = i5.U;
        if (t4) {
          i5.U = void 0;
          for (var f5 in t4) {
            var o4 = t4[f5];
            if (o4) o4.d();
          }
        }
      }
    } else {
      var e4 = r5.__c;
      if (e4) {
        var u5 = e4.__$u;
        if (u5) {
          e4.__$u = void 0;
          u5.d();
        }
      }
    }
    n3(r5);
  });
  l4("__h", function(n3, r5, i5, t4) {
    if (t4 < 3 || 9 === t4) r5.__$f |= 2;
    n3(r5, i5, t4);
  });
  x.prototype.shouldComponentUpdate = function(n3, r5) {
    var i5 = this.__$u;
    if (!(i5 && void 0 !== i5.s || 4 & this.__$f)) return true;
    if (3 & this.__$f) return true;
    for (var t4 in r5) return true;
    for (var f5 in n3) if ("__source" !== f5 && n3[f5] !== this.props[f5]) return true;
    for (var o4 in this.props) if (!(o4 in n3)) return true;
    return false;
  };
  function useSignal(n3) {
    return T2(function() {
      return d3(n3);
    }, []);
  }

  // src/core/utils.ts
  function descending(a4, b3) {
    return b3 - a4;
  }
  function getComponentGroupNames(group) {
    let result = group[0].name;
    const len = group.length;
    const max = Math.min(4, len);
    for (let i5 = 1; i5 < max; i5++) {
      result += `, ${group[i5].name}`;
    }
    return result;
  }
  function getComponentGroupTotalTime(group) {
    let result = group[0].time;
    for (let i5 = 1, len = group.length; i5 < len; i5++) {
      result += group[i5].time;
    }
    return result;
  }
  function componentGroupHasForget(group) {
    for (let i5 = 0, len = group.length; i5 < len; i5++) {
      if (group[i5].forget) {
        return true;
      }
    }
    return false;
  }
  var getLabelText = (groupedAggregatedRenders) => {
    let labelText = "";
    const componentsByCount = /* @__PURE__ */ new Map();
    for (const aggregatedRender of groupedAggregatedRenders) {
      const { forget, time, aggregatedCount, name } = aggregatedRender;
      if (!componentsByCount.has(aggregatedCount)) {
        componentsByCount.set(aggregatedCount, []);
      }
      const components = componentsByCount.get(aggregatedCount);
      if (components) {
        components.push({ name, forget, time: time ?? 0 });
      }
    }
    const sortedCounts = Array.from(componentsByCount.keys()).sort(descending);
    const parts = [];
    let cumulativeTime = 0;
    for (const count of sortedCounts) {
      const componentGroup = componentsByCount.get(count);
      if (!componentGroup) continue;
      let text = getComponentGroupNames(componentGroup);
      const totalTime = getComponentGroupTotalTime(componentGroup);
      const hasForget = componentGroupHasForget(componentGroup);
      cumulativeTime += totalTime;
      if (componentGroup.length > 4) {
        text += "\u2026";
      }
      if (count > 1) {
        text += ` \xD7 ${count}`;
      }
      if (hasForget) {
        text = `\u2728${text}`;
      }
      parts.push(text);
    }
    labelText = parts.join(", ");
    if (!labelText.length) return null;
    if (labelText.length > 40) {
      labelText = `${labelText.slice(0, 40)}\u2026`;
    }
    if (cumulativeTime >= 0.01) {
      labelText += ` (${Number(cumulativeTime.toFixed(2))}ms)`;
    }
    return labelText;
  };
  function isEqual(a4, b3) {
    return a4 === b3 || a4 !== a4 && b3 !== b3;
  }

  // src/web/utils/lerp.ts
  var lerp = (start2, end, t4) => {
    return start2 + (end - start2) * t4;
  };

  // ../../node_modules/.pnpm/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs
  function r4(e4) {
    var t4, f5, n3 = "";
    if ("string" == typeof e4 || "number" == typeof e4) n3 += e4;
    else if ("object" == typeof e4) if (Array.isArray(e4)) {
      var o4 = e4.length;
      for (t4 = 0; t4 < o4; t4++) e4[t4] && (f5 = r4(e4[t4])) && (n3 && (n3 += " "), n3 += f5);
    } else for (f5 in e4) e4[f5] && (n3 && (n3 += " "), n3 += f5);
    return n3;
  }
  function clsx() {
    for (var e4, t4, f5 = 0, n3 = "", o4 = arguments.length; f5 < o4; f5++) (e4 = arguments[f5]) && (t4 = r4(e4)) && (n3 && (n3 += " "), n3 += t4);
    return n3;
  }

  // ../../node_modules/.pnpm/tailwind-merge@2.5.5/node_modules/tailwind-merge/dist/bundle-mjs.mjs
  var CLASS_PART_SEPARATOR = "-";
  var createClassGroupUtils = (config) => {
    const classMap = createClassMap(config);
    const {
      conflictingClassGroups,
      conflictingClassGroupModifiers
    } = config;
    const getClassGroupId = (className) => {
      const classParts = className.split(CLASS_PART_SEPARATOR);
      if (classParts[0] === "" && classParts.length !== 1) {
        classParts.shift();
      }
      return getGroupRecursive(classParts, classMap) || getGroupIdForArbitraryProperty(className);
    };
    const getConflictingClassGroupIds = (classGroupId, hasPostfixModifier) => {
      const conflicts = conflictingClassGroups[classGroupId] || [];
      if (hasPostfixModifier && conflictingClassGroupModifiers[classGroupId]) {
        return [...conflicts, ...conflictingClassGroupModifiers[classGroupId]];
      }
      return conflicts;
    };
    return {
      getClassGroupId,
      getConflictingClassGroupIds
    };
  };
  var getGroupRecursive = (classParts, classPartObject) => {
    if (classParts.length === 0) {
      return classPartObject.classGroupId;
    }
    const currentClassPart = classParts[0];
    const nextClassPartObject = classPartObject.nextPart.get(currentClassPart);
    const classGroupFromNextClassPart = nextClassPartObject ? getGroupRecursive(classParts.slice(1), nextClassPartObject) : void 0;
    if (classGroupFromNextClassPart) {
      return classGroupFromNextClassPart;
    }
    if (classPartObject.validators.length === 0) {
      return void 0;
    }
    const classRest = classParts.join(CLASS_PART_SEPARATOR);
    return classPartObject.validators.find(({
      validator
    }) => validator(classRest))?.classGroupId;
  };
  var arbitraryPropertyRegex = /^\[(.+)\]$/;
  var getGroupIdForArbitraryProperty = (className) => {
    if (arbitraryPropertyRegex.test(className)) {
      const arbitraryPropertyClassName = arbitraryPropertyRegex.exec(className)[1];
      const property = arbitraryPropertyClassName?.substring(0, arbitraryPropertyClassName.indexOf(":"));
      if (property) {
        return "arbitrary.." + property;
      }
    }
  };
  var createClassMap = (config) => {
    const {
      theme,
      prefix
    } = config;
    const classMap = {
      nextPart: /* @__PURE__ */ new Map(),
      validators: []
    };
    const prefixedClassGroupEntries = getPrefixedClassGroupEntries(Object.entries(config.classGroups), prefix);
    prefixedClassGroupEntries.forEach(([classGroupId, classGroup]) => {
      processClassesRecursively(classGroup, classMap, classGroupId, theme);
    });
    return classMap;
  };
  var processClassesRecursively = (classGroup, classPartObject, classGroupId, theme) => {
    classGroup.forEach((classDefinition) => {
      if (typeof classDefinition === "string") {
        const classPartObjectToEdit = classDefinition === "" ? classPartObject : getPart(classPartObject, classDefinition);
        classPartObjectToEdit.classGroupId = classGroupId;
        return;
      }
      if (typeof classDefinition === "function") {
        if (isThemeGetter(classDefinition)) {
          processClassesRecursively(classDefinition(theme), classPartObject, classGroupId, theme);
          return;
        }
        classPartObject.validators.push({
          validator: classDefinition,
          classGroupId
        });
        return;
      }
      Object.entries(classDefinition).forEach(([key, classGroup2]) => {
        processClassesRecursively(classGroup2, getPart(classPartObject, key), classGroupId, theme);
      });
    });
  };
  var getPart = (classPartObject, path) => {
    let currentClassPartObject = classPartObject;
    path.split(CLASS_PART_SEPARATOR).forEach((pathPart) => {
      if (!currentClassPartObject.nextPart.has(pathPart)) {
        currentClassPartObject.nextPart.set(pathPart, {
          nextPart: /* @__PURE__ */ new Map(),
          validators: []
        });
      }
      currentClassPartObject = currentClassPartObject.nextPart.get(pathPart);
    });
    return currentClassPartObject;
  };
  var isThemeGetter = (func) => func.isThemeGetter;
  var getPrefixedClassGroupEntries = (classGroupEntries, prefix) => {
    if (!prefix) {
      return classGroupEntries;
    }
    return classGroupEntries.map(([classGroupId, classGroup]) => {
      const prefixedClassGroup = classGroup.map((classDefinition) => {
        if (typeof classDefinition === "string") {
          return prefix + classDefinition;
        }
        if (typeof classDefinition === "object") {
          return Object.fromEntries(Object.entries(classDefinition).map(([key, value]) => [prefix + key, value]));
        }
        return classDefinition;
      });
      return [classGroupId, prefixedClassGroup];
    });
  };
  var createLruCache = (maxCacheSize) => {
    if (maxCacheSize < 1) {
      return {
        get: () => void 0,
        set: () => {
        }
      };
    }
    let cacheSize = 0;
    let cache2 = /* @__PURE__ */ new Map();
    let previousCache = /* @__PURE__ */ new Map();
    const update = (key, value) => {
      cache2.set(key, value);
      cacheSize++;
      if (cacheSize > maxCacheSize) {
        cacheSize = 0;
        previousCache = cache2;
        cache2 = /* @__PURE__ */ new Map();
      }
    };
    return {
      get(key) {
        let value = cache2.get(key);
        if (value !== void 0) {
          return value;
        }
        if ((value = previousCache.get(key)) !== void 0) {
          update(key, value);
          return value;
        }
      },
      set(key, value) {
        if (cache2.has(key)) {
          cache2.set(key, value);
        } else {
          update(key, value);
        }
      }
    };
  };
  var IMPORTANT_MODIFIER = "!";
  var createParseClassName = (config) => {
    const {
      separator,
      experimentalParseClassName
    } = config;
    const isSeparatorSingleCharacter = separator.length === 1;
    const firstSeparatorCharacter = separator[0];
    const separatorLength = separator.length;
    const parseClassName = (className) => {
      const modifiers = [];
      let bracketDepth = 0;
      let modifierStart = 0;
      let postfixModifierPosition;
      for (let index = 0; index < className.length; index++) {
        let currentCharacter = className[index];
        if (bracketDepth === 0) {
          if (currentCharacter === firstSeparatorCharacter && (isSeparatorSingleCharacter || className.slice(index, index + separatorLength) === separator)) {
            modifiers.push(className.slice(modifierStart, index));
            modifierStart = index + separatorLength;
            continue;
          }
          if (currentCharacter === "/") {
            postfixModifierPosition = index;
            continue;
          }
        }
        if (currentCharacter === "[") {
          bracketDepth++;
        } else if (currentCharacter === "]") {
          bracketDepth--;
        }
      }
      const baseClassNameWithImportantModifier = modifiers.length === 0 ? className : className.substring(modifierStart);
      const hasImportantModifier = baseClassNameWithImportantModifier.startsWith(IMPORTANT_MODIFIER);
      const baseClassName = hasImportantModifier ? baseClassNameWithImportantModifier.substring(1) : baseClassNameWithImportantModifier;
      const maybePostfixModifierPosition = postfixModifierPosition && postfixModifierPosition > modifierStart ? postfixModifierPosition - modifierStart : void 0;
      return {
        modifiers,
        hasImportantModifier,
        baseClassName,
        maybePostfixModifierPosition
      };
    };
    if (experimentalParseClassName) {
      return (className) => experimentalParseClassName({
        className,
        parseClassName
      });
    }
    return parseClassName;
  };
  var sortModifiers = (modifiers) => {
    if (modifiers.length <= 1) {
      return modifiers;
    }
    const sortedModifiers = [];
    let unsortedModifiers = [];
    modifiers.forEach((modifier) => {
      const isArbitraryVariant = modifier[0] === "[";
      if (isArbitraryVariant) {
        sortedModifiers.push(...unsortedModifiers.sort(), modifier);
        unsortedModifiers = [];
      } else {
        unsortedModifiers.push(modifier);
      }
    });
    sortedModifiers.push(...unsortedModifiers.sort());
    return sortedModifiers;
  };
  var createConfigUtils = (config) => ({
    cache: createLruCache(config.cacheSize),
    parseClassName: createParseClassName(config),
    ...createClassGroupUtils(config)
  });
  var SPLIT_CLASSES_REGEX = /\s+/;
  var mergeClassList = (classList, configUtils) => {
    const {
      parseClassName,
      getClassGroupId,
      getConflictingClassGroupIds
    } = configUtils;
    const classGroupsInConflict = [];
    const classNames = classList.trim().split(SPLIT_CLASSES_REGEX);
    let result = "";
    for (let index = classNames.length - 1; index >= 0; index -= 1) {
      const originalClassName = classNames[index];
      const {
        modifiers,
        hasImportantModifier,
        baseClassName,
        maybePostfixModifierPosition
      } = parseClassName(originalClassName);
      let hasPostfixModifier = Boolean(maybePostfixModifierPosition);
      let classGroupId = getClassGroupId(hasPostfixModifier ? baseClassName.substring(0, maybePostfixModifierPosition) : baseClassName);
      if (!classGroupId) {
        if (!hasPostfixModifier) {
          result = originalClassName + (result.length > 0 ? " " + result : result);
          continue;
        }
        classGroupId = getClassGroupId(baseClassName);
        if (!classGroupId) {
          result = originalClassName + (result.length > 0 ? " " + result : result);
          continue;
        }
        hasPostfixModifier = false;
      }
      const variantModifier = sortModifiers(modifiers).join(":");
      const modifierId = hasImportantModifier ? variantModifier + IMPORTANT_MODIFIER : variantModifier;
      const classId = modifierId + classGroupId;
      if (classGroupsInConflict.includes(classId)) {
        continue;
      }
      classGroupsInConflict.push(classId);
      const conflictGroups = getConflictingClassGroupIds(classGroupId, hasPostfixModifier);
      for (let i5 = 0; i5 < conflictGroups.length; ++i5) {
        const group = conflictGroups[i5];
        classGroupsInConflict.push(modifierId + group);
      }
      result = originalClassName + (result.length > 0 ? " " + result : result);
    }
    return result;
  };
  function twJoin() {
    let index = 0;
    let argument;
    let resolvedValue;
    let string = "";
    while (index < arguments.length) {
      if (argument = arguments[index++]) {
        if (resolvedValue = toValue(argument)) {
          string && (string += " ");
          string += resolvedValue;
        }
      }
    }
    return string;
  }
  var toValue = (mix) => {
    if (typeof mix === "string") {
      return mix;
    }
    let resolvedValue;
    let string = "";
    for (let k3 = 0; k3 < mix.length; k3++) {
      if (mix[k3]) {
        if (resolvedValue = toValue(mix[k3])) {
          string && (string += " ");
          string += resolvedValue;
        }
      }
    }
    return string;
  };
  function createTailwindMerge(createConfigFirst, ...createConfigRest) {
    let configUtils;
    let cacheGet;
    let cacheSet;
    let functionToCall = initTailwindMerge;
    function initTailwindMerge(classList) {
      const config = createConfigRest.reduce((previousConfig, createConfigCurrent) => createConfigCurrent(previousConfig), createConfigFirst());
      configUtils = createConfigUtils(config);
      cacheGet = configUtils.cache.get;
      cacheSet = configUtils.cache.set;
      functionToCall = tailwindMerge;
      return tailwindMerge(classList);
    }
    function tailwindMerge(classList) {
      const cachedResult = cacheGet(classList);
      if (cachedResult) {
        return cachedResult;
      }
      const result = mergeClassList(classList, configUtils);
      cacheSet(classList, result);
      return result;
    }
    return function callTailwindMerge() {
      return functionToCall(twJoin.apply(null, arguments));
    };
  }
  var fromTheme = (key) => {
    const themeGetter = (theme) => theme[key] || [];
    themeGetter.isThemeGetter = true;
    return themeGetter;
  };
  var arbitraryValueRegex = /^\[(?:([a-z-]+):)?(.+)\]$/i;
  var fractionRegex = /^\d+\/\d+$/;
  var stringLengths = /* @__PURE__ */ new Set(["px", "full", "screen"]);
  var tshirtUnitRegex = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/;
  var lengthUnitRegex = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/;
  var colorFunctionRegex = /^(rgba?|hsla?|hwb|(ok)?(lab|lch))\(.+\)$/;
  var shadowRegex = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/;
  var imageRegex = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/;
  var isLength = (value) => isNumber(value) || stringLengths.has(value) || fractionRegex.test(value);
  var isArbitraryLength = (value) => getIsArbitraryValue(value, "length", isLengthOnly);
  var isNumber = (value) => Boolean(value) && !Number.isNaN(Number(value));
  var isArbitraryNumber = (value) => getIsArbitraryValue(value, "number", isNumber);
  var isInteger = (value) => Boolean(value) && Number.isInteger(Number(value));
  var isPercent = (value) => value.endsWith("%") && isNumber(value.slice(0, -1));
  var isArbitraryValue = (value) => arbitraryValueRegex.test(value);
  var isTshirtSize = (value) => tshirtUnitRegex.test(value);
  var sizeLabels = /* @__PURE__ */ new Set(["length", "size", "percentage"]);
  var isArbitrarySize = (value) => getIsArbitraryValue(value, sizeLabels, isNever);
  var isArbitraryPosition = (value) => getIsArbitraryValue(value, "position", isNever);
  var imageLabels = /* @__PURE__ */ new Set(["image", "url"]);
  var isArbitraryImage = (value) => getIsArbitraryValue(value, imageLabels, isImage);
  var isArbitraryShadow = (value) => getIsArbitraryValue(value, "", isShadow);
  var isAny = () => true;
  var getIsArbitraryValue = (value, label, testValue) => {
    const result = arbitraryValueRegex.exec(value);
    if (result) {
      if (result[1]) {
        return typeof label === "string" ? result[1] === label : label.has(result[1]);
      }
      return testValue(result[2]);
    }
    return false;
  };
  var isLengthOnly = (value) => (
    // `colorFunctionRegex` check is necessary because color functions can have percentages in them which which would be incorrectly classified as lengths.
    // For example, `hsl(0 0% 0%)` would be classified as a length without this check.
    // I could also use lookbehind assertion in `lengthUnitRegex` but that isn't supported widely enough.
    lengthUnitRegex.test(value) && !colorFunctionRegex.test(value)
  );
  var isNever = () => false;
  var isShadow = (value) => shadowRegex.test(value);
  var isImage = (value) => imageRegex.test(value);
  var getDefaultConfig = () => {
    const colors = fromTheme("colors");
    const spacing = fromTheme("spacing");
    const blur = fromTheme("blur");
    const brightness = fromTheme("brightness");
    const borderColor = fromTheme("borderColor");
    const borderRadius = fromTheme("borderRadius");
    const borderSpacing = fromTheme("borderSpacing");
    const borderWidth = fromTheme("borderWidth");
    const contrast = fromTheme("contrast");
    const grayscale = fromTheme("grayscale");
    const hueRotate = fromTheme("hueRotate");
    const invert = fromTheme("invert");
    const gap = fromTheme("gap");
    const gradientColorStops = fromTheme("gradientColorStops");
    const gradientColorStopPositions = fromTheme("gradientColorStopPositions");
    const inset = fromTheme("inset");
    const margin = fromTheme("margin");
    const opacity = fromTheme("opacity");
    const padding = fromTheme("padding");
    const saturate = fromTheme("saturate");
    const scale = fromTheme("scale");
    const sepia = fromTheme("sepia");
    const skew = fromTheme("skew");
    const space = fromTheme("space");
    const translate = fromTheme("translate");
    const getOverscroll = () => ["auto", "contain", "none"];
    const getOverflow = () => ["auto", "hidden", "clip", "visible", "scroll"];
    const getSpacingWithAutoAndArbitrary = () => ["auto", isArbitraryValue, spacing];
    const getSpacingWithArbitrary = () => [isArbitraryValue, spacing];
    const getLengthWithEmptyAndArbitrary = () => ["", isLength, isArbitraryLength];
    const getNumberWithAutoAndArbitrary = () => ["auto", isNumber, isArbitraryValue];
    const getPositions = () => ["bottom", "center", "left", "left-bottom", "left-top", "right", "right-bottom", "right-top", "top"];
    const getLineStyles = () => ["solid", "dashed", "dotted", "double", "none"];
    const getBlendModes = () => ["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"];
    const getAlign = () => ["start", "end", "center", "between", "around", "evenly", "stretch"];
    const getZeroAndEmpty = () => ["", "0", isArbitraryValue];
    const getBreaks = () => ["auto", "avoid", "all", "avoid-page", "page", "left", "right", "column"];
    const getNumberAndArbitrary = () => [isNumber, isArbitraryValue];
    return {
      cacheSize: 500,
      separator: ":",
      theme: {
        colors: [isAny],
        spacing: [isLength, isArbitraryLength],
        blur: ["none", "", isTshirtSize, isArbitraryValue],
        brightness: getNumberAndArbitrary(),
        borderColor: [colors],
        borderRadius: ["none", "", "full", isTshirtSize, isArbitraryValue],
        borderSpacing: getSpacingWithArbitrary(),
        borderWidth: getLengthWithEmptyAndArbitrary(),
        contrast: getNumberAndArbitrary(),
        grayscale: getZeroAndEmpty(),
        hueRotate: getNumberAndArbitrary(),
        invert: getZeroAndEmpty(),
        gap: getSpacingWithArbitrary(),
        gradientColorStops: [colors],
        gradientColorStopPositions: [isPercent, isArbitraryLength],
        inset: getSpacingWithAutoAndArbitrary(),
        margin: getSpacingWithAutoAndArbitrary(),
        opacity: getNumberAndArbitrary(),
        padding: getSpacingWithArbitrary(),
        saturate: getNumberAndArbitrary(),
        scale: getNumberAndArbitrary(),
        sepia: getZeroAndEmpty(),
        skew: getNumberAndArbitrary(),
        space: getSpacingWithArbitrary(),
        translate: getSpacingWithArbitrary()
      },
      classGroups: {
        // Layout
        /**
         * Aspect Ratio
         * @see https://tailwindcss.com/docs/aspect-ratio
         */
        aspect: [{
          aspect: ["auto", "square", "video", isArbitraryValue]
        }],
        /**
         * Container
         * @see https://tailwindcss.com/docs/container
         */
        container: ["container"],
        /**
         * Columns
         * @see https://tailwindcss.com/docs/columns
         */
        columns: [{
          columns: [isTshirtSize]
        }],
        /**
         * Break After
         * @see https://tailwindcss.com/docs/break-after
         */
        "break-after": [{
          "break-after": getBreaks()
        }],
        /**
         * Break Before
         * @see https://tailwindcss.com/docs/break-before
         */
        "break-before": [{
          "break-before": getBreaks()
        }],
        /**
         * Break Inside
         * @see https://tailwindcss.com/docs/break-inside
         */
        "break-inside": [{
          "break-inside": ["auto", "avoid", "avoid-page", "avoid-column"]
        }],
        /**
         * Box Decoration Break
         * @see https://tailwindcss.com/docs/box-decoration-break
         */
        "box-decoration": [{
          "box-decoration": ["slice", "clone"]
        }],
        /**
         * Box Sizing
         * @see https://tailwindcss.com/docs/box-sizing
         */
        box: [{
          box: ["border", "content"]
        }],
        /**
         * Display
         * @see https://tailwindcss.com/docs/display
         */
        display: ["block", "inline-block", "inline", "flex", "inline-flex", "table", "inline-table", "table-caption", "table-cell", "table-column", "table-column-group", "table-footer-group", "table-header-group", "table-row-group", "table-row", "flow-root", "grid", "inline-grid", "contents", "list-item", "hidden"],
        /**
         * Floats
         * @see https://tailwindcss.com/docs/float
         */
        float: [{
          float: ["right", "left", "none", "start", "end"]
        }],
        /**
         * Clear
         * @see https://tailwindcss.com/docs/clear
         */
        clear: [{
          clear: ["left", "right", "both", "none", "start", "end"]
        }],
        /**
         * Isolation
         * @see https://tailwindcss.com/docs/isolation
         */
        isolation: ["isolate", "isolation-auto"],
        /**
         * Object Fit
         * @see https://tailwindcss.com/docs/object-fit
         */
        "object-fit": [{
          object: ["contain", "cover", "fill", "none", "scale-down"]
        }],
        /**
         * Object Position
         * @see https://tailwindcss.com/docs/object-position
         */
        "object-position": [{
          object: [...getPositions(), isArbitraryValue]
        }],
        /**
         * Overflow
         * @see https://tailwindcss.com/docs/overflow
         */
        overflow: [{
          overflow: getOverflow()
        }],
        /**
         * Overflow X
         * @see https://tailwindcss.com/docs/overflow
         */
        "overflow-x": [{
          "overflow-x": getOverflow()
        }],
        /**
         * Overflow Y
         * @see https://tailwindcss.com/docs/overflow
         */
        "overflow-y": [{
          "overflow-y": getOverflow()
        }],
        /**
         * Overscroll Behavior
         * @see https://tailwindcss.com/docs/overscroll-behavior
         */
        overscroll: [{
          overscroll: getOverscroll()
        }],
        /**
         * Overscroll Behavior X
         * @see https://tailwindcss.com/docs/overscroll-behavior
         */
        "overscroll-x": [{
          "overscroll-x": getOverscroll()
        }],
        /**
         * Overscroll Behavior Y
         * @see https://tailwindcss.com/docs/overscroll-behavior
         */
        "overscroll-y": [{
          "overscroll-y": getOverscroll()
        }],
        /**
         * Position
         * @see https://tailwindcss.com/docs/position
         */
        position: ["static", "fixed", "absolute", "relative", "sticky"],
        /**
         * Top / Right / Bottom / Left
         * @see https://tailwindcss.com/docs/top-right-bottom-left
         */
        inset: [{
          inset: [inset]
        }],
        /**
         * Right / Left
         * @see https://tailwindcss.com/docs/top-right-bottom-left
         */
        "inset-x": [{
          "inset-x": [inset]
        }],
        /**
         * Top / Bottom
         * @see https://tailwindcss.com/docs/top-right-bottom-left
         */
        "inset-y": [{
          "inset-y": [inset]
        }],
        /**
         * Start
         * @see https://tailwindcss.com/docs/top-right-bottom-left
         */
        start: [{
          start: [inset]
        }],
        /**
         * End
         * @see https://tailwindcss.com/docs/top-right-bottom-left
         */
        end: [{
          end: [inset]
        }],
        /**
         * Top
         * @see https://tailwindcss.com/docs/top-right-bottom-left
         */
        top: [{
          top: [inset]
        }],
        /**
         * Right
         * @see https://tailwindcss.com/docs/top-right-bottom-left
         */
        right: [{
          right: [inset]
        }],
        /**
         * Bottom
         * @see https://tailwindcss.com/docs/top-right-bottom-left
         */
        bottom: [{
          bottom: [inset]
        }],
        /**
         * Left
         * @see https://tailwindcss.com/docs/top-right-bottom-left
         */
        left: [{
          left: [inset]
        }],
        /**
         * Visibility
         * @see https://tailwindcss.com/docs/visibility
         */
        visibility: ["visible", "invisible", "collapse"],
        /**
         * Z-Index
         * @see https://tailwindcss.com/docs/z-index
         */
        z: [{
          z: ["auto", isInteger, isArbitraryValue]
        }],
        // Flexbox and Grid
        /**
         * Flex Basis
         * @see https://tailwindcss.com/docs/flex-basis
         */
        basis: [{
          basis: getSpacingWithAutoAndArbitrary()
        }],
        /**
         * Flex Direction
         * @see https://tailwindcss.com/docs/flex-direction
         */
        "flex-direction": [{
          flex: ["row", "row-reverse", "col", "col-reverse"]
        }],
        /**
         * Flex Wrap
         * @see https://tailwindcss.com/docs/flex-wrap
         */
        "flex-wrap": [{
          flex: ["wrap", "wrap-reverse", "nowrap"]
        }],
        /**
         * Flex
         * @see https://tailwindcss.com/docs/flex
         */
        flex: [{
          flex: ["1", "auto", "initial", "none", isArbitraryValue]
        }],
        /**
         * Flex Grow
         * @see https://tailwindcss.com/docs/flex-grow
         */
        grow: [{
          grow: getZeroAndEmpty()
        }],
        /**
         * Flex Shrink
         * @see https://tailwindcss.com/docs/flex-shrink
         */
        shrink: [{
          shrink: getZeroAndEmpty()
        }],
        /**
         * Order
         * @see https://tailwindcss.com/docs/order
         */
        order: [{
          order: ["first", "last", "none", isInteger, isArbitraryValue]
        }],
        /**
         * Grid Template Columns
         * @see https://tailwindcss.com/docs/grid-template-columns
         */
        "grid-cols": [{
          "grid-cols": [isAny]
        }],
        /**
         * Grid Column Start / End
         * @see https://tailwindcss.com/docs/grid-column
         */
        "col-start-end": [{
          col: ["auto", {
            span: ["full", isInteger, isArbitraryValue]
          }, isArbitraryValue]
        }],
        /**
         * Grid Column Start
         * @see https://tailwindcss.com/docs/grid-column
         */
        "col-start": [{
          "col-start": getNumberWithAutoAndArbitrary()
        }],
        /**
         * Grid Column End
         * @see https://tailwindcss.com/docs/grid-column
         */
        "col-end": [{
          "col-end": getNumberWithAutoAndArbitrary()
        }],
        /**
         * Grid Template Rows
         * @see https://tailwindcss.com/docs/grid-template-rows
         */
        "grid-rows": [{
          "grid-rows": [isAny]
        }],
        /**
         * Grid Row Start / End
         * @see https://tailwindcss.com/docs/grid-row
         */
        "row-start-end": [{
          row: ["auto", {
            span: [isInteger, isArbitraryValue]
          }, isArbitraryValue]
        }],
        /**
         * Grid Row Start
         * @see https://tailwindcss.com/docs/grid-row
         */
        "row-start": [{
          "row-start": getNumberWithAutoAndArbitrary()
        }],
        /**
         * Grid Row End
         * @see https://tailwindcss.com/docs/grid-row
         */
        "row-end": [{
          "row-end": getNumberWithAutoAndArbitrary()
        }],
        /**
         * Grid Auto Flow
         * @see https://tailwindcss.com/docs/grid-auto-flow
         */
        "grid-flow": [{
          "grid-flow": ["row", "col", "dense", "row-dense", "col-dense"]
        }],
        /**
         * Grid Auto Columns
         * @see https://tailwindcss.com/docs/grid-auto-columns
         */
        "auto-cols": [{
          "auto-cols": ["auto", "min", "max", "fr", isArbitraryValue]
        }],
        /**
         * Grid Auto Rows
         * @see https://tailwindcss.com/docs/grid-auto-rows
         */
        "auto-rows": [{
          "auto-rows": ["auto", "min", "max", "fr", isArbitraryValue]
        }],
        /**
         * Gap
         * @see https://tailwindcss.com/docs/gap
         */
        gap: [{
          gap: [gap]
        }],
        /**
         * Gap X
         * @see https://tailwindcss.com/docs/gap
         */
        "gap-x": [{
          "gap-x": [gap]
        }],
        /**
         * Gap Y
         * @see https://tailwindcss.com/docs/gap
         */
        "gap-y": [{
          "gap-y": [gap]
        }],
        /**
         * Justify Content
         * @see https://tailwindcss.com/docs/justify-content
         */
        "justify-content": [{
          justify: ["normal", ...getAlign()]
        }],
        /**
         * Justify Items
         * @see https://tailwindcss.com/docs/justify-items
         */
        "justify-items": [{
          "justify-items": ["start", "end", "center", "stretch"]
        }],
        /**
         * Justify Self
         * @see https://tailwindcss.com/docs/justify-self
         */
        "justify-self": [{
          "justify-self": ["auto", "start", "end", "center", "stretch"]
        }],
        /**
         * Align Content
         * @see https://tailwindcss.com/docs/align-content
         */
        "align-content": [{
          content: ["normal", ...getAlign(), "baseline"]
        }],
        /**
         * Align Items
         * @see https://tailwindcss.com/docs/align-items
         */
        "align-items": [{
          items: ["start", "end", "center", "baseline", "stretch"]
        }],
        /**
         * Align Self
         * @see https://tailwindcss.com/docs/align-self
         */
        "align-self": [{
          self: ["auto", "start", "end", "center", "stretch", "baseline"]
        }],
        /**
         * Place Content
         * @see https://tailwindcss.com/docs/place-content
         */
        "place-content": [{
          "place-content": [...getAlign(), "baseline"]
        }],
        /**
         * Place Items
         * @see https://tailwindcss.com/docs/place-items
         */
        "place-items": [{
          "place-items": ["start", "end", "center", "baseline", "stretch"]
        }],
        /**
         * Place Self
         * @see https://tailwindcss.com/docs/place-self
         */
        "place-self": [{
          "place-self": ["auto", "start", "end", "center", "stretch"]
        }],
        // Spacing
        /**
         * Padding
         * @see https://tailwindcss.com/docs/padding
         */
        p: [{
          p: [padding]
        }],
        /**
         * Padding X
         * @see https://tailwindcss.com/docs/padding
         */
        px: [{
          px: [padding]
        }],
        /**
         * Padding Y
         * @see https://tailwindcss.com/docs/padding
         */
        py: [{
          py: [padding]
        }],
        /**
         * Padding Start
         * @see https://tailwindcss.com/docs/padding
         */
        ps: [{
          ps: [padding]
        }],
        /**
         * Padding End
         * @see https://tailwindcss.com/docs/padding
         */
        pe: [{
          pe: [padding]
        }],
        /**
         * Padding Top
         * @see https://tailwindcss.com/docs/padding
         */
        pt: [{
          pt: [padding]
        }],
        /**
         * Padding Right
         * @see https://tailwindcss.com/docs/padding
         */
        pr: [{
          pr: [padding]
        }],
        /**
         * Padding Bottom
         * @see https://tailwindcss.com/docs/padding
         */
        pb: [{
          pb: [padding]
        }],
        /**
         * Padding Left
         * @see https://tailwindcss.com/docs/padding
         */
        pl: [{
          pl: [padding]
        }],
        /**
         * Margin
         * @see https://tailwindcss.com/docs/margin
         */
        m: [{
          m: [margin]
        }],
        /**
         * Margin X
         * @see https://tailwindcss.com/docs/margin
         */
        mx: [{
          mx: [margin]
        }],
        /**
         * Margin Y
         * @see https://tailwindcss.com/docs/margin
         */
        my: [{
          my: [margin]
        }],
        /**
         * Margin Start
         * @see https://tailwindcss.com/docs/margin
         */
        ms: [{
          ms: [margin]
        }],
        /**
         * Margin End
         * @see https://tailwindcss.com/docs/margin
         */
        me: [{
          me: [margin]
        }],
        /**
         * Margin Top
         * @see https://tailwindcss.com/docs/margin
         */
        mt: [{
          mt: [margin]
        }],
        /**
         * Margin Right
         * @see https://tailwindcss.com/docs/margin
         */
        mr: [{
          mr: [margin]
        }],
        /**
         * Margin Bottom
         * @see https://tailwindcss.com/docs/margin
         */
        mb: [{
          mb: [margin]
        }],
        /**
         * Margin Left
         * @see https://tailwindcss.com/docs/margin
         */
        ml: [{
          ml: [margin]
        }],
        /**
         * Space Between X
         * @see https://tailwindcss.com/docs/space
         */
        "space-x": [{
          "space-x": [space]
        }],
        /**
         * Space Between X Reverse
         * @see https://tailwindcss.com/docs/space
         */
        "space-x-reverse": ["space-x-reverse"],
        /**
         * Space Between Y
         * @see https://tailwindcss.com/docs/space
         */
        "space-y": [{
          "space-y": [space]
        }],
        /**
         * Space Between Y Reverse
         * @see https://tailwindcss.com/docs/space
         */
        "space-y-reverse": ["space-y-reverse"],
        // Sizing
        /**
         * Width
         * @see https://tailwindcss.com/docs/width
         */
        w: [{
          w: ["auto", "min", "max", "fit", "svw", "lvw", "dvw", isArbitraryValue, spacing]
        }],
        /**
         * Min-Width
         * @see https://tailwindcss.com/docs/min-width
         */
        "min-w": [{
          "min-w": [isArbitraryValue, spacing, "min", "max", "fit"]
        }],
        /**
         * Max-Width
         * @see https://tailwindcss.com/docs/max-width
         */
        "max-w": [{
          "max-w": [isArbitraryValue, spacing, "none", "full", "min", "max", "fit", "prose", {
            screen: [isTshirtSize]
          }, isTshirtSize]
        }],
        /**
         * Height
         * @see https://tailwindcss.com/docs/height
         */
        h: [{
          h: [isArbitraryValue, spacing, "auto", "min", "max", "fit", "svh", "lvh", "dvh"]
        }],
        /**
         * Min-Height
         * @see https://tailwindcss.com/docs/min-height
         */
        "min-h": [{
          "min-h": [isArbitraryValue, spacing, "min", "max", "fit", "svh", "lvh", "dvh"]
        }],
        /**
         * Max-Height
         * @see https://tailwindcss.com/docs/max-height
         */
        "max-h": [{
          "max-h": [isArbitraryValue, spacing, "min", "max", "fit", "svh", "lvh", "dvh"]
        }],
        /**
         * Size
         * @see https://tailwindcss.com/docs/size
         */
        size: [{
          size: [isArbitraryValue, spacing, "auto", "min", "max", "fit"]
        }],
        // Typography
        /**
         * Font Size
         * @see https://tailwindcss.com/docs/font-size
         */
        "font-size": [{
          text: ["base", isTshirtSize, isArbitraryLength]
        }],
        /**
         * Font Smoothing
         * @see https://tailwindcss.com/docs/font-smoothing
         */
        "font-smoothing": ["antialiased", "subpixel-antialiased"],
        /**
         * Font Style
         * @see https://tailwindcss.com/docs/font-style
         */
        "font-style": ["italic", "not-italic"],
        /**
         * Font Weight
         * @see https://tailwindcss.com/docs/font-weight
         */
        "font-weight": [{
          font: ["thin", "extralight", "light", "normal", "medium", "semibold", "bold", "extrabold", "black", isArbitraryNumber]
        }],
        /**
         * Font Family
         * @see https://tailwindcss.com/docs/font-family
         */
        "font-family": [{
          font: [isAny]
        }],
        /**
         * Font Variant Numeric
         * @see https://tailwindcss.com/docs/font-variant-numeric
         */
        "fvn-normal": ["normal-nums"],
        /**
         * Font Variant Numeric
         * @see https://tailwindcss.com/docs/font-variant-numeric
         */
        "fvn-ordinal": ["ordinal"],
        /**
         * Font Variant Numeric
         * @see https://tailwindcss.com/docs/font-variant-numeric
         */
        "fvn-slashed-zero": ["slashed-zero"],
        /**
         * Font Variant Numeric
         * @see https://tailwindcss.com/docs/font-variant-numeric
         */
        "fvn-figure": ["lining-nums", "oldstyle-nums"],
        /**
         * Font Variant Numeric
         * @see https://tailwindcss.com/docs/font-variant-numeric
         */
        "fvn-spacing": ["proportional-nums", "tabular-nums"],
        /**
         * Font Variant Numeric
         * @see https://tailwindcss.com/docs/font-variant-numeric
         */
        "fvn-fraction": ["diagonal-fractions", "stacked-fractions"],
        /**
         * Letter Spacing
         * @see https://tailwindcss.com/docs/letter-spacing
         */
        tracking: [{
          tracking: ["tighter", "tight", "normal", "wide", "wider", "widest", isArbitraryValue]
        }],
        /**
         * Line Clamp
         * @see https://tailwindcss.com/docs/line-clamp
         */
        "line-clamp": [{
          "line-clamp": ["none", isNumber, isArbitraryNumber]
        }],
        /**
         * Line Height
         * @see https://tailwindcss.com/docs/line-height
         */
        leading: [{
          leading: ["none", "tight", "snug", "normal", "relaxed", "loose", isLength, isArbitraryValue]
        }],
        /**
         * List Style Image
         * @see https://tailwindcss.com/docs/list-style-image
         */
        "list-image": [{
          "list-image": ["none", isArbitraryValue]
        }],
        /**
         * List Style Type
         * @see https://tailwindcss.com/docs/list-style-type
         */
        "list-style-type": [{
          list: ["none", "disc", "decimal", isArbitraryValue]
        }],
        /**
         * List Style Position
         * @see https://tailwindcss.com/docs/list-style-position
         */
        "list-style-position": [{
          list: ["inside", "outside"]
        }],
        /**
         * Placeholder Color
         * @deprecated since Tailwind CSS v3.0.0
         * @see https://tailwindcss.com/docs/placeholder-color
         */
        "placeholder-color": [{
          placeholder: [colors]
        }],
        /**
         * Placeholder Opacity
         * @see https://tailwindcss.com/docs/placeholder-opacity
         */
        "placeholder-opacity": [{
          "placeholder-opacity": [opacity]
        }],
        /**
         * Text Alignment
         * @see https://tailwindcss.com/docs/text-align
         */
        "text-alignment": [{
          text: ["left", "center", "right", "justify", "start", "end"]
        }],
        /**
         * Text Color
         * @see https://tailwindcss.com/docs/text-color
         */
        "text-color": [{
          text: [colors]
        }],
        /**
         * Text Opacity
         * @see https://tailwindcss.com/docs/text-opacity
         */
        "text-opacity": [{
          "text-opacity": [opacity]
        }],
        /**
         * Text Decoration
         * @see https://tailwindcss.com/docs/text-decoration
         */
        "text-decoration": ["underline", "overline", "line-through", "no-underline"],
        /**
         * Text Decoration Style
         * @see https://tailwindcss.com/docs/text-decoration-style
         */
        "text-decoration-style": [{
          decoration: [...getLineStyles(), "wavy"]
        }],
        /**
         * Text Decoration Thickness
         * @see https://tailwindcss.com/docs/text-decoration-thickness
         */
        "text-decoration-thickness": [{
          decoration: ["auto", "from-font", isLength, isArbitraryLength]
        }],
        /**
         * Text Underline Offset
         * @see https://tailwindcss.com/docs/text-underline-offset
         */
        "underline-offset": [{
          "underline-offset": ["auto", isLength, isArbitraryValue]
        }],
        /**
         * Text Decoration Color
         * @see https://tailwindcss.com/docs/text-decoration-color
         */
        "text-decoration-color": [{
          decoration: [colors]
        }],
        /**
         * Text Transform
         * @see https://tailwindcss.com/docs/text-transform
         */
        "text-transform": ["uppercase", "lowercase", "capitalize", "normal-case"],
        /**
         * Text Overflow
         * @see https://tailwindcss.com/docs/text-overflow
         */
        "text-overflow": ["truncate", "text-ellipsis", "text-clip"],
        /**
         * Text Wrap
         * @see https://tailwindcss.com/docs/text-wrap
         */
        "text-wrap": [{
          text: ["wrap", "nowrap", "balance", "pretty"]
        }],
        /**
         * Text Indent
         * @see https://tailwindcss.com/docs/text-indent
         */
        indent: [{
          indent: getSpacingWithArbitrary()
        }],
        /**
         * Vertical Alignment
         * @see https://tailwindcss.com/docs/vertical-align
         */
        "vertical-align": [{
          align: ["baseline", "top", "middle", "bottom", "text-top", "text-bottom", "sub", "super", isArbitraryValue]
        }],
        /**
         * Whitespace
         * @see https://tailwindcss.com/docs/whitespace
         */
        whitespace: [{
          whitespace: ["normal", "nowrap", "pre", "pre-line", "pre-wrap", "break-spaces"]
        }],
        /**
         * Word Break
         * @see https://tailwindcss.com/docs/word-break
         */
        break: [{
          break: ["normal", "words", "all", "keep"]
        }],
        /**
         * Hyphens
         * @see https://tailwindcss.com/docs/hyphens
         */
        hyphens: [{
          hyphens: ["none", "manual", "auto"]
        }],
        /**
         * Content
         * @see https://tailwindcss.com/docs/content
         */
        content: [{
          content: ["none", isArbitraryValue]
        }],
        // Backgrounds
        /**
         * Background Attachment
         * @see https://tailwindcss.com/docs/background-attachment
         */
        "bg-attachment": [{
          bg: ["fixed", "local", "scroll"]
        }],
        /**
         * Background Clip
         * @see https://tailwindcss.com/docs/background-clip
         */
        "bg-clip": [{
          "bg-clip": ["border", "padding", "content", "text"]
        }],
        /**
         * Background Opacity
         * @deprecated since Tailwind CSS v3.0.0
         * @see https://tailwindcss.com/docs/background-opacity
         */
        "bg-opacity": [{
          "bg-opacity": [opacity]
        }],
        /**
         * Background Origin
         * @see https://tailwindcss.com/docs/background-origin
         */
        "bg-origin": [{
          "bg-origin": ["border", "padding", "content"]
        }],
        /**
         * Background Position
         * @see https://tailwindcss.com/docs/background-position
         */
        "bg-position": [{
          bg: [...getPositions(), isArbitraryPosition]
        }],
        /**
         * Background Repeat
         * @see https://tailwindcss.com/docs/background-repeat
         */
        "bg-repeat": [{
          bg: ["no-repeat", {
            repeat: ["", "x", "y", "round", "space"]
          }]
        }],
        /**
         * Background Size
         * @see https://tailwindcss.com/docs/background-size
         */
        "bg-size": [{
          bg: ["auto", "cover", "contain", isArbitrarySize]
        }],
        /**
         * Background Image
         * @see https://tailwindcss.com/docs/background-image
         */
        "bg-image": [{
          bg: ["none", {
            "gradient-to": ["t", "tr", "r", "br", "b", "bl", "l", "tl"]
          }, isArbitraryImage]
        }],
        /**
         * Background Color
         * @see https://tailwindcss.com/docs/background-color
         */
        "bg-color": [{
          bg: [colors]
        }],
        /**
         * Gradient Color Stops From Position
         * @see https://tailwindcss.com/docs/gradient-color-stops
         */
        "gradient-from-pos": [{
          from: [gradientColorStopPositions]
        }],
        /**
         * Gradient Color Stops Via Position
         * @see https://tailwindcss.com/docs/gradient-color-stops
         */
        "gradient-via-pos": [{
          via: [gradientColorStopPositions]
        }],
        /**
         * Gradient Color Stops To Position
         * @see https://tailwindcss.com/docs/gradient-color-stops
         */
        "gradient-to-pos": [{
          to: [gradientColorStopPositions]
        }],
        /**
         * Gradient Color Stops From
         * @see https://tailwindcss.com/docs/gradient-color-stops
         */
        "gradient-from": [{
          from: [gradientColorStops]
        }],
        /**
         * Gradient Color Stops Via
         * @see https://tailwindcss.com/docs/gradient-color-stops
         */
        "gradient-via": [{
          via: [gradientColorStops]
        }],
        /**
         * Gradient Color Stops To
         * @see https://tailwindcss.com/docs/gradient-color-stops
         */
        "gradient-to": [{
          to: [gradientColorStops]
        }],
        // Borders
        /**
         * Border Radius
         * @see https://tailwindcss.com/docs/border-radius
         */
        rounded: [{
          rounded: [borderRadius]
        }],
        /**
         * Border Radius Start
         * @see https://tailwindcss.com/docs/border-radius
         */
        "rounded-s": [{
          "rounded-s": [borderRadius]
        }],
        /**
         * Border Radius End
         * @see https://tailwindcss.com/docs/border-radius
         */
        "rounded-e": [{
          "rounded-e": [borderRadius]
        }],
        /**
         * Border Radius Top
         * @see https://tailwindcss.com/docs/border-radius
         */
        "rounded-t": [{
          "rounded-t": [borderRadius]
        }],
        /**
         * Border Radius Right
         * @see https://tailwindcss.com/docs/border-radius
         */
        "rounded-r": [{
          "rounded-r": [borderRadius]
        }],
        /**
         * Border Radius Bottom
         * @see https://tailwindcss.com/docs/border-radius
         */
        "rounded-b": [{
          "rounded-b": [borderRadius]
        }],
        /**
         * Border Radius Left
         * @see https://tailwindcss.com/docs/border-radius
         */
        "rounded-l": [{
          "rounded-l": [borderRadius]
        }],
        /**
         * Border Radius Start Start
         * @see https://tailwindcss.com/docs/border-radius
         */
        "rounded-ss": [{
          "rounded-ss": [borderRadius]
        }],
        /**
         * Border Radius Start End
         * @see https://tailwindcss.com/docs/border-radius
         */
        "rounded-se": [{
          "rounded-se": [borderRadius]
        }],
        /**
         * Border Radius End End
         * @see https://tailwindcss.com/docs/border-radius
         */
        "rounded-ee": [{
          "rounded-ee": [borderRadius]
        }],
        /**
         * Border Radius End Start
         * @see https://tailwindcss.com/docs/border-radius
         */
        "rounded-es": [{
          "rounded-es": [borderRadius]
        }],
        /**
         * Border Radius Top Left
         * @see https://tailwindcss.com/docs/border-radius
         */
        "rounded-tl": [{
          "rounded-tl": [borderRadius]
        }],
        /**
         * Border Radius Top Right
         * @see https://tailwindcss.com/docs/border-radius
         */
        "rounded-tr": [{
          "rounded-tr": [borderRadius]
        }],
        /**
         * Border Radius Bottom Right
         * @see https://tailwindcss.com/docs/border-radius
         */
        "rounded-br": [{
          "rounded-br": [borderRadius]
        }],
        /**
         * Border Radius Bottom Left
         * @see https://tailwindcss.com/docs/border-radius
         */
        "rounded-bl": [{
          "rounded-bl": [borderRadius]
        }],
        /**
         * Border Width
         * @see https://tailwindcss.com/docs/border-width
         */
        "border-w": [{
          border: [borderWidth]
        }],
        /**
         * Border Width X
         * @see https://tailwindcss.com/docs/border-width
         */
        "border-w-x": [{
          "border-x": [borderWidth]
        }],
        /**
         * Border Width Y
         * @see https://tailwindcss.com/docs/border-width
         */
        "border-w-y": [{
          "border-y": [borderWidth]
        }],
        /**
         * Border Width Start
         * @see https://tailwindcss.com/docs/border-width
         */
        "border-w-s": [{
          "border-s": [borderWidth]
        }],
        /**
         * Border Width End
         * @see https://tailwindcss.com/docs/border-width
         */
        "border-w-e": [{
          "border-e": [borderWidth]
        }],
        /**
         * Border Width Top
         * @see https://tailwindcss.com/docs/border-width
         */
        "border-w-t": [{
          "border-t": [borderWidth]
        }],
        /**
         * Border Width Right
         * @see https://tailwindcss.com/docs/border-width
         */
        "border-w-r": [{
          "border-r": [borderWidth]
        }],
        /**
         * Border Width Bottom
         * @see https://tailwindcss.com/docs/border-width
         */
        "border-w-b": [{
          "border-b": [borderWidth]
        }],
        /**
         * Border Width Left
         * @see https://tailwindcss.com/docs/border-width
         */
        "border-w-l": [{
          "border-l": [borderWidth]
        }],
        /**
         * Border Opacity
         * @see https://tailwindcss.com/docs/border-opacity
         */
        "border-opacity": [{
          "border-opacity": [opacity]
        }],
        /**
         * Border Style
         * @see https://tailwindcss.com/docs/border-style
         */
        "border-style": [{
          border: [...getLineStyles(), "hidden"]
        }],
        /**
         * Divide Width X
         * @see https://tailwindcss.com/docs/divide-width
         */
        "divide-x": [{
          "divide-x": [borderWidth]
        }],
        /**
         * Divide Width X Reverse
         * @see https://tailwindcss.com/docs/divide-width
         */
        "divide-x-reverse": ["divide-x-reverse"],
        /**
         * Divide Width Y
         * @see https://tailwindcss.com/docs/divide-width
         */
        "divide-y": [{
          "divide-y": [borderWidth]
        }],
        /**
         * Divide Width Y Reverse
         * @see https://tailwindcss.com/docs/divide-width
         */
        "divide-y-reverse": ["divide-y-reverse"],
        /**
         * Divide Opacity
         * @see https://tailwindcss.com/docs/divide-opacity
         */
        "divide-opacity": [{
          "divide-opacity": [opacity]
        }],
        /**
         * Divide Style
         * @see https://tailwindcss.com/docs/divide-style
         */
        "divide-style": [{
          divide: getLineStyles()
        }],
        /**
         * Border Color
         * @see https://tailwindcss.com/docs/border-color
         */
        "border-color": [{
          border: [borderColor]
        }],
        /**
         * Border Color X
         * @see https://tailwindcss.com/docs/border-color
         */
        "border-color-x": [{
          "border-x": [borderColor]
        }],
        /**
         * Border Color Y
         * @see https://tailwindcss.com/docs/border-color
         */
        "border-color-y": [{
          "border-y": [borderColor]
        }],
        /**
         * Border Color S
         * @see https://tailwindcss.com/docs/border-color
         */
        "border-color-s": [{
          "border-s": [borderColor]
        }],
        /**
         * Border Color E
         * @see https://tailwindcss.com/docs/border-color
         */
        "border-color-e": [{
          "border-e": [borderColor]
        }],
        /**
         * Border Color Top
         * @see https://tailwindcss.com/docs/border-color
         */
        "border-color-t": [{
          "border-t": [borderColor]
        }],
        /**
         * Border Color Right
         * @see https://tailwindcss.com/docs/border-color
         */
        "border-color-r": [{
          "border-r": [borderColor]
        }],
        /**
         * Border Color Bottom
         * @see https://tailwindcss.com/docs/border-color
         */
        "border-color-b": [{
          "border-b": [borderColor]
        }],
        /**
         * Border Color Left
         * @see https://tailwindcss.com/docs/border-color
         */
        "border-color-l": [{
          "border-l": [borderColor]
        }],
        /**
         * Divide Color
         * @see https://tailwindcss.com/docs/divide-color
         */
        "divide-color": [{
          divide: [borderColor]
        }],
        /**
         * Outline Style
         * @see https://tailwindcss.com/docs/outline-style
         */
        "outline-style": [{
          outline: ["", ...getLineStyles()]
        }],
        /**
         * Outline Offset
         * @see https://tailwindcss.com/docs/outline-offset
         */
        "outline-offset": [{
          "outline-offset": [isLength, isArbitraryValue]
        }],
        /**
         * Outline Width
         * @see https://tailwindcss.com/docs/outline-width
         */
        "outline-w": [{
          outline: [isLength, isArbitraryLength]
        }],
        /**
         * Outline Color
         * @see https://tailwindcss.com/docs/outline-color
         */
        "outline-color": [{
          outline: [colors]
        }],
        /**
         * Ring Width
         * @see https://tailwindcss.com/docs/ring-width
         */
        "ring-w": [{
          ring: getLengthWithEmptyAndArbitrary()
        }],
        /**
         * Ring Width Inset
         * @see https://tailwindcss.com/docs/ring-width
         */
        "ring-w-inset": ["ring-inset"],
        /**
         * Ring Color
         * @see https://tailwindcss.com/docs/ring-color
         */
        "ring-color": [{
          ring: [colors]
        }],
        /**
         * Ring Opacity
         * @see https://tailwindcss.com/docs/ring-opacity
         */
        "ring-opacity": [{
          "ring-opacity": [opacity]
        }],
        /**
         * Ring Offset Width
         * @see https://tailwindcss.com/docs/ring-offset-width
         */
        "ring-offset-w": [{
          "ring-offset": [isLength, isArbitraryLength]
        }],
        /**
         * Ring Offset Color
         * @see https://tailwindcss.com/docs/ring-offset-color
         */
        "ring-offset-color": [{
          "ring-offset": [colors]
        }],
        // Effects
        /**
         * Box Shadow
         * @see https://tailwindcss.com/docs/box-shadow
         */
        shadow: [{
          shadow: ["", "inner", "none", isTshirtSize, isArbitraryShadow]
        }],
        /**
         * Box Shadow Color
         * @see https://tailwindcss.com/docs/box-shadow-color
         */
        "shadow-color": [{
          shadow: [isAny]
        }],
        /**
         * Opacity
         * @see https://tailwindcss.com/docs/opacity
         */
        opacity: [{
          opacity: [opacity]
        }],
        /**
         * Mix Blend Mode
         * @see https://tailwindcss.com/docs/mix-blend-mode
         */
        "mix-blend": [{
          "mix-blend": [...getBlendModes(), "plus-lighter", "plus-darker"]
        }],
        /**
         * Background Blend Mode
         * @see https://tailwindcss.com/docs/background-blend-mode
         */
        "bg-blend": [{
          "bg-blend": getBlendModes()
        }],
        // Filters
        /**
         * Filter
         * @deprecated since Tailwind CSS v3.0.0
         * @see https://tailwindcss.com/docs/filter
         */
        filter: [{
          filter: ["", "none"]
        }],
        /**
         * Blur
         * @see https://tailwindcss.com/docs/blur
         */
        blur: [{
          blur: [blur]
        }],
        /**
         * Brightness
         * @see https://tailwindcss.com/docs/brightness
         */
        brightness: [{
          brightness: [brightness]
        }],
        /**
         * Contrast
         * @see https://tailwindcss.com/docs/contrast
         */
        contrast: [{
          contrast: [contrast]
        }],
        /**
         * Drop Shadow
         * @see https://tailwindcss.com/docs/drop-shadow
         */
        "drop-shadow": [{
          "drop-shadow": ["", "none", isTshirtSize, isArbitraryValue]
        }],
        /**
         * Grayscale
         * @see https://tailwindcss.com/docs/grayscale
         */
        grayscale: [{
          grayscale: [grayscale]
        }],
        /**
         * Hue Rotate
         * @see https://tailwindcss.com/docs/hue-rotate
         */
        "hue-rotate": [{
          "hue-rotate": [hueRotate]
        }],
        /**
         * Invert
         * @see https://tailwindcss.com/docs/invert
         */
        invert: [{
          invert: [invert]
        }],
        /**
         * Saturate
         * @see https://tailwindcss.com/docs/saturate
         */
        saturate: [{
          saturate: [saturate]
        }],
        /**
         * Sepia
         * @see https://tailwindcss.com/docs/sepia
         */
        sepia: [{
          sepia: [sepia]
        }],
        /**
         * Backdrop Filter
         * @deprecated since Tailwind CSS v3.0.0
         * @see https://tailwindcss.com/docs/backdrop-filter
         */
        "backdrop-filter": [{
          "backdrop-filter": ["", "none"]
        }],
        /**
         * Backdrop Blur
         * @see https://tailwindcss.com/docs/backdrop-blur
         */
        "backdrop-blur": [{
          "backdrop-blur": [blur]
        }],
        /**
         * Backdrop Brightness
         * @see https://tailwindcss.com/docs/backdrop-brightness
         */
        "backdrop-brightness": [{
          "backdrop-brightness": [brightness]
        }],
        /**
         * Backdrop Contrast
         * @see https://tailwindcss.com/docs/backdrop-contrast
         */
        "backdrop-contrast": [{
          "backdrop-contrast": [contrast]
        }],
        /**
         * Backdrop Grayscale
         * @see https://tailwindcss.com/docs/backdrop-grayscale
         */
        "backdrop-grayscale": [{
          "backdrop-grayscale": [grayscale]
        }],
        /**
         * Backdrop Hue Rotate
         * @see https://tailwindcss.com/docs/backdrop-hue-rotate
         */
        "backdrop-hue-rotate": [{
          "backdrop-hue-rotate": [hueRotate]
        }],
        /**
         * Backdrop Invert
         * @see https://tailwindcss.com/docs/backdrop-invert
         */
        "backdrop-invert": [{
          "backdrop-invert": [invert]
        }],
        /**
         * Backdrop Opacity
         * @see https://tailwindcss.com/docs/backdrop-opacity
         */
        "backdrop-opacity": [{
          "backdrop-opacity": [opacity]
        }],
        /**
         * Backdrop Saturate
         * @see https://tailwindcss.com/docs/backdrop-saturate
         */
        "backdrop-saturate": [{
          "backdrop-saturate": [saturate]
        }],
        /**
         * Backdrop Sepia
         * @see https://tailwindcss.com/docs/backdrop-sepia
         */
        "backdrop-sepia": [{
          "backdrop-sepia": [sepia]
        }],
        // Tables
        /**
         * Border Collapse
         * @see https://tailwindcss.com/docs/border-collapse
         */
        "border-collapse": [{
          border: ["collapse", "separate"]
        }],
        /**
         * Border Spacing
         * @see https://tailwindcss.com/docs/border-spacing
         */
        "border-spacing": [{
          "border-spacing": [borderSpacing]
        }],
        /**
         * Border Spacing X
         * @see https://tailwindcss.com/docs/border-spacing
         */
        "border-spacing-x": [{
          "border-spacing-x": [borderSpacing]
        }],
        /**
         * Border Spacing Y
         * @see https://tailwindcss.com/docs/border-spacing
         */
        "border-spacing-y": [{
          "border-spacing-y": [borderSpacing]
        }],
        /**
         * Table Layout
         * @see https://tailwindcss.com/docs/table-layout
         */
        "table-layout": [{
          table: ["auto", "fixed"]
        }],
        /**
         * Caption Side
         * @see https://tailwindcss.com/docs/caption-side
         */
        caption: [{
          caption: ["top", "bottom"]
        }],
        // Transitions and Animation
        /**
         * Tranisition Property
         * @see https://tailwindcss.com/docs/transition-property
         */
        transition: [{
          transition: ["none", "all", "", "colors", "opacity", "shadow", "transform", isArbitraryValue]
        }],
        /**
         * Transition Duration
         * @see https://tailwindcss.com/docs/transition-duration
         */
        duration: [{
          duration: getNumberAndArbitrary()
        }],
        /**
         * Transition Timing Function
         * @see https://tailwindcss.com/docs/transition-timing-function
         */
        ease: [{
          ease: ["linear", "in", "out", "in-out", isArbitraryValue]
        }],
        /**
         * Transition Delay
         * @see https://tailwindcss.com/docs/transition-delay
         */
        delay: [{
          delay: getNumberAndArbitrary()
        }],
        /**
         * Animation
         * @see https://tailwindcss.com/docs/animation
         */
        animate: [{
          animate: ["none", "spin", "ping", "pulse", "bounce", isArbitraryValue]
        }],
        // Transforms
        /**
         * Transform
         * @see https://tailwindcss.com/docs/transform
         */
        transform: [{
          transform: ["", "gpu", "none"]
        }],
        /**
         * Scale
         * @see https://tailwindcss.com/docs/scale
         */
        scale: [{
          scale: [scale]
        }],
        /**
         * Scale X
         * @see https://tailwindcss.com/docs/scale
         */
        "scale-x": [{
          "scale-x": [scale]
        }],
        /**
         * Scale Y
         * @see https://tailwindcss.com/docs/scale
         */
        "scale-y": [{
          "scale-y": [scale]
        }],
        /**
         * Rotate
         * @see https://tailwindcss.com/docs/rotate
         */
        rotate: [{
          rotate: [isInteger, isArbitraryValue]
        }],
        /**
         * Translate X
         * @see https://tailwindcss.com/docs/translate
         */
        "translate-x": [{
          "translate-x": [translate]
        }],
        /**
         * Translate Y
         * @see https://tailwindcss.com/docs/translate
         */
        "translate-y": [{
          "translate-y": [translate]
        }],
        /**
         * Skew X
         * @see https://tailwindcss.com/docs/skew
         */
        "skew-x": [{
          "skew-x": [skew]
        }],
        /**
         * Skew Y
         * @see https://tailwindcss.com/docs/skew
         */
        "skew-y": [{
          "skew-y": [skew]
        }],
        /**
         * Transform Origin
         * @see https://tailwindcss.com/docs/transform-origin
         */
        "transform-origin": [{
          origin: ["center", "top", "top-right", "right", "bottom-right", "bottom", "bottom-left", "left", "top-left", isArbitraryValue]
        }],
        // Interactivity
        /**
         * Accent Color
         * @see https://tailwindcss.com/docs/accent-color
         */
        accent: [{
          accent: ["auto", colors]
        }],
        /**
         * Appearance
         * @see https://tailwindcss.com/docs/appearance
         */
        appearance: [{
          appearance: ["none", "auto"]
        }],
        /**
         * Cursor
         * @see https://tailwindcss.com/docs/cursor
         */
        cursor: [{
          cursor: ["auto", "default", "pointer", "wait", "text", "move", "help", "not-allowed", "none", "context-menu", "progress", "cell", "crosshair", "vertical-text", "alias", "copy", "no-drop", "grab", "grabbing", "all-scroll", "col-resize", "row-resize", "n-resize", "e-resize", "s-resize", "w-resize", "ne-resize", "nw-resize", "se-resize", "sw-resize", "ew-resize", "ns-resize", "nesw-resize", "nwse-resize", "zoom-in", "zoom-out", isArbitraryValue]
        }],
        /**
         * Caret Color
         * @see https://tailwindcss.com/docs/just-in-time-mode#caret-color-utilities
         */
        "caret-color": [{
          caret: [colors]
        }],
        /**
         * Pointer Events
         * @see https://tailwindcss.com/docs/pointer-events
         */
        "pointer-events": [{
          "pointer-events": ["none", "auto"]
        }],
        /**
         * Resize
         * @see https://tailwindcss.com/docs/resize
         */
        resize: [{
          resize: ["none", "y", "x", ""]
        }],
        /**
         * Scroll Behavior
         * @see https://tailwindcss.com/docs/scroll-behavior
         */
        "scroll-behavior": [{
          scroll: ["auto", "smooth"]
        }],
        /**
         * Scroll Margin
         * @see https://tailwindcss.com/docs/scroll-margin
         */
        "scroll-m": [{
          "scroll-m": getSpacingWithArbitrary()
        }],
        /**
         * Scroll Margin X
         * @see https://tailwindcss.com/docs/scroll-margin
         */
        "scroll-mx": [{
          "scroll-mx": getSpacingWithArbitrary()
        }],
        /**
         * Scroll Margin Y
         * @see https://tailwindcss.com/docs/scroll-margin
         */
        "scroll-my": [{
          "scroll-my": getSpacingWithArbitrary()
        }],
        /**
         * Scroll Margin Start
         * @see https://tailwindcss.com/docs/scroll-margin
         */
        "scroll-ms": [{
          "scroll-ms": getSpacingWithArbitrary()
        }],
        /**
         * Scroll Margin End
         * @see https://tailwindcss.com/docs/scroll-margin
         */
        "scroll-me": [{
          "scroll-me": getSpacingWithArbitrary()
        }],
        /**
         * Scroll Margin Top
         * @see https://tailwindcss.com/docs/scroll-margin
         */
        "scroll-mt": [{
          "scroll-mt": getSpacingWithArbitrary()
        }],
        /**
         * Scroll Margin Right
         * @see https://tailwindcss.com/docs/scroll-margin
         */
        "scroll-mr": [{
          "scroll-mr": getSpacingWithArbitrary()
        }],
        /**
         * Scroll Margin Bottom
         * @see https://tailwindcss.com/docs/scroll-margin
         */
        "scroll-mb": [{
          "scroll-mb": getSpacingWithArbitrary()
        }],
        /**
         * Scroll Margin Left
         * @see https://tailwindcss.com/docs/scroll-margin
         */
        "scroll-ml": [{
          "scroll-ml": getSpacingWithArbitrary()
        }],
        /**
         * Scroll Padding
         * @see https://tailwindcss.com/docs/scroll-padding
         */
        "scroll-p": [{
          "scroll-p": getSpacingWithArbitrary()
        }],
        /**
         * Scroll Padding X
         * @see https://tailwindcss.com/docs/scroll-padding
         */
        "scroll-px": [{
          "scroll-px": getSpacingWithArbitrary()
        }],
        /**
         * Scroll Padding Y
         * @see https://tailwindcss.com/docs/scroll-padding
         */
        "scroll-py": [{
          "scroll-py": getSpacingWithArbitrary()
        }],
        /**
         * Scroll Padding Start
         * @see https://tailwindcss.com/docs/scroll-padding
         */
        "scroll-ps": [{
          "scroll-ps": getSpacingWithArbitrary()
        }],
        /**
         * Scroll Padding End
         * @see https://tailwindcss.com/docs/scroll-padding
         */
        "scroll-pe": [{
          "scroll-pe": getSpacingWithArbitrary()
        }],
        /**
         * Scroll Padding Top
         * @see https://tailwindcss.com/docs/scroll-padding
         */
        "scroll-pt": [{
          "scroll-pt": getSpacingWithArbitrary()
        }],
        /**
         * Scroll Padding Right
         * @see https://tailwindcss.com/docs/scroll-padding
         */
        "scroll-pr": [{
          "scroll-pr": getSpacingWithArbitrary()
        }],
        /**
         * Scroll Padding Bottom
         * @see https://tailwindcss.com/docs/scroll-padding
         */
        "scroll-pb": [{
          "scroll-pb": getSpacingWithArbitrary()
        }],
        /**
         * Scroll Padding Left
         * @see https://tailwindcss.com/docs/scroll-padding
         */
        "scroll-pl": [{
          "scroll-pl": getSpacingWithArbitrary()
        }],
        /**
         * Scroll Snap Align
         * @see https://tailwindcss.com/docs/scroll-snap-align
         */
        "snap-align": [{
          snap: ["start", "end", "center", "align-none"]
        }],
        /**
         * Scroll Snap Stop
         * @see https://tailwindcss.com/docs/scroll-snap-stop
         */
        "snap-stop": [{
          snap: ["normal", "always"]
        }],
        /**
         * Scroll Snap Type
         * @see https://tailwindcss.com/docs/scroll-snap-type
         */
        "snap-type": [{
          snap: ["none", "x", "y", "both"]
        }],
        /**
         * Scroll Snap Type Strictness
         * @see https://tailwindcss.com/docs/scroll-snap-type
         */
        "snap-strictness": [{
          snap: ["mandatory", "proximity"]
        }],
        /**
         * Touch Action
         * @see https://tailwindcss.com/docs/touch-action
         */
        touch: [{
          touch: ["auto", "none", "manipulation"]
        }],
        /**
         * Touch Action X
         * @see https://tailwindcss.com/docs/touch-action
         */
        "touch-x": [{
          "touch-pan": ["x", "left", "right"]
        }],
        /**
         * Touch Action Y
         * @see https://tailwindcss.com/docs/touch-action
         */
        "touch-y": [{
          "touch-pan": ["y", "up", "down"]
        }],
        /**
         * Touch Action Pinch Zoom
         * @see https://tailwindcss.com/docs/touch-action
         */
        "touch-pz": ["touch-pinch-zoom"],
        /**
         * User Select
         * @see https://tailwindcss.com/docs/user-select
         */
        select: [{
          select: ["none", "text", "all", "auto"]
        }],
        /**
         * Will Change
         * @see https://tailwindcss.com/docs/will-change
         */
        "will-change": [{
          "will-change": ["auto", "scroll", "contents", "transform", isArbitraryValue]
        }],
        // SVG
        /**
         * Fill
         * @see https://tailwindcss.com/docs/fill
         */
        fill: [{
          fill: [colors, "none"]
        }],
        /**
         * Stroke Width
         * @see https://tailwindcss.com/docs/stroke-width
         */
        "stroke-w": [{
          stroke: [isLength, isArbitraryLength, isArbitraryNumber]
        }],
        /**
         * Stroke
         * @see https://tailwindcss.com/docs/stroke
         */
        stroke: [{
          stroke: [colors, "none"]
        }],
        // Accessibility
        /**
         * Screen Readers
         * @see https://tailwindcss.com/docs/screen-readers
         */
        sr: ["sr-only", "not-sr-only"],
        /**
         * Forced Color Adjust
         * @see https://tailwindcss.com/docs/forced-color-adjust
         */
        "forced-color-adjust": [{
          "forced-color-adjust": ["auto", "none"]
        }]
      },
      conflictingClassGroups: {
        overflow: ["overflow-x", "overflow-y"],
        overscroll: ["overscroll-x", "overscroll-y"],
        inset: ["inset-x", "inset-y", "start", "end", "top", "right", "bottom", "left"],
        "inset-x": ["right", "left"],
        "inset-y": ["top", "bottom"],
        flex: ["basis", "grow", "shrink"],
        gap: ["gap-x", "gap-y"],
        p: ["px", "py", "ps", "pe", "pt", "pr", "pb", "pl"],
        px: ["pr", "pl"],
        py: ["pt", "pb"],
        m: ["mx", "my", "ms", "me", "mt", "mr", "mb", "ml"],
        mx: ["mr", "ml"],
        my: ["mt", "mb"],
        size: ["w", "h"],
        "font-size": ["leading"],
        "fvn-normal": ["fvn-ordinal", "fvn-slashed-zero", "fvn-figure", "fvn-spacing", "fvn-fraction"],
        "fvn-ordinal": ["fvn-normal"],
        "fvn-slashed-zero": ["fvn-normal"],
        "fvn-figure": ["fvn-normal"],
        "fvn-spacing": ["fvn-normal"],
        "fvn-fraction": ["fvn-normal"],
        "line-clamp": ["display", "overflow"],
        rounded: ["rounded-s", "rounded-e", "rounded-t", "rounded-r", "rounded-b", "rounded-l", "rounded-ss", "rounded-se", "rounded-ee", "rounded-es", "rounded-tl", "rounded-tr", "rounded-br", "rounded-bl"],
        "rounded-s": ["rounded-ss", "rounded-es"],
        "rounded-e": ["rounded-se", "rounded-ee"],
        "rounded-t": ["rounded-tl", "rounded-tr"],
        "rounded-r": ["rounded-tr", "rounded-br"],
        "rounded-b": ["rounded-br", "rounded-bl"],
        "rounded-l": ["rounded-tl", "rounded-bl"],
        "border-spacing": ["border-spacing-x", "border-spacing-y"],
        "border-w": ["border-w-s", "border-w-e", "border-w-t", "border-w-r", "border-w-b", "border-w-l"],
        "border-w-x": ["border-w-r", "border-w-l"],
        "border-w-y": ["border-w-t", "border-w-b"],
        "border-color": ["border-color-s", "border-color-e", "border-color-t", "border-color-r", "border-color-b", "border-color-l"],
        "border-color-x": ["border-color-r", "border-color-l"],
        "border-color-y": ["border-color-t", "border-color-b"],
        "scroll-m": ["scroll-mx", "scroll-my", "scroll-ms", "scroll-me", "scroll-mt", "scroll-mr", "scroll-mb", "scroll-ml"],
        "scroll-mx": ["scroll-mr", "scroll-ml"],
        "scroll-my": ["scroll-mt", "scroll-mb"],
        "scroll-p": ["scroll-px", "scroll-py", "scroll-ps", "scroll-pe", "scroll-pt", "scroll-pr", "scroll-pb", "scroll-pl"],
        "scroll-px": ["scroll-pr", "scroll-pl"],
        "scroll-py": ["scroll-pt", "scroll-pb"],
        touch: ["touch-x", "touch-y", "touch-pz"],
        "touch-x": ["touch"],
        "touch-y": ["touch"],
        "touch-pz": ["touch"]
      },
      conflictingClassGroupModifiers: {
        "font-size": ["leading"]
      }
    };
  };
  var twMerge = /* @__PURE__ */ createTailwindMerge(getDefaultConfig);

  // src/web/utils/helpers.ts
  var cn = (...inputs) => {
    return twMerge(clsx(inputs));
  };
  typeof navigator !== "undefined" && navigator.userAgent.includes("Firefox");
  var throttle = (callback, delay) => {
    let lastCall = 0;
    return (e4) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        return callback(e4);
      }
      return void 0;
    };
  };
  var tryOrElse = (fn2, defaultValue) => {
    try {
      return fn2();
    } catch {
      return defaultValue;
    }
  };
  var readLocalStorage = (storageKey) => {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };
  var saveLocalStorage = (storageKey, state) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
    }
  };
  var removeLocalStorage = (storageKey) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
    }
  };
  var toggleMultipleClasses = (element, classes) => {
    for (const cls of classes) {
      element.classList.toggle(cls);
    }
  };
  var LazyComponentTag = 24;
  var ProfilerTag = 12;
  var getExtendedDisplayName = (fiber) => {
    if (!fiber) {
      return {
        name: "Unknown",
        wrappers: [],
        wrapperTypes: []
      };
    }
    const { tag, type, elementType } = fiber;
    let name = getDisplayName(type);
    const wrappers = [];
    const wrapperTypes = [];
    if (hasMemoCache(fiber) || tag === SimpleMemoComponentTag || tag === MemoComponentTag || type?.$$typeof === Symbol.for("react.memo") || elementType?.$$typeof === Symbol.for("react.memo")) {
      const compiler = hasMemoCache(fiber);
      wrapperTypes.push({
        type: "memo",
        title: compiler ? "This component has been auto-memoized by the React Compiler." : "Memoized component that skips re-renders if props are the same",
        compiler
      });
    }
    if (tag === ForwardRefTag || type?.$$typeof === Symbol.for("react.forward_ref")) {
      wrapperTypes.push({
        type: "forwardRef",
        title: "Component that can forward refs to DOM elements or other components"
      });
    }
    if (tag === LazyComponentTag) {
      wrapperTypes.push({
        type: "lazy",
        title: "Lazily loaded component that supports code splitting"
      });
    }
    if (tag === SuspenseComponentTag) {
      wrapperTypes.push({
        type: "suspense",
        title: "Component that can suspend while content is loading"
      });
    }
    if (tag === ProfilerTag) {
      wrapperTypes.push({
        type: "profiler",
        title: "Component that measures rendering performance"
      });
    }
    if (typeof name === "string") {
      const wrapperRegex = /^(\w+)\((.*)\)$/;
      let currentName = name;
      while (wrapperRegex.test(currentName)) {
        const match = currentName.match(wrapperRegex);
        if (match?.[1] && match?.[2]) {
          wrappers.unshift(match[1]);
          currentName = match[2];
        } else {
          break;
        }
      }
      name = currentName;
    }
    return {
      name: name || "Unknown",
      wrappers,
      wrapperTypes
    };
  };

  // src/core/worker/deferred.ts
  function createDeferred() {
    let resolve;
    let reject;
    return {
      promise: new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      }),
      resolve(value) {
        resolve(value);
      },
      reject(value) {
        reject(value);
      }
    };
  }

  // src/core/worker/smol.ts
  function setupWorker(setup) {
    const callback = setup();
    function success(id, data) {
      self.postMessage([id, true, data]);
    }
    function failure(id, data) {
      self.postMessage([id, false, data]);
    }
    self.addEventListener("message", (event) => {
      const [id, data] = event.data;
      try {
        Promise.resolve(callback(data)).then(
          (res) => success(id, res),
          (res) => failure(id, res)
        );
      } catch (error) {
        failure(id, error);
      }
    });
  }
  function createWorker(callback) {
    const template = `(${setupWorker.toString()})(${callback.toString()})`;
    const url = URL.createObjectURL(new Blob([template]));
    const worker2 = new Worker(url);
    return worker2;
  }
  var SmolWorker = class {
    constructor(callback) {
      this.callback = callback;
      this.deferredMap = /* @__PURE__ */ new Map();
      this.count = 0;
      this.sync = false;
    }
    setupWorker(worker2) {
      worker2.addEventListener(
        "message",
        (event) => {
          const [id, flag, data] = event.data;
          const deferred = this.deferredMap.get(id);
          if (deferred) {
            if (flag) {
              deferred.resolve(data);
            } else {
              deferred.reject(data);
            }
            this.deferredMap.delete(id);
          }
        }
      );
    }
    async call(data, options) {
      if (this.sync) {
        if (!this.setup) {
          this.setup = this.callback();
        }
        return this.setup(data);
      }
      if (!this.worker) {
        this.worker = createWorker(this.callback);
        this.setupWorker(this.worker);
      }
      const deferred = createDeferred();
      const id = this.count++;
      this.deferredMap.set(id, deferred);
      this.worker.postMessage([id, data], {
        transfer: options?.transfer
      });
      return deferred.promise;
    }
    destroy() {
      this.deferredMap.clear();
      this.worker?.terminate();
    }
  };

  // src/core/worker/smol-extension.ts
  var SmolWorkerExtension = class {
    constructor(callback) {
      this.callback = callback;
      this.sync = true;
    }
    async call(data, _options) {
      if (!this.setup) {
        this.setup = this.callback();
      }
      return this.setup(data);
    }
    destroy() {
    }
  };

  // src/web/utils/outline-worker.ts
  function setupOutlineWorker() {
    const MONO_FONT2 = "Menlo,Consolas,Monaco,Liberation Mono,Lucida Console,monospace";
    let ctx2;
    let Reason;
    ((Reason2) => {
      Reason2[Reason2["Commit"] = 1] = "Commit";
      Reason2[Reason2["Unstable"] = 2] = "Unstable";
      Reason2[Reason2["Unnecessary"] = 4] = "Unnecessary";
    })(Reason || (Reason = {}));
    return async (action) => {
      switch (action.type) {
        case "set-canvas":
          {
            const current = action.payload.getContext("2d");
            if (current) {
              ctx2 = current;
            }
          }
          break;
        case "resize":
          if (ctx2) {
            const { dpi, width, height } = action.payload;
            ctx2.canvas.width = width;
            ctx2.canvas.height = height;
            ctx2.resetTransform();
            ctx2.scale(dpi, dpi);
          }
          break;
        case "fade-out-outline":
          if (ctx2) {
            const { dpi, drawingQueue, mergedLabels } = action.payload;
            ctx2.clearRect(0, 0, ctx2.canvas.width / dpi, ctx2.canvas.height / dpi);
            ctx2.save();
            for (let i5 = 0, len = drawingQueue.length; i5 < len; i5++) {
              const { rect, color, alpha, fillAlpha } = drawingQueue[i5];
              const rgb = `${color.r},${color.g},${color.b}`;
              ctx2.strokeStyle = `rgba(${rgb},${alpha})`;
              ctx2.lineWidth = 1;
              ctx2.fillStyle = `rgba(${rgb},${fillAlpha})`;
              ctx2.beginPath();
              ctx2.rect(rect.x, rect.y, rect.width, rect.height);
              ctx2.stroke();
              ctx2.fill();
            }
            ctx2.restore();
            for (let i5 = 0, len = mergedLabels.length; i5 < len; i5++) {
              const { alpha, rect, color, reasons, labelText } = mergedLabels[i5];
              const conditionalText = reasons & 4 /* Unnecessary */ ? `${labelText}\u26A0\uFE0F` : labelText;
              ctx2.save();
              ctx2.font = `11px ${MONO_FONT2}`;
              const textMetrics = ctx2.measureText(conditionalText);
              const textWidth = textMetrics.width;
              const textHeight = 11;
              const labelX = rect.x;
              const labelY = rect.y - textHeight - 4;
              ctx2.fillStyle = `rgba(${color.r},${color.g},${color.b},${alpha})`;
              ctx2.fillRect(labelX, labelY, textWidth + 4, textHeight + 4);
              ctx2.fillStyle = `rgba(255,255,255,${alpha})`;
              ctx2.fillText(conditionalText, labelX + 2, labelY + textHeight);
            }
          }
          break;
      }
    };
  }
  var createWorker2 = () => {
    const useExtensionWorker = readLocalStorage("use-extension-worker");
    removeLocalStorage("use-extension-worker");
    if (useExtensionWorker) {
      return new SmolWorkerExtension(setupOutlineWorker);
    }
    return new SmolWorker(setupOutlineWorker);
  };
  createWorker2();
  function incrementFrameId() {
    requestAnimationFrame(incrementFrameId);
  }
  if (typeof window !== "undefined") {
    incrementFrameId();
  }
  var batchGetBoundingRects = (elements) => {
    return new Promise((resolve) => {
      const results = /* @__PURE__ */ new Map();
      const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          const element = entry.target;
          const bounds = entry.boundingClientRect;
          results.set(element, bounds);
        }
        observer.disconnect();
        resolve(results);
      });
      for (const element of elements) {
        observer.observe(element);
      }
    });
  };
  var RENDER_PHASE_STRING_TO_ENUM = {
    mount: 1 /* Mount */,
    update: 2 /* Update */,
    unmount: 4 /* Unmount */
  };

  // src/web/constants.ts
  var SAFE_AREA = 24;
  var MIN_SIZE = {
    width: 480,
    height: 36,
    initialHeight: 36 * 10
  };
  var MIN_CONTAINER_WIDTH = 240;
  var LOCALSTORAGE_KEY = "react-scan-widget-settings";

  // src/web/state.ts
  var signalIsSettingsOpen = d3(false);
  var signalRefWidget = d3(null);
  var defaultWidgetConfig = {
    corner: "top-left",
    dimensions: {
      isFullWidth: false,
      isFullHeight: false,
      width: MIN_SIZE.width,
      height: MIN_SIZE.height,
      position: { x: SAFE_AREA, y: SAFE_AREA }
    },
    lastDimensions: {
      isFullWidth: false,
      isFullHeight: false,
      width: MIN_SIZE.width,
      height: MIN_SIZE.height,
      position: { x: SAFE_AREA, y: SAFE_AREA }
    },
    componentsTree: {
      width: MIN_CONTAINER_WIDTH
    }
  };
  var getInitialWidgetConfig = () => {
    const stored = readLocalStorage(LOCALSTORAGE_KEY);
    if (!stored) {
      saveLocalStorage(LOCALSTORAGE_KEY, {
        corner: defaultWidgetConfig.corner,
        dimensions: defaultWidgetConfig.dimensions,
        lastDimensions: defaultWidgetConfig.lastDimensions,
        componentsTree: defaultWidgetConfig.componentsTree
      });
      return defaultWidgetConfig;
    }
    return {
      corner: stored.corner ?? defaultWidgetConfig.corner,
      dimensions: {
        isFullWidth: false,
        isFullHeight: false,
        width: MIN_SIZE.width,
        height: MIN_SIZE.height,
        position: stored.dimensions.position ?? defaultWidgetConfig.dimensions.position
      },
      lastDimensions: stored.dimensions ?? defaultWidgetConfig.dimensions,
      componentsTree: stored.componentsTree ?? defaultWidgetConfig.componentsTree
    };
  };
  var signalWidget = d3(getInitialWidgetConfig());
  var updateDimensions = () => {
    if (typeof window === "undefined") return;
    const { dimensions } = signalWidget.value;
    const { width, height, position } = dimensions;
    signalWidget.value = {
      ...signalWidget.value,
      dimensions: {
        isFullWidth: width >= window.innerWidth - SAFE_AREA * 2,
        isFullHeight: height >= window.innerHeight - SAFE_AREA * 2,
        width,
        height,
        position
      }
    };
  };

  // src/web/utils/preact/constant.ts
  function CONSTANT_UPDATE() {
    return false;
  }
  function constant(Component) {
    function Memoed(props) {
      this.shouldComponentUpdate = CONSTANT_UPDATE;
      return g(Component, props);
    }
    Memoed.displayName = `Memo(${Component.displayName || Component.name})`;
    Memoed.prototype.isReactComponent = true;
    Memoed._forwarded = true;
    return Memoed;
  }

  // ../../node_modules/.pnpm/preact@10.25.1/node_modules/preact/compat/dist/compat.module.js
  function g4(n3, t4) {
    for (var e4 in n3) if ("__source" !== e4 && !(e4 in t4)) return true;
    for (var r5 in t4) if ("__source" !== r5 && n3[r5] !== t4[r5]) return true;
    return false;
  }
  function I2(n3, t4) {
    this.props = n3, this.context = t4;
  }
  function N2(n3, e4) {
    function r5(n4) {
      var t4 = this.props.ref, r6 = t4 == n4.ref;
      return !r6 && t4 && (t4.call ? t4(null) : t4.current = null), g4(this.props, n4);
    }
    function u5(e5) {
      return this.shouldComponentUpdate = r5, g(n3, e5);
    }
    return u5.displayName = "Memo(" + (n3.displayName || n3.name) + ")", u5.prototype.isReactComponent = true, u5.__f = true, u5;
  }
  (I2.prototype = new x()).isPureReactComponent = true, I2.prototype.shouldComponentUpdate = function(n3, t4) {
    return g4(this.props, n3) || g4(this.state, t4);
  };
  var M2 = l.__b;
  l.__b = function(n3) {
    n3.type && n3.type.__f && n3.ref && (n3.props.ref = n3.ref, n3.ref = null), M2 && M2(n3);
  };
  var T3 = "undefined" != typeof Symbol && Symbol.for && Symbol.for("react.forward_ref") || 3911;
  function A3(n3) {
    function t4(t5) {
      if (!("ref" in t5)) return n3(t5, null);
      var e4 = t5.ref;
      delete t5.ref;
      var r5 = n3(t5, e4);
      return t5.ref = e4, r5;
    }
    return t4.$$typeof = T3, t4.render = t4, t4.prototype.isReactComponent = t4.__f = true, t4.displayName = "ForwardRef(" + (n3.displayName || n3.name) + ")", t4;
  }
  var O2 = l.__e;
  l.__e = function(n3, t4, e4, r5) {
    if (n3.then) {
      for (var u5, o4 = t4; o4 = o4.__; ) if ((u5 = o4.__c) && u5.__c) return null == t4.__e && (t4.__e = e4.__e, t4.__k = e4.__k), u5.__c(n3, t4);
    }
    O2(n3, t4, e4, r5);
  };
  var F3 = l.unmount;
  function U(n3, t4, e4) {
    return n3 && (n3.__c && n3.__c.__H && (n3.__c.__H.__.forEach(function(n4) {
      "function" == typeof n4.__c && n4.__c();
    }), n3.__c.__H = null), null != (n3 = function(n4, t5) {
      for (var e5 in t5) n4[e5] = t5[e5];
      return n4;
    }({}, n3)).__c && (n3.__c.__P === e4 && (n3.__c.__P = t4), n3.__c = null), n3.__k = n3.__k && n3.__k.map(function(n4) {
      return U(n4, t4, e4);
    })), n3;
  }
  function V2(n3, t4, e4) {
    return n3 && e4 && (n3.__v = null, n3.__k = n3.__k && n3.__k.map(function(n4) {
      return V2(n4, t4, e4);
    }), n3.__c && n3.__c.__P === t4 && (n3.__e && e4.appendChild(n3.__e), n3.__c.__e = true, n3.__c.__P = e4)), n3;
  }
  function W() {
    this.__u = 0, this.o = null, this.__b = null;
  }
  function P3(n3) {
    var t4 = n3.__.__c;
    return t4 && t4.__a && t4.__a(n3);
  }
  function z3() {
    this.i = null, this.l = null;
  }
  l.unmount = function(n3) {
    var t4 = n3.__c;
    t4 && t4.__R && t4.__R(), t4 && 32 & n3.__u && (n3.type = null), F3 && F3(n3);
  }, (W.prototype = new x()).__c = function(n3, t4) {
    var e4 = t4.__c, r5 = this;
    null == r5.o && (r5.o = []), r5.o.push(e4);
    var u5 = P3(r5.__v), o4 = false, i5 = function() {
      o4 || (o4 = true, e4.__R = null, u5 ? u5(c4) : c4());
    };
    e4.__R = i5;
    var c4 = function() {
      if (!--r5.__u) {
        if (r5.state.__a) {
          var n4 = r5.state.__a;
          r5.__v.__k[0] = V2(n4, n4.__c.__P, n4.__c.__O);
        }
        var t5;
        for (r5.setState({ __a: r5.__b = null }); t5 = r5.o.pop(); ) t5.forceUpdate();
      }
    };
    r5.__u++ || 32 & t4.__u || r5.setState({ __a: r5.__b = r5.__v.__k[0] }), n3.then(i5, i5);
  }, W.prototype.componentWillUnmount = function() {
    this.o = [];
  }, W.prototype.render = function(n3, e4) {
    if (this.__b) {
      if (this.__v.__k) {
        var r5 = document.createElement("div"), o4 = this.__v.__k[0].__c;
        this.__v.__k[0] = U(this.__b, r5, o4.__O = o4.__P);
      }
      this.__b = null;
    }
    var i5 = e4.__a && g(k, null, n3.fallback);
    return i5 && (i5.__u &= -33), [g(k, null, e4.__a ? null : n3.children), i5];
  };
  var B3 = function(n3, t4, e4) {
    if (++e4[1] === e4[0] && n3.l.delete(t4), n3.props.revealOrder && ("t" !== n3.props.revealOrder[0] || !n3.l.size)) for (e4 = n3.i; e4; ) {
      for (; e4.length > 3; ) e4.pop()();
      if (e4[1] < e4[0]) break;
      n3.i = e4 = e4[2];
    }
  };
  (z3.prototype = new x()).__a = function(n3) {
    var t4 = this, e4 = P3(t4.__v), r5 = t4.l.get(n3);
    return r5[0]++, function(u5) {
      var o4 = function() {
        t4.props.revealOrder ? (r5.push(u5), B3(t4, n3, r5)) : u5();
      };
      e4 ? e4(o4) : o4();
    };
  }, z3.prototype.render = function(n3) {
    this.i = null, this.l = /* @__PURE__ */ new Map();
    var t4 = L(n3.children);
    n3.revealOrder && "b" === n3.revealOrder[0] && t4.reverse();
    for (var e4 = t4.length; e4--; ) this.l.set(t4[e4], this.i = [1, 0, this.i]);
    return n3.children;
  }, z3.prototype.componentDidUpdate = z3.prototype.componentDidMount = function() {
    var n3 = this;
    this.l.forEach(function(t4, e4) {
      B3(n3, e4, t4);
    });
  };
  var $2 = "undefined" != typeof Symbol && Symbol.for && Symbol.for("react.element") || 60103;
  var q3 = /^(?:accent|alignment|arabic|baseline|cap|clip(?!PathU)|color|dominant|fill|flood|font|glyph(?!R)|horiz|image(!S)|letter|lighting|marker(?!H|W|U)|overline|paint|pointer|shape|stop|strikethrough|stroke|text(?!L)|transform|underline|unicode|units|v|vector|vert|word|writing|x(?!C))[A-Z]/;
  var G2 = /^on(Ani|Tra|Tou|BeforeInp|Compo)/;
  var J2 = /[A-Z0-9]/g;
  var K = "undefined" != typeof document;
  var Q = function(n3) {
    return ("undefined" != typeof Symbol && "symbol" == typeof Symbol() ? /fil|che|rad/ : /fil|che|ra/).test(n3);
  };
  x.prototype.isReactComponent = {}, ["componentWillMount", "componentWillReceiveProps", "componentWillUpdate"].forEach(function(t4) {
    Object.defineProperty(x.prototype, t4, { configurable: true, get: function() {
      return this["UNSAFE_" + t4];
    }, set: function(n3) {
      Object.defineProperty(this, t4, { configurable: true, writable: true, value: n3 });
    } });
  });
  var tn = l.event;
  function en() {
  }
  function rn() {
    return this.cancelBubble;
  }
  function un() {
    return this.defaultPrevented;
  }
  l.event = function(n3) {
    return tn && (n3 = tn(n3)), n3.persist = en, n3.isPropagationStopped = rn, n3.isDefaultPrevented = un, n3.nativeEvent = n3;
  };
  var cn2 = { enumerable: false, configurable: true, get: function() {
    return this.class;
  } };
  var fn = l.vnode;
  l.vnode = function(n3) {
    "string" == typeof n3.type && function(n4) {
      var t4 = n4.props, e4 = n4.type, u5 = {}, o4 = -1 === e4.indexOf("-");
      for (var i5 in t4) {
        var c4 = t4[i5];
        if (!("value" === i5 && "defaultValue" in t4 && null == c4 || K && "children" === i5 && "noscript" === e4 || "class" === i5 || "className" === i5)) {
          var f5 = i5.toLowerCase();
          "defaultValue" === i5 && "value" in t4 && null == t4.value ? i5 = "value" : "download" === i5 && true === c4 ? c4 = "" : "translate" === f5 && "no" === c4 ? c4 = false : "o" === f5[0] && "n" === f5[1] ? "ondoubleclick" === f5 ? i5 = "ondblclick" : "onchange" !== f5 || "input" !== e4 && "textarea" !== e4 || Q(t4.type) ? "onfocus" === f5 ? i5 = "onfocusin" : "onblur" === f5 ? i5 = "onfocusout" : G2.test(i5) && (i5 = f5) : f5 = i5 = "oninput" : o4 && q3.test(i5) ? i5 = i5.replace(J2, "-$&").toLowerCase() : null === c4 && (c4 = void 0), "oninput" === f5 && u5[i5 = f5] && (i5 = "oninputCapture"), u5[i5] = c4;
        }
      }
      "select" == e4 && u5.multiple && Array.isArray(u5.value) && (u5.value = L(t4.children).forEach(function(n5) {
        n5.props.selected = -1 != u5.value.indexOf(n5.props.value);
      })), "select" == e4 && null != u5.defaultValue && (u5.value = L(t4.children).forEach(function(n5) {
        n5.props.selected = u5.multiple ? -1 != u5.defaultValue.indexOf(n5.props.value) : u5.defaultValue == n5.props.value;
      })), t4.class && !t4.className ? (u5.class = t4.class, Object.defineProperty(u5, "className", cn2)) : (t4.className && !t4.class || t4.class && t4.className) && (u5.class = u5.className = t4.className), n4.props = u5;
    }(n3), n3.$$typeof = $2, fn && fn(n3);
  };
  var ln = l.__r;
  l.__r = function(n3) {
    ln && ln(n3), n3.__c;
  };
  var an = l.diffed;
  l.diffed = function(n3) {
    an && an(n3);
    var t4 = n3.props, e4 = n3.__e;
    null != e4 && "textarea" === n3.type && "value" in t4 && t4.value !== e4.value && (e4.value = null == t4.value ? "" : t4.value);
  };

  // ../../node_modules/.pnpm/preact@10.25.1/node_modules/preact/jsx-runtime/dist/jsxRuntime.module.js
  var f4 = 0;
  function u4(e4, t4, n3, o4, i5, u5) {
    t4 || (t4 = {});
    var a4, c4, l5 = t4;
    "ref" in t4 && (a4 = t4.ref, delete t4.ref);
    var p5 = { type: e4, props: l5, key: n3, ref: a4, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: --f4, __i: -1, __u: 0, __source: i5, __self: u5 };
    if ("function" == typeof e4 && (a4 = e4.defaultProps)) for (c4 in a4) void 0 === l5[c4] && (l5[c4] = a4[c4]);
    return l.vnode && l.vnode(p5), p5;
  }

  // src/web/components/icon/index.tsx
  var Icon = A3(({
    size = 15,
    name,
    fill = "currentColor",
    stroke = "currentColor",
    className,
    externalURL = "",
    style
  }, ref) => {
    const width = Array.isArray(size) ? size[0] : size;
    const height = Array.isArray(size) ? size[1] || size[0] : size;
    const path = `${externalURL}#${name}`;
    return /* @__PURE__ */ u4(
      "svg",
      {
        ref,
        width: `${width}px`,
        height: `${height}px`,
        fill,
        stroke,
        className,
        style: {
          ...style,
          minWidth: `${width}px`,
          maxWidth: `${width}px`,
          minHeight: `${height}px`,
          maxHeight: `${height}px`
        },
        children: [
          /* @__PURE__ */ u4("title", { children: name }),
          /* @__PURE__ */ u4("use", { href: path })
        ]
      }
    );
  });

  // src/web/components/sticky-section/index.tsx
  var StickySection = N2(({ children }) => {
    const refScrollableElement = A2(null);
    const refElement = A2(null);
    const refScrollAtTop = A2(false);
    const [isSticky, setIsSticky] = h2(false);
    const refRafId = A2(0);
    const calculateStickyTop = q2((removeSticky = false) => {
      const stickyElements = Array.from(
        refScrollableElement.current?.children || []
      );
      if (!stickyElements.length) return;
      let cumulativeHeight = 0;
      for (const element of stickyElements) {
        const sticky = element;
        if (sticky.dataset.sticky) {
          if (removeSticky) {
            sticky.style.removeProperty("top");
          } else {
            sticky.style.setProperty("top", `${cumulativeHeight}px`);
          }
          cumulativeHeight += sticky.offsetHeight;
        }
      }
    }, []);
    const refSticky = q2(
      (node) => {
        if (!node) {
          requestAnimationFrame(() => {
            calculateStickyTop();
          });
          return;
        }
        refElement.current = node;
        refScrollableElement.current = node.parentElement;
        node.dataset.sticky = "true";
        const handleClick = () => {
          if (!node.dataset.disableScroll) {
            refScrollableElement.current?.scrollTo({
              top: Number(node.style.top) ?? 0,
              behavior: "smooth"
            });
          }
        };
        node.onclick = handleClick;
        calculateStickyTop();
        const handleScroll = () => {
          cancelAnimationFrame(refRafId.current);
          refRafId.current = requestAnimationFrame(() => {
            if (!node || !refScrollableElement.current) return;
            const refRect = node.getBoundingClientRect();
            const containerRect = refScrollableElement.current.getBoundingClientRect();
            const stickyOffset = Number.parseInt(getComputedStyle(node).top);
            refScrollAtTop.current = refScrollableElement.current.scrollTop > 0;
            const stickyActive = refScrollAtTop.current && refRect.top <= containerRect.top + stickyOffset;
            if (stickyActive !== isSticky) {
              setIsSticky(stickyActive);
            }
            calculateStickyTop();
          });
        };
        refScrollableElement.current?.addEventListener("scroll", handleScroll, {
          passive: true
        });
      },
      [isSticky, calculateStickyTop]
    );
    return children({
      refSticky,
      isSticky,
      calculateStickyTop
    });
  });

  // src/web/components/inspector/flash-overlay.ts
  var fadeOutTimers = /* @__PURE__ */ new WeakMap();
  var trackElementPosition = (element, callback) => {
    const handleScroll = callback.bind(null, element);
    document.addEventListener("scroll", handleScroll, {
      passive: true,
      capture: true
    });
    return () => {
      document.removeEventListener("scroll", handleScroll, { capture: true });
    };
  };
  var flashManager = {
    activeFlashes: /* @__PURE__ */ new Map(),
    create(container) {
      const existingOverlay = container.querySelector(
        ".react-scan-flash-overlay"
      );
      const overlay = existingOverlay instanceof HTMLElement ? existingOverlay : (() => {
        const newOverlay = document.createElement("div");
        newOverlay.className = "react-scan-flash-overlay";
        container.appendChild(newOverlay);
        const scrollCleanup = trackElementPosition(container, () => {
          if (container.querySelector(".react-scan-flash-overlay")) {
            this.create(container);
          }
        });
        this.activeFlashes.set(container, {
          element: container,
          overlay: newOverlay,
          scrollCleanup
        });
        return newOverlay;
      })();
      const existingTimer = fadeOutTimers.get(overlay);
      if (existingTimer) {
        clearTimeout(existingTimer);
        fadeOutTimers.delete(overlay);
      }
      requestAnimationFrame(() => {
        overlay.style.transition = "none";
        overlay.style.opacity = "0.9";
        const timerId = setTimeout(() => {
          overlay.style.transition = "opacity 150ms ease-out";
          overlay.style.opacity = "0";
          const cleanupTimer = setTimeout(() => {
            if (overlay.parentNode) {
              overlay.parentNode.removeChild(overlay);
            }
            const entry = this.activeFlashes.get(container);
            if (entry?.scrollCleanup) {
              entry.scrollCleanup();
            }
            this.activeFlashes.delete(container);
            fadeOutTimers.delete(overlay);
          }, 150);
          fadeOutTimers.set(overlay, cleanupTimer);
        }, 300);
        fadeOutTimers.set(overlay, timerId);
      });
    },
    cleanup(container) {
      const entry = this.activeFlashes.get(container);
      if (entry) {
        const existingTimer = fadeOutTimers.get(entry.overlay);
        if (existingTimer) {
          clearTimeout(existingTimer);
          fadeOutTimers.delete(entry.overlay);
        }
        if (entry.overlay.parentNode) {
          entry.overlay.parentNode.removeChild(entry.overlay);
        }
        if (entry.scrollCleanup) {
          entry.scrollCleanup();
        }
        this.activeFlashes.delete(container);
      }
    },
    cleanupAll() {
      for (const [, entry] of this.activeFlashes) {
        this.cleanup(entry.element);
      }
    }
  };

  // src/web/components/copy-to-clipboard/index.tsx
  var CopyToClipboard = N2(
    ({
      text,
      children,
      onCopy,
      className,
      iconSize = 14
    }) => {
      const refTimeout = A2();
      const [isCopied, setIsCopied] = h2(false);
      y2(() => {
        if (isCopied) {
          refTimeout.current = setTimeout(() => setIsCopied(false), 600);
          return () => {
            clearTimeout(refTimeout.current);
          };
        }
      }, [isCopied]);
      const copyToClipboard = q2(
        (e4) => {
          e4.preventDefault();
          e4.stopPropagation();
          navigator.clipboard.writeText(text).then(
            () => {
              setIsCopied(true);
              onCopy?.(true, text);
            },
            () => {
              onCopy?.(false, text);
            }
          );
        },
        [text, onCopy]
      );
      const ClipboardIcon = /* @__PURE__ */ u4(
        "button",
        {
          onClick: copyToClipboard,
          type: "button",
          className: cn(
            "z-10",
            "flex items-center justify-center",
            "hover:text-dev-pink-400",
            "transition-colors duration-200 ease-in-out",
            "cursor-pointer",
            `size-[${iconSize}px]`,
            className
          ),
          children: /* @__PURE__ */ u4(
            Icon,
            {
              name: `icon-${isCopied ? "check" : "copy"}`,
              size: [iconSize],
              className: cn({
                "text-green-500": isCopied
              })
            }
          )
        }
      );
      if (!children) {
        return ClipboardIcon;
      }
      return children({
        ClipboardIcon,
        onClick: copyToClipboard
      });
    }
  );

  // src/web/hooks/use-merged-refs.ts
  var assignRef = (ref, value) => {
    if (typeof ref === "function") {
      ref(value);
    } else if (ref !== null) {
      ref.current = value;
    }
  };
  var mergeRefs = (...refs) => {
    return (node) => {
      for (const ref of refs) {
        if (ref) {
          assignRef(ref, node);
        }
      }
    };
  };
  var useMergedRefs = (...refs) => {
    return q2(mergeRefs(...refs), [...refs]);
  };

  // src/web/components/inspector/states.ts
  var TIMELINE_MAX_UPDATES = 1e3;
  var timelineStateDefault = {
    updates: [],
    currentFiber: null,
    totalUpdates: 0,
    windowOffset: 0,
    currentIndex: 0,
    isViewingHistory: false,
    latestFiber: null,
    isVisible: false,
    playbackSpeed: 1
  };
  var timelineState = d3(timelineStateDefault);
  var inspectorUpdateSignal = d3(0);
  var pendingUpdates = [];
  var batchTimeout = null;
  var batchUpdates = () => {
    if (pendingUpdates.length === 0) return;
    const batchedUpdates = [...pendingUpdates];
    const { updates, totalUpdates, currentIndex, isViewingHistory } = timelineState.value;
    const newUpdates = [...updates];
    let newTotalUpdates = totalUpdates;
    for (const { update } of batchedUpdates) {
      if (newUpdates.length >= TIMELINE_MAX_UPDATES) {
        newUpdates.shift();
      }
      newUpdates.push(update);
      newTotalUpdates++;
    }
    const newWindowOffset = Math.max(0, newTotalUpdates - TIMELINE_MAX_UPDATES);
    let newCurrentIndex;
    if (isViewingHistory) {
      if (currentIndex === totalUpdates - 1) {
        newCurrentIndex = newUpdates.length - 1;
      } else if (currentIndex === 0) {
        newCurrentIndex = 0;
      } else {
        if (newWindowOffset === 0) {
          newCurrentIndex = currentIndex;
        } else {
          newCurrentIndex = currentIndex - 1;
        }
      }
    } else {
      newCurrentIndex = newUpdates.length - 1;
    }
    const lastUpdate = batchedUpdates[batchedUpdates.length - 1];
    timelineState.value = {
      ...timelineState.value,
      latestFiber: lastUpdate.fiber,
      updates: newUpdates,
      totalUpdates: newTotalUpdates,
      windowOffset: newWindowOffset,
      currentIndex: newCurrentIndex,
      isViewingHistory
    };
    pendingUpdates = pendingUpdates.slice(batchedUpdates.length);
  };
  var timelineActions = {
    showTimeline: () => {
      timelineState.value = {
        ...timelineState.value,
        isVisible: true
      };
    },
    hideTimeline: () => {
      timelineState.value = {
        ...timelineState.value,
        isVisible: false,
        currentIndex: timelineState.value.updates.length - 1
      };
    },
    updateFrame: (index, isViewingHistory) => {
      timelineState.value = {
        ...timelineState.value,
        currentIndex: index,
        isViewingHistory
      };
    },
    updatePlaybackSpeed: (speed) => {
      timelineState.value = {
        ...timelineState.value,
        playbackSpeed: speed
      };
    },
    addUpdate: (update, latestFiber) => {
      pendingUpdates.push({ update, fiber: latestFiber });
      if (!batchTimeout) {
        const processBatch = () => {
          batchUpdates();
          batchTimeout = null;
          if (pendingUpdates.length > 0) {
            batchTimeout = setTimeout(processBatch, 96);
          }
        };
        batchTimeout = setTimeout(processBatch, 96);
      }
    },
    reset: () => {
      if (batchTimeout) {
        clearTimeout(batchTimeout);
        batchTimeout = null;
      }
      pendingUpdates = [];
      timelineState.value = timelineStateDefault;
    }
  };

  // src/web/components/inspector/properties.tsx
  var EditableValue = ({
    value,
    onSave,
    onCancel
  }) => {
    const refInput = A2(null);
    const [editValue, setEditValue] = h2("");
    y2(() => {
      let initialValue = "";
      try {
        if (value instanceof Date) {
          initialValue = value.toISOString().slice(0, 16);
        } else if (value instanceof Map || value instanceof Set || value instanceof RegExp || value instanceof Error || value instanceof ArrayBuffer || ArrayBuffer.isView(value) || typeof value === "object" && value !== null) {
          initialValue = formatValue(value);
        } else {
          initialValue = formatInitialValue(value);
        }
      } catch {
        initialValue = String(value);
      }
      const sanitizedValue = sanitizeString(initialValue);
      setEditValue(sanitizedValue);
      requestAnimationFrame(() => {
        if (!refInput.current) return;
        refInput.current.focus();
        if (typeof value === "string") {
          refInput.current.setSelectionRange(1, sanitizedValue.length - 1);
        } else {
          refInput.current.select();
        }
      });
    }, [value]);
    const handleChange = q2((e4) => {
      const target = e4.target;
      if (target) {
        setEditValue(target.value);
      }
    }, []);
    const handleKeyDown = (e4) => {
      if (e4.key === "Enter") {
        e4.preventDefault();
        try {
          let newValue;
          if (value instanceof Date) {
            const date = new Date(editValue);
            if (Number.isNaN(date.getTime())) {
              throw new Error("Invalid date");
            }
            newValue = date;
          } else {
            const detected = detectValueType(editValue);
            newValue = detected.value;
          }
          onSave(newValue);
        } catch {
          onCancel();
        }
      } else if (e4.key === "Escape") {
        e4.preventDefault();
        e4.stopPropagation();
        e4.stopImmediatePropagation();
        onCancel();
      }
    };
    return /* @__PURE__ */ u4(
      "input",
      {
        ref: refInput,
        type: value instanceof Date ? "datetime-local" : "text",
        className: "react-scan-input flex-1",
        value: editValue,
        onChange: handleChange,
        onKeyDown: handleKeyDown,
        onBlur: onCancel,
        step: value instanceof Date ? 1 : void 0
      }
    );
  };
  var PropertyElement = ({
    name,
    value,
    section,
    level,
    parentPath,
    objectPathMap = /* @__PURE__ */ new WeakMap(),
    changedKeys = /* @__PURE__ */ new Set(),
    allowEditing = true
  }) => {
    const { updates, currentIndex } = timelineState.value;
    const currentUpdate = updates[currentIndex];
    const fiberInfo = currentUpdate?.fiberInfo;
    const refElement = A2(null);
    const currentPath = getPath(
      fiberInfo.displayName,
      section,
      parentPath ?? "",
      name
    );
    const [isExpanded, setIsExpanded] = h2(
      globalInspectorState.expandedPaths.has(currentPath)
    );
    const [isEditing, setIsEditing] = h2(false);
    const prevValue = globalInspectorState.lastRendered.get(currentPath);
    const isChanged = !isEqual(prevValue, value);
    y2(() => {
      if (name === "children") {
        return;
      }
      if (section === "context") {
        return;
      }
      const isFirstRender = !globalInspectorState.lastRendered.has(currentPath);
      const shouldFlash = isChanged && refElement.current && !isFirstRender;
      globalInspectorState.lastRendered.set(currentPath, value);
      if (shouldFlash && refElement.current && level === 0) {
        flashManager.create(refElement.current);
      }
    }, [value, isChanged, currentPath, level, name, section]);
    const handleToggleExpand = q2(() => {
      setIsExpanded((prevState) => {
        const newIsExpanded = !prevState;
        if (newIsExpanded) {
          globalInspectorState.expandedPaths.add(currentPath);
        } else {
          globalInspectorState.expandedPaths.delete(currentPath);
        }
        return newIsExpanded;
      });
    }, [currentPath]);
    const valuePreview = T2(() => {
      if (typeof value === "object" && value !== null) {
        if ("displayValue" in value) {
          return String(value.displayValue);
        }
      }
      return formatValue(value);
    }, [value]);
    const clipboardText = T2(() => {
      if (typeof value === "object" && value !== null) {
        if ("value" in value) {
          return String(formatForClipboard(value.value));
        }
        if ("displayValue" in value) {
          return String(value.displayValue);
        }
      }
      return String(formatForClipboard(value));
    }, [value]);
    const isExpandableValue = T2(() => {
      if (!value || typeof value !== "object") return false;
      if ("type" in value) {
        const metadata2 = value;
        switch (metadata2.type) {
          case "array":
          case "Map":
          case "Set":
            return (metadata2.size ?? metadata2.length ?? 0) > 0;
          case "object":
            return (metadata2.size ?? 0) > 0;
          case "ArrayBuffer":
          case "DataView":
            return (metadata2.byteLength ?? 0) > 0;
          case "circular":
          case "promise":
          case "function":
          case "error":
            return false;
          default:
            if ("entries" in metadata2 || "items" in metadata2) {
              return true;
            }
            return false;
        }
      }
      return isExpandable(value);
    }, [value]);
    const { overrideProps, overrideHookState } = getOverrideMethods();
    const canEdit = T2(() => {
      if (!allowEditing) return false;
      if (section === "props") return !!overrideProps && name !== "children";
      if (section === "state") return !!overrideHookState;
      return false;
    }, [section, overrideProps, overrideHookState, allowEditing, name]);
    const handleEdit = q2(() => {
      if (canEdit) {
        setIsEditing(true);
      }
    }, [canEdit]);
    const handleSave = (section2, name2, value2) => {
      const { updates: updates2, currentIndex: currentIndex2, latestFiber } = timelineState.value;
      const currentUpdate2 = updates2[currentIndex2];
      if (!latestFiber) return;
      const { overrideProps: overrideProps2, overrideHookState: overrideHookState2 } = getOverrideMethods();
      if (!overrideProps2 || !overrideHookState2) return;
      if (section2 === "props") {
        tryOrElse(() => {
          const currentProps = latestFiber.memoizedProps || {};
          let currentValue;
          let path;
          if (parentPath) {
            const parts = parentPath.split(".");
            path = parts.filter(
              (part) => part !== "props" && part !== getDisplayName(latestFiber.type)
            );
            path.push(name2);
            currentValue = path.reduce(
              (obj, key) => obj && typeof obj === "object" ? obj[key] : {},
              currentProps
            );
          } else {
            path = [name2];
            currentValue = currentProps[name2];
          }
          if (!isEqual(currentValue, value2)) {
            overrideProps2(latestFiber, path, value2);
            if (latestFiber.alternate) {
              overrideProps2(latestFiber.alternate, path, value2);
            }
          }
        }, null);
      } else if (section2 === "state") {
        tryOrElse(() => {
          if (!parentPath) {
            const stateNames = currentUpdate2.stateNames;
            const namedStateIndex = stateNames.indexOf(name2);
            const hookId = namedStateIndex !== -1 ? namedStateIndex.toString() : name2;
            overrideHookState2(latestFiber, hookId, [], value2);
          } else {
            const fullPathParts = parentPath.split(".");
            const stateIndex = fullPathParts.indexOf("state");
            if (stateIndex === -1) return;
            const statePath = fullPathParts.slice(stateIndex + 1);
            const baseStateKey = statePath[0];
            const stateNames = currentUpdate2.stateNames;
            const namedStateIndex = stateNames.indexOf(baseStateKey);
            const hookId = namedStateIndex !== -1 ? namedStateIndex.toString() : "0";
            const currentState = currentUpdate2.state.current;
            if (!currentState || !currentState.find((item) => item.name === Number(baseStateKey))) {
              return;
            }
            const updatedState = updateNestedValue(
              currentState.find((item) => item.name === Number(baseStateKey))?.value,
              statePath.slice(1).concat(name2),
              value2
            );
            overrideHookState2(latestFiber, hookId, [], updatedState);
          }
        }, null);
      }
      setIsEditing(false);
    };
    const checkCircularInValue = T2(() => {
      if (!value || typeof value !== "object" || isPromise(value)) return false;
      return "type" in value && value.type === "circular";
    }, [value]);
    const renderNestedProperties = q2(
      (obj) => {
        if (!obj || typeof obj !== "object") return null;
        if ("type" in obj) {
          const metadata2 = obj;
          if ("entries" in metadata2 && metadata2.entries) {
            const entries2 = Object.entries(metadata2.entries);
            if (entries2.length === 0) return null;
            return /* @__PURE__ */ u4("div", { className: "react-scan-nested", children: entries2.map(([key, val]) => /* @__PURE__ */ u4(
              PropertyElement,
              {
                name: key,
                value: val,
                section,
                level: level + 1,
                parentPath: currentPath,
                objectPathMap,
                changedKeys,
                allowEditing
              },
              `${currentPath}-entry-${key}`
            )) });
          }
          if ("items" in metadata2 && Array.isArray(metadata2.items)) {
            if (metadata2.items.length === 0) return null;
            return /* @__PURE__ */ u4("div", { className: "react-scan-nested", children: metadata2.items.map((item, i5) => {
              const itemKey = `${currentPath}-item-${item.type}-${i5}`;
              return /* @__PURE__ */ u4(
                PropertyElement,
                {
                  name: `${i5}`,
                  value: item,
                  section,
                  level: level + 1,
                  parentPath: currentPath,
                  objectPathMap,
                  changedKeys,
                  allowEditing
                },
                itemKey
              );
            }) });
          }
          return null;
        }
        let entries;
        if (obj instanceof ArrayBuffer) {
          const view = new Uint8Array(obj);
          entries = Array.from(view).map((v5, i5) => [i5, v5]);
        } else if (obj instanceof DataView) {
          const view = new Uint8Array(obj.buffer, obj.byteOffset, obj.byteLength);
          entries = Array.from(view).map((v5, i5) => [i5, v5]);
        } else if (ArrayBuffer.isView(obj)) {
          if (obj instanceof BigInt64Array || obj instanceof BigUint64Array) {
            entries = Array.from({ length: obj.length }, (_5, i5) => [i5, obj[i5]]);
          } else {
            const typedArray = obj;
            entries = Array.from(typedArray).map((v5, i5) => [i5, v5]);
          }
        } else if (obj instanceof Map) {
          entries = Array.from(obj.entries()).map(([k3, v5]) => [String(k3), v5]);
        } else if (obj instanceof Set) {
          entries = Array.from(obj).map((v5, i5) => [i5, v5]);
        } else if (Array.isArray(obj)) {
          entries = obj.map((value2, index) => [`${index}`, value2]);
        } else {
          entries = Object.entries(obj);
        }
        if (entries.length === 0) return null;
        const canEditChildren = !(obj instanceof DataView || obj instanceof ArrayBuffer || ArrayBuffer.isView(obj));
        return /* @__PURE__ */ u4("div", { className: "react-scan-nested", children: entries.map(([key, val]) => {
          const itemKey = `${currentPath}-${typeof key === "number" ? `item-${key}` : key}`;
          return /* @__PURE__ */ u4(
            PropertyElement,
            {
              name: String(key),
              value: val,
              section,
              level: level + 1,
              parentPath: currentPath,
              objectPathMap,
              changedKeys,
              allowEditing: canEditChildren
            },
            itemKey
          );
        }) });
      },
      [section, level, currentPath, objectPathMap, changedKeys, allowEditing]
    );
    if (checkCircularInValue) {
      return /* @__PURE__ */ u4("div", { className: "react-scan-property", children: /* @__PURE__ */ u4("div", { className: "react-scan-property-content", children: /* @__PURE__ */ u4("div", { className: "react-scan-preview-line", children: [
        /* @__PURE__ */ u4("div", { className: "react-scan-key", children: [
          name,
          ":"
        ] }),
        /* @__PURE__ */ u4("span", { className: "text-yellow-500", children: "[Circular Reference]" })
      ] }) }) });
    }
    return /* @__PURE__ */ u4("div", { ref: refElement, className: "react-scan-property", children: /* @__PURE__ */ u4("div", { className: "react-scan-property-content", children: [
      isExpandableValue && /* @__PURE__ */ u4(
        "button",
        {
          type: "button",
          onClick: handleToggleExpand,
          className: "react-scan-arrow",
          children: /* @__PURE__ */ u4(
            Icon,
            {
              name: "icon-chevron-right",
              size: 12,
              className: cn({
                "rotate-90": isExpanded
              })
            }
          )
        }
      ),
      /* @__PURE__ */ u4(
        "div",
        {
          className: cn("group", "react-scan-preview-line", {
            "react-scan-highlight": isChanged
          }),
          children: [
            /* @__PURE__ */ u4("div", { className: "react-scan-key", children: [
              name,
              ":"
            ] }),
            isEditing && isEditableValue(value, parentPath) ? /* @__PURE__ */ u4(
              EditableValue,
              {
                value,
                onSave: (newValue) => handleSave(section, name, newValue),
                onCancel: () => setIsEditing(false)
              }
            ) : /* @__PURE__ */ u4("button", { type: "button", className: "truncate", onClick: handleEdit, children: valuePreview }),
            /* @__PURE__ */ u4(
              CopyToClipboard,
              {
                text: clipboardText,
                className: "opacity-0 transition-opacity group-hover:opacity-100",
                children: ({ ClipboardIcon }) => /* @__PURE__ */ u4(k, { children: ClipboardIcon })
              }
            )
          ]
        }
      ),
      /* @__PURE__ */ u4(
        "div",
        {
          className: cn("react-scan-expandable", {
            "react-scan-expanded": isExpanded
          }),
          children: isExpandableValue && isExpanded && /* @__PURE__ */ u4("div", { className: "react-scan-nested", children: renderNestedProperties(value) })
        }
      )
    ] }) });
  };
  var PropertySection = ({
    refSticky,
    isSticky,
    section
  }) => {
    const refStickyElement = A2(null);
    const refSection = A2(null);
    const { updates, currentIndex } = timelineState.value;
    const [isExpanded, setIsExpanded] = h2(true);
    const refs = useMergedRefs(refStickyElement, refSticky);
    const pathMap = T2(() => /* @__PURE__ */ new WeakMap(), []);
    const { currentData, changedKeys } = T2(() => {
      const data = updates[currentIndex] ?? {
        props: { current: {}, changes: /* @__PURE__ */ new Set() },
        state: { current: {}, changes: /* @__PURE__ */ new Set() },
        context: { current: {}, changes: /* @__PURE__ */ new Set() }
      };
      switch (section) {
        case "props":
          return {
            currentData: data.props.current,
            changedKeys: data.props.changes
          };
        case "state":
          return {
            currentData: data.state.current,
            changedKeys: data.state.changes
          };
        case "context":
          return {
            currentData: data.context.current,
            changedKeys: data.context.changes
          };
        default:
          return {
            currentData: {},
            changedKeys: /* @__PURE__ */ new Set()
          };
      }
    }, [section, currentIndex, updates]);
    const toggleExpanded = q2(() => {
      setIsExpanded((state) => {
        if (isSticky && isExpanded) {
          return state;
        }
        return !state;
      });
    }, [isExpanded, isSticky]);
    if (!currentData || (Array.isArray(currentData) ? currentData.length === 0 : Object.keys(currentData).length === 0)) {
      return null;
    }
    const propertyCount = Array.isArray(currentData) ? currentData.length : Object.keys(currentData).length;
    return /* @__PURE__ */ u4(k, { children: [
      /* @__PURE__ */ u4(
        "button",
        {
          ref: refs,
          type: "button",
          onClick: toggleExpanded,
          "data-sticky": true,
          className: "react-section-header",
          children: [
            /* @__PURE__ */ u4("div", { className: "w-4 h-4 flex items-center justify-center", children: /* @__PURE__ */ u4(
              Icon,
              {
                name: "icon-chevron-right",
                size: 12,
                className: cn(
                  {
                    "rotate-90": isExpanded,
                    "rotate-0": isSticky && isExpanded
                  }
                )
              }
            ) }),
            /* @__PURE__ */ u4("span", { className: "capitalize", children: [
              section,
              " ",
              !isExpanded && propertyCount > 0 && `(${propertyCount})`
            ] })
          ]
        }
      ),
      /* @__PURE__ */ u4("div", { ref: refSection, className: "react-scan-section", children: /* @__PURE__ */ u4(
        "div",
        {
          className: cn(
            "react-scan-expandable",
            {
              "react-scan-expanded py-0.5": isExpanded
            }
          ),
          children: /* @__PURE__ */ u4("div", { className: "overflow-hidden", children: Array.isArray(currentData) ? currentData.map(({ name, value }) => /* @__PURE__ */ u4(
            PropertyElement,
            {
              name,
              value,
              section,
              level: 0,
              objectPathMap: pathMap,
              changedKeys
            },
            name
          )) : Object.entries(currentData).map(([key, value]) => /* @__PURE__ */ u4(
            PropertyElement,
            {
              name: key,
              value,
              section,
              level: 0,
              objectPathMap: pathMap,
              changedKeys
            },
            key
          )) })
        }
      ) })
    ] });
  };

  // src/web/components/inspector/diff-value.tsx
  var DiffValueView = ({
    value,
    expanded,
    onToggle,
    isNegative
  }) => {
    const { value: safeValue, error } = safeGetValue(value);
    const pathPrefix = T2(() => Math.random().toString(36).slice(2), []);
    const [expandedPaths, setExpandedPaths] = h2(/* @__PURE__ */ new Set());
    if (error) {
      return /* @__PURE__ */ u4("span", { className: "text-gray-500 font-italic", children: error });
    }
    const isExpandable2 = safeValue !== null && typeof safeValue === "object" && !(safeValue instanceof Promise);
    const renderExpandedValue = (obj, path = "") => {
      if (obj === null || typeof obj !== "object") {
        return /* @__PURE__ */ u4("span", { children: formatValuePreview(obj) });
      }
      const entries = Object.entries(obj);
      const seenObjects = /* @__PURE__ */ new WeakSet();
      return /* @__PURE__ */ u4("div", { children: entries.map(([key, val], i5) => {
        const currentPath = path ? `${path}.${key}` : key;
        const fullPath = `${pathPrefix}.${currentPath}`;
        const isExpanded = expandedPaths.has(fullPath);
        const canExpand = val !== null && typeof val === "object";
        let isCircular = false;
        if (canExpand) {
          if (seenObjects.has(val)) {
            isCircular = true;
          } else {
            seenObjects.add(val);
          }
        }
        return /* @__PURE__ */ u4(
          "div",
          {
            className: cn({ "mt-1": i5 > 0 }),
            children: [
              /* @__PURE__ */ u4("div", { className: "flex items-center gap-1", children: [
                canExpand && !isCircular && /* @__PURE__ */ u4(
                  "button",
                  {
                    type: "button",
                    onClick: () => {
                      setExpandedPaths((prev) => {
                        const next = new Set(prev);
                        if (next.has(fullPath)) {
                          next.delete(fullPath);
                        } else {
                          next.add(fullPath);
                        }
                        return next;
                      });
                    },
                    className: cn(
                      "flex items-center",
                      "p-0 mr-1",
                      "opacity-50"
                    ),
                    children: /* @__PURE__ */ u4(
                      Icon,
                      {
                        name: "icon-chevron-right",
                        size: 12,
                        className: cn(
                          "transition-[transform,color]",
                          "text-[#4ade80]",
                          {
                            "transform rotate-90": isExpanded,
                            "text-[#f87171]": isNegative
                          }
                        )
                      }
                    )
                  }
                ),
                /* @__PURE__ */ u4("span", { className: "text-gray-500", children: [
                  key,
                  ":"
                ] }),
                isCircular ? /* @__PURE__ */ u4("span", { className: "text-gray-500 font-italic", children: "[Circular]" }) : !canExpand || !isExpanded ? /* @__PURE__ */ u4("span", { children: formatValuePreview(val) }) : null
              ] }),
              canExpand && isExpanded && !isCircular && renderExpandedValue(val, currentPath)
            ]
          },
          key
        );
      }) });
    };
    return /* @__PURE__ */ u4("div", { className: "flex items-start gap-1", children: [
      isExpandable2 && /* @__PURE__ */ u4(
        "button",
        {
          type: "button",
          onClick: onToggle,
          className: cn(
            "flex items-center",
            "p-0 mt-0.5 mr-1",
            "opacity-50"
          ),
          children: /* @__PURE__ */ u4(
            Icon,
            {
              name: "icon-chevron-right",
              size: 12,
              className: cn(
                "transition-[transform,color]",
                "text-[#4ade80]",
                {
                  "transform rotate-90": expanded,
                  "text-[#f87171]": isNegative
                }
              )
            }
          )
        }
      ),
      /* @__PURE__ */ u4("div", { className: "flex-1", children: !expanded ? /* @__PURE__ */ u4("span", { children: formatValuePreview(safeValue) }) : renderExpandedValue(safeValue) }),
      /* @__PURE__ */ u4(
        CopyToClipboard,
        {
          text: formatForClipboard(safeValue),
          className: "opacity-0 transition-opacity group-hover:opacity-100",
          children: ({ ClipboardIcon }) => /* @__PURE__ */ u4(k, { children: ClipboardIcon })
        }
      )
    ] });
  };

  // src/web/components/slider/index.tsx
  var Slider = ({
    value,
    min,
    max,
    onChange,
    className,
    totalUpdates = max + 1
  }) => {
    const refThumb = A2(null);
    const refLastValue = A2(value);
    const updateThumbPosition = q2((value2) => {
      if (!refThumb.current) return;
      const range = Math.max(1, max - min);
      const valueOffset = value2 - min;
      const percentage = min === max ? 0 : Math.min(100, Math.round(valueOffset / range * 100));
      refThumb.current.style.setProperty("left", `${percentage}%`);
    }, [min, max]);
    y2(() => {
      updateThumbPosition(value);
    }, [min, max, value]);
    const handleChange = q2((e4) => {
      const target = e4.target;
      const newValue = Number.parseInt(target.value, 10);
      if (newValue >= totalUpdates) {
        return;
      }
      if (refLastValue.current !== newValue) {
        refLastValue.current = newValue;
        updateThumbPosition(newValue);
        onChange(e4);
      }
    }, [onChange, updateThumbPosition, totalUpdates]);
    return /* @__PURE__ */ u4(
      "div",
      {
        onMouseDown: (e4) => {
          e4.stopPropagation();
        },
        className: cn(
          "react-scan-slider relative",
          "flex-1",
          className
        ),
        children: [
          /* @__PURE__ */ u4(
            "input",
            {
              type: "range",
              value,
              min,
              max,
              onChange: handleChange,
              className: cn(
                "react-scan-slider",
                "flex-1",
                "h-1.5",
                "bg-gray-200",
                "rounded-lg",
                "appearance-none",
                "cursor-pointer",
                className
              )
            }
          ),
          /* @__PURE__ */ u4(
            "div",
            {
              className: cn(
                "absolute inset-0 right-2",
                "pointer-events-none"
              ),
              children: /* @__PURE__ */ u4("span", { ref: refThumb })
            }
          )
        ]
      }
    );
  };

  // src/web/components/inspector/timeline/index.tsx
  var Timeline = N2(({
    refSticky
  }) => {
    const refPlayInterval = A2(null);
    const refChangeInterval = A2(null);
    const {
      currentIndex,
      isVisible,
      totalUpdates,
      updates
    } = timelineState.value;
    const sliderValues = T2(() => {
      return calculateSliderValues(totalUpdates, currentIndex);
    }, [totalUpdates, currentIndex]);
    const handleSliderChange = async (e4) => {
      const target = e4.target;
      const value = Number.parseInt(target.value, 10);
      const newIndex = Math.min(updates.length - 1, Math.max(0, value));
      let isViewingHistory = false;
      if (newIndex > 0 && newIndex < updates.length - 1) {
        isViewingHistory = true;
      }
      timelineActions.updateFrame(newIndex, isViewingHistory);
    };
    y2(() => {
      return () => {
        if (refPlayInterval.current) {
          clearInterval(refPlayInterval.current);
        }
        if (refChangeInterval.current) {
          cancelAnimationFrame(refChangeInterval.current);
        }
      };
    }, []);
    const handleShowTimeline = q2(() => {
      if (!isVisible) {
        timelineActions.showTimeline();
      }
    }, [isVisible]);
    const handleHideTimeline = q2((e4) => {
      e4.preventDefault();
      e4.stopPropagation();
      if (refPlayInterval.current) {
        clearInterval(refPlayInterval.current);
        refPlayInterval.current = null;
      }
      timelineActions.hideTimeline();
    }, []);
    if (!isInstrumentationActive()) {
      return null;
    }
    if (totalUpdates <= 1) {
      return null;
    }
    return /* @__PURE__ */ u4(
      "button",
      {
        ref: refSticky,
        type: "button",
        onClick: handleShowTimeline,
        className: "react-section-header",
        "data-disable-scroll": "true",
        children: [
          /* @__PURE__ */ u4(
            "button",
            {
              type: "button",
              onClick: isVisible ? handleHideTimeline : void 0,
              title: isVisible ? "Hide Re-renders History" : "View Re-renders History",
              className: "w-4 h-4 flex items-center justify-center",
              children: /* @__PURE__ */ u4(Icon, { name: "icon-gallery-horizontal-end", size: 12 })
            }
          ),
          isVisible ? /* @__PURE__ */ u4(k, { children: [
            /* @__PURE__ */ u4("div", { className: "text-xs text-gray-500", children: sliderValues.leftValue }),
            /* @__PURE__ */ u4(
              Slider,
              {
                min: sliderValues.min,
                max: sliderValues.max,
                value: sliderValues.value,
                onChange: handleSliderChange,
                className: "flex-1",
                totalUpdates: sliderValues.rightValue + 1
              }
            ),
            /* @__PURE__ */ u4("div", { className: "text-xs text-gray-500", children: sliderValues.rightValue })
          ] }) : "View Re-renders History"
        ]
      }
    );
  });

  // src/web/components/inspector/what-changed.tsx
  var safeGetValue2 = (value) => {
    if (value === null || value === void 0) return { value };
    if (typeof value === "function") return { value };
    if (typeof value !== "object") return { value };
    if (isPromise(value)) {
      return { value: "Promise" };
    }
    try {
      const proto = Object.getPrototypeOf(value);
      if (proto === Promise.prototype || proto?.constructor?.name === "Promise") {
        return { value: "Promise" };
      }
      return { value };
    } catch {
      return { value: null, error: "Error accessing value" };
    }
  };
  var WhatChangedSection = N2(() => {
    const refShowTimeline = A2(false);
    const [shouldShowChanges, setShouldShowChanges] = h2(true);
    y2(() => {
      const rafId = 0;
      const unsubscribe = timelineState.subscribe(async (state) => {
        cancelAnimationFrame(rafId);
        const { currentIndex, updates } = state;
        if (currentIndex === 0) {
          setShouldShowChanges(false);
          return;
        }
        if (updates.length > 0) {
          if (!refShowTimeline.current) {
            refShowTimeline.current = true;
          }
          setShouldShowChanges(true);
        }
      });
      return () => {
        unsubscribe();
        cancelAnimationFrame(rafId);
      };
    }, []);
    return /* @__PURE__ */ u4(k, { children: [
      refShowTimeline.current && /* @__PURE__ */ u4(StickySection, { children: (props) => /* @__PURE__ */ u4(Timeline, { ...props }) }),
      /* @__PURE__ */ u4(StickySection, { children: (props) => /* @__PURE__ */ u4(
        WhatChanged,
        {
          ...props,
          shouldShowChanges
        }
      ) })
    ] });
  });
  var WhatChanged = N2(({
    isSticky,
    refSticky,
    calculateStickyTop,
    shouldShowChanges
  }) => {
    const [isExpanded, setIsExpanded] = h2(true);
    return /* @__PURE__ */ u4(k, { children: [
      /* @__PURE__ */ u4(
        WhatsChangedHeader,
        {
          refSticky,
          isSticky,
          calculateStickyTop,
          isExpanded,
          shouldShowChanges,
          setIsExpanded
        }
      ),
      /* @__PURE__ */ u4(
        "div",
        {
          className: cn("react-scan-expandable", {
            "react-scan-expanded": isExpanded
          }),
          children: /* @__PURE__ */ u4("div", { className: "overflow-hidden", children: shouldShowChanges && /* @__PURE__ */ u4(
            "div",
            {
              className: cn(
                "relative",
                "flex flex-col gap-y-2",
                "pl-9 pr-2",
                'before:content-[""] before:absolute before:inset-x-0 before:bottom-0 before:h-[1px] before:bg-[#333]'
              ),
              children: [
                /* @__PURE__ */ u4(Section, { title: "Props", isExpanded }),
                /* @__PURE__ */ u4(Section, { title: "State", isExpanded }),
                /* @__PURE__ */ u4(Section, { title: "Context", isExpanded })
              ]
            }
          ) })
        }
      )
    ] });
  });
  var renderStateName = (key, componentName) => {
    if (Number.isNaN(Number(key))) {
      return key;
    }
    const n3 = Number.parseInt(key);
    const getOrdinalSuffix = (num) => {
      const lastDigit = num % 10;
      const lastTwoDigits = num % 100;
      if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
        return "th";
      }
      switch (lastDigit) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };
    return /* @__PURE__ */ u4("span", { children: [
      n3,
      getOrdinalSuffix(n3),
      " hook",
      " ",
      /* @__PURE__ */ u4("span", { style: { color: "#666" }, children: [
        "called in",
        " ",
        /* @__PURE__ */ u4("i", { className: "text-[#A855F7] truncate", children: componentName })
      ] })
    ] });
  };
  var WhatsChangedHeader = N2(
    ({
      refSticky,
      isSticky,
      calculateStickyTop,
      isExpanded,
      shouldShowChanges,
      setIsExpanded
    }) => {
      const refProps = A2(null);
      const refState = A2(null);
      const refContext = A2(null);
      const refStats = A2({
        isPropsChanged: false,
        isStateChanged: false,
        isContextChanged: false
      });
      y2(() => {
        const flash = throttle(() => {
          const flashElements = [];
          if (refProps.current?.dataset.flash === "true") {
            flashElements.push(refProps.current);
          }
          if (refState.current?.dataset.flash === "true") {
            flashElements.push(refState.current);
          }
          if (refContext.current?.dataset.flash === "true") {
            flashElements.push(refContext.current);
          }
          for (const element of flashElements) {
            element.classList.remove("count-flash-white");
            void element.offsetWidth;
            element.classList.add("count-flash-white");
          }
        }, 400);
        const unsubscribe = timelineState.subscribe((state) => {
          if (!refProps.current || !refState.current || !refContext.current) {
            return;
          }
          const { currentIndex, updates } = state;
          const currentUpdate = updates[currentIndex];
          if (!currentUpdate || currentIndex === 0) {
            return;
          }
          flash();
          refStats.current = {
            isPropsChanged: (currentUpdate.props?.changes?.size ?? 0) > 0,
            isStateChanged: (currentUpdate.state?.changes?.size ?? 0) > 0,
            isContextChanged: (currentUpdate.context?.changes?.size ?? 0) > 0
          };
          if (refProps.current.dataset.flash !== "true") {
            refProps.current.dataset.flash = refStats.current.isPropsChanged.toString();
          }
          if (refState.current.dataset.flash !== "true") {
            refState.current.dataset.flash = refStats.current.isStateChanged.toString();
          }
          if (refContext.current.dataset.flash !== "true") {
            refContext.current.dataset.flash = refStats.current.isContextChanged.toString();
          }
        });
        return unsubscribe;
      }, []);
      const toggleExpanded = q2(() => {
        setIsExpanded((state) => {
          if (isSticky && isExpanded) {
            return state;
          }
          return !state;
        });
      }, [setIsExpanded, isExpanded, isSticky]);
      const onTransitionStart = q2((e4) => {
        if (e4.propertyName === "max-height") {
          calculateStickyTop(true);
        }
      }, [calculateStickyTop]);
      const onTransitionEnd = q2((e4) => {
        if (e4.propertyName === "max-height") {
          calculateStickyTop(false);
        }
      }, [calculateStickyTop]);
      return /* @__PURE__ */ u4(
        "button",
        {
          ref: refSticky,
          type: "button",
          onClick: toggleExpanded,
          onTransitionStart,
          onTransitionEnd,
          className: cn(
            "react-section-header",
            "overflow-hidden",
            "max-h-0",
            "transition-[max-height]",
            {
              "max-h-8": shouldShowChanges
            }
          ),
          children: /* @__PURE__ */ u4(
            "div",
            {
              className: cn(
                "flex-1 react-scan-expandable",
                {
                  "react-scan-expanded": shouldShowChanges
                }
              ),
              children: /* @__PURE__ */ u4("div", { className: "overflow-hidden", children: /* @__PURE__ */ u4("div", { className: "flex items-center whitespace-nowrap", children: [
                /* @__PURE__ */ u4("div", { className: "flex items-center gap-x-2", children: [
                  /* @__PURE__ */ u4("div", { className: "w-4 h-4 flex items-center justify-center", children: /* @__PURE__ */ u4(
                    Icon,
                    {
                      name: "icon-chevron-right",
                      size: 12,
                      className: cn({
                        "rotate-90": isExpanded,
                        "rotate-0": isSticky && isExpanded
                      })
                    }
                  ) }),
                  "What changed?"
                ] }),
                /* @__PURE__ */ u4(
                  "div",
                  {
                    className: cn(
                      "ml-auto",
                      "change-scope",
                      "opacity-0",
                      "transition-opacity duration-300 delay-150",
                      {
                        "opacity-100": !isExpanded
                      }
                    ),
                    children: [
                      /* @__PURE__ */ u4("div", { ref: refProps, children: "props" }),
                      /* @__PURE__ */ u4("div", { ref: refState, children: "state" }),
                      /* @__PURE__ */ u4("div", { ref: refContext, children: "context" })
                    ]
                  }
                )
              ] }) })
            }
          )
        }
      );
    }
  );
  var Section = N2(({ title, isExpanded }) => {
    const refFiberInfo = A2(null);
    const refLastUpdated = A2(/* @__PURE__ */ new Set());
    const refChangesValues = A2(/* @__PURE__ */ new Map());
    const refLatestChanges = A2([]);
    const [changes, setChanges] = h2([]);
    const [expandedFns, setExpandedFns] = h2(/* @__PURE__ */ new Set());
    const [expandedEntries, setExpandedEntries] = h2(/* @__PURE__ */ new Set());
    y2(() => {
      const unsubscribe = timelineState.subscribe((state) => {
        const { currentIndex, updates } = state;
        const currentUpdate = currentIndex >= 0 ? updates[currentIndex] : null;
        const prevUpdate = currentIndex > 0 ? updates[currentIndex - 1] : null;
        const currentData = currentUpdate?.[title.toLowerCase()];
        const prevData = prevUpdate?.[title.toLowerCase()];
        if (!currentData) {
          return;
        }
        refFiberInfo.current = currentUpdate?.fiberInfo;
        refLastUpdated.current.clear();
        const changesMap = new Map(
          refLatestChanges.current.map((c4) => [c4.name, c4])
        );
        for (const { name, value } of currentData.current) {
          const currentCount = currentData.changesCounts?.get(name) ?? 0;
          const prevCount = prevData?.changesCounts?.get(name) ?? 0;
          const count = Math.max(currentCount, prevCount);
          const prevValue = prevData?.current.find(
            (p5) => p5.name === name
          )?.value;
          const hasValueChange = !isEqual(value, prevValue);
          if (count > 0 || hasValueChange) {
            const { value: safePrevValue, error: prevError } = safeGetValue2(prevValue);
            const { value: safeCurrValue, error: currError } = safeGetValue2(value);
            const diff = getObjectDiff(safePrevValue, safeCurrValue);
            refChangesValues.current.set(name, {
              name,
              prevValue,
              currValue: value,
              prevError,
              currError,
              diff,
              isFunction: typeof value === "function"
            });
            const change = { name, value, prevValue, count };
            const existingChange = changesMap.get(name);
            if (!existingChange || existingChange.count !== count || !isEqual(existingChange.value, value)) {
              refLastUpdated.current.add(name);
            }
            changesMap.set(name, change);
          }
        }
        refLatestChanges.current = Array.from(changesMap.values());
        setChanges(refLatestChanges.current);
      });
      return unsubscribe;
    }, [title]);
    const handleExpandEntry = q2((entryKey) => {
      setExpandedEntries((prev) => {
        const next = new Set(prev);
        if (next.has(String(entryKey))) {
          next.delete(String(entryKey));
        } else {
          next.add(String(entryKey));
        }
        return next;
      });
    }, []);
    const memoizedRenderStateName = q2((name) => {
      if (!refFiberInfo.current) return name;
      return renderStateName(name, refFiberInfo.current.displayName);
    }, []);
    if (changes.length === 0) {
      return null;
    }
    return /* @__PURE__ */ u4("div", { className: "pb-2", children: [
      /* @__PURE__ */ u4("div", { className: "text-xs text-[#888] mb-1.5", children: title }),
      /* @__PURE__ */ u4("div", { className: "flex flex-col gap-2", children: changes.map((change) => {
        const isEntryExpanded = expandedEntries.has(String(change.name));
        const values = refChangesValues.current.get(change.name);
        if (!values) return null;
        return /* @__PURE__ */ u4("div", { children: [
          /* @__PURE__ */ u4(
            "button",
            {
              type: "button",
              onClick: () => handleExpandEntry(String(change.name)),
              className: cn(
                "relative",
                "flex items-center gap-2",
                "w-full p-0 cursor-pointer text-white text-xs"
              ),
              children: /* @__PURE__ */ u4("div", { className: "flex items-center gap-1.5 flex-1", children: [
                /* @__PURE__ */ u4(
                  Icon,
                  {
                    name: "icon-chevron-right",
                    size: 12,
                    className: cn(
                      "text-[#666] transition-transform duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
                      {
                        "rotate-90": isEntryExpanded
                      }
                    )
                  }
                ),
                /* @__PURE__ */ u4("div", { className: "whitespace-nowrap break-words text-left font-medium flex items-center gap-x-1.5", children: [
                  memoizedRenderStateName(String(change.name)),
                  /* @__PURE__ */ u4(
                    CountBadge,
                    {
                      forceFlash: isExpanded && refLastUpdated.current.has(change.name),
                      count: change.count,
                      isFunction: values.isFunction,
                      showWarning: values.diff.changes.length === 0
                    }
                  )
                ] })
              ] })
            }
          ),
          /* @__PURE__ */ u4(
            "div",
            {
              className: cn(
                "react-scan-expandable",
                "overflow-hidden",
                {
                  "react-scan-expanded": isEntryExpanded
                }
              ),
              children: /* @__PURE__ */ u4("div", { className: "pl-3 text-xs font-mono border-l-1 border-[#333] overflow-hidden", children: /* @__PURE__ */ u4("div", { className: "flex flex-col gap-0.5", children: values.prevError || values.currError ? /* @__PURE__ */ u4(
                AccessError,
                {
                  currError: values.currError,
                  prevError: values.prevError
                }
              ) : values.diff.changes.length > 0 ? /* @__PURE__ */ u4(
                DiffChange,
                {
                  title,
                  change,
                  diff: values.diff,
                  expandedFns,
                  renderName: memoizedRenderStateName,
                  setExpandedFns
                }
              ) : /* @__PURE__ */ u4(
                ReferenceOnlyChange,
                {
                  currValue: values.currValue,
                  entryKey: change.name,
                  expandedFns,
                  prevValue: values.prevValue,
                  setExpandedFns
                }
              ) }) })
            }
          )
        ] }, change.name);
      }) })
    ] });
  });
  var AccessError = ({
    prevError,
    currError
  }) => {
    return /* @__PURE__ */ u4(k, { children: [
      prevError && /* @__PURE__ */ u4("div", { className: "text-[#f87171] bg-[#2a1515] px-1.5 py-[3px] rounded-[2px] italic", children: prevError }),
      currError && /* @__PURE__ */ u4("div", { className: "text-[#4ade80] bg-[#1a2a1a] px-1.5 py-[3px] rounded-[2px] italic mt-0.5", children: currError })
    ] });
  };
  var DiffChange = ({
    diff,
    title,
    renderName,
    change,
    expandedFns,
    setExpandedFns
  }) => {
    return diff.changes.map((diffChange, i5) => {
      const { value: prevDiffValue, error: prevDiffError } = safeGetValue2(
        diffChange.prevValue
      );
      const { value: currDiffValue, error: currDiffError } = safeGetValue2(
        diffChange.currentValue
      );
      const isFunction = typeof prevDiffValue === "function" || typeof currDiffValue === "function";
      let path;
      if (title === "Props") {
        path = diffChange.path.length > 0 ? `${renderName(String(change.name))}.${formatPath(diffChange.path)}` : void 0;
      }
      if (title === "State" && diffChange.path.length > 0) {
        path = `state.${formatPath(diffChange.path)}`;
      }
      if (!path) {
        path = formatPath(diffChange.path);
      }
      return /* @__PURE__ */ u4(
        "div",
        {
          className: cn("flex flex-col gap-y-1", {
            "mb-4": i5 < diff.changes.length - 1
          }),
          children: [
            path && /* @__PURE__ */ u4("div", { className: "text-[#666] text-[10px]", children: path }),
            /* @__PURE__ */ u4(
              "button",
              {
                type: "button",
                className: cn(
                  "group",
                  "flex items-start",
                  "py-[3px] px-1.5",
                  "text-left text-[#f87171] bg-[#2a1515]",
                  "rounded-[2px]",
                  "overflow-hidden break-all",
                  isFunction && "cursor-pointer"
                ),
                onClick: isFunction ? () => {
                  const fnKey = `${formatPath(diffChange.path)}-prev`;
                  setExpandedFns((prev) => {
                    const next = new Set(prev);
                    if (next.has(fnKey)) {
                      next.delete(fnKey);
                    } else {
                      next.add(fnKey);
                    }
                    return next;
                  });
                } : void 0,
                children: [
                  /* @__PURE__ */ u4("span", { className: "w-3 opacity-50", children: "-" }),
                  /* @__PURE__ */ u4("span", { className: "flex-1 whitespace-nowrap font-mono", children: prevDiffError ? /* @__PURE__ */ u4("span", { className: "italic text-[#f87171]", children: prevDiffError }) : isFunction ? /* @__PURE__ */ u4("div", { className: "flex gap-1 items-start flex-col", children: [
                    /* @__PURE__ */ u4("div", { className: "flex gap-1 items-start w-full", children: [
                      /* @__PURE__ */ u4("span", { className: "flex-1 max-h-40", children: formatFunctionPreview(
                        prevDiffValue,
                        expandedFns.has(`${formatPath(diffChange.path)}-prev`)
                      ) }),
                      typeof prevDiffValue === "function" && /* @__PURE__ */ u4(
                        CopyToClipboard,
                        {
                          text: prevDiffValue.toString(),
                          className: "opacity-0 transition-opacity group-hover:opacity-100",
                          children: ({ ClipboardIcon }) => /* @__PURE__ */ u4(k, { children: ClipboardIcon })
                        }
                      )
                    ] }),
                    prevDiffValue?.toString() === currDiffValue?.toString() && /* @__PURE__ */ u4("div", { className: "text-[10px] text-[#666] italic", children: "Function reference changed" })
                  ] }) : /* @__PURE__ */ u4(
                    DiffValueView,
                    {
                      value: prevDiffValue,
                      expanded: expandedFns.has(
                        `${formatPath(diffChange.path)}-prev`
                      ),
                      onToggle: () => {
                        const key = `${formatPath(diffChange.path)}-prev`;
                        setExpandedFns((prev) => {
                          const next = new Set(prev);
                          if (next.has(key)) {
                            next.delete(key);
                          } else {
                            next.add(key);
                          }
                          return next;
                        });
                      },
                      isNegative: true
                    }
                  ) })
                ]
              }
            ),
            /* @__PURE__ */ u4(
              "button",
              {
                type: "button",
                className: cn(
                  "group",
                  "flex items-start",
                  "py-[3px] px-1.5",
                  "text-left text-[#4ade80] bg-[#1a2a1a]",
                  "rounded-[2px]",
                  "overflow-hidden break-all",
                  isFunction && "cursor-pointer"
                ),
                onClick: isFunction ? () => {
                  const fnKey = `${formatPath(diffChange.path)}-current`;
                  setExpandedFns((prev) => {
                    const next = new Set(prev);
                    if (next.has(fnKey)) {
                      next.delete(fnKey);
                    } else {
                      next.add(fnKey);
                    }
                    return next;
                  });
                } : void 0,
                children: [
                  /* @__PURE__ */ u4("span", { className: "w-3 opacity-50", children: "+" }),
                  /* @__PURE__ */ u4("span", { className: "flex-1 whitespace-pre-wrap font-mono", children: currDiffError ? /* @__PURE__ */ u4("span", { className: "italic text-[#4ade80]", children: currDiffError }) : isFunction ? /* @__PURE__ */ u4("div", { className: "flex gap-1 items-start flex-col", children: [
                    /* @__PURE__ */ u4("div", { className: "flex gap-1 items-start w-full", children: [
                      /* @__PURE__ */ u4("span", { className: "flex-1", children: formatFunctionPreview(
                        currDiffValue,
                        expandedFns.has(`${formatPath(diffChange.path)}-current`)
                      ) }),
                      typeof currDiffValue === "function" && /* @__PURE__ */ u4(
                        CopyToClipboard,
                        {
                          text: currDiffValue.toString(),
                          className: "opacity-0 transition-opacity group-hover:opacity-100",
                          children: ({ ClipboardIcon }) => /* @__PURE__ */ u4(k, { children: ClipboardIcon })
                        }
                      )
                    ] }),
                    prevDiffValue?.toString() === currDiffValue?.toString() && /* @__PURE__ */ u4("div", { className: "text-[10px] text-[#666] italic", children: "Function reference changed" })
                  ] }) : /* @__PURE__ */ u4(
                    DiffValueView,
                    {
                      value: currDiffValue,
                      expanded: expandedFns.has(
                        `${formatPath(diffChange.path)}-current`
                      ),
                      onToggle: () => {
                        const key = `${formatPath(diffChange.path)}-current`;
                        setExpandedFns((prev) => {
                          const next = new Set(prev);
                          if (next.has(key)) {
                            next.delete(key);
                          } else {
                            next.add(key);
                          }
                          return next;
                        });
                      },
                      isNegative: false
                    }
                  ) })
                ]
              }
            )
          ]
        },
        `${path}-${change.name}-${i5}`
      );
    });
  };
  var ReferenceOnlyChange = ({
    prevValue,
    currValue,
    entryKey,
    expandedFns,
    setExpandedFns
  }) => {
    return /* @__PURE__ */ u4(k, { children: [
      /* @__PURE__ */ u4("div", { className: "group flex items-start text-[#f87171] bg-[#2a1515] py-[3px] px-1.5 rounded-[2px]", children: [
        /* @__PURE__ */ u4("span", { className: "w-3 opacity-50", children: "-" }),
        /* @__PURE__ */ u4("span", { className: "flex-1 whitespace-pre-wrap font-mono", children: /* @__PURE__ */ u4(
          DiffValueView,
          {
            value: prevValue,
            expanded: expandedFns.has(`${String(entryKey)}-prev`),
            onToggle: () => {
              const key = `${String(entryKey)}-prev`;
              setExpandedFns((prev) => {
                const next = new Set(prev);
                if (next.has(key)) {
                  next.delete(key);
                } else {
                  next.add(key);
                }
                return next;
              });
            },
            isNegative: true
          }
        ) })
      ] }),
      /* @__PURE__ */ u4("div", { className: "group flex items-start text-[#4ade80] bg-[#1a2a1a] py-[3px] px-1.5 rounded-[2px] mt-0.5", children: [
        /* @__PURE__ */ u4("span", { className: "w-3 opacity-50", children: "+" }),
        /* @__PURE__ */ u4("span", { className: "flex-1 whitespace-pre-wrap font-mono", children: /* @__PURE__ */ u4(
          DiffValueView,
          {
            value: currValue,
            expanded: expandedFns.has(`${String(entryKey)}-current`),
            onToggle: () => {
              const key = `${String(entryKey)}-current`;
              setExpandedFns((prev) => {
                const next = new Set(prev);
                if (next.has(key)) {
                  next.delete(key);
                } else {
                  next.add(key);
                }
                return next;
              });
            },
            isNegative: false
          }
        ) })
      ] }),
      typeof currValue === "object" && currValue !== null && /* @__PURE__ */ u4("div", { className: "text-[#666] text-[10px] italic mt-1", children: "Reference changed but objects are the same" })
    ] });
  };
  var CountBadge = ({
    count,
    forceFlash,
    isFunction,
    showWarning
  }) => {
    const refTimer = A2();
    const refIsFirstRender = A2(true);
    const refBadge = A2(null);
    const refPrevCount = A2(count);
    y2(() => {
      const element = refBadge.current;
      if (!element || refPrevCount.current === count) {
        return;
      }
      element.classList.remove("count-flash");
      void element.offsetWidth;
      element.classList.add("count-flash");
      refPrevCount.current = count;
    }, [count]);
    y2(() => {
      if (refIsFirstRender.current) {
        refIsFirstRender.current = false;
        return;
      }
      if (forceFlash) {
        refTimer.current = setTimeout(() => {
          refBadge.current?.classList.add("count-flash-white");
          refTimer.current = setTimeout(() => {
            refBadge.current?.classList.remove("count-flash-white");
          }, 300);
        }, 500);
      }
      return () => {
        clearTimeout(refTimer.current);
      };
    }, [forceFlash]);
    return /* @__PURE__ */ u4("div", { ref: refBadge, className: "count-badge", children: [
      showWarning && /* @__PURE__ */ u4(
        Icon,
        {
          name: "icon-triangle-alert",
          className: "text-yellow-500 mb-px",
          size: 14
        }
      ),
      isFunction && /* @__PURE__ */ u4(Icon, { name: "icon-function", className: "text-[#A855F7] mb-px", size: 14 }),
      "x",
      count
    ] });
  };

  // src/web/components/inspector/index.tsx
  var globalInspectorState = {
    lastRendered: /* @__PURE__ */ new Map(),
    expandedPaths: /* @__PURE__ */ new Set(),
    cleanup: () => {
      globalInspectorState.lastRendered.clear();
      globalInspectorState.expandedPaths.clear();
      flashManager.cleanupAll();
      resetTracking();
      timelineActions.reset();
    }
  };
  var InspectorErrorBoundary = class extends x {
    constructor() {
      super(...arguments);
      this.state = {
        hasError: false,
        error: null
      };
      this.handleReset = () => {
        this.setState({ hasError: false, error: null });
        globalInspectorState.cleanup();
      };
    }
    static getDerivedStateFromError(e4) {
      return { hasError: true, error: e4 };
    }
    render() {
      if (this.state.hasError) {
        return /* @__PURE__ */ u4("div", { className: "p-4 bg-red-950/50 h-screen backdrop-blur-sm", children: [
          /* @__PURE__ */ u4("div", { className: "flex items-center gap-2 mb-3 text-red-400 font-medium", children: [
            /* @__PURE__ */ u4(Icon, { name: "icon-flame", className: "text-red-500", size: 16 }),
            "Something went wrong in the inspector"
          ] }),
          /* @__PURE__ */ u4("div", { className: "p-3 bg-black/40 rounded font-mono text-xs text-red-300 mb-4 break-words", children: this.state.error?.message || JSON.stringify(this.state.error) }),
          /* @__PURE__ */ u4(
            "button",
            {
              type: "button",
              onClick: this.handleReset,
              className: "px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2",
              children: "Reset Inspector"
            }
          )
        ] });
      }
      return this.props.children;
    }
  };
  var Inspector = constant(() => {
    const refInspector = A2(null);
    const refLastInspectedFiber = A2(null);
    const isSettingsOpen = signalIsSettingsOpen.value;
    y2(() => {
      const processUpdate = (fiber) => {
        if (!fiber) return;
        refLastInspectedFiber.current = fiber;
        const { data: inspectorData, shouldUpdate } = collectInspectorData(fiber);
        if (shouldUpdate) {
          const update = {
            timestamp: Date.now(),
            fiberInfo: extractMinimalFiberInfo(fiber),
            props: inspectorData.fiberProps,
            state: inspectorData.fiberState,
            context: inspectorData.fiberContext,
            stateNames: getStateNames(fiber)
          };
          timelineActions.addUpdate(update, fiber);
        }
      };
      const unSubState = Store.inspectState.subscribe((state) => {
        if (state.kind !== "focused" || !state.focusedDomElement) {
          refLastInspectedFiber.current = null;
          globalInspectorState.cleanup();
          return;
        }
        if (state.kind === "focused") {
          signalIsSettingsOpen.value = false;
        }
        const { parentCompositeFiber } = getCompositeFiberFromElement(
          state.focusedDomElement,
          state.fiber
        );
        if (!parentCompositeFiber) return;
        const isNewComponent = refLastInspectedFiber.current?.type !== parentCompositeFiber.type;
        if (isNewComponent) {
          refLastInspectedFiber.current = parentCompositeFiber;
          globalInspectorState.cleanup();
          processUpdate(parentCompositeFiber);
        }
      });
      const unSubInspectorUpdate = inspectorUpdateSignal.subscribe(() => {
        const inspectState = Store.inspectState.value;
        if (inspectState.kind !== "focused" || !inspectState.focusedDomElement) {
          refLastInspectedFiber.current = null;
          globalInspectorState.cleanup();
          return;
        }
        const { parentCompositeFiber } = getCompositeFiberFromElement(
          inspectState.focusedDomElement,
          inspectState.fiber
        );
        if (!parentCompositeFiber) {
          Store.inspectState.value = {
            kind: "inspect-off"
          };
          return;
        }
        processUpdate(parentCompositeFiber);
        if (!inspectState.focusedDomElement.isConnected) {
          refLastInspectedFiber.current = null;
          globalInspectorState.cleanup();
          Store.inspectState.value = {
            kind: "inspecting",
            hoveredDomElement: null
          };
        }
      });
      return () => {
        unSubState();
        unSubInspectorUpdate();
        globalInspectorState.cleanup();
      };
    }, []);
    return /* @__PURE__ */ u4(InspectorErrorBoundary, { children: /* @__PURE__ */ u4(
      "div",
      {
        ref: refInspector,
        className: cn(
          "react-scan-inspector",
          "flex-1",
          "opacity-0",
          "overflow-y-auto overflow-x-hidden",
          "transition-opacity delay-0",
          "pointer-events-none",
          {
            "opacity-100 delay-300 pointer-events-auto": !isSettingsOpen
          }
        ),
        children: [
          /* @__PURE__ */ u4(WhatChangedSection, {}),
          /* @__PURE__ */ u4(StickySection, { children: (props) => /* @__PURE__ */ u4(PropertySection, { section: "props", ...props }) }),
          /* @__PURE__ */ u4(StickySection, { children: (props) => /* @__PURE__ */ u4(PropertySection, { section: "state", ...props }) }),
          /* @__PURE__ */ u4(StickySection, { children: (props) => /* @__PURE__ */ u4(PropertySection, { section: "context", ...props }) })
        ]
      }
    ) });
  });

  // src/web/components/inspector/utils.ts
  var getFiberFromElement = (element) => {
    if ("__REACT_DEVTOOLS_GLOBAL_HOOK__" in window) {
      const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
      if (!hook?.renderers) return null;
      for (const [, renderer] of Array.from(hook.renderers)) {
        try {
          const fiber = renderer.findFiberByHostInstance?.(element);
          if (fiber) return fiber;
        } catch {
        }
      }
    }
    if ("_reactRootContainer" in element) {
      const elementWithRoot = element;
      const rootContainer2 = elementWithRoot._reactRootContainer;
      return rootContainer2?._internalRoot?.current?.child ?? null;
    }
    for (const key in element) {
      if (key.startsWith("__reactInternalInstance$") || key.startsWith("__reactFiber")) {
        const elementWithFiber = element;
        return elementWithFiber[key];
      }
    }
    return null;
  };
  var getFirstStateNode = (fiber) => {
    let current = fiber;
    while (current) {
      if (current.stateNode instanceof Element) {
        return current.stateNode;
      }
      if (!current.child) {
        break;
      }
      current = current.child;
    }
    while (current) {
      if (current.stateNode instanceof Element) {
        return current.stateNode;
      }
      if (!current.return) {
        break;
      }
      current = current.return;
    }
    return null;
  };
  var getNearestFiberFromElement = (element) => {
    if (!element) return null;
    try {
      const fiber = getFiberFromElement(element);
      if (!fiber) return null;
      const res = getParentCompositeFiber(fiber);
      return res ? res[0] : null;
    } catch {
      return null;
    }
  };
  var getParentCompositeFiber = (fiber) => {
    let current = fiber;
    let prevHost = null;
    while (current) {
      if (isCompositeFiber(current)) return [current, prevHost];
      if (isHostFiber(current) && !prevHost) prevHost = current;
      current = current.return;
    }
    return null;
  };
  var isFiberInTree = (fiber, root) => {
    {
      const res = !!traverseFiber(root, (searchFiber) => searchFiber === fiber);
      return res;
    }
  };
  var getAssociatedFiberRect = async (element) => {
    const associatedFiber = getNearestFiberFromElement(element);
    if (!associatedFiber) return null;
    const stateNode = getFirstStateNode(associatedFiber);
    if (!stateNode) return null;
    const rect = (await batchGetBoundingRects([stateNode])).get(stateNode);
    if (!rect) return null;
    return rect;
  };
  var getCompositeComponentFromElement = (element) => {
    const associatedFiber = getNearestFiberFromElement(element);
    if (!associatedFiber) return {};
    const stateNode = getFirstStateNode(associatedFiber);
    if (!stateNode) return {};
    const parentCompositeFiberInfo = getParentCompositeFiber(associatedFiber);
    if (!parentCompositeFiberInfo) {
      return {};
    }
    const [parentCompositeFiber] = parentCompositeFiberInfo;
    return {
      parentCompositeFiber
    };
  };
  var getCompositeFiberFromElement = (element, knownFiber) => {
    if (!element.isConnected) return {};
    let fiber = knownFiber ?? getNearestFiberFromElement(element);
    if (!fiber) return {};
    let curr = fiber;
    let rootFiber = null;
    let currentRootFiber = null;
    while (curr) {
      if (!curr.stateNode) {
        curr = curr.return;
        continue;
      }
      if (ReactScanInternals.instrumentation?.fiberRoots.has(curr.stateNode)) {
        rootFiber = curr;
        currentRootFiber = curr.stateNode.current;
        break;
      }
      curr = curr.return;
    }
    if (!rootFiber || !currentRootFiber) return {};
    fiber = isFiberInTree(fiber, currentRootFiber) ? fiber : fiber.alternate ?? fiber;
    if (!fiber) return {};
    if (!getFirstStateNode(fiber)) return {};
    const parentCompositeFiber = getParentCompositeFiber(fiber)?.[0];
    if (!parentCompositeFiber) return {};
    return {
      parentCompositeFiber: isFiberInTree(parentCompositeFiber, currentRootFiber) ? parentCompositeFiber : parentCompositeFiber.alternate ?? parentCompositeFiber
    };
  };
  var getChangedPropsDetailed = (fiber) => {
    const currentProps = fiber.memoizedProps ?? {};
    const previousProps = fiber.alternate?.memoizedProps ?? {};
    const changes = [];
    for (const key in currentProps) {
      if (key === "children") continue;
      const currentValue = currentProps[key];
      const prevValue = previousProps[key];
      if (!isEqual(currentValue, prevValue)) {
        changes.push({
          name: key,
          value: currentValue,
          prevValue,
          type: 1 /* Props */
        });
      }
    }
    return changes;
  };
  var isRecord = (value) => {
    return value !== null && typeof value === "object";
  };
  var getOverrideMethods = () => {
    let overrideProps = null;
    let overrideHookState = null;
    let overrideContext = null;
    if ("__REACT_DEVTOOLS_GLOBAL_HOOK__" in window) {
      const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
      if (!hook?.renderers) {
        return {
          overrideProps: null,
          overrideHookState: null,
          overrideContext: null
        };
      }
      for (const [, renderer] of Array.from(hook.renderers)) {
        try {
          const devToolsRenderer = renderer;
          if (overrideHookState) {
            const prevOverrideHookState = overrideHookState;
            overrideHookState = (fiber, id, path, value) => {
              let current = fiber.memoizedState;
              for (let i5 = 0; i5 < Number(id); i5++) {
                if (!current?.next) break;
                current = current.next;
              }
              if (current?.queue) {
                const queue = current.queue;
                if (isRecord(queue) && "dispatch" in queue) {
                  const dispatch = queue.dispatch;
                  dispatch(value);
                  return;
                }
              }
              prevOverrideHookState(fiber, id, path, value);
              devToolsRenderer.overrideHookState?.(fiber, id, path, value);
            };
          } else if (devToolsRenderer.overrideHookState) {
            overrideHookState = devToolsRenderer.overrideHookState;
          }
          if (overrideProps) {
            const prevOverrideProps = overrideProps;
            overrideProps = (fiber, path, value) => {
              prevOverrideProps(fiber, path, value);
              devToolsRenderer.overrideProps?.(fiber, path, value);
            };
          } else if (devToolsRenderer.overrideProps) {
            overrideProps = devToolsRenderer.overrideProps;
          }
          overrideContext = (fiber, contextType, value) => {
            let current = fiber;
            while (current) {
              const type = current.type;
              if (type === contextType || type?.Provider === contextType) {
                if (overrideProps) {
                  overrideProps(current, ["value"], value);
                  if (current.alternate) {
                    overrideProps(current.alternate, ["value"], value);
                  }
                }
                break;
              }
              current = current.return;
            }
          };
        } catch {
        }
      }
    }
    return { overrideProps, overrideHookState, overrideContext };
  };
  var nonVisualTags = /* @__PURE__ */ new Set([
    "HTML",
    "HEAD",
    "META",
    "TITLE",
    "BASE",
    "SCRIPT",
    "SCRIPT",
    "STYLE",
    "LINK",
    "NOSCRIPT",
    "SOURCE",
    "TRACK",
    "EMBED",
    "OBJECT",
    "PARAM",
    "TEMPLATE",
    "PORTAL",
    "SLOT",
    "AREA",
    "XML",
    "DOCTYPE",
    "COMMENT"
  ]);
  var findComponentDOMNode = (fiber, excludeNonVisualTags = true) => {
    if (fiber.stateNode && "nodeType" in fiber.stateNode) {
      const element = fiber.stateNode;
      if (excludeNonVisualTags && element.tagName && nonVisualTags.has(element.tagName.toLowerCase())) {
        return null;
      }
      return element;
    }
    let child = fiber.child;
    while (child) {
      const result = findComponentDOMNode(child, excludeNonVisualTags);
      if (result) return result;
      child = child.sibling;
    }
    return null;
  };
  var getInspectableElements = (root = document.body) => {
    const result = [];
    const findInspectableFiber = (element) => {
      if (!element) return null;
      const { parentCompositeFiber } = getCompositeComponentFromElement(element);
      if (!parentCompositeFiber) return null;
      const componentRoot = findComponentDOMNode(parentCompositeFiber);
      return componentRoot === element ? element : null;
    };
    const traverse = (element, depth = 0) => {
      const inspectable = findInspectableFiber(element);
      if (inspectable) {
        const { parentCompositeFiber } = getCompositeComponentFromElement(inspectable);
        if (!parentCompositeFiber) return;
        result.push({
          element: inspectable,
          depth,
          name: getDisplayName(parentCompositeFiber.type) ?? "Unknown",
          fiber: parentCompositeFiber
        });
      }
      for (const child of Array.from(element.children)) {
        traverse(child, inspectable ? depth + 1 : depth);
      }
    };
    traverse(root);
    return result;
  };
  var fiberMap = /* @__PURE__ */ new WeakMap();
  var getInspectableAncestors = (element) => {
    const result = [];
    const findInspectableFiber = (element2) => {
      if (!element2) return null;
      const { parentCompositeFiber } = getCompositeComponentFromElement(element2);
      if (!parentCompositeFiber) return null;
      const componentRoot = findComponentDOMNode(parentCompositeFiber);
      if (componentRoot === element2) {
        fiberMap.set(element2, parentCompositeFiber);
        return element2;
      }
      return null;
    };
    let current = element;
    while (current && current !== document.body) {
      const inspectable = findInspectableFiber(current);
      if (inspectable) {
        const fiber = fiberMap.get(inspectable);
        if (fiber) {
          result.unshift({
            element: inspectable,
            depth: 0,
            name: getDisplayName(fiber.type) ?? "Unknown",
            fiber
          });
        }
      }
      current = current.parentElement;
    }
    return result;
  };
  var isExpandable = (value) => {
    if (value === null || typeof value !== "object" || isPromise(value)) {
      return false;
    }
    if (value instanceof ArrayBuffer) {
      return true;
    }
    if (value instanceof DataView) {
      return true;
    }
    if (ArrayBuffer.isView(value)) {
      return true;
    }
    if (value instanceof Map || value instanceof Set) {
      return value.size > 0;
    }
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return Object.keys(value).length > 0;
  };
  var isEditableValue = (value, parentPath) => {
    if (value == null) return true;
    if (isPromise(value)) return false;
    if (typeof value === "function") {
      return false;
    }
    if (parentPath) {
      const parts = parentPath.split(".");
      let currentPath = "";
      for (const part of parts) {
        currentPath = currentPath ? `${currentPath}.${part}` : part;
        const obj = globalInspectorState.lastRendered.get(currentPath);
        if (obj instanceof DataView || obj instanceof ArrayBuffer || ArrayBuffer.isView(obj)) {
          return false;
        }
      }
    }
    switch (value.constructor) {
      case Date:
      case RegExp:
      case Error:
        return true;
      default:
        switch (typeof value) {
          case "string":
          case "number":
          case "boolean":
          case "bigint":
            return true;
          default:
            return false;
        }
    }
  };
  var getPath = (componentName, section, parentPath, key) => {
    if (parentPath) {
      return `${componentName}.${parentPath}.${key}`;
    }
    if (section === "context" && !key.startsWith("context.")) {
      return `${componentName}.${section}.context.${key}`;
    }
    return `${componentName}.${section}.${key}`;
  };
  var sanitizeString = (value) => {
    return value.replace(/[<>]/g, "").replace(/javascript:/gi, "").replace(/data:/gi, "").replace(/on\w+=/gi, "").slice(0, 5e4);
  };
  var formatValue = (value) => {
    const metadata2 = ensureRecord(value);
    return metadata2.displayValue;
  };
  var formatForClipboard = (value) => {
    try {
      if (value === null) return "null";
      if (value === void 0) return "undefined";
      if (isPromise(value)) return "Promise";
      if (typeof value === "function") {
        const fnStr = value.toString();
        try {
          const formatted = fnStr.replace(/\s+/g, " ").replace(/{\s+/g, "{\n  ").replace(/;\s+/g, ";\n  ").replace(/}\s*$/g, "\n}").replace(/\(\s+/g, "(").replace(/\s+\)/g, ")").replace(/,\s+/g, ", ");
          return formatted;
        } catch {
          return fnStr;
        }
      }
      switch (true) {
        case value instanceof Date:
          return value.toISOString();
        case value instanceof RegExp:
          return value.toString();
        case value instanceof Error:
          return `${value.name}: ${value.message}`;
        case value instanceof Map:
          return JSON.stringify(Array.from(value.entries()), null, 2);
        case value instanceof Set:
          return JSON.stringify(Array.from(value), null, 2);
        case value instanceof DataView:
          return JSON.stringify(
            Array.from(new Uint8Array(value.buffer)),
            null,
            2
          );
        case value instanceof ArrayBuffer:
          return JSON.stringify(Array.from(new Uint8Array(value)), null, 2);
        case (ArrayBuffer.isView(value) && "length" in value):
          return JSON.stringify(
            Array.from(value),
            null,
            2
          );
        case Array.isArray(value):
          return JSON.stringify(value, null, 2);
        case typeof value === "object":
          return JSON.stringify(value, null, 2);
        default:
          return String(value);
      }
    } catch {
      return String(value);
    }
  };
  var detectValueType = (value) => {
    const trimmed = value.trim();
    switch (trimmed) {
      case "undefined":
        return { type: "undefined", value: void 0 };
      case "null":
        return { type: "null", value: null };
      case "true":
        return { type: "boolean", value: true };
      case "false":
        return { type: "boolean", value: false };
    }
    if (/^".*"$/.test(trimmed)) {
      return { type: "string", value: trimmed.slice(1, -1) };
    }
    if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) {
      return { type: "number", value: Number(trimmed) };
    }
    return { type: "string", value: `"${trimmed}"` };
  };
  var formatInitialValue = (value) => {
    if (value === void 0) return "undefined";
    if (value === null) return "null";
    if (typeof value === "string") return `"${value}"`;
    return String(value);
  };
  var updateNestedValue = (obj, path, value) => {
    try {
      if (path.length === 0) return value;
      const [key, ...rest] = path;
      if (Array.isArray(obj) && obj.every((item) => "name" in item && "value" in item)) {
        const index = obj.findIndex((item) => item.name === key);
        if (index === -1) return obj;
        const newArray = [...obj];
        if (rest.length === 0) {
          newArray[index] = { ...newArray[index], value };
        } else {
          newArray[index] = {
            ...newArray[index],
            value: updateNestedValue(newArray[index].value, rest, value)
          };
        }
        return newArray;
      }
      if (obj instanceof Map) {
        const newMap = new Map(obj);
        if (rest.length === 0) {
          newMap.set(key, value);
        } else {
          const currentValue = newMap.get(key);
          newMap.set(key, updateNestedValue(currentValue, rest, value));
        }
        return newMap;
      }
      if (Array.isArray(obj)) {
        const index = Number.parseInt(key, 10);
        const newArray = [...obj];
        if (rest.length === 0) {
          newArray[index] = value;
        } else {
          newArray[index] = updateNestedValue(obj[index], rest, value);
        }
        return newArray;
      }
      if (obj && typeof obj === "object") {
        if (rest.length === 0) {
          return { ...obj, [key]: value };
        }
        return {
          ...obj,
          [key]: updateNestedValue(
            obj[key],
            rest,
            value
          )
        };
      }
      return value;
    } catch {
      return obj;
    }
  };
  var areFunctionsEqual = (prev, current) => {
    try {
      if (typeof prev !== "function" || typeof current !== "function") {
        return false;
      }
      return prev.toString() === current.toString();
    } catch {
      return false;
    }
  };
  var getObjectDiff = (prev, current, path = [], seen = /* @__PURE__ */ new WeakSet()) => {
    if (prev === current) {
      return { type: "primitive", changes: [], hasDeepChanges: false };
    }
    if (typeof prev === "function" && typeof current === "function") {
      const isSameFunction = areFunctionsEqual(prev, current);
      return {
        type: "primitive",
        changes: [
          {
            path,
            prevValue: prev,
            currentValue: current,
            sameFunction: isSameFunction
          }
        ],
        hasDeepChanges: !isSameFunction
      };
    }
    if (prev === null || current === null || prev === void 0 || current === void 0 || typeof prev !== "object" || typeof current !== "object") {
      return {
        type: "primitive",
        changes: [{ path, prevValue: prev, currentValue: current }],
        hasDeepChanges: true
      };
    }
    if (seen.has(prev) || seen.has(current)) {
      return {
        type: "object",
        changes: [{ path, prevValue: "[Circular]", currentValue: "[Circular]" }],
        hasDeepChanges: false
      };
    }
    seen.add(prev);
    seen.add(current);
    const prevObj = prev;
    const currentObj = current;
    const allKeys = /* @__PURE__ */ new Set([
      ...Object.keys(prevObj),
      ...Object.keys(currentObj)
    ]);
    const changes = [];
    let hasDeepChanges = false;
    for (const key of allKeys) {
      const prevValue = prevObj[key];
      const currentValue = currentObj[key];
      if (prevValue !== currentValue) {
        if (typeof prevValue === "object" && typeof currentValue === "object" && prevValue !== null && currentValue !== null) {
          const nestedDiff = getObjectDiff(
            prevValue,
            currentValue,
            [...path, key],
            seen
          );
          changes.push(...nestedDiff.changes);
          if (nestedDiff.hasDeepChanges) {
            hasDeepChanges = true;
          }
        } else {
          changes.push({
            path: [...path, key],
            prevValue,
            currentValue
          });
          hasDeepChanges = true;
        }
      }
    }
    return {
      type: "object",
      changes,
      hasDeepChanges
    };
  };
  var formatPath = (path) => {
    if (path.length === 0) return "";
    return path.reduce((acc, segment, i5) => {
      if (/^\d+$/.test(segment)) {
        return `${acc}[${segment}]`;
      }
      return i5 === 0 ? segment : `${acc}.${segment}`;
    }, "");
  };
  function hackyJsFormatter(code) {
    const normalizedCode = code.replace(/\s+/g, " ").trim();
    const rawTokens = [];
    let current = "";
    for (let i5 = 0; i5 < normalizedCode.length; i5++) {
      const c4 = normalizedCode[i5];
      if (c4 === "=" && normalizedCode[i5 + 1] === ">") {
        if (current.trim()) rawTokens.push(current.trim());
        rawTokens.push("=>");
        current = "";
        i5++;
        continue;
      }
      if (/[(){}[\];,<>:\?!]/.test(c4)) {
        if (current.trim()) {
          rawTokens.push(current.trim());
        }
        rawTokens.push(c4);
        current = "";
      } else if (/\s/.test(c4)) {
        if (current.trim()) {
          rawTokens.push(current.trim());
        }
        current = "";
      } else {
        current += c4;
      }
    }
    if (current.trim()) {
      rawTokens.push(current.trim());
    }
    const merged = [];
    for (let i5 = 0; i5 < rawTokens.length; i5++) {
      const t4 = rawTokens[i5];
      const n3 = rawTokens[i5 + 1];
      if (t4 === "(" && n3 === ")" || t4 === "[" && n3 === "]" || t4 === "{" && n3 === "}" || t4 === "<" && n3 === ">") {
        merged.push(t4 + n3);
        i5++;
      } else {
        merged.push(t4);
      }
    }
    const arrowParamSet = /* @__PURE__ */ new Set();
    const genericSet = /* @__PURE__ */ new Set();
    function findMatchingPair(openTok, closeTok, startIndex) {
      let depth = 0;
      for (let j3 = startIndex; j3 < merged.length; j3++) {
        const token = merged[j3];
        if (token === openTok) depth++;
        else if (token === closeTok) {
          depth--;
          if (depth === 0) return j3;
        }
      }
      return -1;
    }
    for (let i5 = 0; i5 < merged.length; i5++) {
      const t4 = merged[i5];
      if (t4 === "(") {
        const closeIndex = findMatchingPair("(", ")", i5);
        if (closeIndex !== -1 && merged[closeIndex + 1] === "=>") {
          for (let k3 = i5; k3 <= closeIndex; k3++) {
            arrowParamSet.add(k3);
          }
        }
      }
    }
    for (let i5 = 1; i5 < merged.length; i5++) {
      const prev = merged[i5 - 1];
      const t4 = merged[i5];
      if (/^[a-zA-Z0-9_$]+$/.test(prev) && t4 === "<") {
        const closeIndex = findMatchingPair("<", ">", i5);
        if (closeIndex !== -1) {
          for (let k3 = i5; k3 <= closeIndex; k3++) {
            genericSet.add(k3);
          }
        }
      }
    }
    let indentLevel = 0;
    const indentStr = "  ";
    const lines = [];
    let line = "";
    function pushLine() {
      if (line.trim()) {
        lines.push(line.replace(/\s+$/, ""));
      }
      line = "";
    }
    function newLine() {
      pushLine();
      line = indentStr.repeat(indentLevel);
    }
    const stack = [];
    function stackTop() {
      return stack.length ? stack[stack.length - 1] : null;
    }
    function placeToken(tok, noSpaceBefore = false) {
      if (!line.trim()) {
        line += tok;
      } else {
        if (noSpaceBefore || /^[),;:\].}>]$/.test(tok)) {
          line += tok;
        } else {
          line += ` ${tok}`;
        }
      }
    }
    for (let i5 = 0; i5 < merged.length; i5++) {
      const tok = merged[i5];
      const next = merged[i5 + 1] || "";
      if (["(", "{", "[", "<"].includes(tok)) {
        placeToken(tok);
        stack.push(tok);
        if (tok === "{") {
          indentLevel++;
          newLine();
        } else if (tok === "(" || tok === "[" || tok === "<") {
          if (arrowParamSet.has(i5) && tok === "(" || genericSet.has(i5) && tok === "<") ; else {
            const directClose = {
              "(": ")",
              "[": "]",
              "<": ">"
            }[tok];
            if (next !== directClose && next !== "()" && next !== "[]" && next !== "<>") {
              indentLevel++;
              newLine();
            }
          }
        }
      } else if ([")", "}", "]", ">"].includes(tok)) {
        const opening = stackTop();
        if (tok === ")" && opening === "(" || tok === "]" && opening === "[" || tok === ">" && opening === "<") {
          if (!(arrowParamSet.has(i5) && tok === ")") && !(genericSet.has(i5) && tok === ">")) {
            indentLevel = Math.max(indentLevel - 1, 0);
            newLine();
          }
        } else if (tok === "}" && opening === "{") {
          indentLevel = Math.max(indentLevel - 1, 0);
          newLine();
        }
        stack.pop();
        placeToken(tok);
        if (tok === "}") {
          newLine();
        }
      } else if (/^\(\)|\[\]|\{\}|\<\>$/.test(tok)) {
        placeToken(tok);
      } else if (tok === "=>") {
        placeToken(tok);
      } else if (tok === ";") {
        placeToken(tok, true);
        newLine();
      } else if (tok === ",") {
        placeToken(tok, true);
        const top = stackTop();
        if (!(arrowParamSet.has(i5) && top === "(") && !(genericSet.has(i5) && top === "<")) {
          if (top && ["{", "[", "(", "<"].includes(top)) {
            newLine();
          }
        }
      } else {
        placeToken(tok);
      }
    }
    pushLine();
    return lines.join("\n").replace(/\n\s*\n+/g, "\n").trim();
  }
  var formatFunctionPreview = (fn2, expanded = false) => {
    try {
      const fnStr = fn2.toString();
      const match = fnStr.match(
        /(?:function\s*)?(?:\(([^)]*)\)|([^=>\s]+))\s*=>?/
      );
      if (!match) return "\u0192";
      const params = match[1] || match[2] || "";
      const cleanParams = params.replace(/\s+/g, "");
      if (!expanded) {
        return `\u0192 (${cleanParams}) => ...`;
      }
      return hackyJsFormatter(fnStr);
    } catch {
      return "\u0192";
    }
  };
  var formatValuePreview = (value) => {
    if (value === null) return "null";
    if (value === void 0) return "undefined";
    if (typeof value === "string")
      return `"${value.length > 150 ? `${value.slice(0, 20)}...` : value}"`;
    if (typeof value === "number" || typeof value === "boolean")
      return String(value);
    if (typeof value === "function") return formatFunctionPreview(value);
    if (Array.isArray(value)) return `Array(${value.length})`;
    if (value instanceof Map) return `Map(${value.size})`;
    if (value instanceof Set) return `Set(${value.size})`;
    if (value instanceof Date) return value.toISOString();
    if (value instanceof RegExp) return value.toString();
    if (value instanceof Error) return `${value.name}: ${value.message}`;
    if (typeof value === "object") {
      const keys = Object.keys(value);
      return `{${keys.length > 2 ? `${keys.slice(0, 2).join(", ")}, ...` : keys.join(", ")}}`;
    }
    return String(value);
  };
  var safeGetValue = (value) => {
    if (value === null || value === void 0) return { value };
    if (typeof value === "function") return { value };
    if (typeof value !== "object") return { value };
    if (value instanceof Promise) {
      return { value: "Promise" };
    }
    try {
      const proto = Object.getPrototypeOf(value);
      if (proto === Promise.prototype || proto?.constructor?.name === "Promise") {
        return { value: "Promise" };
      }
      return { value };
    } catch {
      return { value: null, error: "Error accessing value" };
    }
  };
  var calculateSliderValues = (totalUpdates, currentIndex) => {
    if (totalUpdates <= TIMELINE_MAX_UPDATES) {
      return {
        leftValue: 0,
        min: 0,
        max: totalUpdates - 1,
        value: currentIndex,
        rightValue: totalUpdates - 1
      };
    }
    return {
      leftValue: totalUpdates - TIMELINE_MAX_UPDATES,
      min: 0,
      max: TIMELINE_MAX_UPDATES - 1,
      value: currentIndex,
      rightValue: totalUpdates - 1
    };
  };
  var isPromise = (value) => {
    return !!value && (value instanceof Promise || typeof value === "object" && "then" in value);
  };
  var ensureRecord = (value, maxDepth = 2, seen = /* @__PURE__ */ new WeakSet()) => {
    if (isPromise(value)) {
      return { type: "promise", displayValue: "Promise" };
    }
    if (value === null) {
      return { type: "null", displayValue: "null" };
    }
    if (value === void 0) {
      return { type: "undefined", displayValue: "undefined" };
    }
    switch (typeof value) {
      case "object": {
        if (seen.has(value)) {
          return { type: "circular", displayValue: "[Circular Reference]" };
        }
        if (!value) return { type: "null", displayValue: "null" };
        seen.add(value);
        try {
          const result = {};
          if (value instanceof Element) {
            result.type = "Element";
            result.tagName = value.tagName.toLowerCase();
            result.displayValue = value.tagName.toLowerCase();
            return result;
          }
          if (value instanceof Map) {
            result.type = "Map";
            result.size = value.size;
            result.displayValue = `Map(${value.size})`;
            if (maxDepth > 0) {
              const entries = {};
              let index = 0;
              for (const [key, val] of value.entries()) {
                if (index >= 50) break;
                try {
                  entries[String(key)] = ensureRecord(val, maxDepth - 1, seen);
                } catch {
                  entries[String(index)] = {
                    type: "error",
                    displayValue: "Error accessing Map entry"
                  };
                }
                index++;
              }
              result.entries = entries;
            }
            return result;
          }
          if (value instanceof Set) {
            result.type = "Set";
            result.size = value.size;
            result.displayValue = `Set(${value.size})`;
            if (maxDepth > 0) {
              const items = [];
              let count = 0;
              for (const item of value) {
                if (count >= 50) break;
                items.push(ensureRecord(item, maxDepth - 1, seen));
                count++;
              }
              result.items = items;
            }
            return result;
          }
          if (value instanceof Date) {
            result.type = "Date";
            result.value = value.toISOString();
            result.displayValue = value.toLocaleString();
            return result;
          }
          if (value instanceof RegExp) {
            result.type = "RegExp";
            result.value = value.toString();
            result.displayValue = value.toString();
            return result;
          }
          if (value instanceof Error) {
            result.type = "Error";
            result.name = value.name;
            result.message = value.message;
            result.displayValue = `${value.name}: ${value.message}`;
            return result;
          }
          if (value instanceof ArrayBuffer) {
            result.type = "ArrayBuffer";
            result.byteLength = value.byteLength;
            result.displayValue = `ArrayBuffer(${value.byteLength})`;
            return result;
          }
          if (value instanceof DataView) {
            result.type = "DataView";
            result.byteLength = value.byteLength;
            result.displayValue = `DataView(${value.byteLength})`;
            return result;
          }
          if (ArrayBuffer.isView(value)) {
            const typedArray = value;
            result.type = typedArray.constructor.name;
            result.length = typedArray.length;
            result.byteLength = typedArray.buffer.byteLength;
            result.displayValue = `${typedArray.constructor.name}(${typedArray.length})`;
            return result;
          }
          if (Array.isArray(value)) {
            result.type = "array";
            result.length = value.length;
            result.displayValue = `Array(${value.length})`;
            if (maxDepth > 0) {
              result.items = value.slice(0, 50).map((item) => ensureRecord(item, maxDepth - 1, seen));
            }
            return result;
          }
          const keys = Object.keys(value);
          result.type = "object";
          result.size = keys.length;
          result.displayValue = keys.length <= 5 ? `{${keys.join(", ")}}` : `{${keys.slice(0, 5).join(", ")}, ...${keys.length - 5}}`;
          if (maxDepth > 0) {
            const entries = {};
            for (const key of keys.slice(0, 50)) {
              try {
                entries[key] = ensureRecord(
                  value[key],
                  maxDepth - 1,
                  seen
                );
              } catch {
                entries[key] = {
                  type: "error",
                  displayValue: "Error accessing property"
                };
              }
            }
            result.entries = entries;
          }
          return result;
        } finally {
          seen.delete(value);
        }
      }
      case "string":
        return {
          type: "string",
          value,
          displayValue: `"${value}"`
        };
      case "function":
        return {
          type: "function",
          displayValue: "\u0192()",
          name: value.name || "anonymous"
        };
      default:
        return {
          type: typeof value,
          value,
          displayValue: String(value)
        };
    }
  };
  var extractMinimalFiberInfo = (fiber) => {
    const timings = getTimings(fiber);
    return {
      displayName: getDisplayName(fiber) || "Unknown",
      type: fiber.type,
      key: fiber.key,
      id: fiber.index,
      selfTime: timings?.selfTime ?? null,
      totalTime: timings?.totalTime ?? null
    };
  };

  // src/web/components/inspector/timeline/utils.ts
  var propsTracker = /* @__PURE__ */ new Map();
  var stateTracker = /* @__PURE__ */ new Map();
  var contextTracker = /* @__PURE__ */ new Map();
  var lastComponentType = null;
  var STATE_NAME_REGEX = /\[(?<name>\w+),\s*set\w+\]/g;
  var PROPS_ORDER_REGEX = /\(\s*{\s*(?<props>[^}]+)\s*}\s*\)/;
  var getStateNames = (fiber) => {
    const componentSource = fiber.type?.toString?.() || "";
    return componentSource ? Array.from(
      componentSource.matchAll(STATE_NAME_REGEX),
      (m3) => m3.groups?.name ?? ""
    ) : [];
  };
  var resetTracking = () => {
    propsTracker.clear();
    stateTracker.clear();
    contextTracker.clear();
    lastComponentType = null;
  };
  var isInitialComponentUpdate = (fiber) => {
    const isNewComponent = fiber.type !== lastComponentType;
    lastComponentType = fiber.type;
    return isNewComponent;
  };
  var trackChange = (tracker, key, currentValue, previousValue) => {
    const existing = tracker.get(key);
    const isInitialValue = tracker === propsTracker || tracker === contextTracker;
    const hasChanged = !isEqual(currentValue, previousValue);
    if (!existing) {
      tracker.set(key, {
        count: hasChanged && isInitialValue ? 1 : 0,
        currentValue,
        previousValue,
        lastUpdated: Date.now()
      });
      return {
        hasChanged,
        count: hasChanged && isInitialValue ? 1 : isInitialValue ? 0 : 1
      };
    }
    if (!isEqual(existing.currentValue, currentValue)) {
      const newCount = existing.count + 1;
      tracker.set(key, {
        count: newCount,
        currentValue,
        previousValue: existing.currentValue,
        lastUpdated: Date.now()
      });
      return { hasChanged: true, count: newCount };
    }
    return { hasChanged: false, count: existing.count };
  };
  var getStateFromFiber = (fiber) => {
    if (!fiber) return {};
    if (fiber.tag === FunctionComponentTag || fiber.tag === ForwardRefTag || fiber.tag === SimpleMemoComponentTag || fiber.tag === MemoComponentTag) {
      let memoizedState = fiber.memoizedState;
      const state = {};
      let index = 0;
      while (memoizedState) {
        if (memoizedState.queue && memoizedState.memoizedState !== void 0) {
          state[index] = memoizedState.memoizedState;
        }
        memoizedState = memoizedState.next;
        index++;
      }
      return state;
    }
    if (fiber.tag === ClassComponentTag) {
      return fiber.memoizedState || {};
    }
    return {};
  };
  var getPropsOrder = (fiber) => {
    const componentSource = fiber.type?.toString?.() || "";
    const match = componentSource.match(PROPS_ORDER_REGEX);
    if (!match?.groups?.props) return [];
    return match.groups.props.split(",").map((prop) => prop.trim().split(":")[0].split("=")[0].trim()).filter(Boolean);
  };
  var collectPropsChanges = (fiber) => {
    const currentProps = fiber.memoizedProps || {};
    const prevProps = fiber.alternate?.memoizedProps || {};
    const orderedProps = getPropsOrder(fiber);
    const current = {};
    const prev = {};
    const allProps = [
      .../* @__PURE__ */ new Set([...orderedProps, ...Object.keys(currentProps)])
    ];
    for (const key of allProps) {
      if (key in currentProps) {
        current[key] = currentProps[key];
        prev[key] = prevProps[key];
      }
    }
    const changes = getChangedPropsDetailed(fiber).map((change) => ({
      name: change.name,
      value: change.value,
      prevValue: change.prevValue
    }));
    return { current, prev, changes };
  };
  var collectStateChanges = (fiber) => {
    const current = getStateFromFiber(fiber);
    const prev = fiber.alternate ? getStateFromFiber(fiber.alternate) : {};
    const changes = [];
    for (const [index, value] of Object.entries(current)) {
      const stateKey = fiber.tag === ClassComponentTag ? index : Number(index);
      if (fiber.alternate && !isEqual(prev[index], value)) {
        changes.push({
          name: stateKey,
          value,
          prevValue: prev[index]
        });
      }
    }
    return { current, prev, changes };
  };
  var collectContextChanges = (fiber) => {
    const currentContexts = getAllFiberContexts(fiber);
    const prevContexts = fiber.alternate ? getAllFiberContexts(fiber.alternate) : /* @__PURE__ */ new Map();
    const current = {};
    const prev = {};
    const changes = [];
    const seenContexts = /* @__PURE__ */ new Set();
    for (const [contextType, ctx2] of currentContexts) {
      const name = ctx2.displayName;
      const contextKey = `${name}-${contextType?.toString()}`;
      if (seenContexts.has(contextKey)) continue;
      seenContexts.add(contextKey);
      current[name] = ctx2.value;
      const prevCtx = prevContexts.get(contextType);
      if (prevCtx) {
        prev[name] = prevCtx.value;
        if (!isEqual(prevCtx.value, ctx2.value)) {
          changes.push({
            name,
            value: ctx2.value,
            prevValue: prevCtx.value,
            contextType
          });
        }
      }
    }
    return { current, prev, changes };
  };
  var collectInspectorData = (fiber) => {
    const emptySection = () => ({
      current: [],
      changes: /* @__PURE__ */ new Set(),
      changesCounts: /* @__PURE__ */ new Map()
    });
    if (!fiber) {
      return {
        data: {
          fiberProps: emptySection(),
          fiberState: emptySection(),
          fiberContext: emptySection()
        },
        shouldUpdate: false
      };
    }
    let hasNewChanges = false;
    const isInitialUpdate = isInitialComponentUpdate(fiber);
    const propsData = emptySection();
    if (fiber.memoizedProps) {
      const { current, changes } = collectPropsChanges(fiber);
      for (const [key, value] of Object.entries(current)) {
        propsData.current.push({
          name: key,
          value: isPromise(value) ? { type: "promise", displayValue: "Promise" } : value
        });
      }
      for (const change of changes) {
        const { hasChanged, count } = trackChange(
          propsTracker,
          change.name,
          change.value,
          change.prevValue
        );
        if (hasChanged) {
          hasNewChanges = true;
          propsData.changes.add(change.name);
          propsData.changesCounts.set(change.name, count);
        }
      }
    }
    const stateData = emptySection();
    const { current: stateCurrent, changes: stateChanges } = collectStateChanges(fiber);
    for (const [index, value] of Object.entries(stateCurrent)) {
      const stateKey = fiber.tag === ClassComponentTag ? index : Number(index);
      stateData.current.push({ name: stateKey, value });
    }
    for (const change of stateChanges) {
      const { hasChanged, count } = trackChange(
        stateTracker,
        change.name,
        change.value,
        change.prevValue
      );
      if (hasChanged) {
        hasNewChanges = true;
        stateData.changes.add(change.name);
        stateData.changesCounts.set(change.name, count);
      }
    }
    const contextData = emptySection();
    const { current: contextCurrent, changes: contextChanges } = collectContextChanges(fiber);
    for (const [name, value] of Object.entries(contextCurrent)) {
      contextData.current.push({ name, value });
    }
    if (!isInitialUpdate) {
      for (const change of contextChanges) {
        const { hasChanged, count } = trackChange(
          contextTracker,
          change.name,
          change.value,
          change.prevValue
        );
        if (hasChanged) {
          hasNewChanges = true;
          contextData.changes.add(change.name);
          contextData.changesCounts.set(change.name, count);
        }
      }
    }
    if (!hasNewChanges && !isInitialUpdate) {
      propsData.changes.clear();
      stateData.changes.clear();
      contextData.changes.clear();
    }
    return {
      data: {
        fiberProps: propsData,
        fiberState: stateData,
        fiberContext: contextData
      },
      shouldUpdate: hasNewChanges || isInitialUpdate
    };
  };
  var getAllFiberContexts = (fiber) => {
    const contexts = /* @__PURE__ */ new Map();
    if (!fiber) {
      return contexts;
    }
    let currentFiber = fiber;
    while (currentFiber) {
      const dependencies = currentFiber.dependencies;
      if (dependencies?.firstContext) {
        let contextItem = dependencies.firstContext;
        while (contextItem) {
          const memoizedValue = contextItem.memoizedValue;
          const displayName = contextItem.context?.displayName;
          if (!contexts.has(memoizedValue)) {
            contexts.set(contextItem.context, {
              value: memoizedValue,
              displayName: displayName ?? "UnnamedContext",
              contextType: null
            });
          }
          if (contextItem === contextItem.next) {
            break;
          }
          contextItem = contextItem.next;
        }
      }
      currentFiber = currentFiber.return;
    }
    return contexts;
  };

  // src/core/instrumentation.ts
  var fps = 0;
  var lastTime = performance.now();
  var frameCount = 0;
  var initedFps = false;
  var updateFPS = () => {
    frameCount++;
    const now = performance.now();
    if (now - lastTime >= 1e3) {
      fps = frameCount;
      frameCount = 0;
      lastTime = now;
    }
    requestAnimationFrame(updateFPS);
  };
  var getFPS = () => {
    if (!initedFps) {
      initedFps = true;
      updateFPS();
      fps = 60;
    }
    return fps;
  };
  var instrumentationInstances = /* @__PURE__ */ new Map();
  var inited = false;
  var getAllInstances = () => Array.from(instrumentationInstances.values());
  var createInstrumentation = (instanceKey, config) => {
    const instrumentation = {
      // this will typically be false, but in cases where a user provides showToolbar: true, this will be true
      isPaused: d3(!ReactScanInternals.options.value.enabled),
      fiberRoots: /* @__PURE__ */ new WeakSet()
    };
    instrumentationInstances.set(instanceKey, {
      key: instanceKey,
      config,
      instrumentation
    });
    if (!inited) {
      inited = true;
      instrument({
        name: "react-scan",
        onActive: config.onActive,
        onCommitFiberRoot(_rendererID, root) {
          instrumentation.fiberRoots.add(root);
          if (ReactScanInternals.instrumentation?.isPaused.value && (Store.inspectState.value.kind === "inspect-off" || Store.inspectState.value.kind === "uninitialized") && !config.forceAlwaysTrackRenders) {
            return;
          }
          const allInstances = getAllInstances();
          for (const instance of allInstances) {
            instance.config.onCommitStart();
          }
          traverseRenderedFibers(
            root.current,
            (fiber, phase) => {
              const type = getType(fiber.type);
              if (!type) return null;
              const allInstances2 = getAllInstances();
              const validInstancesIndicies = [];
              for (let i5 = 0, len = allInstances2.length; i5 < len; i5++) {
                const instance = allInstances2[i5];
                if (!instance.config.isValidFiber(fiber)) continue;
                validInstancesIndicies.push(i5);
              }
              if (!validInstancesIndicies.length) return null;
              const changes = [];
              if (allInstances2.some((instance) => instance.config.trackChanges)) {
                const changesProps = collectPropsChanges(fiber).changes;
                const changesState = collectStateChanges(fiber).changes;
                const changesContext = collectContextChanges(fiber).changes;
                changes.push.apply(
                  null,
                  changesProps.map(
                    (change) => ({
                      type: 1 /* Props */,
                      name: change.name,
                      value: change.value
                    })
                  )
                );
                for (const change of changesState) {
                  if (fiber.tag === ClassComponentTag) {
                    changes.push({
                      type: 3 /* ClassState */,
                      name: change.name.toString(),
                      value: change.value
                    });
                  } else {
                    changes.push({
                      type: 2 /* FunctionalState */,
                      name: change.name.toString(),
                      value: change.value
                    });
                  }
                }
                changes.push.apply(
                  null,
                  changesContext.map(
                    (change) => ({
                      type: 4 /* Context */,
                      name: change.name,
                      value: change.value,
                      contextType: Number(change.contextType)
                    })
                  )
                );
              }
              const { selfTime } = getTimings(fiber);
              const fps2 = getFPS();
              const render = {
                phase: RENDER_PHASE_STRING_TO_ENUM[phase],
                componentName: getDisplayName(type),
                count: 1,
                changes,
                time: selfTime,
                forget: hasMemoCache(fiber),
                // todo: allow this to be toggle-able through toolbar
                // todo: performance optimization: if the last fiber measure was very off screen, do not run isRenderUnnecessary
                unnecessary: null,
                didCommit: didFiberCommit(fiber),
                fps: fps2
              };
              for (let i5 = 0, len = validInstancesIndicies.length; i5 < len; i5++) {
                const index = validInstancesIndicies[i5];
                const instance = allInstances2[index];
                instance.config.onRender(fiber, [render]);
              }
            }
          );
          for (const instance of allInstances) {
            instance.config.onCommitFinish();
          }
        }
      });
    }
    return instrumentation;
  };

  // src/web/utils/log.ts
  var log = (renders) => {
    const logMap = /* @__PURE__ */ new Map();
    for (let i5 = 0, len = renders.length; i5 < len; i5++) {
      const render = renders[i5];
      if (!render.componentName) continue;
      const changeLog = logMap.get(render.componentName) ?? [];
      const labelText = getLabelText([
        {
          aggregatedCount: 1,
          computedKey: null,
          name: render.componentName,
          frame: null,
          ...render,
          changes: {
            // TODO(Alexis): use a faster reduction method
            type: render.changes.reduce((set, change) => set | change.type, 0),
            unstable: render.changes.some((change) => change.unstable)
          },
          phase: render.phase,
          computedCurrent: null
        }
      ]);
      if (!labelText) continue;
      let prevChangedProps = null;
      let nextChangedProps = null;
      if (render.changes) {
        for (let i6 = 0, len2 = render.changes.length; i6 < len2; i6++) {
          const { name, prevValue, nextValue, unstable, type } = render.changes[i6];
          if (type === 1 /* Props */) {
            prevChangedProps ??= {};
            nextChangedProps ??= {};
            prevChangedProps[`${unstable ? "\u26A0\uFE0F" : ""}${name} (prev)`] = prevValue;
            nextChangedProps[`${unstable ? "\u26A0\uFE0F" : ""}${name} (next)`] = nextValue;
          } else {
            changeLog.push({
              prev: prevValue,
              next: nextValue,
              type: type === 4 /* Context */ ? "context" : "state",
              unstable: unstable ?? false
            });
          }
        }
      }
      if (prevChangedProps && nextChangedProps) {
        changeLog.push({
          prev: prevChangedProps,
          next: nextChangedProps,
          type: "props",
          unstable: false
        });
      }
      logMap.set(labelText, changeLog);
    }
    for (const [name, changeLog] of Array.from(logMap.entries())) {
      console.group(
        `%c${name}`,
        "background: hsla(0,0%,70%,.3); border-radius:3px; padding: 0 2px;"
      );
      for (const { type, prev, next, unstable } of changeLog) {
        console.log(`${type}:`, unstable ? "\u26A0\uFE0F" : "", prev, "!==", next);
      }
      console.groupEnd();
    }
  };
  var logIntro = () => {
    console.log(
      "%c[\xB7] %cReact Scan",
      "font-weight:bold;color:#7a68e8;font-size:20px;",
      "font-weight:bold;font-size:14px;"
    );
    console.log(
      "Try React Scan Monitoring to target performance issues in production: https://react-scan.com/monitoring"
    );
  };

  // src/new-outlines/canvas.ts
  var OUTLINE_ARRAY_SIZE = 7;
  var MONO_FONT = "Menlo,Consolas,Monaco,Liberation Mono,Lucida Console,monospace";
  var INTERPOLATION_SPEED = 0.1;
  var lerp2 = (start2, end) => {
    return Math.floor(start2 + (end - start2) * INTERPOLATION_SPEED);
  };
  var MAX_PARTS_LENGTH = 4;
  var MAX_LABEL_LENGTH = 40;
  var TOTAL_FRAMES = 45;
  var primaryColor = "115,97,230";
  var getLabelText2 = (outlines) => {
    const nameByCount = /* @__PURE__ */ new Map();
    for (const outline of outlines) {
      const { name, count } = outline;
      nameByCount.set(name, (nameByCount.get(name) || 0) + count);
    }
    const countByNames = /* @__PURE__ */ new Map();
    for (const [name, count] of nameByCount.entries()) {
      const names = countByNames.get(count);
      if (names) {
        names.push(name);
      } else {
        countByNames.set(count, [name]);
      }
    }
    const partsEntries = Array.from(countByNames.entries()).sort(
      ([countA], [countB]) => countB - countA
    );
    const partsLength = partsEntries.length;
    let labelText = "";
    for (let i5 = 0; i5 < partsLength; i5++) {
      const [count, names] = partsEntries[i5];
      let part = `${names.slice(0, MAX_PARTS_LENGTH).join(", ")} \xD7${count}`;
      if (part.length > MAX_LABEL_LENGTH) {
        part = `${part.slice(0, MAX_LABEL_LENGTH)}\u2026`;
      }
      if (i5 !== partsLength - 1) {
        part += ", ";
      }
      labelText += part;
    }
    if (labelText.length > MAX_LABEL_LENGTH) {
      return `${labelText.slice(0, MAX_LABEL_LENGTH)}\u2026`;
    }
    return labelText;
  };
  var getAreaFromOutlines = (outlines) => {
    let area = 0;
    for (const outline of outlines) {
      area += outline.width * outline.height;
    }
    return area;
  };
  var updateOutlines = (activeOutlines2, outlines) => {
    for (const { id, name, count, x: x3, y: y4, width, height, didCommit } of outlines) {
      const outline = {
        id,
        name,
        count,
        x: x3,
        y: y4,
        width,
        height,
        frame: 0,
        targetX: x3,
        targetY: y4,
        targetWidth: width,
        targetHeight: height,
        didCommit
      };
      const key = String(outline.id);
      const existingOutline = activeOutlines2.get(key);
      if (existingOutline) {
        existingOutline.count++;
        existingOutline.frame = 0;
        existingOutline.targetX = x3;
        existingOutline.targetY = y4;
        existingOutline.targetWidth = width;
        existingOutline.targetHeight = height;
        existingOutline.didCommit = didCommit;
      } else {
        activeOutlines2.set(key, outline);
      }
    }
  };
  var updateScroll = (activeOutlines2, deltaX, deltaY) => {
    for (const outline of activeOutlines2.values()) {
      const newX = outline.x - deltaX;
      const newY = outline.y - deltaY;
      outline.targetX = newX;
      outline.targetY = newY;
    }
  };
  var initCanvas = (canvas2, dpr2) => {
    const ctx2 = canvas2.getContext("2d", { alpha: true });
    if (ctx2) {
      ctx2.scale(dpr2, dpr2);
    }
    return ctx2;
  };
  var drawCanvas = (ctx2, canvas2, dpr2, activeOutlines2) => {
    ctx2.clearRect(0, 0, canvas2.width / dpr2, canvas2.height / dpr2);
    const groupedOutlinesMap = /* @__PURE__ */ new Map();
    const rectMap = /* @__PURE__ */ new Map();
    for (const outline of activeOutlines2.values()) {
      const {
        x: x3,
        y: y4,
        width,
        height,
        targetX,
        targetY,
        targetWidth,
        targetHeight,
        frame
      } = outline;
      if (targetX !== x3) {
        outline.x = lerp2(x3, targetX);
      }
      if (targetY !== y4) {
        outline.y = lerp2(y4, targetY);
      }
      if (targetWidth !== width) {
        outline.width = lerp2(width, targetWidth);
      }
      if (targetHeight !== height) {
        outline.height = lerp2(height, targetHeight);
      }
      const labelKey = `${targetX ?? x3},${targetY ?? y4}`;
      const rectKey = `${labelKey},${targetWidth ?? width},${targetHeight ?? height}`;
      const outlines = groupedOutlinesMap.get(labelKey);
      if (outlines) {
        outlines.push(outline);
      } else {
        groupedOutlinesMap.set(labelKey, [outline]);
      }
      const alpha = 1 - frame / TOTAL_FRAMES;
      outline.frame++;
      const rect = rectMap.get(rectKey) || {
        x: x3,
        y: y4,
        width,
        height,
        alpha
      };
      if (alpha > rect.alpha) {
        rect.alpha = alpha;
      }
      rectMap.set(rectKey, rect);
    }
    for (const rect of rectMap.values()) {
      const { x: x3, y: y4, width, height, alpha } = rect;
      ctx2.strokeStyle = `rgba(${primaryColor},${alpha})`;
      ctx2.lineWidth = 1;
      ctx2.beginPath();
      ctx2.rect(x3, y4, width, height);
      ctx2.stroke();
      ctx2.fillStyle = `rgba(${primaryColor},${alpha * 0.1})`;
      ctx2.fill();
    }
    ctx2.font = `11px ${MONO_FONT}`;
    const labelMap = /* @__PURE__ */ new Map();
    ctx2.textRendering = "optimizeSpeed";
    for (const outlines of groupedOutlinesMap.values()) {
      const first = outlines[0];
      const { x: x3, y: y4, frame } = first;
      const alpha = 1 - frame / TOTAL_FRAMES;
      const text = getLabelText2(outlines);
      const { width } = ctx2.measureText(text);
      const height = 11;
      labelMap.set(`${x3},${y4},${width},${text}`, {
        text,
        width,
        height,
        alpha,
        x: x3,
        y: y4,
        outlines
      });
      if (frame > TOTAL_FRAMES) {
        for (const outline of outlines) {
          activeOutlines2.delete(String(outline.id));
        }
      }
    }
    const sortedLabels = Array.from(labelMap.entries()).sort(
      ([_5, a4], [__, b3]) => {
        return getAreaFromOutlines(b3.outlines) - getAreaFromOutlines(a4.outlines);
      }
    );
    for (const [labelKey, label] of sortedLabels) {
      if (!labelMap.has(labelKey)) continue;
      for (const [otherKey, otherLabel] of labelMap.entries()) {
        if (labelKey === otherKey) continue;
        const { x: x3, y: y4, width, height } = label;
        const {
          x: otherX,
          y: otherY,
          width: otherWidth,
          height: otherHeight
        } = otherLabel;
        if (x3 + width > otherX && otherX + otherWidth > x3 && y4 + height > otherY && otherY + otherHeight > y4) {
          label.text = getLabelText2([...label.outlines, ...otherLabel.outlines]);
          label.width = ctx2.measureText(label.text).width;
          labelMap.delete(otherKey);
        }
      }
    }
    for (const label of labelMap.values()) {
      const { x: x3, y: y4, alpha, width, height, text } = label;
      let labelY = y4 - height - 4;
      if (labelY < 0) {
        labelY = 0;
      }
      ctx2.fillStyle = `rgba(${primaryColor},${alpha})`;
      ctx2.fillRect(x3, labelY, width + 4, height + 4);
      ctx2.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx2.fillText(text, x3 + 2, labelY + height);
    }
    return activeOutlines2.size > 0;
  };

  // src/new-outlines/index.ts
  var workerCode = "\"use strict\";(()=>{var Y=\"Menlo,Consolas,Monaco,Liberation Mono,Lucida Console,monospace\";var C=(t,l)=>Math.floor(t+(l-t)*.1);var _=\"115,97,230\";var $=t=>{let l=new Map;for(let o of t){let{name:f,count:e}=o;l.set(f,(l.get(f)||0)+e)}let u=new Map;for(let[o,f]of l.entries()){let e=u.get(f);e?e.push(o):u.set(f,[o])}let m=Array.from(u.entries()).sort(([o],[f])=>f-o),s=m.length,i=\"\";for(let o=0;o<s;o++){let[f,e]=m[o],n=`${e.slice(0,4).join(\", \")} \\xD7${f}`;n.length>40&&(n=`${n.slice(0,40)}\\u2026`),o!==s-1&&(n+=\", \"),i+=n}return i.length>40?`${i.slice(0,40)}\\u2026`:i},S=t=>{let l=0;for(let u of t)l+=u.width*u.height;return l};var X=(t,l)=>{let u=t.getContext(\"2d\",{alpha:!0});return u&&u.scale(l,l),u},N=(t,l,u,m)=>{t.clearRect(0,0,l.width/u,l.height/u);let s=new Map,i=new Map;for(let e of m.values()){let{x:n,y:c,width:a,height:h,targetX:r,targetY:d,targetWidth:g,targetHeight:A,frame:x}=e;r!==n&&(e.x=C(n,r)),d!==c&&(e.y=C(c,d)),g!==a&&(e.width=C(a,g)),A!==h&&(e.height=C(h,A));let O=`${r??n},${d??c}`,y=`${O},${g??a},${A??h}`,R=s.get(O);R?R.push(e):s.set(O,[e]);let M=1-x/45;e.frame++;let E=i.get(y)||{x:n,y:c,width:a,height:h,alpha:M};M>E.alpha&&(E.alpha=M),i.set(y,E)}for(let e of i.values()){let{x:n,y:c,width:a,height:h,alpha:r}=e;t.strokeStyle=`rgba(${_},${r})`,t.lineWidth=1,t.beginPath(),t.rect(n,c,a,h),t.stroke(),t.fillStyle=`rgba(${_},${r*.1})`,t.fill()}t.font=`11px ${Y}`;let o=new Map;t.textRendering=\"optimizeSpeed\";for(let e of s.values()){let n=e[0],{x:c,y:a,frame:h}=n,r=1-h/45,d=$(e),{width:g}=t.measureText(d),A=11;o.set(`${c},${a},${g},${d}`,{text:d,width:g,height:A,alpha:r,x:c,y:a,outlines:e});let x=a-A-4;if(x<0&&(x=0),h>45)for(let O of e)m.delete(String(O.id))}let f=Array.from(o.entries()).sort(([e,n],[c,a])=>S(a.outlines)-S(n.outlines));for(let[e,n]of f)if(o.has(e))for(let[c,a]of o.entries()){if(e===c)continue;let{x:h,y:r,width:d,height:g}=n,{x:A,y:x,width:O,height:y}=a;h+d>A&&A+O>h&&r+g>x&&x+y>r&&(n.text=$([...n.outlines,...a.outlines]),n.width=t.measureText(n.text).width,o.delete(c))}for(let e of o.values()){let{x:n,y:c,alpha:a,width:h,height:r,text:d}=e,g=c-r-4;g<0&&(g=0),t.fillStyle=`rgba(${_},${a})`,t.fillRect(n,g,h+4,r+4),t.fillStyle=`rgba(255,255,255,${a})`,t.fillText(d,n+2,g+r)}return m.size>0};var p=null,w=null,b=1,L=new Map,T=null,v=()=>{if(!w||!p)return;N(w,p,b,L)?T=requestAnimationFrame(v):T=null};self.onmessage=t=>{let{type:l}=t.data;if(l===\"init\"&&(p=t.data.canvas,b=t.data.dpr,p&&(p.width=t.data.width,p.height=t.data.height,w=X(p,b))),!(!p||!w)){if(l===\"resize\"){b=t.data.dpr,p.width=t.data.width*b,p.height=t.data.height*b,w.resetTransform(),w.scale(b,b),v();return}if(l===\"draw-outlines\"){let{data:u,names:m}=t.data,s=new Float32Array(u);for(let i=0;i<s.length;i+=7){let o=s[i+2],f=s[i+3],e=s[i+4],n=s[i+5],c=s[i+6],a={id:s[i],name:m[i/7],count:s[i+1],x:o,y:f,width:e,height:n,frame:0,targetX:o,targetY:f,targetWidth:e,targetHeight:n,didCommit:c},h=String(a.id),r=L.get(h);r?(r.count++,r.frame=0,r.targetX=o,r.targetY=f,r.targetWidth=e,r.targetHeight=n,r.didCommit=c):L.set(h,a)}T||(T=requestAnimationFrame(v));return}if(l===\"scroll\"){let{deltaX:u,deltaY:m}=t.data;for(let s of L.values()){let i=s.x-u,o=s.y-m;s.targetX=i,s.targetY=o}}}};})();\n";
  var worker = null;
  var canvas = null;
  var ctx = null;
  var dpr = 1;
  var animationFrameId = null;
  var activeOutlines = /* @__PURE__ */ new Map();
  var blueprintMap = /* @__PURE__ */ new Map();
  var blueprintMapKeys = /* @__PURE__ */ new Set();
  var outlineFiber = (fiber) => {
    if (!isCompositeFiber(fiber)) return;
    const name = typeof fiber.type === "string" ? fiber.type : getDisplayName(fiber);
    if (!name) return;
    const blueprint = blueprintMap.get(fiber);
    const nearestFibers = getNearestHostFibers(fiber);
    const didCommit = didFiberCommit(fiber);
    if (!blueprint) {
      blueprintMap.set(fiber, {
        name,
        count: 1,
        elements: nearestFibers.map((fiber2) => fiber2.stateNode),
        didCommit: didCommit ? 1 : 0
      });
      blueprintMapKeys.add(fiber);
    } else {
      blueprint.count++;
    }
  };
  var mergeRects = (rects) => {
    const firstRect = rects[0];
    if (rects.length === 1) return firstRect;
    let minX;
    let minY;
    let maxX;
    let maxY;
    for (let i5 = 0, len = rects.length; i5 < len; i5++) {
      const rect = rects[i5];
      minX = minX == null ? rect.x : Math.min(minX, rect.x);
      minY = minY == null ? rect.y : Math.min(minY, rect.y);
      maxX = maxX == null ? rect.x + rect.width : Math.max(maxX, rect.x + rect.width);
      maxY = maxY == null ? rect.y + rect.height : Math.max(maxY, rect.y + rect.height);
    }
    if (minX == null || minY == null || maxX == null || maxY == null) {
      return rects[0];
    }
    return new DOMRect(minX, minY, maxX - minX, maxY - minY);
  };
  var getBatchedRectMap = async function* (elements) {
    const uniqueElements = new Set(elements);
    const seenElements = /* @__PURE__ */ new Set();
    let resolveNext = null;
    let done = false;
    const observer = new IntersectionObserver((entries) => {
      const newEntries = [];
      for (const entry of entries) {
        const element = entry.target;
        if (!seenElements.has(element)) {
          seenElements.add(element);
          newEntries.push(entry);
        }
      }
      if (newEntries.length > 0 && resolveNext) {
        resolveNext(newEntries);
        resolveNext = null;
      }
      if (seenElements.size === uniqueElements.size) {
        observer.disconnect();
        done = true;
        if (resolveNext) {
          resolveNext([]);
        }
      }
    });
    for (const element of uniqueElements) {
      observer.observe(element);
    }
    while (!done) {
      const entries = await new Promise(
        (resolve) => {
          resolveNext = resolve;
        }
      );
      if (entries.length > 0) {
        yield entries;
      }
    }
  };
  var SupportedArrayBuffer = typeof SharedArrayBuffer !== "undefined" ? SharedArrayBuffer : ArrayBuffer;
  var flushOutlines = async () => {
    const elements = [];
    for (const fiber of blueprintMapKeys) {
      const blueprint = blueprintMap.get(fiber);
      if (!blueprint) continue;
      for (let i5 = 0; i5 < blueprint.elements.length; i5++) {
        if (!(blueprint.elements[i5] instanceof Element)) {
          continue;
        }
        elements.push(blueprint.elements[i5]);
      }
    }
    const rectsMap = /* @__PURE__ */ new Map();
    for await (const entries of getBatchedRectMap(elements)) {
      for (const entry of entries) {
        const element = entry.target;
        const rect = entry.intersectionRect;
        if (entry.isIntersecting && rect.width && rect.height) {
          rectsMap.set(element, rect);
        }
      }
      const blueprints = [];
      const blueprintRects = [];
      const blueprintIds = [];
      for (const fiber of blueprintMapKeys) {
        const blueprint = blueprintMap.get(fiber);
        if (!blueprint) continue;
        const rects = [];
        for (let i5 = 0; i5 < blueprint.elements.length; i5++) {
          const element = blueprint.elements[i5];
          const rect = rectsMap.get(element);
          if (!rect) continue;
          rects.push(rect);
        }
        if (!rects.length) continue;
        blueprints.push(blueprint);
        blueprintRects.push(mergeRects(rects));
        blueprintIds.push(getFiberId(fiber));
      }
      if (blueprints.length > 0) {
        const arrayBuffer = new SupportedArrayBuffer(
          blueprints.length * OUTLINE_ARRAY_SIZE * 4
        );
        const sharedView = new Float32Array(arrayBuffer);
        const blueprintNames = new Array(blueprints.length);
        let outlineData;
        for (let i5 = 0, len = blueprints.length; i5 < len; i5++) {
          const blueprint = blueprints[i5];
          const id = blueprintIds[i5];
          const { x: x3, y: y4, width, height } = blueprintRects[i5];
          const { count, name, didCommit } = blueprint;
          if (worker) {
            const scaledIndex = i5 * OUTLINE_ARRAY_SIZE;
            sharedView[scaledIndex] = id;
            sharedView[scaledIndex + 1] = count;
            sharedView[scaledIndex + 2] = x3;
            sharedView[scaledIndex + 3] = y4;
            sharedView[scaledIndex + 4] = width;
            sharedView[scaledIndex + 5] = height;
            sharedView[scaledIndex + 6] = didCommit;
            blueprintNames[i5] = name;
          } else {
            outlineData ||= new Array(blueprints.length);
            outlineData[i5] = {
              id,
              name,
              count,
              x: x3,
              y: y4,
              width,
              height,
              didCommit
            };
          }
        }
        if (worker) {
          worker.postMessage({
            type: "draw-outlines",
            data: arrayBuffer,
            names: blueprintNames
          });
        } else if (canvas && ctx && outlineData) {
          updateOutlines(activeOutlines, outlineData);
          if (!animationFrameId) {
            animationFrameId = requestAnimationFrame(draw);
          }
        }
      }
    }
    for (const fiber of blueprintMapKeys) {
      blueprintMap.delete(fiber);
      blueprintMapKeys.delete(fiber);
    }
  };
  var draw = () => {
    if (!ctx || !canvas) return;
    const shouldContinue = drawCanvas(ctx, canvas, dpr, activeOutlines);
    if (shouldContinue) {
      animationFrameId = requestAnimationFrame(draw);
    } else {
      animationFrameId = null;
    }
  };
  var CANVAS_HTML_STR = `<canvas style="position:fixed;top:0;left:0;pointer-events:none;z-index:2147483646" aria-hidden="true"></canvas>`;
  var IS_OFFSCREEN_CANVAS_WORKER_SUPPORTED = typeof OffscreenCanvas !== "undefined" && typeof Worker !== "undefined";
  var getDpr = () => {
    return Math.min(window.devicePixelRatio || 1, 2);
  };
  var getCanvasEl = () => {
    cleanup();
    const host = document.createElement("div");
    host.setAttribute("data-react-scan", "true");
    const shadowRoot2 = host.attachShadow({ mode: "open" });
    shadowRoot2.innerHTML = CANVAS_HTML_STR;
    const canvasEl = shadowRoot2.firstChild;
    if (!canvasEl) return null;
    dpr = getDpr();
    canvas = canvasEl;
    const { innerWidth, innerHeight } = window;
    canvasEl.style.width = `${innerWidth}px`;
    canvasEl.style.height = `${innerHeight}px`;
    const width = innerWidth * dpr;
    const height = innerHeight * dpr;
    canvasEl.width = width;
    canvasEl.height = height;
    if (IS_OFFSCREEN_CANVAS_WORKER_SUPPORTED) {
      try {
        const useExtensionWorker = readLocalStorage("use-extension-worker");
        removeLocalStorage("use-extension-worker");
        if (useExtensionWorker) {
          worker = new Worker(
            URL.createObjectURL(
              new Blob([workerCode], { type: "application/javascript" })
            )
          );
          const offscreenCanvas = canvasEl.transferControlToOffscreen();
          worker?.postMessage(
            {
              type: "init",
              canvas: offscreenCanvas,
              width: canvasEl.width,
              height: canvasEl.height,
              dpr
            },
            [offscreenCanvas]
          );
        }
      } catch (e4) {
        console.warn("Failed to initialize OffscreenCanvas worker:", e4);
      }
    }
    if (!worker) {
      ctx = initCanvas(canvasEl, dpr);
    }
    let isResizeScheduled = false;
    window.addEventListener("resize", () => {
      if (!isResizeScheduled) {
        isResizeScheduled = true;
        setTimeout(() => {
          const width2 = window.innerWidth;
          const height2 = window.innerHeight;
          dpr = getDpr();
          canvasEl.style.width = `${width2}px`;
          canvasEl.style.height = `${height2}px`;
          if (worker) {
            worker.postMessage({
              type: "resize",
              width: width2,
              height: height2,
              dpr
            });
          } else {
            canvasEl.width = width2 * dpr;
            canvasEl.height = height2 * dpr;
            if (ctx) {
              ctx.resetTransform();
              ctx.scale(dpr, dpr);
            }
            draw();
          }
          isResizeScheduled = false;
        });
      }
    });
    let prevScrollX = window.scrollX;
    let prevScrollY = window.scrollY;
    let isScrollScheduled = false;
    window.addEventListener("scroll", () => {
      if (!isScrollScheduled) {
        isScrollScheduled = true;
        setTimeout(() => {
          const { scrollX, scrollY } = window;
          const deltaX = scrollX - prevScrollX;
          const deltaY = scrollY - prevScrollY;
          prevScrollX = scrollX;
          prevScrollY = scrollY;
          if (worker) {
            worker.postMessage({
              type: "scroll",
              deltaX,
              deltaY
            });
          } else {
            requestAnimationFrame(() => {
              updateScroll(activeOutlines, deltaX, deltaY);
            });
          }
          isScrollScheduled = false;
        }, 16 * 2);
      }
    });
    setInterval(() => {
      if (blueprintMapKeys.size) {
        requestAnimationFrame(() => {
          flushOutlines();
        });
      }
    }, 16 * 2);
    shadowRoot2.appendChild(canvasEl);
    return host;
  };
  var hasStopped = () => {
    return globalThis.__REACT_SCAN_STOP__;
  };
  var cleanup = () => {
    const host = document.querySelector("[data-react-scan]");
    if (host) {
      host.remove();
    }
  };
  var reportInterval;
  var startReportInterval = () => {
    clearInterval(reportInterval);
    reportInterval = setInterval(() => {
    }, 50);
  };
  var isValidFiber2 = (fiber) => {
    if (ignoredProps.has(fiber.memoizedProps)) {
      return false;
    }
    return true;
  };
  var initReactScanInstrumentation = () => {
    if (hasStopped()) return;
    const instrumentation = createInstrumentation("react-scan-devtools-0.1.0", {
      onCommitStart: () => {
        ReactScanInternals.options.value.onCommitStart?.();
      },
      onActive: () => {
        if (hasStopped()) return;
        const host = getCanvasEl();
        if (host) {
          document.documentElement.appendChild(host);
        }
        globalThis.__REACT_SCAN__ = {
          ReactScanInternals
        };
        startReportInterval();
        logIntro();
      },
      onError: () => {
      },
      isValidFiber: isValidFiber2,
      onRender: (fiber, renders) => {
        const isOverlayPaused = ReactScanInternals.instrumentation?.isPaused.value;
        const isInspectorInactive = Store.inspectState.value.kind === "inspect-off" || Store.inspectState.value.kind === "uninitialized";
        const shouldFullyAbort = isOverlayPaused && isInspectorInactive;
        if (shouldFullyAbort) {
          return;
        }
        if (!isOverlayPaused) {
          outlineFiber(fiber);
        }
        if (ReactScanInternals.options.value.log) {
          log(renders);
        }
        if (Store.inspectState.value.kind === "focused") {
          inspectorUpdateSignal.value = Date.now();
        }
        ReactScanInternals.options.value.onRender?.(fiber, renders);
      },
      onCommitFinish: () => {
        ReactScanInternals.options.value.onCommitFinish?.();
      },
      trackChanges: false
    });
    ReactScanInternals.instrumentation = instrumentation;
  };

  // src/web/assets/css/styles.css
  var styles_default = "*, ::before, ::after {\n  --tw-border-spacing-x: 0;\n  --tw-border-spacing-y: 0;\n  --tw-translate-x: 0;\n  --tw-translate-y: 0;\n  --tw-rotate: 0;\n  --tw-skew-x: 0;\n  --tw-skew-y: 0;\n  --tw-scale-x: 1;\n  --tw-scale-y: 1;\n  --tw-pan-x:  ;\n  --tw-pan-y:  ;\n  --tw-pinch-zoom:  ;\n  --tw-scroll-snap-strictness: proximity;\n  --tw-gradient-from-position:  ;\n  --tw-gradient-via-position:  ;\n  --tw-gradient-to-position:  ;\n  --tw-ordinal:  ;\n  --tw-slashed-zero:  ;\n  --tw-numeric-figure:  ;\n  --tw-numeric-spacing:  ;\n  --tw-numeric-fraction:  ;\n  --tw-ring-inset:  ;\n  --tw-ring-offset-width: 0px;\n  --tw-ring-offset-color: #fff;\n  --tw-ring-color: rgb(59 130 246 / 0.5);\n  --tw-ring-offset-shadow: 0 0 #0000;\n  --tw-ring-shadow: 0 0 #0000;\n  --tw-shadow: 0 0 #0000;\n  --tw-shadow-colored: 0 0 #0000;\n  --tw-blur:  ;\n  --tw-brightness:  ;\n  --tw-contrast:  ;\n  --tw-grayscale:  ;\n  --tw-hue-rotate:  ;\n  --tw-invert:  ;\n  --tw-saturate:  ;\n  --tw-sepia:  ;\n  --tw-drop-shadow:  ;\n  --tw-backdrop-blur:  ;\n  --tw-backdrop-brightness:  ;\n  --tw-backdrop-contrast:  ;\n  --tw-backdrop-grayscale:  ;\n  --tw-backdrop-hue-rotate:  ;\n  --tw-backdrop-invert:  ;\n  --tw-backdrop-opacity:  ;\n  --tw-backdrop-saturate:  ;\n  --tw-backdrop-sepia:  ;\n  --tw-contain-size:  ;\n  --tw-contain-layout:  ;\n  --tw-contain-paint:  ;\n  --tw-contain-style:  ;\n}\n\n::backdrop {\n  --tw-border-spacing-x: 0;\n  --tw-border-spacing-y: 0;\n  --tw-translate-x: 0;\n  --tw-translate-y: 0;\n  --tw-rotate: 0;\n  --tw-skew-x: 0;\n  --tw-skew-y: 0;\n  --tw-scale-x: 1;\n  --tw-scale-y: 1;\n  --tw-pan-x:  ;\n  --tw-pan-y:  ;\n  --tw-pinch-zoom:  ;\n  --tw-scroll-snap-strictness: proximity;\n  --tw-gradient-from-position:  ;\n  --tw-gradient-via-position:  ;\n  --tw-gradient-to-position:  ;\n  --tw-ordinal:  ;\n  --tw-slashed-zero:  ;\n  --tw-numeric-figure:  ;\n  --tw-numeric-spacing:  ;\n  --tw-numeric-fraction:  ;\n  --tw-ring-inset:  ;\n  --tw-ring-offset-width: 0px;\n  --tw-ring-offset-color: #fff;\n  --tw-ring-color: rgb(59 130 246 / 0.5);\n  --tw-ring-offset-shadow: 0 0 #0000;\n  --tw-ring-shadow: 0 0 #0000;\n  --tw-shadow: 0 0 #0000;\n  --tw-shadow-colored: 0 0 #0000;\n  --tw-blur:  ;\n  --tw-brightness:  ;\n  --tw-contrast:  ;\n  --tw-grayscale:  ;\n  --tw-hue-rotate:  ;\n  --tw-invert:  ;\n  --tw-saturate:  ;\n  --tw-sepia:  ;\n  --tw-drop-shadow:  ;\n  --tw-backdrop-blur:  ;\n  --tw-backdrop-brightness:  ;\n  --tw-backdrop-contrast:  ;\n  --tw-backdrop-grayscale:  ;\n  --tw-backdrop-hue-rotate:  ;\n  --tw-backdrop-invert:  ;\n  --tw-backdrop-opacity:  ;\n  --tw-backdrop-saturate:  ;\n  --tw-backdrop-sepia:  ;\n  --tw-contain-size:  ;\n  --tw-contain-layout:  ;\n  --tw-contain-paint:  ;\n  --tw-contain-style:  ;\n}/*\n! tailwindcss v3.4.17 | MIT License | https://tailwindcss.com\n*//*\n1. Prevent padding and border from affecting element width. (https://github.com/mozdevs/cssremedy/issues/4)\n2. Allow adding a border to an element by just adding a border-width. (https://github.com/tailwindcss/tailwindcss/pull/116)\n*/\n\n*,\n::before,\n::after {\n  box-sizing: border-box; /* 1 */\n  border-width: 0; /* 2 */\n  border-style: solid; /* 2 */\n  border-color: #e5e7eb; /* 2 */\n}\n\n::before,\n::after {\n  --tw-content: '';\n}\n\n/*\n1. Use a consistent sensible line-height in all browsers.\n2. Prevent adjustments of font size after orientation changes in iOS.\n3. Use a more readable tab size.\n4. Use the user's configured `sans` font-family by default.\n5. Use the user's configured `sans` font-feature-settings by default.\n6. Use the user's configured `sans` font-variation-settings by default.\n7. Disable tap highlights on iOS\n*/\n\nhtml,\n:host {\n  line-height: 1.5; /* 1 */\n  -webkit-text-size-adjust: 100%; /* 2 */\n  -moz-tab-size: 4; /* 3 */\n  -o-tab-size: 4;\n     tab-size: 4; /* 3 */\n  font-family: ui-sans-serif, system-ui, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\"; /* 4 */\n  font-feature-settings: normal; /* 5 */\n  font-variation-settings: normal; /* 6 */\n  -webkit-tap-highlight-color: transparent; /* 7 */\n}\n\n/*\n1. Remove the margin in all browsers.\n2. Inherit line-height from `html` so users can set them as a class directly on the `html` element.\n*/\n\nbody {\n  margin: 0; /* 1 */\n  line-height: inherit; /* 2 */\n}\n\n/*\n1. Add the correct height in Firefox.\n2. Correct the inheritance of border color in Firefox. (https://bugzilla.mozilla.org/show_bug.cgi?id=190655)\n3. Ensure horizontal rules are visible by default.\n*/\n\nhr {\n  height: 0; /* 1 */\n  color: inherit; /* 2 */\n  border-top-width: 1px; /* 3 */\n}\n\n/*\nAdd the correct text decoration in Chrome, Edge, and Safari.\n*/\n\nabbr:where([title]) {\n  -webkit-text-decoration: underline dotted;\n          text-decoration: underline dotted;\n}\n\n/*\nRemove the default font size and weight for headings.\n*/\n\nh1,\nh2,\nh3,\nh4,\nh5,\nh6 {\n  font-size: inherit;\n  font-weight: inherit;\n}\n\n/*\nReset links to optimize for opt-in styling instead of opt-out.\n*/\n\na {\n  color: inherit;\n  text-decoration: inherit;\n}\n\n/*\nAdd the correct font weight in Edge and Safari.\n*/\n\nb,\nstrong {\n  font-weight: bolder;\n}\n\n/*\n1. Use the user's configured `mono` font-family by default.\n2. Use the user's configured `mono` font-feature-settings by default.\n3. Use the user's configured `mono` font-variation-settings by default.\n4. Correct the odd `em` font sizing in all browsers.\n*/\n\ncode,\nkbd,\nsamp,\npre {\n  font-family: Menlo, Consolas, Monaco, Liberation Mono, Lucida Console, monospace; /* 1 */\n  font-feature-settings: normal; /* 2 */\n  font-variation-settings: normal; /* 3 */\n  font-size: 1em; /* 4 */\n}\n\n/*\nAdd the correct font size in all browsers.\n*/\n\nsmall {\n  font-size: 80%;\n}\n\n/*\nPrevent `sub` and `sup` elements from affecting the line height in all browsers.\n*/\n\nsub,\nsup {\n  font-size: 75%;\n  line-height: 0;\n  position: relative;\n  vertical-align: baseline;\n}\n\nsub {\n  bottom: -0.25em;\n}\n\nsup {\n  top: -0.5em;\n}\n\n/*\n1. Remove text indentation from table contents in Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=999088, https://bugs.webkit.org/show_bug.cgi?id=201297)\n2. Correct table border color inheritance in all Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=935729, https://bugs.webkit.org/show_bug.cgi?id=195016)\n3. Remove gaps between table borders by default.\n*/\n\ntable {\n  text-indent: 0; /* 1 */\n  border-color: inherit; /* 2 */\n  border-collapse: collapse; /* 3 */\n}\n\n/*\n1. Change the font styles in all browsers.\n2. Remove the margin in Firefox and Safari.\n3. Remove default padding in all browsers.\n*/\n\nbutton,\ninput,\noptgroup,\nselect,\ntextarea {\n  font-family: inherit; /* 1 */\n  font-feature-settings: inherit; /* 1 */\n  font-variation-settings: inherit; /* 1 */\n  font-size: 100%; /* 1 */\n  font-weight: inherit; /* 1 */\n  line-height: inherit; /* 1 */\n  letter-spacing: inherit; /* 1 */\n  color: inherit; /* 1 */\n  margin: 0; /* 2 */\n  padding: 0; /* 3 */\n}\n\n/*\nRemove the inheritance of text transform in Edge and Firefox.\n*/\n\nbutton,\nselect {\n  text-transform: none;\n}\n\n/*\n1. Correct the inability to style clickable types in iOS and Safari.\n2. Remove default button styles.\n*/\n\nbutton,\ninput:where([type='button']),\ninput:where([type='reset']),\ninput:where([type='submit']) {\n  -webkit-appearance: button; /* 1 */\n  background-color: transparent; /* 2 */\n  background-image: none; /* 2 */\n}\n\n/*\nUse the modern Firefox focus style for all focusable elements.\n*/\n\n:-moz-focusring {\n  outline: auto;\n}\n\n/*\nRemove the additional `:invalid` styles in Firefox. (https://github.com/mozilla/gecko-dev/blob/2f9eacd9d3d995c937b4251a5557d95d494c9be1/layout/style/res/forms.css#L728-L737)\n*/\n\n:-moz-ui-invalid {\n  box-shadow: none;\n}\n\n/*\nAdd the correct vertical alignment in Chrome and Firefox.\n*/\n\nprogress {\n  vertical-align: baseline;\n}\n\n/*\nCorrect the cursor style of increment and decrement buttons in Safari.\n*/\n\n::-webkit-inner-spin-button,\n::-webkit-outer-spin-button {\n  height: auto;\n}\n\n/*\n1. Correct the odd appearance in Chrome and Safari.\n2. Correct the outline style in Safari.\n*/\n\n[type='search'] {\n  -webkit-appearance: textfield; /* 1 */\n  outline-offset: -2px; /* 2 */\n}\n\n/*\nRemove the inner padding in Chrome and Safari on macOS.\n*/\n\n::-webkit-search-decoration {\n  -webkit-appearance: none;\n}\n\n/*\n1. Correct the inability to style clickable types in iOS and Safari.\n2. Change font properties to `inherit` in Safari.\n*/\n\n::-webkit-file-upload-button {\n  -webkit-appearance: button; /* 1 */\n  font: inherit; /* 2 */\n}\n\n/*\nAdd the correct display in Chrome and Safari.\n*/\n\nsummary {\n  display: list-item;\n}\n\n/*\nRemoves the default spacing and border for appropriate elements.\n*/\n\nblockquote,\ndl,\ndd,\nh1,\nh2,\nh3,\nh4,\nh5,\nh6,\nhr,\nfigure,\np,\npre {\n  margin: 0;\n}\n\nfieldset {\n  margin: 0;\n  padding: 0;\n}\n\nlegend {\n  padding: 0;\n}\n\nol,\nul,\nmenu {\n  list-style: none;\n  margin: 0;\n  padding: 0;\n}\n\n/*\nReset default styling for dialogs.\n*/\ndialog {\n  padding: 0;\n}\n\n/*\nPrevent resizing textareas horizontally by default.\n*/\n\ntextarea {\n  resize: vertical;\n}\n\n/*\n1. Reset the default placeholder opacity in Firefox. (https://github.com/tailwindlabs/tailwindcss/issues/3300)\n2. Set the default placeholder color to the user's configured gray 400 color.\n*/\n\ninput::-moz-placeholder, textarea::-moz-placeholder {\n  opacity: 1; /* 1 */\n  color: #9ca3af; /* 2 */\n}\n\ninput::placeholder,\ntextarea::placeholder {\n  opacity: 1; /* 1 */\n  color: #9ca3af; /* 2 */\n}\n\n/*\nSet the default cursor for buttons.\n*/\n\nbutton,\n[role=\"button\"] {\n  cursor: pointer;\n}\n\n/*\nMake sure disabled buttons don't get the pointer cursor.\n*/\n:disabled {\n  cursor: default;\n}\n\n/*\n1. Make replaced elements `display: block` by default. (https://github.com/mozdevs/cssremedy/issues/14)\n2. Add `vertical-align: middle` to align replaced elements more sensibly by default. (https://github.com/jensimmons/cssremedy/issues/14#issuecomment-634934210)\n   This can trigger a poorly considered lint error in some tools but is included by design.\n*/\n\nimg,\nsvg,\nvideo,\ncanvas,\naudio,\niframe,\nembed,\nobject {\n  display: block; /* 1 */\n  vertical-align: middle; /* 2 */\n}\n\n/*\nConstrain images and videos to the parent width and preserve their intrinsic aspect ratio. (https://github.com/mozdevs/cssremedy/issues/14)\n*/\n\nimg,\nvideo {\n  max-width: 100%;\n  height: auto;\n}\n\n/* Make elements with the HTML hidden attribute stay hidden by default */\n[hidden]:where(:not([hidden=\"until-found\"])) {\n  display: none;\n}\n.\\!container {\n  width: 100% !important;\n}\n.container {\n  width: 100%;\n}\n@media (min-width: 640px) {\n\n  .\\!container {\n    max-width: 640px !important;\n  }\n\n  .container {\n    max-width: 640px;\n  }\n}\n@media (min-width: 768px) {\n\n  .\\!container {\n    max-width: 768px !important;\n  }\n\n  .container {\n    max-width: 768px;\n  }\n}\n@media (min-width: 1024px) {\n\n  .\\!container {\n    max-width: 1024px !important;\n  }\n\n  .container {\n    max-width: 1024px;\n  }\n}\n@media (min-width: 1280px) {\n\n  .\\!container {\n    max-width: 1280px !important;\n  }\n\n  .container {\n    max-width: 1280px;\n  }\n}\n@media (min-width: 1536px) {\n\n  .\\!container {\n    max-width: 1536px !important;\n  }\n\n  .container {\n    max-width: 1536px;\n  }\n}\n.pointer-events-none {\n  pointer-events: none;\n}\n.pointer-events-auto {\n  pointer-events: auto;\n}\n.visible {\n  visibility: visible;\n}\n.static {\n  position: static;\n}\n.fixed {\n  position: fixed;\n}\n.absolute {\n  position: absolute;\n}\n.relative {\n  position: relative;\n}\n.sticky {\n  position: sticky;\n}\n.inset-0 {\n  inset: 0px;\n}\n.inset-x-1 {\n  left: 4px;\n  right: 4px;\n}\n.inset-y-0 {\n  top: 0px;\n  bottom: 0px;\n}\n.bottom-4 {\n  bottom: 16px;\n}\n.left-0 {\n  left: 0px;\n}\n.right-2 {\n  right: 8px;\n}\n.right-4 {\n  right: 16px;\n}\n.z-10 {\n  z-index: 10;\n}\n.z-50 {\n  z-index: 50;\n}\n.z-\\[124124124124\\] {\n  z-index: 124124124124;\n}\n.z-\\[214748365\\] {\n  z-index: 214748365;\n}\n.z-\\[214748367\\] {\n  z-index: 214748367;\n}\n.m-\\[2px\\] {\n  margin: 2px;\n}\n.\\!ml-0 {\n  margin-left: 0px !important;\n}\n.mb-1\\.5 {\n  margin-bottom: 6px;\n}\n.mb-2 {\n  margin-bottom: 8px;\n}\n.mb-3 {\n  margin-bottom: 12px;\n}\n.mb-4 {\n  margin-bottom: 16px;\n}\n.mb-px {\n  margin-bottom: 1px;\n}\n.ml-1 {\n  margin-left: 4px;\n}\n.ml-auto {\n  margin-left: auto;\n}\n.mr-1 {\n  margin-right: 4px;\n}\n.mr-auto {\n  margin-right: auto;\n}\n.mt-0\\.5 {\n  margin-top: 2px;\n}\n.mt-1 {\n  margin-top: 4px;\n}\n.mt-\\[1px\\] {\n  margin-top: 1px;\n}\n.block {\n  display: block;\n}\n.inline {\n  display: inline;\n}\n.flex {\n  display: flex;\n}\n.table {\n  display: table;\n}\n.hidden {\n  display: none;\n}\n.h-1\\.5 {\n  height: 6px;\n}\n.h-10 {\n  height: 40px;\n}\n.h-12 {\n  height: 48px;\n}\n.h-2\\.5 {\n  height: 10px;\n}\n.h-4 {\n  height: 16px;\n}\n.h-7 {\n  height: 28px;\n}\n.h-8 {\n  height: 32px;\n}\n.h-full {\n  height: 100%;\n}\n.h-screen {\n  height: 100vh;\n}\n.max-h-0 {\n  max-height: 0px;\n}\n.max-h-40 {\n  max-height: 160px;\n}\n.max-h-8 {\n  max-height: 32px;\n}\n.max-h-9 {\n  max-height: 36px;\n}\n.max-h-\\[\\\"auto\\\"\\] {\n  max-height: \"auto\";\n}\n.min-h-9 {\n  min-height: 36px;\n}\n.w-2\\.5 {\n  width: 10px;\n}\n.w-3 {\n  width: 12px;\n}\n.w-4 {\n  width: 16px;\n}\n.w-80 {\n  width: 320px;\n}\n.w-fit {\n  width: -moz-fit-content;\n  width: fit-content;\n}\n.w-full {\n  width: 100%;\n}\n.w-screen {\n  width: 100vw;\n}\n.min-w-fit {\n  min-width: -moz-fit-content;\n  min-width: fit-content;\n}\n.flex-1 {\n  flex: 1 1 0%;\n}\n.flex-\\[0_0_auto\\] {\n  flex: 0 0 auto;\n}\n.grow {\n  flex-grow: 1;\n}\n.-translate-y-\\[200\\%\\] {\n  --tw-translate-y: -200%;\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n.translate-y-0 {\n  --tw-translate-y: 0px;\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n.-rotate-90 {\n  --tw-rotate: -90deg;\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n.rotate-0 {\n  --tw-rotate: 0deg;\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n.rotate-90 {\n  --tw-rotate: 90deg;\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n.transform {\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n@keyframes fadeIn {\n\n  0% {\n    opacity: 0;\n  }\n\n  100% {\n    opacity: 1;\n  }\n}\n.animate-fade-in {\n  animation: fadeIn ease-in forwards;\n}\n.cursor-ew-resize {\n  cursor: ew-resize;\n}\n.cursor-move {\n  cursor: move;\n}\n.cursor-nesw-resize {\n  cursor: nesw-resize;\n}\n.cursor-ns-resize {\n  cursor: ns-resize;\n}\n.cursor-nwse-resize {\n  cursor: nwse-resize;\n}\n.cursor-pointer {\n  cursor: pointer;\n}\n.select-none {\n  -webkit-user-select: none;\n     -moz-user-select: none;\n          user-select: none;\n}\n.resize {\n  resize: both;\n}\n.appearance-none {\n  -webkit-appearance: none;\n     -moz-appearance: none;\n          appearance: none;\n}\n.flex-row-reverse {\n  flex-direction: row-reverse;\n}\n.flex-col {\n  flex-direction: column;\n}\n.flex-wrap {\n  flex-wrap: wrap;\n}\n.items-start {\n  align-items: flex-start;\n}\n.items-center {\n  align-items: center;\n}\n.items-stretch {\n  align-items: stretch;\n}\n.justify-end {\n  justify-content: flex-end;\n}\n.justify-center {\n  justify-content: center;\n}\n.gap-0\\.5 {\n  gap: 2px;\n}\n.gap-1 {\n  gap: 4px;\n}\n.gap-1\\.5 {\n  gap: 6px;\n}\n.gap-2 {\n  gap: 8px;\n}\n.gap-x-0\\.5 {\n  -moz-column-gap: 2px;\n       column-gap: 2px;\n}\n.gap-x-1 {\n  -moz-column-gap: 4px;\n       column-gap: 4px;\n}\n.gap-x-1\\.5 {\n  -moz-column-gap: 6px;\n       column-gap: 6px;\n}\n.gap-x-2 {\n  -moz-column-gap: 8px;\n       column-gap: 8px;\n}\n.gap-x-\\[6px\\] {\n  -moz-column-gap: 6px;\n       column-gap: 6px;\n}\n.gap-y-1 {\n  row-gap: 4px;\n}\n.gap-y-2 {\n  row-gap: 8px;\n}\n.space-y-1\\.5 > :not([hidden]) ~ :not([hidden]) {\n  --tw-space-y-reverse: 0;\n  margin-top: calc(6px * calc(1 - var(--tw-space-y-reverse)));\n  margin-bottom: calc(6px * var(--tw-space-y-reverse));\n}\n.overflow-auto {\n  overflow: auto;\n}\n.overflow-hidden {\n  overflow: hidden;\n}\n.\\!overflow-visible {\n  overflow: visible !important;\n}\n.overflow-y-auto {\n  overflow-y: auto;\n}\n.overflow-x-hidden {\n  overflow-x: hidden;\n}\n.truncate {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n.whitespace-nowrap {\n  white-space: nowrap;\n}\n.whitespace-pre-wrap {\n  white-space: pre-wrap;\n}\n.break-words {\n  overflow-wrap: break-word;\n}\n.break-all {\n  word-break: break-all;\n}\n.rounded {\n  border-radius: 4px;\n}\n.rounded-\\[2px\\] {\n  border-radius: 2px;\n}\n.rounded-lg {\n  border-radius: 8px;\n}\n.rounded-md {\n  border-radius: 6px;\n}\n.rounded-xl {\n  border-radius: 12px;\n}\n.rounded-t-lg {\n  border-top-left-radius: 8px;\n  border-top-right-radius: 8px;\n}\n.border {\n  border-width: 1px;\n}\n.border-4 {\n  border-width: 4px;\n}\n.border-b {\n  border-bottom-width: 1px;\n}\n.border-l-1 {\n  border-left-width: 1px;\n}\n.\\!border-red-500 {\n  --tw-border-opacity: 1 !important;\n  border-color: rgb(239 68 68 / var(--tw-border-opacity, 1)) !important;\n}\n.border-\\[\\#1e1e1e\\] {\n  --tw-border-opacity: 1;\n  border-color: rgb(30 30 30 / var(--tw-border-opacity, 1));\n}\n.border-\\[\\#333\\] {\n  --tw-border-opacity: 1;\n  border-color: rgb(51 51 51 / var(--tw-border-opacity, 1));\n}\n.border-transparent {\n  border-color: transparent;\n}\n.border-white\\/10 {\n  border-color: rgb(255 255 255 / 0.1);\n}\n.bg-\\[\\#0A0A0A\\] {\n  --tw-bg-opacity: 1;\n  background-color: rgb(10 10 10 / var(--tw-bg-opacity, 1));\n}\n.bg-\\[\\#1a2a1a\\] {\n  --tw-bg-opacity: 1;\n  background-color: rgb(26 42 26 / var(--tw-bg-opacity, 1));\n}\n.bg-\\[\\#1e1e1e\\] {\n  --tw-bg-opacity: 1;\n  background-color: rgb(30 30 30 / var(--tw-bg-opacity, 1));\n}\n.bg-\\[\\#2a1515\\] {\n  --tw-bg-opacity: 1;\n  background-color: rgb(42 21 21 / var(--tw-bg-opacity, 1));\n}\n.bg-\\[\\#5f3f9a\\] {\n  --tw-bg-opacity: 1;\n  background-color: rgb(95 63 154 / var(--tw-bg-opacity, 1));\n}\n.bg-\\[\\#5f3f9a\\]\\/40 {\n  background-color: rgb(95 63 154 / 0.4);\n}\n.bg-\\[\\#8e61e3\\] {\n  --tw-bg-opacity: 1;\n  background-color: rgb(142 97 227 / var(--tw-bg-opacity, 1));\n}\n.bg-black {\n  --tw-bg-opacity: 1;\n  background-color: rgb(0 0 0 / var(--tw-bg-opacity, 1));\n}\n.bg-black\\/40 {\n  background-color: rgb(0 0 0 / 0.4);\n}\n.bg-gray-200 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(229 231 235 / var(--tw-bg-opacity, 1));\n}\n.bg-neutral-600 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(82 82 82 / var(--tw-bg-opacity, 1));\n}\n.bg-neutral-700 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(64 64 64 / var(--tw-bg-opacity, 1));\n}\n.bg-purple-800 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(107 33 168 / var(--tw-bg-opacity, 1));\n}\n.bg-red-500 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(239 68 68 / var(--tw-bg-opacity, 1));\n}\n.bg-red-950\\/50 {\n  background-color: rgb(69 10 10 / 0.5);\n}\n.bg-transparent {\n  background-color: transparent;\n}\n.bg-yellow-300 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(253 224 71 / var(--tw-bg-opacity, 1));\n}\n.p-0 {\n  padding: 0px;\n}\n.p-1\\.5 {\n  padding: 6px;\n}\n.p-2 {\n  padding: 8px;\n}\n.p-3 {\n  padding: 12px;\n}\n.p-4 {\n  padding: 16px;\n}\n.p-6 {\n  padding: 24px;\n}\n.px-1 {\n  padding-left: 4px;\n  padding-right: 4px;\n}\n.px-1\\.5 {\n  padding-left: 6px;\n  padding-right: 6px;\n}\n.px-2 {\n  padding-left: 8px;\n  padding-right: 8px;\n}\n.px-3 {\n  padding-left: 12px;\n  padding-right: 12px;\n}\n.px-4 {\n  padding-left: 16px;\n  padding-right: 16px;\n}\n.py-0\\.5 {\n  padding-top: 2px;\n  padding-bottom: 2px;\n}\n.py-1\\.5 {\n  padding-top: 6px;\n  padding-bottom: 6px;\n}\n.py-2 {\n  padding-top: 8px;\n  padding-bottom: 8px;\n}\n.py-\\[1px\\] {\n  padding-top: 1px;\n  padding-bottom: 1px;\n}\n.py-\\[3px\\] {\n  padding-top: 3px;\n  padding-bottom: 3px;\n}\n.pb-2 {\n  padding-bottom: 8px;\n}\n.pl-2 {\n  padding-left: 8px;\n}\n.pl-3 {\n  padding-left: 12px;\n}\n.pl-9 {\n  padding-left: 36px;\n}\n.pr-2 {\n  padding-right: 8px;\n}\n.text-left {\n  text-align: left;\n}\n.font-mono {\n  font-family: Menlo, Consolas, Monaco, Liberation Mono, Lucida Console, monospace;\n}\n.text-\\[10px\\] {\n  font-size: 10px;\n}\n.text-\\[13px\\] {\n  font-size: 13px;\n}\n.text-sm {\n  font-size: 14px;\n  line-height: 20px;\n}\n.text-xs {\n  font-size: 12px;\n  line-height: 16px;\n}\n.text-xxs {\n  font-size: 8px;\n}\n.font-medium {\n  font-weight: 500;\n}\n.uppercase {\n  text-transform: uppercase;\n}\n.lowercase {\n  text-transform: lowercase;\n}\n.capitalize {\n  text-transform: capitalize;\n}\n.italic {\n  font-style: italic;\n}\n.tracking-wide {\n  letter-spacing: 0.025em;\n}\n.text-\\[\\#4ade80\\] {\n  --tw-text-opacity: 1;\n  color: rgb(74 222 128 / var(--tw-text-opacity, 1));\n}\n.text-\\[\\#666\\] {\n  --tw-text-opacity: 1;\n  color: rgb(102 102 102 / var(--tw-text-opacity, 1));\n}\n.text-\\[\\#888\\] {\n  --tw-text-opacity: 1;\n  color: rgb(136 136 136 / var(--tw-text-opacity, 1));\n}\n.text-\\[\\#A855F7\\] {\n  --tw-text-opacity: 1;\n  color: rgb(168 85 247 / var(--tw-text-opacity, 1));\n}\n.text-\\[\\#f87171\\] {\n  --tw-text-opacity: 1;\n  color: rgb(248 113 113 / var(--tw-text-opacity, 1));\n}\n.text-black {\n  --tw-text-opacity: 1;\n  color: rgb(0 0 0 / var(--tw-text-opacity, 1));\n}\n.text-gray-500 {\n  --tw-text-opacity: 1;\n  color: rgb(107 114 128 / var(--tw-text-opacity, 1));\n}\n.text-green-500 {\n  --tw-text-opacity: 1;\n  color: rgb(34 197 94 / var(--tw-text-opacity, 1));\n}\n.text-inspect {\n  --tw-text-opacity: 1;\n  color: rgb(142 97 227 / var(--tw-text-opacity, 1));\n}\n.text-neutral-300 {\n  --tw-text-opacity: 1;\n  color: rgb(212 212 212 / var(--tw-text-opacity, 1));\n}\n.text-neutral-400 {\n  --tw-text-opacity: 1;\n  color: rgb(163 163 163 / var(--tw-text-opacity, 1));\n}\n.text-neutral-500 {\n  --tw-text-opacity: 1;\n  color: rgb(115 115 115 / var(--tw-text-opacity, 1));\n}\n.text-purple-400 {\n  --tw-text-opacity: 1;\n  color: rgb(192 132 252 / var(--tw-text-opacity, 1));\n}\n.text-red-300 {\n  --tw-text-opacity: 1;\n  color: rgb(252 165 165 / var(--tw-text-opacity, 1));\n}\n.text-red-400 {\n  --tw-text-opacity: 1;\n  color: rgb(248 113 113 / var(--tw-text-opacity, 1));\n}\n.text-red-500 {\n  --tw-text-opacity: 1;\n  color: rgb(239 68 68 / var(--tw-text-opacity, 1));\n}\n.text-white {\n  --tw-text-opacity: 1;\n  color: rgb(255 255 255 / var(--tw-text-opacity, 1));\n}\n.text-yellow-300 {\n  --tw-text-opacity: 1;\n  color: rgb(253 224 71 / var(--tw-text-opacity, 1));\n}\n.text-yellow-500 {\n  --tw-text-opacity: 1;\n  color: rgb(234 179 8 / var(--tw-text-opacity, 1));\n}\n.opacity-0 {\n  opacity: 0;\n}\n.opacity-100 {\n  opacity: 1;\n}\n.opacity-50 {\n  opacity: 0.5;\n}\n.\\!shadow {\n  --tw-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1) !important;\n  --tw-shadow-colored: 0 1px 3px 0 var(--tw-shadow-color), 0 1px 2px -1px var(--tw-shadow-color) !important;\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow) !important;\n}\n.shadow {\n  --tw-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);\n  --tw-shadow-colored: 0 1px 3px 0 var(--tw-shadow-color), 0 1px 2px -1px var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n.shadow-lg {\n  --tw-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);\n  --tw-shadow-colored: 0 10px 15px -3px var(--tw-shadow-color), 0 4px 6px -4px var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n.outline {\n  outline-style: solid;\n}\n.blur {\n  --tw-blur: blur(8px);\n  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);\n}\n.\\!filter {\n  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow) !important;\n}\n.filter {\n  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);\n}\n.backdrop-blur-sm {\n  --tw-backdrop-blur: blur(4px);\n  -webkit-backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);\n  backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);\n}\n.transition {\n  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter;\n  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;\n  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter, -webkit-backdrop-filter;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 150ms;\n}\n.transition-\\[border-radius\\] {\n  transition-property: border-radius;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 150ms;\n}\n.transition-\\[max-height\\] {\n  transition-property: max-height;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 150ms;\n}\n.transition-\\[opacity\\] {\n  transition-property: opacity;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 150ms;\n}\n.transition-\\[transform\\2c color\\] {\n  transition-property: transform,color;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 150ms;\n}\n.transition-all {\n  transition-property: all;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 150ms;\n}\n.transition-colors {\n  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 150ms;\n}\n.transition-opacity {\n  transition-property: opacity;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 150ms;\n}\n.transition-transform {\n  transition-property: transform;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 150ms;\n}\n.delay-0 {\n  transition-delay: 0s;\n}\n.delay-150 {\n  transition-delay: 150ms;\n}\n.delay-300 {\n  transition-delay: 300ms;\n}\n.duration-0 {\n  transition-duration: 0s;\n}\n.duration-200 {\n  transition-duration: 200ms;\n}\n.duration-300 {\n  transition-duration: 300ms;\n}\n.ease-\\[cubic-bezier\\(0\\.25\\2c 0\\.1\\2c 0\\.25\\2c 1\\)\\] {\n  transition-timing-function: cubic-bezier(0.25,0.1,0.25,1);\n}\n.ease-in-out {\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n}\n.ease-out {\n  transition-timing-function: cubic-bezier(0, 0, 0.2, 1);\n}\n.will-change-transform {\n  will-change: transform;\n}\n.animation-duration-300 {\n  animation-duration: .3s;\n}\n.animation-delay-300 {\n  animation-delay: .3s;\n}\n\n* {\n  outline: none !important;\n  text-rendering: optimizeLegibility;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  backface-visibility: hidden;\n\n  /* WebKit (Chrome, Safari, Edge) specific scrollbar styles */\n  &::-webkit-scrollbar {\n    width: 6px;\n    height: 6px;\n  }\n\n  &::-webkit-scrollbar-track {\n    border-radius: 10px;\n    background: transparent;\n  }\n\n  &::-webkit-scrollbar-thumb {\n    border-radius: 10px;\n    background: rgba(255, 255, 255, 0.3);\n  }\n\n  &::-webkit-scrollbar-thumb:hover {\n    background: rgba(255, 255, 255, .4);\n  }\n\n  &::-webkit-scrollbar-corner {\n    background: transparent;\n  }\n}\n\n@-moz-document url-prefix() {\n  * {\n    scrollbar-width: thin;\n    scrollbar-color: rgba(255, 255, 255, 0.4) transparent;\n    scrollbar-width: 6px;\n  }\n}\n\n\nbutton:hover {\n  background-image: none;\n}\n\n\nbutton {\n  outline: 2px solid transparent;\n  outline-offset: 2px;\n  border-style: none;\n  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 150ms;\n  transition-timing-function: linear;\n  cursor: pointer;\n}\n\ninput {\n  border-style: none;\n  background-color: transparent;\n  background-image: none;\n  outline: 2px solid transparent;\n  outline-offset: 2px;\n}\n\ninput::-moz-placeholder {\n  font-size: 12px;\n  line-height: 16px;\n  font-style: italic;\n  --tw-text-opacity: 1;\n  color: rgb(115 115 115 / var(--tw-text-opacity, 1));\n}\n\ninput::placeholder {\n  font-size: 12px;\n  line-height: 16px;\n  font-style: italic;\n  --tw-text-opacity: 1;\n  color: rgb(115 115 115 / var(--tw-text-opacity, 1));\n}\n\ninput:-moz-placeholder-shown {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\ninput:placeholder-shown {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\nsvg {\n  height: auto;\n  width: auto;\n  pointer-events: none;\n}\n\n/*\n  Using CSS content with data attributes is more performant than:\n  1. React re-renders with JSX text content\n  2. Direct DOM manipulation methods:\n     - element.textContent (creates/updates text nodes, triggers repaint)\n     - element.innerText (triggers reflow by computing styles & layout)\n     - element.innerHTML (heavy parsing, triggers reflow, security risks)\n  3. Multiple data attributes with complex CSS concatenation\n\n  This approach:\n  - Avoids React reconciliation\n  - Uses browser's native CSS engine (optimized content updates)\n  - Minimizes main thread work\n  - Reduces DOM operations\n  - Avoids forced reflows (layout recalculation)\n  - Only triggers necessary repaints\n  - Keeps pseudo-element updates in render layer\n*/\n.with-data-text {\n  overflow: hidden;\n  &::before {\n    content: attr(data-text);\n  }\n  &::before {\n    display: block;\n  }\n  &::before {\n    overflow: hidden;\n    text-overflow: ellipsis;\n    white-space: nowrap;\n  }\n}\n\n#react-scan-toolbar {\n  position: fixed;\n  left: 0px;\n  top: 0px;\n  display: flex;\n  flex-direction: column;\n  border-radius: 8px;\n  --tw-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);\n  --tw-shadow-colored: 0 10px 15px -3px var(--tw-shadow-color), 0 4px 6px -4px var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n  font-family: Menlo, Consolas, Monaco, Liberation Mono, Lucida Console, monospace;\n  font-size: 13px;\n  --tw-text-opacity: 1;\n  color: rgb(255 255 255 / var(--tw-text-opacity, 1));\n  --tw-bg-opacity: 1;\n  background-color: rgb(0 0 0 / var(--tw-bg-opacity, 1));\n  -webkit-user-select: none;\n     -moz-user-select: none;\n          user-select: none;\n  cursor: move;\n  opacity: 0;\n  z-index: 2147483678;\n}\n\n@keyframes fadeIn {\n\n  0% {\n    opacity: 0;\n  }\n\n  100% {\n    opacity: 1;\n  }\n}\n\n#react-scan-toolbar {\n  animation: fadeIn ease-in forwards;\n  animation-duration: .3s;\n  animation-delay: .3s;\n  --tw-shadow: 0 4px 12px rgba(0,0,0,0.2);\n  --tw-shadow-colored: 0 4px 12px var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n  place-self: start;\n}\n\n.button {\n  &:hover {\n    background: rgba(255, 255, 255, 0.1);\n  }\n\n  &:active {\n    background: rgba(255, 255, 255, 0.15);\n  }\n}\n\n.resize-line-wrapper {\n  position: absolute;\n  overflow: hidden;\n}\n\n.resize-line {\n  position: absolute;\n  inset: 0px;\n  overflow: hidden;\n  --tw-bg-opacity: 1;\n  background-color: rgb(0 0 0 / var(--tw-bg-opacity, 1));\n  transition-property: all;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 150ms;\n\n  svg {\n    position: absolute;\n  }\n\n  svg {\n    top: 50%;\n  }\n\n  svg {\n    left: 50%;\n  }\n\n  svg {\n    --tw-translate-x: -50%;\n    transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n  }\n\n  svg {\n    --tw-translate-y: -50%;\n    transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n  }\n}\n\n.resize-right,\n.resize-left {\n  top: 0px;\n  bottom: 0px;\n  width: 24px;\n  cursor: ew-resize;\n\n  .resize-line-wrapper {\n    top: 0px;\n    bottom: 0px;\n  }\n\n  .resize-line-wrapper {\n    width: 50%;\n  }\n\n  &:hover {\n    .resize-line {\n      --tw-translate-x: 0px;\n      transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n    }\n  }\n}\n.resize-right {\n  right: 0px;\n  --tw-translate-x: 50%;\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n\n  .resize-line-wrapper {\n    right: 0px;\n  }\n  .resize-line {\n    border-top-right-radius: 8px;\n    border-bottom-right-radius: 8px;\n  }\n  .resize-line {\n    --tw-translate-x: -100%;\n    transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n  }\n}\n\n.resize-left {\n  left: 0px;\n  --tw-translate-x: -50%;\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n\n  .resize-line-wrapper {\n    left: 0px;\n  }\n  .resize-line {\n    border-top-left-radius: 8px;\n    border-bottom-left-radius: 8px;\n  }\n  .resize-line {\n    --tw-translate-x: 100%;\n    transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n  }\n}\n\n.resize-top,\n.resize-bottom {\n  left: 0px;\n  right: 0px;\n  height: 24px;\n  cursor: ns-resize;\n\n  .resize-line-wrapper {\n    left: 0px;\n    right: 0px;\n  }\n\n  .resize-line-wrapper {\n    height: 50%;\n  }\n\n  &:hover {\n    .resize-line {\n      --tw-translate-y: 0px;\n      transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n    }\n  }\n}\n.resize-top {\n  top: 0px;\n  --tw-translate-y: -50%;\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n\n  .resize-line-wrapper {\n    top: 0px;\n  }\n  .resize-line {\n    border-top-left-radius: 8px;\n    border-top-right-radius: 8px;\n  }\n  .resize-line {\n    --tw-translate-y: 100%;\n    transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n  }\n}\n\n.resize-bottom {\n  bottom: 0px;\n  --tw-translate-y: 50%;\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n\n  .resize-line-wrapper {\n    bottom: 0px;\n  }\n  .resize-line {\n    border-bottom-right-radius: 8px;\n    border-bottom-left-radius: 8px;\n  }\n  .resize-line {\n    --tw-translate-y: -100%;\n    transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n  }\n}\n\n.react-scan-header {\n  display: flex;\n  align-items: center;\n  -moz-column-gap: 8px;\n       column-gap: 8px;\n  padding-left: 12px;\n  padding-right: 8px;\n  min-height: 36px;\n  border-bottom-width: 1px;\n  border-color: rgb(255 255 255 / 0.1);\n  overflow: hidden;\n  white-space: nowrap;\n}\n\n.react-scan-replay-button,\n.react-scan-close-button {\n  display: flex;\n  align-items: center;\n  padding: 4px;\n  min-width: -moz-fit-content;\n  min-width: fit-content;\n  border-radius: 4px;\n  transition-property: all;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 300ms;\n}\n\n.react-scan-replay-button {\n  position: relative;\n  overflow: hidden;\n  background-color: rgb(168 85 247 / 0.5) !important;\n\n  &:hover {\n    background-color: rgb(168 85 247 / 0.25);\n  }\n\n  &.disabled {\n    opacity: 0.5;\n  }\n\n  &.disabled {\n    pointer-events: none;\n  }\n\n  &:before {\n    content: '';\n  }\n\n  &:before {\n    position: absolute;\n  }\n\n  &:before {\n    inset: 0px;\n  }\n\n  &:before {\n    --tw-translate-x: -100%;\n    transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n  }\n\n  &:before {\n    animation: shimmer 2s infinite;\n    background: linear-gradient(to right,\n      transparent,\n      rgba(142, 97, 227, 0.3),\n      transparent);\n  }\n}\n\n.react-scan-close-button {\n  background-color: rgb(255 255 255 / 0.1);\n\n  &:hover {\n    background-color: rgb(255 255 255 / 0.15);\n  }\n}\n\n@keyframes shimmer {\n  100% {\n    --tw-translate-x: 100%;\n    transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n  }\n}\n\n.react-section-header {\n  position: sticky;\n  z-index: 100;\n  display: flex;\n  align-items: center;\n  -moz-column-gap: 8px;\n       column-gap: 8px;\n  padding-left: 12px;\n  padding-right: 12px;\n  height: 32px;\n  width: 100%;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  --tw-text-opacity: 1;\n  color: rgb(136 136 136 / var(--tw-text-opacity, 1));\n  border-bottom-width: 1px;\n  --tw-border-opacity: 1;\n  border-color: rgb(34 34 34 / var(--tw-border-opacity, 1));\n  --tw-bg-opacity: 1;\n  background-color: rgb(10 10 10 / var(--tw-bg-opacity, 1));\n}\n\n.react-scan-section {\n  display: flex;\n  flex-direction: column;\n  padding-left: 8px;\n  padding-right: 8px;\n  --tw-text-opacity: 1;\n  color: rgb(136 136 136 / var(--tw-text-opacity, 1));\n}\n\n.react-scan-section::before {\n  --tw-text-opacity: 1;\n  color: rgb(107 114 128 / var(--tw-text-opacity, 1));\n  --tw-content: attr(data-section);\n  content: var(--tw-content);\n}\n\n.react-scan-section {\n  font-size: 12px;\n  line-height: 16px;\n\n  > .react-scan-property {\n    margin-left: -14px;\n  }\n}\n\n.react-scan-property {\n  position: relative;\n  display: flex;\n  flex-direction: column;\n  padding-left: 32px;\n  border-left-width: 1px;\n  border-color: transparent;\n  overflow: hidden;\n}\n\n.react-scan-property-content {\n  display: flex;\n  flex: 1 1 0%;\n  flex-direction: column;\n  min-height: 24px;\n  padding-top: 4px;\n  padding-bottom: 4px;\n  max-width: 100%;\n  overflow: hidden;\n}\n\n.react-scan-string {\n  color: #9ecbff;\n}\n\n.react-scan-number {\n  color: #79c7ff;\n}\n\n.react-scan-boolean {\n  color: #56b6c2;\n}\n\n.react-scan-key {\n  width: -moz-fit-content;\n  width: fit-content;\n  max-width: 240px;\n  white-space: nowrap;\n  --tw-text-opacity: 1;\n  color: rgb(255 255 255 / var(--tw-text-opacity, 1));\n}\n\n.react-scan-input {\n  --tw-text-opacity: 1;\n  color: rgb(255 255 255 / var(--tw-text-opacity, 1));\n  --tw-bg-opacity: 1;\n  background-color: rgb(0 0 0 / var(--tw-bg-opacity, 1));\n}\n\n@keyframes blink {\n  from {\n    opacity: 1;\n  }\n  to {\n    opacity: 0;\n  }\n}\n\n.react-scan-arrow {\n  position: absolute;\n  top: 4px;\n  left: 28px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  cursor: pointer;\n  height: 24px;\n  width: 24px;\n  --tw-translate-x: -100%;\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n  z-index: 10;\n\n  > svg {\n    transition-property: transform;\n    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n    transition-duration: 150ms;\n  }\n}\n\n.react-scan-expandable {\n  display: grid;\n  grid-template-rows: 0fr;\n  transition-property: all;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 75ms;\n\n  &.react-scan-expanded {\n    grid-template-rows: 1fr;\n  }\n\n  &.react-scan-expanded {\n    transition-duration: 100ms;\n  }\n}\n\n.react-scan-nested {\n  position: relative;\n  overflow: hidden;\n\n  &:before {\n    content: '';\n  }\n\n  &:before {\n    position: absolute;\n  }\n\n  &:before {\n    top: 0px;\n  }\n\n  &:before {\n    left: 0px;\n  }\n\n  &:before {\n    height: 100%;\n  }\n\n  &:before {\n    width: 1px;\n  }\n\n  &:before {\n    background-color: rgb(107 114 128 / 0.3);\n  }\n}\n\n.react-scan-settings {\n  position: absolute;\n  inset: 0px;\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n  padding-top: 8px;\n  padding-bottom: 8px;\n  padding-left: 16px;\n  padding-right: 16px;\n  --tw-text-opacity: 1;\n  color: rgb(136 136 136 / var(--tw-text-opacity, 1));\n\n  >div {\n    display: flex;\n  }\n\n  >div {\n    align-items: center;\n  }\n\n  >div {\n    justify-content: space-between;\n  }\n\n  >div {\n    transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;\n    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n    transition-duration: 150ms;\n  }\n\n  >div {\n    transition-duration: 300ms;\n  }\n}\n\n.react-scan-preview-line {\n  position: relative;\n  display: flex;\n  min-height: 24px;\n  align-items: center;\n  -moz-column-gap: 8px;\n       column-gap: 8px;\n}\n\n.react-scan-flash-overlay {\n  position: absolute;\n  inset: 0px;\n  opacity: 0;\n  z-index: 50;\n  pointer-events: none;\n  transition-property: opacity;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 150ms;\n  mix-blend-mode: multiply;\n  background-color: rgb(168 85 247 / 0.9);\n}\n\n.react-scan-toggle {\n  position: relative;\n  display: inline-block;\n  height: 24px;\n  width: 40px;\n\n  input {\n    position: absolute;\n  }\n\n  input {\n    inset: 0px;\n  }\n\n  input {\n    z-index: 20;\n  }\n\n  input {\n    opacity: 0;\n  }\n\n  input {\n    cursor: pointer;\n  }\n\n  input:checked {\n    +div {\n      --tw-bg-opacity: 1;\n      background-color: rgb(95 63 154 / var(--tw-bg-opacity, 1));\n    }\n    +div {\n\n      &::before {\n        --tw-translate-x: 100%;\n        transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n      }\n\n      &::before {\n        left: auto;\n      }\n\n      &::before {\n        --tw-border-opacity: 1;\n        border-color: rgb(95 63 154 / var(--tw-border-opacity, 1));\n      }\n    }\n  }\n\n  >div {\n    position: absolute;\n  }\n\n  >div {\n    inset: 4px;\n  }\n\n  >div {\n    --tw-bg-opacity: 1;\n    background-color: rgb(64 64 64 / var(--tw-bg-opacity, 1));\n  }\n\n  >div {\n    border-radius: 9999px;\n  }\n\n  >div {\n    pointer-events: none;\n  }\n\n  >div {\n    transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;\n    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n    transition-duration: 150ms;\n  }\n\n  >div {\n    transition-duration: 300ms;\n  }\n\n  >div {\n\n    &:before {\n      --tw-content: '';\n      content: var(--tw-content);\n    }\n\n    &:before {\n      position: absolute;\n    }\n\n    &:before {\n      top: 50%;\n    }\n\n    &:before {\n      left: 0px;\n    }\n\n    &:before {\n      --tw-translate-y: -50%;\n      transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n    }\n\n    &:before {\n      height: 16px;\n    }\n\n    &:before {\n      width: 16px;\n    }\n\n    &:before {\n      --tw-bg-opacity: 1;\n      background-color: rgb(255 255 255 / var(--tw-bg-opacity, 1));\n    }\n\n    &:before {\n      border-width: 2px;\n    }\n\n    &:before {\n      --tw-border-opacity: 1;\n      border-color: rgb(64 64 64 / var(--tw-border-opacity, 1));\n    }\n\n    &:before {\n      border-radius: 9999px;\n    }\n\n    &:before {\n      --tw-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);\n      --tw-shadow-colored: 0 1px 2px 0 var(--tw-shadow-color);\n      box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n    }\n\n    &:before {\n      transition-property: all;\n      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n      transition-duration: 150ms;\n    }\n\n    &:before {\n      transition-duration: 300ms;\n    }\n  }\n}\n\n.react-scan-flash-active {\n  opacity: 0.4;\n  transition-property: opacity;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 300ms;\n}\n\n.react-scan-inspector-overlay {\n  display: flex;\n  flex-direction: column;\n  opacity: 0;\n  transition-property: opacity;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 300ms;\n\n  &.fade-out {\n    opacity: 0;\n  }\n\n  &.fade-in {\n    opacity: 1;\n  }\n}\n\n.react-scan-what-changed {\n  ul {\n    list-style-type: disc;\n  }\n  ul {\n    padding-left: 16px;\n  }\n\n  li {\n    white-space: nowrap;\n  }\n\n  li {\n    > div {\n      display: flex;\n    }\n    > div {\n      align-items: center;\n    }\n    > div {\n      justify-content: space-between;\n    }\n    > div {\n      -moz-column-gap: 8px;\n           column-gap: 8px;\n    }\n  }\n}\n\n.count-badge {\n  display: flex;\n  align-items: center;\n  -moz-column-gap: 8px;\n       column-gap: 8px;\n  padding-left: 6px;\n  padding-right: 6px;\n  padding-top: 2px;\n  padding-bottom: 2px;\n  border-radius: 4px;\n  font-size: 12px;\n  line-height: 16px;\n  font-weight: 500;\n  --tw-numeric-spacing: tabular-nums;\n  font-variant-numeric: var(--tw-ordinal) var(--tw-slashed-zero) var(--tw-numeric-figure) var(--tw-numeric-spacing) var(--tw-numeric-fraction);\n  --tw-text-opacity: 1;\n  color: rgb(168 85 247 / var(--tw-text-opacity, 1));\n  background-color: rgb(168 85 247 / 0.1);\n  transform-origin: center;\n  transition-property: all;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-delay: 150ms;\n  transition-duration: 300ms;\n}\n\n@keyframes countFlash {\n\n  0% {\n    background-color: rgba(168, 85, 247, 0.3);\n    transform: scale(1.05);\n  }\n\n  100% {\n    background-color: rgba(168, 85, 247, 0.1);\n    transform: scale(1);\n  }\n}\n\n.count-flash {\n  animation: countFlash .3s ease-out forwards;\n}\n\n@keyframes countFlashShake {\n\n  0% {\n    transform: translateX(0);\n  }\n\n  25% {\n    transform: translateX(-5px);\n  }\n\n  50% {\n    transform: translateX(5px) scale(1.1);\n  }\n\n  75% {\n    transform: translateX(-5px);\n  }\n\n  100% {\n    transform: translateX(0);\n  }\n}\n\n.count-flash-white {\n  animation: countFlashShake .3s ease-out forwards;\n  transition-delay: 500ms !important;\n}\n\n.change-scope {\n  display: flex;\n  align-items: center;\n  -moz-column-gap: 4px;\n       column-gap: 4px;\n  --tw-text-opacity: 1;\n  color: rgb(102 102 102 / var(--tw-text-opacity, 1));\n  font-size: 12px;\n  line-height: 16px;\n  font-family: Menlo, Consolas, Monaco, Liberation Mono, Lucida Console, monospace;\n\n  > div {\n    padding-left: 6px;\n    padding-right: 6px;\n  }\n\n  > div {\n    padding-top: 2px;\n    padding-bottom: 2px;\n  }\n\n  > div {\n    transform-origin: center;\n  }\n\n  > div {\n    border-radius: 4px;\n  }\n\n  > div {\n    font-size: 12px;\n    line-height: 16px;\n  }\n\n  > div {\n    font-weight: 500;\n  }\n\n  > div {\n    --tw-numeric-spacing: tabular-nums;\n    font-variant-numeric: var(--tw-ordinal) var(--tw-slashed-zero) var(--tw-numeric-figure) var(--tw-numeric-spacing) var(--tw-numeric-fraction);\n  }\n\n  > div {\n    transform-origin: center;\n  }\n\n  > div {\n    transition-property: all;\n    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n    transition-duration: 150ms;\n  }\n\n  > div {\n    transition-delay: 150ms;\n  }\n\n  > div {\n    transition-duration: 300ms;\n  }\n\n  > div {\n\n    &[data-flash=\"true\"] {\n      background-color: rgb(168 85 247 / 0.1);\n    }\n\n    &[data-flash=\"true\"] {\n      --tw-text-opacity: 1;\n      color: rgb(168 85 247 / var(--tw-text-opacity, 1));\n    }\n  }\n}\n\n.react-scan-slider {\n  position: relative;\n  min-height: 24px;\n\n  > input {\n    position: absolute;\n  }\n\n  > input {\n    inset: 0px;\n  }\n\n  > input {\n    opacity: 0;\n  }\n\n  &:before {\n    --tw-content: '';\n    content: var(--tw-content);\n  }\n\n  &:before {\n    position: absolute;\n  }\n\n  &:before {\n    left: 0px;\n    right: 0px;\n  }\n\n  &:before {\n    top: 50%;\n  }\n\n  &:before {\n    --tw-translate-y: -50%;\n    transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n  }\n\n  &:before {\n    height: 6px;\n  }\n\n  &:before {\n    background-color: rgb(142 97 227 / 0.4);\n  }\n\n  &:before {\n    border-radius: 8px;\n  }\n\n  &:before {\n    pointer-events: none;\n  }\n\n  &:after {\n    --tw-content: '';\n    content: var(--tw-content);\n  }\n\n  &:after {\n    position: absolute;\n  }\n\n  &:after {\n    left: 0px;\n    right: 0px;\n  }\n\n  &:after {\n    top: -8px;\n    bottom: -8px;\n  }\n\n  &:after {\n    z-index: -10;\n  }\n\n  span {\n    position: absolute;\n  }\n\n  span {\n    left: 0px;\n  }\n\n  span {\n    top: 50%;\n  }\n\n  span {\n    --tw-translate-y: -50%;\n    transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n  }\n\n  span {\n    height: 10px;\n  }\n\n  span {\n    width: 10px;\n  }\n\n  span {\n    border-radius: 8px;\n  }\n\n  span {\n    --tw-bg-opacity: 1;\n    background-color: rgb(142 97 227 / var(--tw-bg-opacity, 1));\n  }\n\n  span {\n    pointer-events: none;\n  }\n\n  span {\n    transition-property: transform;\n    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n    transition-duration: 150ms;\n  }\n\n  span {\n    transition-duration: 75ms;\n  }\n}\n\n.resize-v-line {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  min-width: 20px;\n  max-width: 20px;\n  height: 100%;\n  width: 100%;\n  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 150ms;\n  cursor: col-resize;\n\n  &:hover,\n  &:active {\n    > span {\n      background-color: rgb(255 255 255 / 0.1);\n    }\n\n    svg {\n      opacity: 1;\n    }\n  }\n\n  &::before {\n    --tw-content: \"\";\n    content: var(--tw-content);\n  }\n\n  &::before {\n    position: absolute;\n  }\n\n  &::before {\n    inset: 0px;\n  }\n\n  &::before {\n    left: 50%;\n  }\n\n  &::before {\n    --tw-translate-x: -50%;\n    transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n  }\n\n  &::before {\n    width: 1px;\n  }\n\n  &::before {\n    background-color: rgb(255 255 255 / 0.1);\n  }\n\n  &::before {\n    transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;\n    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n    transition-duration: 150ms;\n  }\n\n  > span {\n    position: absolute;\n  }\n\n  > span {\n    left: 50%;\n  }\n\n  > span {\n    top: 50%;\n  }\n\n  > span {\n    --tw-translate-x: -50%;\n    transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n  }\n\n  > span {\n    --tw-translate-y: -50%;\n    transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n  }\n\n  > span {\n    height: 18px;\n  }\n\n  > span {\n    width: 6px;\n  }\n\n  > span {\n    border-radius: 4px;\n  }\n\n  > span {\n    transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;\n    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n    transition-duration: 150ms;\n  }\n\n  svg {\n    position: absolute;\n  }\n\n  svg {\n    left: 50%;\n  }\n\n  svg {\n    top: 50%;\n  }\n\n  svg {\n    --tw-translate-x: -50%;\n    transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n  }\n\n  svg {\n    --tw-translate-y: -50%;\n    transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n  }\n\n  svg {\n    --tw-rotate: 90deg;\n    transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n  }\n\n  svg {\n    --tw-text-opacity: 1;\n    color: rgb(163 163 163 / var(--tw-text-opacity, 1));\n  }\n\n  svg {\n    opacity: 0;\n  }\n\n  svg {\n    transition-property: opacity;\n    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n    transition-duration: 150ms;\n  }\n\n  svg {\n    z-index: 50;\n  }\n}\n\n\n.tree-node-search-highlight {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n\n  span {\n    padding-top: 1px;\n    padding-bottom: 1px;\n  }\n\n  span {\n    border-radius: 2px;\n  }\n\n  span {\n    --tw-bg-opacity: 1;\n    background-color: rgb(253 224 71 / var(--tw-bg-opacity, 1));\n  }\n\n  span {\n    font-weight: 500;\n  }\n\n  span {\n    --tw-text-opacity: 1;\n    color: rgb(0 0 0 / var(--tw-text-opacity, 1));\n  }\n\n  .single {\n    margin-right: 1px;\n  }\n\n  .single {\n    padding-left: 2px;\n    padding-right: 2px;\n  }\n\n  .regex {\n    padding-left: 2px;\n    padding-right: 2px;\n  }\n\n  .start {\n    margin-left: 1px;\n  }\n\n  .start {\n    border-top-left-radius: 2px;\n    border-bottom-left-radius: 2px;\n  }\n\n  .end {\n    margin-right: 1px;\n  }\n\n  .end {\n    border-top-right-radius: 2px;\n    border-bottom-right-radius: 2px;\n  }\n\n  .middle {\n    margin-left: 1px;\n    margin-right: 1px;\n  }\n\n  .middle {\n    border-radius: 2px;\n  }\n}\n\n\n.before\\:absolute::before {\n  content: var(--tw-content);\n  position: absolute;\n}\n\n\n.before\\:inset-x-0::before {\n  content: var(--tw-content);\n  left: 0px;\n  right: 0px;\n}\n\n\n.before\\:bottom-0::before {\n  content: var(--tw-content);\n  bottom: 0px;\n}\n\n\n.before\\:h-\\[1px\\]::before {\n  content: var(--tw-content);\n  height: 1px;\n}\n\n\n.before\\:bg-\\[\\#333\\]::before {\n  content: var(--tw-content);\n  --tw-bg-opacity: 1;\n  background-color: rgb(51 51 51 / var(--tw-bg-opacity, 1));\n}\n\n\n.before\\:content-\\[\\\"\\\"\\]::before {\n  --tw-content: \"\";\n  content: var(--tw-content);\n}\n\n\n.focus-within\\:border-\\[\\#454545\\]:focus-within {\n  --tw-border-opacity: 1;\n  border-color: rgb(69 69 69 / var(--tw-border-opacity, 1));\n}\n\n\n.hover\\:bg-\\[\\#5f3f9a\\]\\/20:hover {\n  background-color: rgb(95 63 154 / 0.2);\n}\n\n\n.hover\\:bg-\\[\\#5f3f9a\\]\\/40:hover {\n  background-color: rgb(95 63 154 / 0.4);\n}\n\n\n.hover\\:bg-red-600:hover {\n  --tw-bg-opacity: 1;\n  background-color: rgb(220 38 38 / var(--tw-bg-opacity, 1));\n}\n\n\n.hover\\:text-neutral-300:hover {\n  --tw-text-opacity: 1;\n  color: rgb(212 212 212 / var(--tw-text-opacity, 1));\n}\n\n\n.group:hover .group-hover\\:opacity-100 {\n  opacity: 1;\n}\n\n\n.peer\\/bottom:hover ~ .peer-hover\\/bottom\\:rounded-b-none {\n  border-bottom-right-radius: 0px;\n  border-bottom-left-radius: 0px;\n}\n\n\n.peer\\/left:hover ~ .peer-hover\\/left\\:rounded-l-none {\n  border-top-left-radius: 0px;\n  border-bottom-left-radius: 0px;\n}\n\n\n.peer\\/right:hover ~ .peer-hover\\/right\\:rounded-r-none {\n  border-top-right-radius: 0px;\n  border-bottom-right-radius: 0px;\n}\n\n\n.peer\\/top:hover ~ .peer-hover\\/top\\:rounded-t-none {\n  border-top-left-radius: 0px;\n  border-top-right-radius: 0px;\n}\n";

  // src/web/assets/svgs/svgs.ts
  var ICONS = `
<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
  <symbol id="icon-inspect" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12.034 12.681a.498.498 0 0 1 .647-.647l9 3.5a.5.5 0 0 1-.033.943l-3.444 1.068a1 1 0 0 0-.66.66l-1.067 3.443a.5.5 0 0 1-.943.033z"/>
    <path d="M5 3a2 2 0 0 0-2 2"/>
    <path d="M19 3a2 2 0 0 1 2 2"/>
    <path d="M5 21a2 2 0 0 1-2-2"/>
    <path d="M9 3h1"/>
    <path d="M9 21h2"/>
    <path d="M14 3h1"/>
    <path d="M3 9v1"/>
    <path d="M21 9v2"/>
    <path d="M3 14v1"/>
  </symbol>

  <symbol id="icon-focus" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12.034 12.681a.498.498 0 0 1 .647-.647l9 3.5a.5.5 0 0 1-.033.943l-3.444 1.068a1 1 0 0 0-.66.66l-1.067 3.443a.5.5 0 0 1-.943.033z"/>
    <path d="M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6"/>
  </symbol>

  <symbol id="icon-next" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M6 9h6V5l7 7-7 7v-4H6V9z"/>
  </symbol>

  <symbol id="icon-previous" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M18 15h-6v4l-7-7 7-7v4h6v6z"/>
  </symbol>

  <symbol id="icon-close" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </symbol>

  <symbol id="icon-replay" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
    <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
    <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
    <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
    <circle cx="12" cy="12" r="1"/>
    <path d="M18.944 12.33a1 1 0 0 0 0-.66 7.5 7.5 0 0 0-13.888 0 1 1 0 0 0 0 .66 7.5 7.5 0 0 0 13.888 0"/>
  </symbol>

  <symbol id="icon-ellipsis" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="1"/>
    <circle cx="19" cy="12" r="1"/>
    <circle cx="5" cy="12" r="1"/>
  </symbol>

  <symbol id="icon-copy" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
  </symbol>

  <symbol id="icon-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 6 9 17l-5-5"/>
  </symbol>

  <symbol id="icon-chevron-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </symbol>

  <symbol id="icon-settings" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3" />
  </symbol>

  <symbol id="icon-flame" viewBox="0 0 24 24">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
  </symbol>

  <symbol id="icon-function" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
    <path d="M9 17c2 0 2.8-1 2.8-2.8V10c0-2 1-3.3 3.2-3"/>
    <path d="M9 11.2h5.7"/>
  </symbol>

  <symbol id="icon-triangle-alert" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/>
    <path d="M12 9v4"/>
    <path d="M12 17h.01"/>
  </symbol>

  <symbol id="icon-gallery-horizontal-end" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M2 7v10"/><path d="M6 5v14"/>
    <rect width="12" height="18" x="10" y="3" rx="2"/>
  </symbol>

  <symbol id="icon-search" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </symbol>

  <symbol id="icon-lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </symbol>

  <symbol id="icon-lock-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
  </symbol>
</svg>
`;

  // src/web/components/inspector/overlay/index.tsx
  var ANIMATION_CONFIG = {
    frameInterval: 1e3 / 60,
    speeds: {
      fast: 0.51,
      slow: 0.1,
      off: 0
    }
  };
  var OVERLAY_DPR = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  var ScanOverlay = () => {
    const refCanvas = A2(null);
    const refEventCatcher = A2(null);
    const refCurrentRect = A2(null);
    const refCurrentLockIconRect = A2(null);
    const refLastHoveredElement = A2(null);
    const refRafId = A2(0);
    const refTimeout = A2();
    const refCleanupMap = A2(
      /* @__PURE__ */ new Map()
    );
    const refIsFadingOut = A2(false);
    const refLastFrameTime = A2(0);
    const drawLockIcon = (ctx2, x3, y4, size) => {
      ctx2.save();
      ctx2.strokeStyle = "white";
      ctx2.fillStyle = "white";
      ctx2.lineWidth = 1.5;
      const shackleWidth = size * 0.6;
      const shackleHeight = size * 0.5;
      const shackleX = x3 + (size - shackleWidth) / 2;
      const shackleY = y4;
      ctx2.beginPath();
      ctx2.arc(
        shackleX + shackleWidth / 2,
        shackleY + shackleHeight / 2,
        shackleWidth / 2,
        Math.PI,
        0,
        false
      );
      ctx2.stroke();
      const bodyWidth = size * 0.8;
      const bodyHeight = size * 0.5;
      const bodyX = x3 + (size - bodyWidth) / 2;
      const bodyY = y4 + shackleHeight / 2;
      ctx2.fillRect(bodyX, bodyY, bodyWidth, bodyHeight);
      ctx2.restore();
    };
    const drawStatsPill = (ctx2, rect, kind, fiber) => {
      if (!fiber) return;
      const pillHeight = 24;
      const pillPadding = 8;
      const componentName = (fiber?.type && getDisplayName(fiber.type)) ?? "Unknown";
      const text = componentName;
      ctx2.save();
      ctx2.font = "12px system-ui, -apple-system, sans-serif";
      const textMetrics = ctx2.measureText(text);
      const textWidth = textMetrics.width;
      const lockIconSize = kind === "locked" ? 14 : 0;
      const lockIconPadding = kind === "locked" ? 6 : 0;
      const pillWidth = textWidth + pillPadding * 2 + lockIconSize + lockIconPadding;
      const pillX = rect.left;
      const pillY = rect.top - pillHeight - 4;
      ctx2.fillStyle = "rgb(37, 37, 38, .75)";
      ctx2.beginPath();
      ctx2.roundRect(pillX, pillY, pillWidth, pillHeight, 3);
      ctx2.fill();
      if (kind === "locked") {
        const lockX = pillX + pillPadding;
        const lockY = pillY + (pillHeight - lockIconSize) / 2 + 2;
        drawLockIcon(ctx2, lockX, lockY, lockIconSize);
        refCurrentLockIconRect.current = {
          x: lockX,
          y: lockY,
          width: lockIconSize,
          height: lockIconSize
        };
      } else {
        refCurrentLockIconRect.current = null;
      }
      ctx2.fillStyle = "white";
      ctx2.textBaseline = "middle";
      const textX = pillX + pillPadding + (kind === "locked" ? lockIconSize + lockIconPadding : 0);
      ctx2.fillText(text, textX, pillY + pillHeight / 2);
      ctx2.restore();
    };
    const drawRect = (canvas2, ctx2, kind, fiber) => {
      if (!refCurrentRect.current) return;
      const rect = refCurrentRect.current;
      ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
      ctx2.strokeStyle = "rgba(142, 97, 227, 0.5)";
      ctx2.fillStyle = "rgba(173, 97, 230, 0.10)";
      if (kind === "locked") {
        ctx2.setLineDash([]);
      } else {
        ctx2.setLineDash([4]);
      }
      ctx2.lineWidth = 1;
      ctx2.fillRect(rect.left, rect.top, rect.width, rect.height);
      ctx2.strokeRect(rect.left, rect.top, rect.width, rect.height);
      drawStatsPill(ctx2, rect, kind, fiber);
    };
    const animate = (canvas2, ctx2, targetRect, kind, parentCompositeFiber, onComplete) => {
      const speed = ReactScanInternals.options.value.animationSpeed;
      const t4 = ANIMATION_CONFIG.speeds[speed] ?? ANIMATION_CONFIG.speeds.off;
      const animationFrame = (timestamp) => {
        if (timestamp - refLastFrameTime.current < ANIMATION_CONFIG.frameInterval) {
          refRafId.current = requestAnimationFrame(animationFrame);
          return;
        }
        refLastFrameTime.current = timestamp;
        if (!refCurrentRect.current) {
          cancelAnimationFrame(refRafId.current);
          return;
        }
        refCurrentRect.current = {
          left: lerp(refCurrentRect.current.left, targetRect.left, t4),
          top: lerp(refCurrentRect.current.top, targetRect.top, t4),
          width: lerp(refCurrentRect.current.width, targetRect.width, t4),
          height: lerp(refCurrentRect.current.height, targetRect.height, t4)
        };
        drawRect(canvas2, ctx2, kind, parentCompositeFiber);
        const stillMoving = Math.abs(refCurrentRect.current.left - targetRect.left) > 0.1 || Math.abs(refCurrentRect.current.top - targetRect.top) > 0.1 || Math.abs(refCurrentRect.current.width - targetRect.width) > 0.1 || Math.abs(refCurrentRect.current.height - targetRect.height) > 0.1;
        if (stillMoving) {
          refRafId.current = requestAnimationFrame(animationFrame);
        } else {
          refCurrentRect.current = targetRect;
          drawRect(canvas2, ctx2, kind, parentCompositeFiber);
          cancelAnimationFrame(refRafId.current);
          ctx2.restore();
        }
      };
      cancelAnimationFrame(refRafId.current);
      clearTimeout(refTimeout.current);
      refRafId.current = requestAnimationFrame(animationFrame);
      refTimeout.current = setTimeout(() => {
        cancelAnimationFrame(refRafId.current);
        refCurrentRect.current = targetRect;
        drawRect(canvas2, ctx2, kind, parentCompositeFiber);
        ctx2.restore();
      }, 1e3);
    };
    const setupOverlayAnimation = (canvas2, ctx2, targetRect, kind, parentCompositeFiber) => {
      ctx2.save();
      if (!refCurrentRect.current) {
        refCurrentRect.current = targetRect;
        drawRect(canvas2, ctx2, kind, parentCompositeFiber);
        ctx2.restore();
        return;
      }
      animate(canvas2, ctx2, targetRect, kind, parentCompositeFiber);
    };
    const drawHoverOverlay = async (overlayElement, canvas2, ctx2, kind) => {
      if (!overlayElement || !canvas2 || !ctx2) return;
      const { parentCompositeFiber } = getCompositeComponentFromElement(overlayElement);
      const targetRect = await getAssociatedFiberRect(overlayElement);
      if (!parentCompositeFiber || !targetRect) return;
      setupOverlayAnimation(canvas2, ctx2, targetRect, kind, parentCompositeFiber);
    };
    const unsubscribeAll = () => {
      for (const cleanup2 of refCleanupMap.current.values()) {
        cleanup2?.();
      }
    };
    const cleanupCanvas = (canvas2) => {
      const ctx2 = canvas2.getContext("2d");
      if (ctx2) {
        ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
      }
      refCurrentRect.current = null;
      refCurrentLockIconRect.current = null;
      refLastHoveredElement.current = null;
      canvas2.classList.remove("fade-in");
      refIsFadingOut.current = false;
    };
    const startFadeOut = (onComplete) => {
      if (!refCanvas.current || refIsFadingOut.current) return;
      const handleTransitionEnd = (e4) => {
        if (!refCanvas.current || e4.propertyName !== "opacity" || !refIsFadingOut.current) {
          return;
        }
        refCanvas.current.removeEventListener(
          "transitionend",
          handleTransitionEnd
        );
        cleanupCanvas(refCanvas.current);
        onComplete?.();
      };
      const existingListener = refCleanupMap.current.get("fade-out");
      if (existingListener) {
        existingListener();
        refCleanupMap.current.delete("fade-out");
      }
      refCanvas.current.addEventListener("transitionend", handleTransitionEnd);
      refCleanupMap.current.set("fade-out", () => {
        refCanvas.current?.removeEventListener(
          "transitionend",
          handleTransitionEnd
        );
      });
      refIsFadingOut.current = true;
      refCanvas.current.classList.remove("fade-in");
      requestAnimationFrame(() => {
        refCanvas.current?.classList.add("fade-out");
      });
    };
    const startFadeIn = () => {
      if (!refCanvas.current) return;
      refIsFadingOut.current = false;
      refCanvas.current.classList.remove("fade-out");
      requestAnimationFrame(() => {
        refCanvas.current?.classList.add("fade-in");
      });
    };
    const handleHoverableElement = (componentElement) => {
      if (componentElement === refLastHoveredElement.current) return;
      refLastHoveredElement.current = componentElement;
      if (nonVisualTags.has(componentElement.tagName)) {
        startFadeOut();
      } else {
        startFadeIn();
      }
      Store.inspectState.value = {
        kind: "inspecting",
        hoveredDomElement: componentElement
      };
    };
    const handleNonHoverableArea = () => {
      if (!refCurrentRect.current || !refCanvas.current || refIsFadingOut.current) {
        return;
      }
      startFadeOut();
    };
    const handleMouseMove = throttle((e4) => {
      const state = Store.inspectState.peek();
      if (state.kind !== "inspecting" || !refEventCatcher.current) return;
      refEventCatcher.current.style.pointerEvents = "none";
      const element = document.elementFromPoint(e4?.clientX ?? 0, e4?.clientY ?? 0);
      refEventCatcher.current.style.removeProperty("pointer-events");
      clearTimeout(refTimeout.current);
      if (element && element !== refCanvas.current) {
        const { parentCompositeFiber } = getCompositeComponentFromElement(
          element
        );
        if (parentCompositeFiber) {
          const componentElement = findComponentDOMNode(parentCompositeFiber);
          if (componentElement) {
            handleHoverableElement(componentElement);
            return;
          }
        }
      }
      handleNonHoverableArea();
    }, 32);
    const isClickInLockIcon = (e4, canvas2) => {
      const currentRect = refCurrentLockIconRect.current;
      if (!currentRect) return false;
      const rect = canvas2.getBoundingClientRect();
      const scaleX = canvas2.width / rect.width;
      const scaleY = canvas2.height / rect.height;
      const x3 = (e4.clientX - rect.left) * scaleX;
      const y4 = (e4.clientY - rect.top) * scaleY;
      const adjustedX = x3 / OVERLAY_DPR;
      const adjustedY = y4 / OVERLAY_DPR;
      return adjustedX >= currentRect.x && adjustedX <= currentRect.x + currentRect.width && adjustedY >= currentRect.y && adjustedY <= currentRect.y + currentRect.height;
    };
    const handleLockIconClick = (state) => {
      if (state.kind === "focused") {
        Store.inspectState.value = {
          kind: "inspecting",
          hoveredDomElement: state.focusedDomElement
        };
      }
    };
    const handleElementClick = (e4) => {
      const clickableElements = [
        "react-scan-inspect-element",
        "react-scan-power"
      ];
      if (e4.target instanceof HTMLElement && clickableElements.includes(e4.target.id)) {
        return;
      }
      const tagName = refLastHoveredElement.current?.tagName;
      if (tagName && nonVisualTags.has(tagName)) {
        return;
      }
      e4.preventDefault();
      e4.stopPropagation();
      const element = refLastHoveredElement.current ?? document.elementFromPoint(e4.clientX, e4.clientY);
      if (!element) return;
      const clickedEl = e4.composedPath().at(0);
      if (clickedEl instanceof HTMLElement && clickableElements.includes(clickedEl.id)) {
        const syntheticEvent = new MouseEvent(e4.type, e4);
        syntheticEvent.__reactScanSyntheticEvent = true;
        clickedEl.dispatchEvent(syntheticEvent);
        return;
      }
      const { parentCompositeFiber } = getCompositeComponentFromElement(
        element
      );
      if (!parentCompositeFiber) return;
      const componentElement = findComponentDOMNode(parentCompositeFiber);
      if (!componentElement) {
        refLastHoveredElement.current = null;
        Store.inspectState.value = {
          kind: "inspect-off"
        };
        return;
      }
      Store.inspectState.value = {
        kind: "focused",
        focusedDomElement: componentElement,
        fiber: parentCompositeFiber
      };
    };
    const handleClick = (e4) => {
      if (e4.__reactScanSyntheticEvent) {
        return;
      }
      const state = Store.inspectState.peek();
      const canvas2 = refCanvas.current;
      if (!canvas2 || !refEventCatcher.current) return;
      if (isClickInLockIcon(e4, canvas2)) {
        e4.preventDefault();
        e4.stopPropagation();
        handleLockIconClick(state);
        return;
      }
      if (state.kind === "inspecting") {
        handleElementClick(e4);
      }
    };
    const handleKeyDown = (e4) => {
      if (e4.key !== "Escape") return;
      const state = Store.inspectState.peek();
      const canvas2 = refCanvas.current;
      if (!canvas2) return;
      if (document.activeElement?.id === "react-scan-root") {
        return;
      }
      if (state.kind === "focused" || state.kind === "inspecting") {
        e4.preventDefault();
        e4.stopPropagation();
        switch (state.kind) {
          case "focused": {
            startFadeIn();
            refCurrentRect.current = null;
            refLastHoveredElement.current = state.focusedDomElement;
            Store.inspectState.value = {
              kind: "inspecting",
              hoveredDomElement: state.focusedDomElement
            };
            break;
          }
          case "inspecting": {
            startFadeOut(() => {
              signalIsSettingsOpen.value = false;
              Store.inspectState.value = {
                kind: "inspect-off"
              };
            });
            break;
          }
        }
      }
    };
    const handleStateChange = (state, canvas2, ctx2) => {
      refCleanupMap.current.get(state.kind)?.();
      if (refEventCatcher.current) {
        if (state.kind !== "inspecting") {
          refEventCatcher.current.style.pointerEvents = "none";
        }
      }
      if (refRafId.current) {
        cancelAnimationFrame(refRafId.current);
      }
      let unsubReport;
      switch (state.kind) {
        case "inspect-off":
          startFadeOut();
          return;
        case "inspecting":
          drawHoverOverlay(state.hoveredDomElement, canvas2, ctx2, "inspecting");
          break;
        case "focused":
          if (!state.focusedDomElement) return;
          if (refLastHoveredElement.current !== state.focusedDomElement) {
            refLastHoveredElement.current = state.focusedDomElement;
          }
          drawHoverOverlay(state.focusedDomElement, canvas2, ctx2, "locked");
          unsubReport = Store.lastReportTime.subscribe(() => {
            if (refRafId.current && refCurrentRect.current) {
              const { parentCompositeFiber } = getCompositeComponentFromElement(
                state.focusedDomElement
              );
              if (parentCompositeFiber) {
                drawHoverOverlay(state.focusedDomElement, canvas2, ctx2, "locked");
              }
            }
          });
          if (unsubReport) {
            refCleanupMap.current.set(state.kind, unsubReport);
          }
          break;
      }
    };
    const updateCanvasSize = (canvas2, ctx2) => {
      const rect = canvas2.getBoundingClientRect();
      canvas2.width = rect.width * OVERLAY_DPR;
      canvas2.height = rect.height * OVERLAY_DPR;
      ctx2.scale(OVERLAY_DPR, OVERLAY_DPR);
      ctx2.save();
    };
    const handleResizeOrScroll = () => {
      const state = Store.inspectState.peek();
      const canvas2 = refCanvas.current;
      if (!canvas2) return;
      const ctx2 = canvas2?.getContext("2d");
      if (!ctx2) return;
      cancelAnimationFrame(refRafId.current);
      clearTimeout(refTimeout.current);
      updateCanvasSize(canvas2, ctx2);
      refCurrentRect.current = null;
      if (state.kind === "focused" && state.focusedDomElement) {
        drawHoverOverlay(state.focusedDomElement, canvas2, ctx2, "locked");
      } else if (state.kind === "inspecting" && state.hoveredDomElement) {
        drawHoverOverlay(state.hoveredDomElement, canvas2, ctx2, "inspecting");
      }
    };
    const handlePointerDown = (e4) => {
      const state = Store.inspectState.peek();
      const canvas2 = refCanvas.current;
      if (!canvas2) return;
      if (state.kind === "inspecting" || isClickInLockIcon(e4, canvas2)) {
        e4.preventDefault();
        e4.stopPropagation();
        e4.stopImmediatePropagation();
      }
    };
    y2(() => {
      const canvas2 = refCanvas.current;
      if (!canvas2) return;
      const ctx2 = canvas2?.getContext("2d");
      if (!ctx2) return;
      updateCanvasSize(canvas2, ctx2);
      const unSubState = Store.inspectState.subscribe((state) => {
        handleStateChange(state, canvas2, ctx2);
      });
      window.addEventListener("scroll", handleResizeOrScroll, { passive: true });
      window.addEventListener("resize", handleResizeOrScroll, { passive: true });
      document.addEventListener("mousemove", handleMouseMove, {
        passive: true,
        capture: true
      });
      document.addEventListener("pointerdown", handlePointerDown, {
        capture: true
      });
      document.addEventListener("click", handleClick, { capture: true });
      document.addEventListener("keydown", handleKeyDown, { capture: true });
      return () => {
        unsubscribeAll();
        unSubState();
        window.removeEventListener("scroll", handleResizeOrScroll);
        window.removeEventListener("resize", handleResizeOrScroll);
        document.removeEventListener("mousemove", handleMouseMove, {
          capture: true
        });
        document.removeEventListener("click", handleClick, { capture: true });
        document.removeEventListener("pointerdown", handlePointerDown, {
          capture: true
        });
        document.removeEventListener("keydown", handleKeyDown, { capture: true });
        if (refRafId.current) {
          cancelAnimationFrame(refRafId.current);
        }
        clearTimeout(refTimeout.current);
      };
    }, []);
    return /* @__PURE__ */ u4(k, { children: [
      /* @__PURE__ */ u4(
        "div",
        {
          ref: refEventCatcher,
          className: cn("fixed inset-0 w-screen h-screen", "z-[214748365]"),
          style: {
            pointerEvents: "none"
          }
        }
      ),
      /* @__PURE__ */ u4(
        "canvas",
        {
          ref: refCanvas,
          dir: "ltr",
          className: cn(
            "react-scan-inspector-overlay",
            "fixed inset-0 w-screen h-screen",
            "pointer-events-none",
            "z-[214748367]"
          )
        }
      )
    ] });
  };

  // src/web/hooks/use-virtual-list.ts
  var useVirtualList = (options) => {
    const { count, getScrollElement, estimateSize, overscan = 5 } = options;
    const [scrollTop, setScrollTop] = h2(0);
    const [containerHeight, setContainerHeight] = h2(0);
    const refResizeObserver = A2();
    const refScrollElement = A2(null);
    const refRafId = A2(null);
    const itemHeight = estimateSize();
    const updateContainer = q2((entries) => {
      if (!refScrollElement.current) return;
      const height = entries?.[0]?.contentRect.height ?? refScrollElement.current.getBoundingClientRect().height;
      setContainerHeight(height);
    }, []);
    const debouncedUpdateContainer = q2(() => {
      if (refRafId.current !== null) {
        cancelAnimationFrame(refRafId.current);
      }
      refRafId.current = requestAnimationFrame(() => {
        updateContainer();
        refRafId.current = null;
      });
    }, [updateContainer]);
    y2(() => {
      const element = getScrollElement();
      if (!element) return;
      refScrollElement.current = element;
      const handleScroll = () => {
        if (!refScrollElement.current) return;
        setScrollTop(refScrollElement.current.scrollTop);
      };
      updateContainer();
      if (!refResizeObserver.current) {
        refResizeObserver.current = new ResizeObserver(() => {
          debouncedUpdateContainer();
        });
      }
      refResizeObserver.current.observe(element);
      element.addEventListener("scroll", handleScroll, { passive: true });
      const mutationObserver = new MutationObserver(debouncedUpdateContainer);
      mutationObserver.observe(element, {
        attributes: true,
        childList: true,
        subtree: true
      });
      return () => {
        element.removeEventListener("scroll", handleScroll);
        if (refResizeObserver.current) {
          refResizeObserver.current.disconnect();
        }
        mutationObserver.disconnect();
        if (refRafId.current !== null) {
          cancelAnimationFrame(refRafId.current);
        }
      };
    }, [getScrollElement, updateContainer, debouncedUpdateContainer]);
    const visibleRange = T2(() => {
      const start2 = Math.floor(scrollTop / itemHeight);
      const visibleCount = Math.ceil(containerHeight / itemHeight);
      return {
        start: Math.max(0, start2 - overscan),
        end: Math.min(count, start2 + visibleCount + overscan)
      };
    }, [scrollTop, itemHeight, containerHeight, count, overscan]);
    const items = T2(() => {
      const virtualItems = [];
      for (let index = visibleRange.start; index < visibleRange.end; index++) {
        virtualItems.push({
          key: index,
          index,
          start: index * itemHeight
        });
      }
      return virtualItems;
    }, [visibleRange, itemHeight]);
    return {
      virtualItems: items,
      totalSize: count * itemHeight,
      scrollTop,
      containerHeight
    };
  };

  // src/web/utils/pin.ts
  readLocalStorage("react-scann-pinned");
  var getFiberPath = (fiber) => {
    const pathSegments = [];
    let currentFiber = fiber;
    while (currentFiber) {
      const elementType = currentFiber.elementType;
      const name = typeof elementType === "function" ? elementType.displayName || elementType.name : typeof elementType === "string" ? elementType : "Unknown";
      const index = currentFiber.index !== void 0 ? `[${currentFiber.index}]` : "";
      pathSegments.unshift(`${name}${index}`);
      currentFiber = currentFiber.return ?? null;
    }
    return pathSegments.join("::");
  };

  // src/web/components/widget/components-tree/state.ts
  var searchState = d3({
    query: "",
    matches: [],
    currentMatchIndex: -1
  });
  var signalSkipTreeUpdate = d3(false);

  // src/web/components/widget/components-tree/breadcrumb.tsx
  var Breadcrumb = ({ selectedElement }) => {
    const refContainer = A2(null);
    const refPaths = A2(null);
    const [path, setPath] = h2([]);
    const [areAllItemsVisible, setAreAllItemsVisible] = h2(true);
    y2(() => {
      if (!selectedElement) return;
      const ancestors = getInspectableAncestors(selectedElement);
      setPath(ancestors);
    }, [selectedElement]);
    y2(() => {
      let timeoutId;
      const checkVisibility = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (refContainer.current && refPaths.current) {
            const isFullyVisible = refContainer.current.offsetHeight >= refPaths.current.offsetHeight;
            setAreAllItemsVisible(isFullyVisible);
          }
        }, 16);
      };
      const resizeObserver = new ResizeObserver(checkVisibility);
      if (refContainer.current && refPaths.current) {
        resizeObserver.observe(refPaths.current);
        checkVisibility();
      }
      return () => resizeObserver.disconnect();
    }, []);
    const handleElementClick = (element) => {
      const { parentCompositeFiber } = getCompositeFiberFromElement(element);
      if (!parentCompositeFiber) return;
      signalSkipTreeUpdate.value = false;
      Store.inspectState.value = {
        kind: "focused",
        focusedDomElement: element,
        fiber: parentCompositeFiber
      };
    };
    const firstItem = path[0];
    const restItems = path.slice(1).reverse();
    return /* @__PURE__ */ u4(
      "div",
      {
        ref: refContainer,
        className: cn(
          "flex items-center gap-x-1",
          "px-2",
          "text-xs text-neutral-400",
          "border-b border-white/10",
          "overflow-hidden whitespace-nowrap"
        ),
        children: [
          /* @__PURE__ */ u4(
            "button",
            {
              type: "button",
              className: "hover:text-neutral-300 transition-colors",
              onClick: () => {
                handleElementClick(firstItem.element);
              },
              children: firstItem?.name
            }
          ),
          !areAllItemsVisible && restItems.length > 1 ? /* @__PURE__ */ u4("span", { className: "text-sm w-2.5 h-2.5 flex items-center justify-center", children: "\u2026" }) : restItems.length > 0 && /* @__PURE__ */ u4("span", { className: "w-2.5 h-2.5 flex items-center justify-center text-neutral-400", children: /* @__PURE__ */ u4(Icon, { name: "icon-chevron-right", size: 10 }) }),
          /* @__PURE__ */ u4("div", { className: "h-7 overflow-hidden", children: /* @__PURE__ */ u4(
            "div",
            {
              ref: refPaths,
              className: cn(
                "flex-1 flex flex-wrap flex-row-reverse justify-end gap-x-1"
              ),
              children: restItems.map((item, index) => /* @__PURE__ */ u4(
                "div",
                {
                  className: cn(
                    "flex-1 flex items-center gap-x-1",
                    "flex-[0_0_auto]",
                    "h-7",
                    "hover:text-neutral-300 transition-colors",
                    "overflow-hidden"
                  ),
                  children: [
                    /* @__PURE__ */ u4(
                      "button",
                      {
                        type: "button",
                        title: item.name,
                        style: { maxWidth: "160px" },
                        className: "truncate",
                        onClick: () => {
                          handleElementClick(item.element);
                        },
                        children: item.name
                      }
                    ),
                    index > 0 && /* @__PURE__ */ u4("span", { className: "w-2.5 h-2.5 flex items-center justify-center text-neutral-400", children: /* @__PURE__ */ u4(Icon, { name: "icon-chevron-right", size: 10 }) })
                  ]
                },
                `${item.name}-${index}`
              ))
            }
          ) })
        ]
      }
    );
  };

  // src/web/components/widget/components-tree/index.tsx
  var flattenTree = (nodes, depth = 0, parentPath = null) => {
    return nodes.reduce((acc, node, index) => {
      const nodePath = node.element ? getFiberPath(node.fiber) : `${parentPath}-${index}`;
      const flatNode = {
        ...node,
        depth,
        nodeId: nodePath,
        parentId: parentPath,
        fiber: node.fiber
      };
      acc.push(flatNode);
      if (node.children?.length) {
        acc.push(...flattenTree(node.children, depth + 1, nodePath));
      }
      return acc;
    }, []);
  };
  var getMaxDepth = (nodes) => {
    return nodes.reduce((max, node) => Math.max(max, node.depth), 0);
  };
  var calculateIndentSize = (containerWidth, maxDepth) => {
    const MIN_INDENT = 0;
    const MAX_INDENT = 24;
    const MIN_TOTAL_INDENT = 24;
    if (maxDepth <= 0) return MAX_INDENT;
    const availableSpace = Math.max(0, containerWidth - MIN_CONTAINER_WIDTH);
    if (availableSpace < MIN_TOTAL_INDENT) return MIN_INDENT;
    const targetTotalIndent = Math.min(availableSpace * 0.3, maxDepth * MAX_INDENT);
    const baseIndent = targetTotalIndent / maxDepth;
    return Math.max(MIN_INDENT, Math.min(MAX_INDENT, baseIndent));
  };
  var VALID_TYPES = ["memo", "forwardRef", "lazy", "suspense"];
  var parseTypeSearch = (query) => {
    const typeMatch = query.match(/\[(.*?)\]/);
    if (!typeMatch) return null;
    const typeSearches = [];
    const parts = typeMatch[1].split(",");
    for (const part of parts) {
      const trimmed = part.trim().toLowerCase();
      if (trimmed) typeSearches.push(trimmed);
    }
    return typeSearches;
  };
  var isValidTypeSearch = (typeSearches) => {
    if (typeSearches.length === 0) return false;
    for (const search of typeSearches) {
      let isValid = false;
      for (const validType of VALID_TYPES) {
        if (validType.toLowerCase().includes(search)) {
          isValid = true;
          break;
        }
      }
      if (!isValid) return false;
    }
    return true;
  };
  var matchesTypeSearch = (typeSearches, wrapperTypes) => {
    if (typeSearches.length === 0) return true;
    if (!wrapperTypes.length) return false;
    for (const search of typeSearches) {
      let foundMatch = false;
      for (const wrapper of wrapperTypes) {
        if (wrapper.type.toLowerCase().includes(search)) {
          foundMatch = true;
          break;
        }
      }
      if (!foundMatch) return false;
    }
    return true;
  };
  var useNodeHighlighting = (node, searchValue) => {
    return T2(() => {
      const { query, matches } = searchValue;
      const isMatch = matches.some((match) => match.nodeId === node.nodeId);
      const typeSearches = parseTypeSearch(query) || [];
      const searchQuery = query ? query.replace(/\[.*?\]/, "").trim() : "";
      if (!query || !isMatch) {
        return {
          highlightedText: /* @__PURE__ */ u4("span", { className: "truncate", children: node.label }),
          typeHighlight: false
        };
      }
      let matchesType = true;
      if (typeSearches.length > 0) {
        if (!node.fiber) {
          matchesType = false;
        } else {
          const { wrapperTypes } = getExtendedDisplayName(node.fiber);
          matchesType = matchesTypeSearch(typeSearches, wrapperTypes);
        }
      }
      let textContent = /* @__PURE__ */ u4("span", { className: "truncate", children: node.label });
      if (searchQuery) {
        try {
          if (searchQuery.startsWith("/") && searchQuery.endsWith("/")) {
            const pattern = searchQuery.slice(1, -1);
            const regex = new RegExp(`(${pattern})`, "i");
            const parts = node.label.split(regex);
            textContent = /* @__PURE__ */ u4("span", { className: "tree-node-search-highlight", children: parts.map(
              (part, index) => regex.test(part) ? /* @__PURE__ */ u4(
                "span",
                {
                  className: cn("regex", {
                    start: regex.test(part) && index === 0,
                    middle: regex.test(part) && index % 2 === 1,
                    end: regex.test(part) && index === parts.length - 1,
                    "!ml-0": index === 1
                  }),
                  children: part
                },
                `${node.nodeId}-${part}`
              ) : part
            ) });
          } else {
            const lowerLabel = node.label.toLowerCase();
            const lowerQuery = searchQuery.toLowerCase();
            const index = lowerLabel.indexOf(lowerQuery);
            if (index >= 0) {
              textContent = /* @__PURE__ */ u4("span", { className: "tree-node-search-highlight", children: [
                node.label.slice(0, index),
                /* @__PURE__ */ u4("span", { className: "single", children: node.label.slice(index, index + searchQuery.length) }),
                node.label.slice(index + searchQuery.length)
              ] });
            }
          }
        } catch {
        }
      }
      return {
        highlightedText: textContent,
        typeHighlight: matchesType && typeSearches.length > 0
      };
    }, [node.label, node.nodeId, node.fiber, searchValue]);
  };
  var TreeNodeItem = ({
    node,
    onElementClick,
    collapsedNodes,
    onToggle,
    searchValue
  }) => {
    const hasChildren = node.children && node.children.length > 0;
    const isCollapsed = collapsedNodes.has(node.nodeId);
    const handleClick = q2(() => {
      if (node.element) {
        onElementClick?.(node.element);
      }
    }, [node.element, onElementClick]);
    const handleToggle = q2(() => {
      if (hasChildren) {
        onToggle(node.nodeId);
      }
    }, [hasChildren, node.nodeId, onToggle]);
    const { highlightedText, typeHighlight } = useNodeHighlighting(node, searchValue);
    const componentTypes = T2(() => {
      if (!node.fiber) return null;
      const { wrapperTypes } = getExtendedDisplayName(node.fiber);
      const firstWrapperType = wrapperTypes[0];
      return /* @__PURE__ */ u4(
        "span",
        {
          className: cn(
            "flex items-center gap-x-1",
            "text-[10px] text-neutral-400 tracking-wide",
            "overflow-hidden"
          ),
          children: [
            firstWrapperType && /* @__PURE__ */ u4(k, { children: [
              /* @__PURE__ */ u4(
                "span",
                {
                  title: firstWrapperType?.title,
                  className: cn(
                    "rounded py-[1px] px-1",
                    "bg-neutral-700 text-neutral-300",
                    "truncate",
                    {
                      "bg-[#8e61e3] text-white": firstWrapperType.type === "memo",
                      "bg-yellow-300 text-black": typeHighlight
                    }
                  ),
                  children: firstWrapperType.type
                },
                firstWrapperType.type
              ),
              firstWrapperType.compiler && /* @__PURE__ */ u4("span", { className: "text-yellow-300 ml-1", children: "\u2728" })
            ] }),
            wrapperTypes.length > 1 && `\xD7${wrapperTypes.length}`
          ]
        }
      );
    }, [node.fiber, typeHighlight]);
    return /* @__PURE__ */ u4(
      "button",
      {
        type: "button",
        title: node.title,
        className: cn(
          "flex items-center gap-x-1",
          "px-2",
          "w-full h-7",
          "text-left",
          "rounded",
          "cursor-pointer select-none"
        ),
        onClick: handleClick,
        children: [
          /* @__PURE__ */ u4(
            "button",
            {
              type: "button",
              onClick: handleToggle,
              className: cn("w-4 h-4 flex items-center justify-center", "text-left"),
              children: hasChildren && /* @__PURE__ */ u4(
                Icon,
                {
                  name: "icon-chevron-right",
                  size: 12,
                  className: cn("w-4 h-4", "transition-transform", {
                    "rotate-90": !isCollapsed
                  })
                }
              )
            }
          ),
          highlightedText,
          componentTypes
        ]
      }
    );
  };
  var ComponentsTree = () => {
    const refContainer = A2(null);
    const refBreadcrumbContainer = A2(null);
    const refMainContainer = A2(null);
    const refSearchInputContainer = A2(null);
    const refSearchInput = A2(null);
    const refSelectedElement = A2(null);
    const refMaxTreeDepth = A2(0);
    const refIsHovering = A2(false);
    const refIsResizing = A2(false);
    const [flattenedNodes, setFlattenedNodes] = h2([]);
    const [collapsedNodes, setCollapsedNodes] = h2(/* @__PURE__ */ new Set());
    const [selectedIndex, setSelectedIndex] = h2(0);
    const [searchValue, setSearchValue] = h2(searchState.value);
    const visibleNodes = T2(() => {
      const visible = [];
      const nodes = flattenedNodes;
      const nodeMap = new Map(nodes.map((node) => [node.nodeId, node]));
      for (const node of nodes) {
        let isVisible = true;
        let currentNode = node;
        while (currentNode.parentId) {
          const parent = nodeMap.get(currentNode.parentId);
          if (!parent) break;
          if (collapsedNodes.has(parent.nodeId)) {
            isVisible = false;
            break;
          }
          currentNode = parent;
        }
        if (isVisible) {
          visible.push(node);
        }
      }
      return visible;
    }, [collapsedNodes, flattenedNodes]);
    const ITEM_HEIGHT = 28;
    const { virtualItems, totalSize } = useVirtualList({
      count: visibleNodes.length,
      getScrollElement: () => refContainer.current,
      estimateSize: () => ITEM_HEIGHT,
      overscan: 5
    });
    const handleElementClick = q2(
      (element) => {
        refIsHovering.current = true;
        refSearchInput.current?.blur();
        signalSkipTreeUpdate.value = true;
        const { parentCompositeFiber } = getCompositeComponentFromElement(element);
        if (!parentCompositeFiber) return;
        Store.inspectState.value = {
          kind: "focused",
          focusedDomElement: element,
          fiber: parentCompositeFiber
        };
        const nodeIndex = visibleNodes.findIndex(
          (node) => node.element === element
        );
        if (nodeIndex !== -1) {
          setSelectedIndex(nodeIndex);
          const itemTop = nodeIndex * ITEM_HEIGHT;
          const container = refContainer.current;
          if (container) {
            const containerHeight = container.clientHeight;
            const scrollTop = container.scrollTop;
            const breadcrumbHeight = 32;
            if (itemTop < scrollTop || itemTop + ITEM_HEIGHT > scrollTop + containerHeight) {
              container.scrollTo({
                top: Math.max(
                  0,
                  itemTop - (containerHeight - breadcrumbHeight) / 2
                ),
                behavior: "instant"
              });
            }
          }
        }
      },
      [visibleNodes]
    );
    const handleToggle = q2((nodeId) => {
      setCollapsedNodes((prev) => {
        const next = new Set(prev);
        if (next.has(nodeId)) {
          next.delete(nodeId);
        } else {
          next.add(nodeId);
        }
        return next;
      });
    }, []);
    const handleOnChangeSearch = q2(
      (query) => {
        refSearchInputContainer.current?.classList.remove("!border-red-500");
        const matches = [];
        if (!query) {
          searchState.value = { query, matches, currentMatchIndex: -1 };
          return;
        }
        if (query.includes("[") && !query.includes("]")) {
          if (query.length > query.indexOf("[") + 1) {
            refSearchInputContainer.current?.classList.add("!border-red-500");
            return;
          }
        }
        const typeSearches = parseTypeSearch(query) || [];
        if (query.includes("[")) {
          if (!isValidTypeSearch(typeSearches)) {
            refSearchInputContainer.current?.classList.add("!border-red-500");
            return;
          }
        }
        const searchQuery = query.replace(/\[.*?\]/, "").trim();
        const isRegex = /^\/.*\/$/.test(searchQuery);
        let matchesLabel = (_label) => false;
        if (searchQuery.startsWith("/") && !isRegex) {
          if (searchQuery.length > 1) {
            refSearchInputContainer.current?.classList.add("!border-red-500");
            return;
          }
        }
        if (isRegex) {
          try {
            const pattern = searchQuery.slice(1, -1);
            const regex = new RegExp(pattern, "i");
            matchesLabel = (label) => regex.test(label);
          } catch {
            refSearchInputContainer.current?.classList.add("!border-red-500");
            return;
          }
        } else if (searchQuery) {
          const lowerQuery = searchQuery.toLowerCase();
          matchesLabel = (label) => label.toLowerCase().includes(lowerQuery);
        }
        for (const node of flattenedNodes) {
          let matchesSearch = true;
          if (searchQuery) {
            matchesSearch = matchesLabel(node.label);
          }
          if (matchesSearch && typeSearches.length > 0) {
            if (!node.fiber) {
              matchesSearch = false;
            } else {
              const { wrapperTypes } = getExtendedDisplayName(node.fiber);
              matchesSearch = matchesTypeSearch(typeSearches, wrapperTypes);
            }
          }
          if (matchesSearch) {
            matches.push(node);
          }
        }
        searchState.value = {
          query,
          matches,
          currentMatchIndex: matches.length > 0 ? 0 : -1
        };
        if (matches.length > 0) {
          const firstMatch = matches[0];
          const nodeIndex = visibleNodes.findIndex(
            (node) => node.nodeId === firstMatch.nodeId
          );
          if (nodeIndex !== -1) {
            const itemTop = nodeIndex * ITEM_HEIGHT;
            const container = refContainer.current;
            if (container) {
              const containerHeight = container.clientHeight;
              container.scrollTo({
                top: Math.max(0, itemTop - containerHeight / 2),
                behavior: "instant"
              });
            }
          }
        }
      },
      [flattenedNodes, visibleNodes]
    );
    const handleInputChange = q2(
      (e4) => {
        const target = e4.currentTarget;
        if (!target) return;
        handleOnChangeSearch(target.value);
      },
      [handleOnChangeSearch]
    );
    const navigateSearch = q2(
      (direction) => {
        const { matches, currentMatchIndex } = searchState.value;
        if (matches.length === 0) return;
        const newIndex = direction === "next" ? (currentMatchIndex + 1) % matches.length : (currentMatchIndex - 1 + matches.length) % matches.length;
        searchState.value = {
          ...searchState.value,
          currentMatchIndex: newIndex
        };
        const currentMatch = matches[newIndex];
        const nodeIndex = visibleNodes.findIndex(
          (node) => node.nodeId === currentMatch.nodeId
        );
        if (nodeIndex !== -1) {
          setSelectedIndex(nodeIndex);
          const itemTop = nodeIndex * ITEM_HEIGHT;
          const container = refContainer.current;
          if (container) {
            const containerHeight = container.clientHeight;
            container.scrollTo({
              top: Math.max(0, itemTop - containerHeight / 2),
              behavior: "instant"
            });
          }
        }
      },
      [visibleNodes]
    );
    const updateContainerWidths = q2((width) => {
      if (refMainContainer.current) {
        refMainContainer.current.style.width = `${width}px`;
      }
      if (refContainer.current) {
        refContainer.current.style.width = `${width}px`;
        const indentSize = calculateIndentSize(width, refMaxTreeDepth.current);
        refContainer.current.style.setProperty(
          "--indentation-size",
          `${indentSize}px`
        );
      }
    }, []);
    const handleResize = q2((e4) => {
      e4.preventDefault();
      e4.stopPropagation();
      if (!refContainer.current) return;
      refContainer.current.style.setProperty("pointer-events", "none");
      refIsResizing.current = true;
      const startX = e4.clientX;
      const startWidth = refContainer.current.offsetWidth;
      const parentWidth = signalWidget.value.dimensions.width;
      const maxWidth = Math.floor(parentWidth - MIN_SIZE.width / 2);
      const handleMouseMove = (e5) => {
        const delta = startX - e5.clientX;
        const newWidth = Math.min(
          maxWidth,
          Math.max(MIN_CONTAINER_WIDTH, startWidth + delta)
        );
        updateContainerWidths(newWidth);
      };
      const handleMouseUp = () => {
        if (!refContainer.current) return;
        refContainer.current.style.removeProperty("pointer-events");
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        signalWidget.value = {
          ...signalWidget.value,
          componentsTree: {
            ...signalWidget.value.componentsTree,
            width: refContainer.current.offsetWidth
          }
        };
        saveLocalStorage(LOCALSTORAGE_KEY, signalWidget.value);
        refIsResizing.current = false;
      };
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }, []);
    const onMouseLeave = q2(() => {
      refIsHovering.current = false;
    }, []);
    y2(() => {
      const buildTreeFromElements = (elements) => {
        const nodeMap = /* @__PURE__ */ new Map();
        const rootNodes = [];
        for (const { element, name, fiber } of elements) {
          if (!element) continue;
          let title = name;
          const { name: componentName, wrappers } = getExtendedDisplayName(fiber);
          if (componentName) {
            if (wrappers.length > 0) {
              title = `${wrappers.join("(")}(${componentName})${")".repeat(wrappers.length)}`;
            } else {
              title = componentName;
            }
          }
          nodeMap.set(element, {
            label: componentName || name,
            title,
            children: [],
            element,
            fiber
          });
        }
        for (const { element, depth } of elements) {
          if (!element) continue;
          const node = nodeMap.get(element);
          if (!node) continue;
          if (depth === 0) {
            rootNodes.push(node);
          } else {
            let parent = element.parentElement;
            while (parent) {
              const parentNode = nodeMap.get(parent);
              if (parentNode) {
                parentNode.children = parentNode.children || [];
                parentNode.children.push(node);
                break;
              }
              parent = parent.parentElement;
            }
          }
        }
        return rootNodes;
      };
      const updateTree = () => {
        const element = refSelectedElement.current;
        if (!element) return;
        const inspectableElements = getInspectableElements(element);
        const tree = buildTreeFromElements(inspectableElements);
        if (tree.length > 0) {
          const flattened = flattenTree(tree);
          const newMaxDepth = getMaxDepth(flattened);
          refMaxTreeDepth.current = newMaxDepth;
          updateContainerWidths(signalWidget.value.componentsTree.width);
          setFlattenedNodes(flattened);
        }
      };
      const unsubscribeStore = Store.inspectState.subscribe((state) => {
        if (state.kind === "focused") {
          if (signalSkipTreeUpdate.value) {
            return;
          }
          handleOnChangeSearch("");
          setSelectedIndex(0);
          refSelectedElement.current = state.focusedDomElement;
          updateTree();
        }
      });
      let rafId = 0;
      const unsubscribeUpdates = inspectorUpdateSignal.subscribe(() => {
        if (Store.inspectState.value.kind === "focused") {
          cancelAnimationFrame(rafId);
          if (refIsResizing.current) return;
          rafId = requestAnimationFrame(() => {
            signalSkipTreeUpdate.value = false;
            updateTree();
          });
        }
      });
      return () => {
        unsubscribeStore();
        unsubscribeUpdates();
        searchState.value = {
          query: "",
          matches: [],
          currentMatchIndex: -1
        };
      };
    }, []);
    y2(() => {
      const handleKeyDown = (e4) => {
        if (!refIsHovering.current) return;
        switch (e4.key) {
          case "ArrowUp": {
            e4.preventDefault();
            e4.stopPropagation();
            if (selectedIndex > 0) {
              const currentNode = visibleNodes[selectedIndex - 1];
              if (currentNode?.element) {
                handleElementClick(currentNode.element);
              }
            }
            return;
          }
          case "ArrowDown": {
            e4.preventDefault();
            e4.stopPropagation();
            if (selectedIndex < visibleNodes.length - 1) {
              const currentNode = visibleNodes[selectedIndex + 1];
              if (currentNode?.element) {
                handleElementClick(currentNode.element);
              }
            }
            return;
          }
          case "ArrowLeft": {
            e4.preventDefault();
            e4.stopPropagation();
            const currentNode = visibleNodes[selectedIndex];
            if (currentNode?.nodeId) {
              handleToggle(currentNode.nodeId);
            }
            return;
          }
          case "ArrowRight": {
            e4.preventDefault();
            e4.stopPropagation();
            const currentNode = visibleNodes[selectedIndex];
            if (currentNode?.nodeId) {
              handleToggle(currentNode.nodeId);
            }
            return;
          }
        }
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [selectedIndex, visibleNodes, handleElementClick, handleToggle]);
    y2(() => {
      return searchState.subscribe(setSearchValue);
    }, []);
    y2(() => {
      const unsubscribe = signalWidget.subscribe((state) => {
        updateContainerWidths(state.componentsTree.width);
      });
      return () => {
        unsubscribe();
      };
    }, []);
    return /* @__PURE__ */ u4(k, { children: [
      /* @__PURE__ */ u4(
        "div",
        {
          onMouseDown: handleResize,
          className: "relative resize-v-line",
          children: /* @__PURE__ */ u4("span", { children: /* @__PURE__ */ u4(Icon, { name: "icon-ellipsis", size: 18 }) })
        }
      ),
      /* @__PURE__ */ u4("div", { ref: refMainContainer, className: "flex flex-col h-full", children: [
        /* @__PURE__ */ u4("div", { ref: refBreadcrumbContainer, className: "overflow-hidden", children: [
          /* @__PURE__ */ u4(Breadcrumb, { selectedElement: refSelectedElement.current }),
          /* @__PURE__ */ u4("div", { className: "py-2 pr-2 border-b border-[#1e1e1e]", children: /* @__PURE__ */ u4(
            "div",
            {
              ref: refSearchInputContainer,
              title: `Search components by:

\u2022 Name (e.g., "Button") \u2014 Case insensitive, matches any part

\u2022 Regular Expression (e.g., "/^Button/") \u2014 Use forward slashes

\u2022 Wrapper Type (e.g., "[memo,forwardRef]"):
   - Available types: memo, forwardRef, lazy, suspense
   - Matches any part of type name (e.g., "mo" matches "memo")
   - Use commas for multiple types

\u2022 Combined Search:
   - Mix name/regex with type: "button [for]"
   - Will match components satisfying both conditions

\u2022 Navigation:
   - Enter \u2192 Next match
   - Shift + Enter \u2192 Previous match
   - Cmd/Ctrl + Enter \u2192 Select and focus match (keeps search active)
`,
              className: cn(
                "relative",
                "flex items-center gap-x-1 px-2",
                "rounded",
                "border border-transparent",
                "focus-within:border-[#454545]",
                "bg-[#1e1e1e] text-neutral-300",
                "transition-colors",
                "whitespace-nowrap",
                "overflow-hidden"
              ),
              children: [
                /* @__PURE__ */ u4(
                  Icon,
                  {
                    name: "icon-search",
                    size: 12,
                    className: " text-neutral-500"
                  }
                ),
                /* @__PURE__ */ u4("div", { className: "relative flex-1 h-7 overflow-hidden", children: /* @__PURE__ */ u4(
                  "input",
                  {
                    ref: refSearchInput,
                    type: "text",
                    value: searchState.value.query,
                    onClick: (e4) => {
                      e4.stopPropagation();
                      e4.currentTarget.focus();
                    },
                    onMouseDown: (e4) => {
                      e4.stopPropagation();
                    },
                    onKeyDown: (e4) => {
                      if (e4.key === "Escape") {
                        e4.currentTarget.blur();
                      }
                      if (searchState.value.matches.length) {
                        if (e4.key === "Enter" && e4.shiftKey) {
                          navigateSearch("prev");
                        } else if (e4.key === "Enter") {
                          if (e4.metaKey || e4.ctrlKey) {
                            e4.preventDefault();
                            e4.stopPropagation();
                            handleElementClick(
                              searchState.value.matches[searchState.value.currentMatchIndex].element
                            );
                            e4.currentTarget.focus();
                          } else {
                            navigateSearch("next");
                          }
                        }
                      }
                    },
                    onChange: handleInputChange,
                    className: "absolute inset-y-0 inset-x-1",
                    placeholder: "Component name, /regex/, or [type]"
                  }
                ) }),
                searchState.value.query ? /* @__PURE__ */ u4(k, { children: [
                  /* @__PURE__ */ u4("span", { className: "flex items-center gap-x-0.5 text-xs text-neutral-500", children: [
                    searchState.value.currentMatchIndex + 1,
                    "|",
                    searchState.value.matches.length
                  ] }),
                  !!searchState.value.matches.length && /* @__PURE__ */ u4(k, { children: [
                    /* @__PURE__ */ u4(
                      "button",
                      {
                        type: "button",
                        onClick: (e4) => {
                          e4.stopPropagation();
                          navigateSearch("prev");
                        },
                        className: "button rounded w-4 h-4 flex items-center justify-center text-neutral-400 hover:text-neutral-300",
                        children: /* @__PURE__ */ u4(
                          Icon,
                          {
                            name: "icon-chevron-right",
                            className: "-rotate-90",
                            size: 12
                          }
                        )
                      }
                    ),
                    /* @__PURE__ */ u4(
                      "button",
                      {
                        type: "button",
                        onClick: (e4) => {
                          e4.stopPropagation();
                          navigateSearch("next");
                        },
                        className: "button rounded w-4 h-4 flex items-center justify-center text-neutral-400 hover:text-neutral-300",
                        children: /* @__PURE__ */ u4(
                          Icon,
                          {
                            name: "icon-chevron-right",
                            className: "rotate-90",
                            size: 12
                          }
                        )
                      }
                    )
                  ] }),
                  /* @__PURE__ */ u4(
                    "button",
                    {
                      type: "button",
                      onClick: (e4) => {
                        e4.stopPropagation();
                        handleOnChangeSearch("");
                      },
                      className: "button rounded w-4 h-4 flex items-center justify-center text-neutral-400 hover:text-neutral-300",
                      children: /* @__PURE__ */ u4(Icon, { name: "icon-close", size: 12 })
                    }
                  )
                ] }) : !!flattenedNodes.length && /* @__PURE__ */ u4("span", { className: "text-xs text-neutral-500", children: flattenedNodes.length })
              ]
            }
          ) })
        ] }),
        /* @__PURE__ */ u4("div", { className: "flex-1 overflow-hidden", children: /* @__PURE__ */ u4(
          "div",
          {
            ref: refContainer,
            onMouseLeave,
            className: "h-full overflow-auto will-change-transform",
            children: /* @__PURE__ */ u4(
              "div",
              {
                className: "relative w-full",
                style: {
                  height: totalSize
                },
                children: virtualItems.map((virtualItem) => {
                  const node = visibleNodes[virtualItem.index];
                  if (!node) return null;
                  const isSelected = Store.inspectState.value.kind === "focused" && node.element === Store.inspectState.value.focusedDomElement;
                  const isKeyboardSelected = virtualItem.index === selectedIndex;
                  return /* @__PURE__ */ u4(
                    "div",
                    {
                      className: cn(
                        "absolute left-0 w-full overflow-hidden",
                        "text-neutral-400 hover:text-neutral-300",
                        "bg-transparent hover:bg-[#5f3f9a]/20",
                        {
                          "text-neutral-300 bg-[#5f3f9a]/40 hover:bg-[#5f3f9a]/40": isSelected || isKeyboardSelected
                        }
                      ),
                      style: {
                        top: virtualItem.start,
                        height: ITEM_HEIGHT
                      },
                      children: /* @__PURE__ */ u4(
                        "div",
                        {
                          className: "w-full h-full",
                          style: {
                            paddingLeft: `calc(${node.depth} * var(--indentation-size))`
                          },
                          children: /* @__PURE__ */ u4(
                            TreeNodeItem,
                            {
                              node,
                              onElementClick: handleElementClick,
                              collapsedNodes,
                              onToggle: handleToggle,
                              searchValue
                            }
                          )
                        }
                      )
                    },
                    node.nodeId
                  );
                })
              }
            )
          }
        ) })
      ] })
    ] });
  };

  // src/web/components/widget/header.tsx
  var HeaderInspect = () => {
    const refReRenders = A2(null);
    const refTiming = A2(null);
    const isSettingsOpen = signalIsSettingsOpen.value;
    const [currentFiber, setCurrentFiber] = h2(null);
    y2(() => {
      const unSubState = Store.inspectState.subscribe((state) => {
        if (state.kind !== "focused") return;
        const fiber = state.fiber;
        if (!fiber) return;
        setCurrentFiber(fiber);
      });
      return unSubState;
    }, []);
    y2(() => {
      const unSubTimeline = timelineState.subscribe((state) => {
        if (Store.inspectState.value.kind !== "focused") return;
        if (!refReRenders.current || !refTiming.current) return;
        const { totalUpdates, currentIndex, updates, isVisible, windowOffset } = state;
        const reRenders = Math.max(0, totalUpdates - 1);
        const headerText = isVisible ? `#${windowOffset + currentIndex} Re-render` : `${reRenders} Re-renders`;
        let formattedTime;
        if (reRenders > 0 && currentIndex >= 0 && currentIndex < updates.length) {
          const time = updates[currentIndex]?.fiberInfo?.selfTime;
          formattedTime = time > 0 ? time < 0.1 - Number.EPSILON ? "< 0.1ms" : `${Number(time.toFixed(1))}ms` : void 0;
        }
        refReRenders.current.dataset.text = `${headerText}${reRenders > 0 && formattedTime ? " \u2022" : ""}`;
        if (formattedTime) {
          refTiming.current.dataset.text = formattedTime;
        }
      });
      return unSubTimeline;
    }, []);
    const componentName = T2(() => {
      if (!currentFiber) return null;
      const { name, wrappers, wrapperTypes } = getExtendedDisplayName(currentFiber);
      const title = wrappers.length ? `${wrappers.join("(")}(${name})${")".repeat(wrappers.length)}` : name ?? "";
      const firstWrapperType = wrapperTypes[0];
      return /* @__PURE__ */ u4(
        "span",
        {
          title,
          className: "flex items-center gap-x-1",
          children: [
            name ?? "Unknown",
            /* @__PURE__ */ u4(
              "span",
              {
                title: firstWrapperType?.title,
                className: "flex items-center gap-x-1 text-[10px] text-purple-400",
                children: !!firstWrapperType && /* @__PURE__ */ u4(k, { children: [
                  /* @__PURE__ */ u4(
                    "span",
                    {
                      className: cn(
                        "rounded py-[1px] px-1",
                        "truncate",
                        {
                          "bg-purple-800 text-neutral-400": firstWrapperType.compiler,
                          "bg-neutral-700 text-neutral-300": !firstWrapperType.compiler,
                          "bg-[#5f3f9a] text-white": firstWrapperType.type === "memo"
                        }
                      ),
                      children: firstWrapperType.type
                    },
                    firstWrapperType.type
                  ),
                  firstWrapperType.compiler && /* @__PURE__ */ u4("span", { className: "text-yellow-300", children: "\u2728" })
                ] })
              }
            ),
            wrapperTypes.length > 1 && /* @__PURE__ */ u4("span", { className: "text-[10px] text-neutral-400", children: [
              "\xD7",
              wrapperTypes.length - 1
            ] }),
            /* @__PURE__ */ u4("samp", { className: "text-neutral-500", children: " \u2022 " })
          ]
        }
      );
    }, [currentFiber]);
    return /* @__PURE__ */ u4(
      "div",
      {
        className: cn(
          "absolute inset-0 flex items-center gap-x-2",
          "translate-y-0",
          "transition-transform duration-300",
          {
            "-translate-y-[200%]": isSettingsOpen
          }
        ),
        children: [
          componentName,
          /* @__PURE__ */ u4("div", { className: "flex items-center gap-x-2 mr-auto text-xs text-[#888]", children: [
            /* @__PURE__ */ u4(
              "span",
              {
                ref: refReRenders,
                className: "with-data-text cursor-pointer !overflow-visible",
                title: "Click to toggle between rerenders and total renders"
              }
            ),
            /* @__PURE__ */ u4("span", { ref: refTiming, className: "with-data-text !overflow-visible" })
          ] })
        ]
      }
    );
  };
  var HeaderSettings = () => {
    const isSettingsOpen = signalIsSettingsOpen.value;
    return /* @__PURE__ */ u4(
      "span",
      {
        "data-text": "Settings",
        className: cn(
          "absolute inset-0 flex items-center",
          "with-data-text",
          "-translate-y-[200%]",
          "transition-transform duration-300",
          {
            "translate-y-0": isSettingsOpen
          }
        )
      }
    );
  };
  var Header = () => {
    const handleClose = () => {
      if (signalIsSettingsOpen.value) {
        signalIsSettingsOpen.value = false;
        return;
      }
      Store.inspectState.value = {
        kind: "inspect-off"
      };
    };
    return /* @__PURE__ */ u4("div", { className: "react-scan-header", children: [
      /* @__PURE__ */ u4("div", { className: "relative flex-1 h-full", children: [
        /* @__PURE__ */ u4(HeaderSettings, {}),
        /* @__PURE__ */ u4(HeaderInspect, {})
      ] }),
      /* @__PURE__ */ u4(
        "button",
        {
          type: "button",
          title: "Close",
          className: "react-scan-close-button",
          onClick: handleClose,
          children: /* @__PURE__ */ u4(Icon, { name: "icon-close" })
        }
      )
    ] });
  };

  // src/web/components/widget/helpers.ts
  var WindowDimensions = class {
    constructor(width, height) {
      this.width = width;
      this.height = height;
      this.maxWidth = width - SAFE_AREA * 2;
      this.maxHeight = height - SAFE_AREA * 2;
    }
    rightEdge(width) {
      return this.width - width - SAFE_AREA;
    }
    bottomEdge(height) {
      return this.height - height - SAFE_AREA;
    }
    isFullWidth(width) {
      return width >= this.maxWidth;
    }
    isFullHeight(height) {
      return height >= this.maxHeight;
    }
  };
  var cachedWindowDimensions;
  var getWindowDimensions = () => {
    const currentWidth = window.innerWidth;
    const currentHeight = window.innerHeight;
    if (cachedWindowDimensions && cachedWindowDimensions.width === currentWidth && cachedWindowDimensions.height === currentHeight) {
      return cachedWindowDimensions;
    }
    cachedWindowDimensions = new WindowDimensions(currentWidth, currentHeight);
    return cachedWindowDimensions;
  };
  var getOppositeCorner = (position, currentCorner, isFullScreen, isFullWidth, isFullHeight) => {
    if (isFullScreen) {
      if (position === "top-left") return "bottom-right";
      if (position === "top-right") return "bottom-left";
      if (position === "bottom-left") return "top-right";
      if (position === "bottom-right") return "top-left";
      const [vertical, horizontal] = currentCorner.split("-");
      if (position === "left") return `${vertical}-right`;
      if (position === "right") return `${vertical}-left`;
      if (position === "top") return `bottom-${horizontal}`;
      if (position === "bottom") return `top-${horizontal}`;
    }
    if (isFullWidth) {
      if (position === "left")
        return `${currentCorner.split("-")[0]}-right`;
      if (position === "right")
        return `${currentCorner.split("-")[0]}-left`;
    }
    if (isFullHeight) {
      if (position === "top")
        return `bottom-${currentCorner.split("-")[1]}`;
      if (position === "bottom")
        return `top-${currentCorner.split("-")[1]}`;
    }
    return currentCorner;
  };
  var calculatePosition = (corner, width, height) => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const isMinimized = width === MIN_SIZE.width;
    const effectiveWidth = isMinimized ? width : Math.min(width, windowWidth - SAFE_AREA * 2);
    const effectiveHeight = isMinimized ? height : Math.min(height, windowHeight - SAFE_AREA * 2);
    let x3;
    let y4;
    switch (corner) {
      case "top-right":
        x3 = windowWidth - effectiveWidth - SAFE_AREA;
        y4 = SAFE_AREA;
        break;
      case "bottom-right":
        x3 = windowWidth - effectiveWidth - SAFE_AREA;
        y4 = windowHeight - effectiveHeight - SAFE_AREA;
        break;
      case "bottom-left":
        x3 = SAFE_AREA;
        y4 = windowHeight - effectiveHeight - SAFE_AREA;
        break;
      case "top-left":
        x3 = SAFE_AREA;
        y4 = SAFE_AREA;
        break;
      default:
        x3 = SAFE_AREA;
        y4 = SAFE_AREA;
        break;
    }
    if (isMinimized) {
      x3 = Math.max(
        SAFE_AREA,
        Math.min(x3, windowWidth - effectiveWidth - SAFE_AREA)
      );
      y4 = Math.max(
        SAFE_AREA,
        Math.min(y4, windowHeight - effectiveHeight - SAFE_AREA)
      );
    }
    return { x: x3, y: y4 };
  };
  var positionMatchesCorner = (position, corner) => {
    const [vertical, horizontal] = corner.split("-");
    return position !== vertical && position !== horizontal;
  };
  var getHandleVisibility = (position, corner, isFullWidth, isFullHeight) => {
    if (isFullWidth && isFullHeight) {
      return true;
    }
    if (!isFullWidth && !isFullHeight) {
      return positionMatchesCorner(position, corner);
    }
    if (isFullWidth) {
      return position !== corner.split("-")[0];
    }
    if (isFullHeight) {
      return position !== corner.split("-")[1];
    }
    return false;
  };
  var calculateBoundedSize = (currentSize, delta, isWidth) => {
    const min = isWidth ? MIN_SIZE.width : MIN_SIZE.initialHeight;
    const max = isWidth ? getWindowDimensions().maxWidth : getWindowDimensions().maxHeight;
    const newSize = currentSize + delta;
    return Math.min(Math.max(min, newSize), max);
  };
  var calculateNewSizeAndPosition = (position, initialSize, initialPosition, deltaX, deltaY) => {
    const maxWidth = window.innerWidth - SAFE_AREA * 2;
    const maxHeight = window.innerHeight - SAFE_AREA * 2;
    let newWidth = initialSize.width;
    let newHeight = initialSize.height;
    let newX = initialPosition.x;
    let newY = initialPosition.y;
    if (position.includes("right")) {
      const availableWidth = window.innerWidth - initialPosition.x - SAFE_AREA;
      const proposedWidth = Math.min(initialSize.width + deltaX, availableWidth);
      newWidth = Math.min(maxWidth, Math.max(MIN_SIZE.width, proposedWidth));
    }
    if (position.includes("left")) {
      const availableWidth = initialPosition.x + initialSize.width - SAFE_AREA;
      const proposedWidth = Math.min(initialSize.width - deltaX, availableWidth);
      newWidth = Math.min(maxWidth, Math.max(MIN_SIZE.width, proposedWidth));
      newX = initialPosition.x - (newWidth - initialSize.width);
    }
    if (position.includes("bottom")) {
      const availableHeight = window.innerHeight - initialPosition.y - SAFE_AREA;
      const proposedHeight = Math.min(
        initialSize.height + deltaY,
        availableHeight
      );
      newHeight = Math.min(
        maxHeight,
        Math.max(MIN_SIZE.initialHeight, proposedHeight)
      );
    }
    if (position.includes("top")) {
      const availableHeight = initialPosition.y + initialSize.height - SAFE_AREA;
      const proposedHeight = Math.min(
        initialSize.height - deltaY,
        availableHeight
      );
      newHeight = Math.min(
        maxHeight,
        Math.max(MIN_SIZE.initialHeight, proposedHeight)
      );
      newY = initialPosition.y - (newHeight - initialSize.height);
    }
    newX = Math.max(
      SAFE_AREA,
      Math.min(newX, window.innerWidth - SAFE_AREA - newWidth)
    );
    newY = Math.max(
      SAFE_AREA,
      Math.min(newY, window.innerHeight - SAFE_AREA - newHeight)
    );
    return {
      newSize: { width: newWidth, height: newHeight },
      newPosition: { x: newX, y: newY }
    };
  };
  var getClosestCorner = (position) => {
    const windowDims = getWindowDimensions();
    const distances = {
      "top-left": Math.hypot(position.x, position.y),
      "top-right": Math.hypot(windowDims.maxWidth - position.x, position.y),
      "bottom-left": Math.hypot(position.x, windowDims.maxHeight - position.y),
      "bottom-right": Math.hypot(
        windowDims.maxWidth - position.x,
        windowDims.maxHeight - position.y
      )
    };
    let closest = "top-left";
    for (const key in distances) {
      if (distances[key] < distances[closest]) {
        closest = key;
      }
    }
    return closest;
  };
  var getBestCorner = (mouseX, mouseY, initialMouseX, initialMouseY, threshold = 100) => {
    const deltaX = initialMouseX !== void 0 ? mouseX - initialMouseX : 0;
    const deltaY = initialMouseY !== void 0 ? mouseY - initialMouseY : 0;
    const windowCenterX = window.innerWidth / 2;
    const windowCenterY = window.innerHeight / 2;
    const movingRight = deltaX > threshold;
    const movingLeft = deltaX < -threshold;
    const movingDown = deltaY > threshold;
    const movingUp = deltaY < -threshold;
    if (movingRight || movingLeft) {
      const isBottom = mouseY > windowCenterY;
      return movingRight ? isBottom ? "bottom-right" : "top-right" : isBottom ? "bottom-left" : "top-left";
    }
    if (movingDown || movingUp) {
      const isRight = mouseX > windowCenterX;
      return movingDown ? isRight ? "bottom-right" : "bottom-left" : isRight ? "top-right" : "top-left";
    }
    return mouseX > windowCenterX ? mouseY > windowCenterY ? "bottom-right" : "top-right" : mouseY > windowCenterY ? "bottom-left" : "top-left";
  };

  // src/web/components/widget/resize-handle.tsx
  var ResizeHandle = ({ position }) => {
    const refContainer = A2(null);
    const prevWidth = A2(null);
    const prevHeight = A2(null);
    const prevCorner = A2(null);
    y2(() => {
      const container = refContainer.current;
      if (!container) return;
      const updateVisibility = (isFocused) => {
        const isVisible = isFocused && getHandleVisibility(
          position,
          signalWidget.value.corner,
          signalWidget.value.dimensions.isFullWidth,
          signalWidget.value.dimensions.isFullHeight
        );
        if (isVisible) {
          container.classList.remove(
            "hidden",
            "pointer-events-none",
            "opacity-0"
          );
        } else {
          container.classList.add("hidden", "pointer-events-none", "opacity-0");
        }
      };
      const unsubscribeSignalWidget = signalWidget.subscribe((state) => {
        if (prevWidth.current !== null && prevHeight.current !== null && prevCorner.current !== null && state.dimensions.width === prevWidth.current && state.dimensions.height === prevHeight.current && state.corner === prevCorner.current) {
          return;
        }
        updateVisibility(Store.inspectState.value.kind === "focused");
        prevWidth.current = state.dimensions.width;
        prevHeight.current = state.dimensions.height;
        prevCorner.current = state.corner;
      });
      const unsubscribeStoreInspectState = Store.inspectState.subscribe(
        (state) => {
          updateVisibility(state.kind === "focused");
        }
      );
      return () => {
        unsubscribeSignalWidget();
        unsubscribeStoreInspectState();
        prevWidth.current = null;
        prevHeight.current = null;
        prevCorner.current = null;
      };
    }, []);
    const handleResize = q2((e4) => {
      e4.preventDefault();
      e4.stopPropagation();
      const widget = signalRefWidget.value;
      if (!widget) return;
      const containerStyle = widget.style;
      const { dimensions } = signalWidget.value;
      const initialX = e4.clientX;
      const initialY = e4.clientY;
      const initialWidth = dimensions.width;
      const initialHeight = dimensions.height;
      const initialPosition = dimensions.position;
      signalWidget.value = {
        ...signalWidget.value,
        dimensions: {
          ...dimensions,
          isFullWidth: false,
          isFullHeight: false,
          width: initialWidth,
          height: initialHeight,
          position: initialPosition
        }
      };
      let rafId = null;
      const handleMouseMove = (e5) => {
        if (rafId) return;
        containerStyle.transition = "none";
        rafId = requestAnimationFrame(() => {
          const { newSize, newPosition } = calculateNewSizeAndPosition(
            position,
            { width: initialWidth, height: initialHeight },
            initialPosition,
            e5.clientX - initialX,
            e5.clientY - initialY
          );
          containerStyle.transform = `translate3d(${newPosition.x}px, ${newPosition.y}px, 0)`;
          containerStyle.width = `${newSize.width}px`;
          containerStyle.height = `${newSize.height}px`;
          const maxTreeWidth = Math.floor(newSize.width - MIN_SIZE.width / 2);
          const currentTreeWidth = signalWidget.value.componentsTree.width;
          const newTreeWidth = Math.min(
            maxTreeWidth,
            Math.max(MIN_CONTAINER_WIDTH, currentTreeWidth)
          );
          signalWidget.value = {
            ...signalWidget.value,
            dimensions: {
              isFullWidth: false,
              isFullHeight: false,
              width: newSize.width,
              height: newSize.height,
              position: newPosition
            },
            componentsTree: {
              ...signalWidget.value.componentsTree,
              width: newTreeWidth
            }
          };
          rafId = null;
        });
      };
      const handleMouseUp = () => {
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        const { dimensions: dimensions2, corner } = signalWidget.value;
        const windowDims = getWindowDimensions();
        const isCurrentFullWidth = windowDims.isFullWidth(dimensions2.width);
        const isCurrentFullHeight = windowDims.isFullHeight(dimensions2.height);
        const isFullScreen = isCurrentFullWidth && isCurrentFullHeight;
        let newCorner = corner;
        if (isFullScreen || isCurrentFullWidth || isCurrentFullHeight) {
          newCorner = getClosestCorner(dimensions2.position);
        }
        const newPosition = calculatePosition(
          newCorner,
          dimensions2.width,
          dimensions2.height
        );
        const onTransitionEnd = () => {
          widget.removeEventListener("transitionend", onTransitionEnd);
        };
        widget.addEventListener("transitionend", onTransitionEnd);
        containerStyle.transform = `translate3d(${newPosition.x}px, ${newPosition.y}px, 0)`;
        signalWidget.value = {
          ...signalWidget.value,
          corner: newCorner,
          dimensions: {
            isFullWidth: isCurrentFullWidth,
            isFullHeight: isCurrentFullHeight,
            width: dimensions2.width,
            height: dimensions2.height,
            position: newPosition
          },
          lastDimensions: {
            isFullWidth: isCurrentFullWidth,
            isFullHeight: isCurrentFullHeight,
            width: dimensions2.width,
            height: dimensions2.height,
            position: newPosition
          }
        };
        saveLocalStorage(LOCALSTORAGE_KEY, {
          corner: newCorner,
          dimensions: signalWidget.value.dimensions,
          lastDimensions: signalWidget.value.lastDimensions,
          componentsTree: signalWidget.value.componentsTree
        });
      };
      document.addEventListener("mousemove", handleMouseMove, {
        passive: true
      });
      document.addEventListener("mouseup", handleMouseUp);
    }, []);
    const handleDoubleClick = q2((e4) => {
      e4.preventDefault();
      e4.stopPropagation();
      const widget = signalRefWidget.value;
      if (!widget) return;
      const containerStyle = widget.style;
      const { dimensions, corner } = signalWidget.value;
      const windowDims = getWindowDimensions();
      const isCurrentFullWidth = windowDims.isFullWidth(dimensions.width);
      const isCurrentFullHeight = windowDims.isFullHeight(dimensions.height);
      const isFullScreen = isCurrentFullWidth && isCurrentFullHeight;
      const isPartiallyMaximized = (isCurrentFullWidth || isCurrentFullHeight) && !isFullScreen;
      let newWidth = dimensions.width;
      let newHeight = dimensions.height;
      const newCorner = getOppositeCorner(
        position,
        corner,
        isFullScreen,
        isCurrentFullWidth,
        isCurrentFullHeight
      );
      if (position === "left" || position === "right") {
        newWidth = isCurrentFullWidth ? dimensions.width : windowDims.maxWidth;
        if (isPartiallyMaximized) {
          newWidth = isCurrentFullWidth ? MIN_SIZE.width : windowDims.maxWidth;
        }
      } else {
        newHeight = isCurrentFullHeight ? dimensions.height : windowDims.maxHeight;
        if (isPartiallyMaximized) {
          newHeight = isCurrentFullHeight ? MIN_SIZE.initialHeight : windowDims.maxHeight;
        }
      }
      if (isFullScreen) {
        if (position === "left" || position === "right") {
          newWidth = MIN_SIZE.width;
        } else {
          newHeight = MIN_SIZE.initialHeight;
        }
      }
      const newPosition = calculatePosition(newCorner, newWidth, newHeight);
      const newDimensions = {
        isFullWidth: windowDims.isFullWidth(newWidth),
        isFullHeight: windowDims.isFullHeight(newHeight),
        width: newWidth,
        height: newHeight,
        position: newPosition
      };
      const maxTreeWidth = Math.floor(newWidth - MIN_SIZE.width / 2);
      const currentTreeWidth = signalWidget.value.componentsTree.width;
      const defaultWidth = Math.floor(newWidth * 0.3);
      const newTreeWidth = isCurrentFullWidth ? MIN_CONTAINER_WIDTH : (position === "left" || position === "right") && !isCurrentFullWidth ? Math.min(maxTreeWidth, Math.max(MIN_CONTAINER_WIDTH, defaultWidth)) : Math.min(maxTreeWidth, Math.max(MIN_CONTAINER_WIDTH, currentTreeWidth));
      requestAnimationFrame(() => {
        signalWidget.value = {
          corner: newCorner,
          dimensions: newDimensions,
          lastDimensions: dimensions,
          componentsTree: {
            ...signalWidget.value.componentsTree,
            width: newTreeWidth
          }
        };
        containerStyle.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
        containerStyle.width = `${newWidth}px`;
        containerStyle.height = `${newHeight}px`;
        containerStyle.transform = `translate3d(${newPosition.x}px, ${newPosition.y}px, 0)`;
      });
      saveLocalStorage(LOCALSTORAGE_KEY, {
        corner: newCorner,
        dimensions: newDimensions,
        lastDimensions: dimensions,
        componentsTree: {
          ...signalWidget.value.componentsTree,
          width: newTreeWidth
        }
      });
    }, []);
    return /* @__PURE__ */ u4(
      "div",
      {
        ref: refContainer,
        onMouseDown: handleResize,
        onDblClick: handleDoubleClick,
        className: cn(
          "absolute z-50",
          "flex items-center justify-center",
          "group",
          "transition-colors select-none",
          "peer",
          {
            "resize-left peer/left": position === "left",
            "resize-right peer/right z-10": position === "right",
            "resize-top peer/top": position === "top",
            "resize-bottom peer/bottom": position === "bottom"
          }
        ),
        children: /* @__PURE__ */ u4("span", { className: "resize-line-wrapper", children: /* @__PURE__ */ u4("span", { className: "resize-line", children: /* @__PURE__ */ u4(
          Icon,
          {
            name: "icon-ellipsis",
            size: 18,
            className: cn("text-neutral-400", {
              "rotate-90": position === "left" || position === "right"
            })
          }
        ) }) })
      }
    );
  };

  // src/web/components/toggle/index.tsx
  var Toggle = ({
    checked,
    onChange,
    class: className,
    ...props
  }) => {
    return /* @__PURE__ */ u4("div", { className: cn("react-scan-toggle", className), children: [
      /* @__PURE__ */ u4(
        "input",
        {
          type: "checkbox",
          checked,
          onChange,
          ...props
        }
      ),
      /* @__PURE__ */ u4("div", {})
    ] });
  };

  // src/web/components/widget/fps-meter.tsx
  var FpsMeter = () => {
    const refFps = A2(null);
    y2(() => {
      const intervalId = setInterval(() => {
        const fps2 = getFPS();
        let color = "#fff";
        if (fps2) {
          if (fps2 < 30) color = "#f87171";
          if (fps2 < 50) color = "#fbbf24";
        }
        if (refFps.current) {
          refFps.current.setAttribute("data-text", fps2.toString());
          refFps.current.style.color = color;
        }
      }, 100);
      return () => clearInterval(intervalId);
    }, []);
    return /* @__PURE__ */ u4(
      "span",
      {
        className: cn(
          "flex items-center gap-x-1 px-1.5",
          "h-full",
          "rounded-xl",
          "font-mono text-xs font-medium",
          "bg-neutral-600"
        ),
        children: [
          /* @__PURE__ */ u4(
            "span",
            {
              ref: refFps,
              "data-text": "120",
              className: "transition-color ease-in-out with-data-text"
            }
          ),
          /* @__PURE__ */ u4("span", { className: "tracking-wide font-mono text-xxs mt-[1px]", children: "FPS" })
        ]
      }
    );
  };
  var fps_meter_default = FpsMeter;

  // src/web/components/widget/toolbar/index.tsx
  var Toolbar = constant(() => {
    const refSettingsButton = A2(null);
    const inspectState = Store.inspectState;
    const isInspectActive = inspectState.value.kind === "inspecting";
    const isInspectFocused = inspectState.value.kind === "focused";
    const onToggleInspect = q2(() => {
      const currentState = Store.inspectState.value;
      switch (currentState.kind) {
        case "inspecting":
          Store.inspectState.value = {
            kind: "inspect-off"
          };
          break;
        case "focused":
          Store.inspectState.value = {
            kind: "inspect-off"
          };
          break;
        case "inspect-off":
          Store.inspectState.value = {
            kind: "inspecting",
            hoveredDomElement: null
          };
          break;
      }
    }, []);
    const onToggleActive = q2((e4) => {
      e4.preventDefault();
      e4.stopPropagation();
      if (!ReactScanInternals.instrumentation) {
        return;
      }
      const isPaused = !ReactScanInternals.instrumentation.isPaused.value;
      ReactScanInternals.instrumentation.isPaused.value = isPaused;
      const existingLocalStorageOptions = readLocalStorage("react-scan-options");
      saveLocalStorage("react-scan-options", {
        ...existingLocalStorageOptions,
        enabled: !isPaused
      });
    }, []);
    y2(() => {
      const unSubState = Store.inspectState.subscribe((state) => {
        if (state.kind === "uninitialized") {
          Store.inspectState.value = {
            kind: "inspect-off"
          };
        }
      });
      const unSubSettings = signalIsSettingsOpen.subscribe((state) => {
        refSettingsButton.current?.classList.toggle("text-inspect", state);
      });
      return () => {
        unSubState();
        unSubSettings();
      };
    }, []);
    let inspectIcon = null;
    let inspectColor = "#999";
    if (isInspectActive) {
      inspectIcon = /* @__PURE__ */ u4(Icon, { name: "icon-inspect" });
      inspectColor = "#8e61e3";
    } else if (isInspectFocused) {
      inspectIcon = /* @__PURE__ */ u4(Icon, { name: "icon-focus" });
      inspectColor = "#8e61e3";
    } else {
      inspectIcon = /* @__PURE__ */ u4(Icon, { name: "icon-inspect" });
      inspectColor = "#999";
    }
    return /* @__PURE__ */ u4(
      "div",
      {
        className: "flex max-h-9 min-h-9 flex-1 items-stretch overflow-hidden gap-x-[6px]",
        children: [
          /* @__PURE__ */ u4("div", { className: "h-full flex items-center min-w-fit gap-x-[6px]", children: [
            /* @__PURE__ */ u4(
              "button",
              {
                type: "button",
                id: "react-scan-inspect-element",
                title: "Inspect element",
                onClick: onToggleInspect,
                className: "button flex items-center justify-center px-3 h-full",
                style: { color: inspectColor },
                children: inspectIcon
              }
            ),
            /* @__PURE__ */ u4(
              Toggle,
              {
                checked: !ReactScanInternals.instrumentation?.isPaused.value,
                onChange: onToggleActive,
                title: ReactScanInternals.instrumentation?.isPaused.value ? "Start" : "Stop"
              }
            )
          ] }),
          /* @__PURE__ */ u4(
            "div",
            {
              className: cn(
                "flex items-center justify-end w-full gap-x-2",
                "pl-2 p-1.5",
                "whitespace-nowrap text-sm text-white"
              ),
              children: [
                "react-scan",
                /* @__PURE__ */ u4(fps_meter_default, {})
              ]
            }
          )
        ]
      }
    );
  });

  // src/web/components/widget/index.tsx
  var Widget = () => {
    const refWidget = A2(null);
    const refContent = A2(null);
    const refInitialMinimizedWidth = A2(0);
    const refInitialMinimizedHeight = A2(0);
    const updateWidgetPosition = q2((shouldSave = true) => {
      if (!refWidget.current) return;
      const inspectState = Store.inspectState.value;
      const isInspectFocused = inspectState.kind === "focused";
      const { corner } = signalWidget.value;
      let newWidth;
      let newHeight;
      if (isInspectFocused || signalIsSettingsOpen.value) {
        const lastDims = signalWidget.value.lastDimensions;
        newWidth = calculateBoundedSize(lastDims.width, 0, true);
        newHeight = calculateBoundedSize(lastDims.height, 0, false);
      } else {
        const currentDims = signalWidget.value.dimensions;
        if (currentDims.width > refInitialMinimizedWidth.current) {
          signalWidget.value = {
            ...signalWidget.value,
            lastDimensions: {
              isFullWidth: currentDims.isFullWidth,
              isFullHeight: currentDims.isFullHeight,
              width: currentDims.width,
              height: currentDims.height,
              position: currentDims.position
            }
          };
        }
        newWidth = refInitialMinimizedWidth.current;
        newHeight = refInitialMinimizedHeight.current;
      }
      const newPosition = calculatePosition(corner, newWidth, newHeight);
      const isTooSmall = newWidth < MIN_SIZE.width || newHeight < MIN_SIZE.initialHeight;
      const shouldPersist = shouldSave && !isTooSmall;
      const container = refWidget.current;
      const containerStyle = container.style;
      let rafId = null;
      const onTransitionEnd = () => {
        updateDimensions();
        container.removeEventListener("transitionend", onTransitionEnd);
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      };
      container.addEventListener("transitionend", onTransitionEnd);
      containerStyle.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
      rafId = requestAnimationFrame(() => {
        containerStyle.width = `${newWidth}px`;
        containerStyle.height = `${newHeight}px`;
        containerStyle.transform = `translate3d(${newPosition.x}px, ${newPosition.y}px, 0)`;
        rafId = null;
      });
      const newDimensions = {
        isFullWidth: newWidth >= window.innerWidth - SAFE_AREA * 2,
        isFullHeight: newHeight >= window.innerHeight - SAFE_AREA * 2,
        width: newWidth,
        height: newHeight,
        position: newPosition
      };
      signalWidget.value = {
        corner,
        dimensions: newDimensions,
        lastDimensions: isInspectFocused ? signalWidget.value.lastDimensions : newWidth > refInitialMinimizedWidth.current ? newDimensions : signalWidget.value.lastDimensions,
        componentsTree: signalWidget.value.componentsTree
      };
      if (shouldPersist) {
        saveLocalStorage(LOCALSTORAGE_KEY, {
          corner: signalWidget.value.corner,
          dimensions: signalWidget.value.dimensions,
          lastDimensions: signalWidget.value.lastDimensions,
          componentsTree: signalWidget.value.componentsTree
        });
      }
      updateDimensions();
    }, []);
    const handleDrag = q2(
      (e4) => {
        e4.preventDefault();
        if (!refWidget.current || e4.target.closest("button"))
          return;
        const container = refWidget.current;
        const containerStyle = container.style;
        const { dimensions } = signalWidget.value;
        const initialMouseX = e4.clientX;
        const initialMouseY = e4.clientY;
        const initialX = dimensions.position.x;
        const initialY = dimensions.position.y;
        let currentX = initialX;
        let currentY = initialY;
        let rafId = null;
        let hasMoved = false;
        let lastMouseX = initialMouseX;
        let lastMouseY = initialMouseY;
        const handleMouseMove = (e5) => {
          if (rafId) return;
          hasMoved = true;
          lastMouseX = e5.clientX;
          lastMouseY = e5.clientY;
          rafId = requestAnimationFrame(() => {
            const deltaX = lastMouseX - initialMouseX;
            const deltaY = lastMouseY - initialMouseY;
            currentX = Number(initialX) + deltaX;
            currentY = Number(initialY) + deltaY;
            containerStyle.transition = "none";
            containerStyle.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
            rafId = null;
          });
        };
        const handleMouseUp = () => {
          if (!container) return;
          if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
          }
          document.removeEventListener("mousemove", handleMouseMove);
          document.removeEventListener("mouseup", handleMouseUp);
          const totalDeltaX = Math.abs(lastMouseX - initialMouseX);
          const totalDeltaY = Math.abs(lastMouseY - initialMouseY);
          const totalMovement = Math.sqrt(totalDeltaX * totalDeltaX + totalDeltaY * totalDeltaY);
          if (!hasMoved || totalMovement < 60) return;
          const newCorner = getBestCorner(
            lastMouseX,
            lastMouseY,
            initialMouseX,
            initialMouseY,
            Store.inspectState.value.kind === "focused" ? 80 : 40
          );
          if (newCorner === signalWidget.value.corner) {
            containerStyle.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
            const currentPosition = signalWidget.value.dimensions.position;
            requestAnimationFrame(() => {
              containerStyle.transform = `translate3d(${currentPosition.x}px, ${currentPosition.y}px, 0)`;
            });
            return;
          }
          const snappedPosition = calculatePosition(
            newCorner,
            dimensions.width,
            dimensions.height
          );
          if (currentX === initialX && currentY === initialY) return;
          const onTransitionEnd = () => {
            containerStyle.transition = "none";
            updateDimensions();
            container.removeEventListener("transitionend", onTransitionEnd);
            if (rafId) {
              cancelAnimationFrame(rafId);
              rafId = null;
            }
          };
          container.addEventListener("transitionend", onTransitionEnd);
          containerStyle.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
          requestAnimationFrame(() => {
            containerStyle.transform = `translate3d(${snappedPosition.x}px, ${snappedPosition.y}px, 0)`;
          });
          signalWidget.value = {
            corner: newCorner,
            dimensions: {
              isFullWidth: dimensions.isFullWidth,
              isFullHeight: dimensions.isFullHeight,
              width: dimensions.width,
              height: dimensions.height,
              position: snappedPosition
            },
            lastDimensions: signalWidget.value.lastDimensions,
            componentsTree: signalWidget.value.componentsTree
          };
          saveLocalStorage(LOCALSTORAGE_KEY, {
            corner: newCorner,
            dimensions: signalWidget.value.dimensions,
            lastDimensions: signalWidget.value.lastDimensions,
            componentsTree: signalWidget.value.componentsTree
          });
        };
        document.addEventListener("mousemove", handleMouseMove, {
          passive: true
        });
        document.addEventListener("mouseup", handleMouseUp);
      },
      []
    );
    y2(() => {
      if (!refWidget.current) return;
      refWidget.current.style.width = "min-content";
      refInitialMinimizedHeight.current = 36;
      refInitialMinimizedWidth.current = refWidget.current.offsetWidth;
      refWidget.current.style.maxWidth = `calc(100vw - ${SAFE_AREA * 2}px)`;
      refWidget.current.style.maxHeight = `calc(100vh - ${SAFE_AREA * 2}px)`;
      if (Store.inspectState.value.kind !== "focused") {
        signalWidget.value = {
          ...signalWidget.value,
          dimensions: {
            isFullWidth: false,
            isFullHeight: false,
            width: refInitialMinimizedWidth.current,
            height: refInitialMinimizedHeight.current,
            position: signalWidget.value.dimensions.position
          }
        };
      }
      signalRefWidget.value = refWidget.current;
      const unsubscribeSignalWidget = signalWidget.subscribe((widget) => {
        if (!refWidget.current) return;
        const { x: x3, y: y4 } = widget.dimensions.position;
        const { width, height } = widget.dimensions;
        const container = refWidget.current;
        requestAnimationFrame(() => {
          container.style.transform = `translate3d(${x3}px, ${y4}px, 0)`;
          container.style.width = `${width}px`;
          container.style.height = `${height}px`;
        });
      });
      signalIsSettingsOpen.subscribe(() => {
        updateWidgetPosition();
      });
      const unsubscribeStoreInspectState = Store.inspectState.subscribe((state) => {
        if (!refContent.current) return;
        if (state.kind === "inspecting") {
          toggleMultipleClasses(refContent.current, [
            "opacity-0",
            "duration-0",
            "delay-0"
          ]);
        }
        updateWidgetPosition();
      });
      const handleWindowResize = () => {
        updateWidgetPosition(true);
      };
      window.addEventListener("resize", handleWindowResize, { passive: true });
      return () => {
        window.removeEventListener("resize", handleWindowResize);
        unsubscribeStoreInspectState();
        unsubscribeSignalWidget();
        saveLocalStorage(LOCALSTORAGE_KEY, {
          ...defaultWidgetConfig,
          corner: signalWidget.value.corner
        });
      };
    }, []);
    return /* @__PURE__ */ u4(k, { children: [
      /* @__PURE__ */ u4(ScanOverlay, {}),
      /* @__PURE__ */ u4(
        "div",
        {
          id: "react-scan-toolbar",
          dir: "ltr",
          ref: refWidget,
          onMouseDown: handleDrag,
          className: cn(
            "fixed inset-0 rounded-lg shadow-lg",
            "flex flex-col",
            "font-mono text-[13px]",
            "user-select-none",
            "opacity-0",
            "cursor-move",
            "z-[124124124124]",
            "animate-fade-in animation-duration-300 animation-delay-300",
            "will-change-transform"
          ),
          children: [
            /* @__PURE__ */ u4(ResizeHandle, { position: "top" }),
            /* @__PURE__ */ u4(ResizeHandle, { position: "bottom" }),
            /* @__PURE__ */ u4(ResizeHandle, { position: "left" }),
            /* @__PURE__ */ u4(ResizeHandle, { position: "right" }),
            /* @__PURE__ */ u4(
              "div",
              {
                className: cn(
                  "flex flex-1 flex-col",
                  "overflow-hidden z-10",
                  "rounded-lg",
                  "bg-black",
                  "opacity-100",
                  "transition-[border-radius]",
                  "peer-hover/left:rounded-l-none",
                  "peer-hover/right:rounded-r-none",
                  "peer-hover/top:rounded-t-none",
                  "peer-hover/bottom:rounded-b-none"
                ),
                children: [
                  /* @__PURE__ */ u4(
                    "div",
                    {
                      ref: refContent,
                      className: cn(
                        "relative",
                        "flex-1",
                        "flex flex-col",
                        "rounded-t-lg",
                        "overflow-hidden",
                        "opacity-100",
                        "transition-[opacity]"
                      ),
                      children: [
                        /* @__PURE__ */ u4(Header, {}),
                        /* @__PURE__ */ u4(
                          "div",
                          {
                            className: cn(
                              "relative",
                              "flex-1 flex",
                              "text-white",
                              "bg-[#0A0A0A]",
                              "transition-opacity delay-150",
                              "overflow-hidden",
                              "border-b border-white/10"
                            ),
                            children: Store.inspectState.value.kind === "focused" && /* @__PURE__ */ u4(k, { children: [
                              /* @__PURE__ */ u4(Inspector, {}),
                              /* @__PURE__ */ u4(ComponentsTree, {})
                            ] })
                          }
                        )
                      ]
                    }
                  ),
                  /* @__PURE__ */ u4(Toolbar, {})
                ]
              }
            )
          ]
        }
      )
    ] });
  };

  // src/web/toolbar.tsx
  var scriptLevelToolbar = null;
  var ToolbarErrorBoundary = class extends x {
    constructor() {
      super(...arguments);
      this.state = { hasError: false, error: null };
      this.handleReset = () => {
        this.setState({ hasError: false, error: null });
      };
    }
    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }
    render() {
      if (this.state.hasError) {
        return /* @__PURE__ */ u4("div", { className: "fixed bottom-4 right-4 z-[124124124124]", children: /* @__PURE__ */ u4("div", { className: "p-3 bg-black rounded-lg shadow-lg w-80", children: [
          /* @__PURE__ */ u4("div", { className: "flex items-center gap-2 mb-2 text-red-400 text-sm font-medium", children: [
            /* @__PURE__ */ u4(Icon, { name: "icon-flame", className: "text-red-500", size: 14 }),
            "React Scan ran into a problem"
          ] }),
          /* @__PURE__ */ u4("div", { className: "p-2 bg-black rounded font-mono text-xs text-red-300 mb-3 break-words", children: this.state.error?.message || JSON.stringify(this.state.error) }),
          /* @__PURE__ */ u4(
            "button",
            {
              type: "button",
              onClick: this.handleReset,
              className: "px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-medium transition-colors flex items-center justify-center gap-1.5",
              children: "Restart"
            }
          )
        ] }) });
      }
      return this.props.children;
    }
  };
  var createToolbar = (root) => {
    const container = document.createElement("div");
    container.id = "react-scan-toolbar-root";
    window.__REACT_SCAN_TOOLBAR_CONTAINER__ = container;
    scriptLevelToolbar = container;
    root.appendChild(container);
    D(
      /* @__PURE__ */ u4(ToolbarErrorBoundary, { children: /* @__PURE__ */ u4(Widget, {}) }),
      container
    );
    const originalRemove = container.remove.bind(container);
    container.remove = () => {
      if (container.hasChildNodes()) {
        scriptLevelToolbar = null;
        D(null, container);
        D(null, container);
      }
      originalRemove();
    };
    return container;
  };

  // src/core/index.ts
  var rootContainer = null;
  var shadowRoot = null;
  var initRootContainer = () => {
    if (rootContainer && shadowRoot) {
      return { rootContainer, shadowRoot };
    }
    rootContainer = document.createElement("div");
    rootContainer.id = "react-scan-root";
    shadowRoot = rootContainer.attachShadow({ mode: "open" });
    const fragment = document.createDocumentFragment();
    const cssStyles = document.createElement("style");
    cssStyles.textContent = styles_default;
    const iconSprite = new DOMParser().parseFromString(
      ICONS,
      "image/svg+xml"
    ).documentElement;
    fragment.appendChild(iconSprite);
    fragment.appendChild(cssStyles);
    shadowRoot.appendChild(fragment);
    document.documentElement.appendChild(rootContainer);
    return { rootContainer, shadowRoot };
  };
  var Store = {
    wasDetailsOpen: d3(true),
    isInIframe: d3(
      typeof window !== "undefined" && window.self !== window.top
    ),
    inspectState: d3({
      kind: "uninitialized"
    }),
    monitor: d3(null),
    fiberRoots: /* @__PURE__ */ new Set(),
    reportData: /* @__PURE__ */ new Map(),
    legacyReportData: /* @__PURE__ */ new Map(),
    lastReportTime: d3(0)
  };
  var ReactScanInternals = {
    instrumentation: null,
    componentAllowList: null,
    options: d3({
      enabled: true,
      includeChildren: true,
      playSound: false,
      log: false,
      showToolbar: true,
      renderCountThreshold: 0,
      report: void 0,
      alwaysShowLabels: false,
      animationSpeed: "fast",
      dangerouslyForceRunInProduction: false,
      smoothlyAnimateOutlines: true,
      trackUnnecessaryRenders: false
    }),
    onRender: null,
    scheduledOutlines: /* @__PURE__ */ new Map(),
    activeOutlines: /* @__PURE__ */ new Map(),
    Store
  };
  function isOptionKey(key) {
    return key in ReactScanInternals.options.value;
  }
  var validateOptions = (options) => {
    const errors = [];
    const validOptions = {};
    for (const key in options) {
      if (!isOptionKey(key)) continue;
      const value = options[key];
      switch (key) {
        case "enabled":
        // case 'includeChildren':
        case "log":
        case "showToolbar":
        // case 'report':
        // case 'alwaysShowLabels':
        case "dangerouslyForceRunInProduction":
          if (typeof value !== "boolean") {
            errors.push(`- ${key} must be a boolean. Got "${value}"`);
          } else {
            validOptions[key] = value;
          }
          break;
        // case 'renderCountThreshold':
        // case 'resetCountTimeout':
        //   if (typeof value !== 'number' || value < 0) {
        //     errors.push(`- ${key} must be a non-negative number. Got "${value}"`);
        //   } else {
        //     validOptions[key] = value as number;
        //   }
        //   break;
        case "animationSpeed":
          if (!["slow", "fast", "off"].includes(value)) {
            errors.push(
              `- Invalid animation speed "${value}". Using default "fast"`
            );
          } else {
            validOptions[key] = value;
          }
          break;
        case "onCommitStart":
          if (typeof value !== "function") {
            errors.push(`- ${key} must be a function. Got "${value}"`);
          } else {
            validOptions.onCommitStart = value;
          }
          break;
        case "onCommitFinish":
          if (typeof value !== "function") {
            errors.push(`- ${key} must be a function. Got "${value}"`);
          } else {
            validOptions.onCommitFinish = value;
          }
          break;
        case "onRender":
          if (typeof value !== "function") {
            errors.push(`- ${key} must be a function. Got "${value}"`);
          } else {
            validOptions.onRender = value;
          }
          break;
        case "onPaintStart":
        case "onPaintFinish":
          if (typeof value !== "function") {
            errors.push(`- ${key} must be a function. Got "${value}"`);
          } else {
            validOptions[key] = value;
          }
          break;
        // case 'trackUnnecessaryRenders': {
        //   validOptions.trackUnnecessaryRenders =
        //     typeof value === 'boolean' ? value : false;
        //   break;
        // }
        // case 'smoothlyAnimateOutlines': {
        //   validOptions.smoothlyAnimateOutlines =
        //     typeof value === 'boolean' ? value : false;
        //   break;
        // }
        default:
          errors.push(`- Unknown option "${key}"`);
      }
    }
    if (errors.length > 0) {
      console.warn(`[React Scan] Invalid options:
${errors.join("\n")}`);
    }
    return validOptions;
  };
  var getReport = (type) => {
    if (type) {
      for (const reportData of Array.from(Store.legacyReportData.values())) {
        if (reportData.type === type) {
          return reportData;
        }
      }
      return null;
    }
    return Store.legacyReportData;
  };
  var setOptions = (userOptions) => {
    const validOptions = validateOptions(userOptions);
    if (Object.keys(validOptions).length === 0) {
      return;
    }
    const newOptions = {
      ...ReactScanInternals.options.value,
      ...validOptions
    };
    const { instrumentation } = ReactScanInternals;
    if (instrumentation && "enabled" in validOptions) {
      instrumentation.isPaused.value = validOptions.enabled === false;
    }
    ReactScanInternals.options.value = newOptions;
    const existingLocalStorageOptions = readLocalStorage("react-scan-options");
    saveLocalStorage("react-scan-options", {
      ...newOptions,
      enabled: newOptions.showToolbar ? existingLocalStorageOptions?.enabled ?? newOptions.enabled ?? true : newOptions.enabled
    });
    return newOptions;
  };
  var getOptions = () => ReactScanInternals.options;
  var isProduction = null;
  var rdtHook;
  var getIsProduction = () => {
    if (isProduction !== null) {
      return isProduction;
    }
    rdtHook ??= getRDTHook();
    for (const renderer of rdtHook.renderers.values()) {
      const buildType = detectReactBuildType(renderer);
      if (buildType === "production") {
        isProduction = true;
      }
    }
    return isProduction;
  };
  var start = () => {
    if (typeof window === "undefined") {
      return;
    }
    if (getIsProduction() && !ReactScanInternals.options.value.dangerouslyForceRunInProduction) {
      return;
    }
    const localStorageOptions = readLocalStorage("react-scan-options");
    if (localStorageOptions) {
      const { enabled } = localStorageOptions;
      const validLocalOptions = validateOptions({ enabled });
      if (Object.keys(validLocalOptions).length > 0) {
        ReactScanInternals.options.value = {
          ...ReactScanInternals.options.value,
          ...validLocalOptions
        };
      }
    }
    const options = getOptions();
    idempotent_createToolbar(!!options.value.showToolbar);
    initReactScanInstrumentation();
    const isUsedInBrowserExtension = typeof window !== "undefined";
    if (!Store.monitor.value && !isUsedInBrowserExtension) {
      setTimeout(() => {
        if (isInstrumentationActive()) return;
        console.error(
          "[React Scan] Failed to load. Must import React Scan before React runs."
        );
      }, 5e3);
    }
  };
  var idempotent_createToolbar = (showToolbar) => {
    const windowToolbarContainer = window.__REACT_SCAN_TOOLBAR_CONTAINER__;
    if (!showToolbar) {
      windowToolbarContainer?.remove();
      return;
    }
    if (!scriptLevelToolbar && windowToolbarContainer) {
      windowToolbarContainer.remove();
      const { shadowRoot: shadowRoot3 } = initRootContainer();
      createToolbar(shadowRoot3);
      return;
    }
    if (scriptLevelToolbar && windowToolbarContainer) {
      return;
    }
    const { shadowRoot: shadowRoot2 } = initRootContainer();
    createToolbar(shadowRoot2);
  };
  var scan = (options = {}) => {
    setOptions(options);
    const isInIframe = Store.isInIframe.value;
    if (isInIframe) {
      return;
    }
    if (options.enabled === false && options.showToolbar !== true) {
      return;
    }
    start();
  };
  var useScan = (options = {}) => {
    setOptions(options);
    start();
  };
  var onRender = (type, _onRender) => {
    const prevOnRender = ReactScanInternals.onRender;
    ReactScanInternals.onRender = (fiber, renders) => {
      prevOnRender?.(fiber, renders);
      if (getType(fiber.type) === type) {
        _onRender(fiber, renders);
      }
    };
  };
  var ignoredProps = /* @__PURE__ */ new WeakSet();
  var ignoreScan = (node) => {
    if (node && typeof node === "object") {
      ignoredProps.add(node);
    }
  };

  // src/index.ts
  init();

  // src/auto.ts
  init();
  if (typeof window !== "undefined") {
    scan();
    window.reactScan = scan;
  }
  /*! Bundled license information:

  bippy/dist/chunk-ZF32UKFC.js:
    (**
     * @license bippy
     *
     * Copyright (c) Aiden Bai, Million Software, Inc.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     *)
  */

  exports.ReactScanInternals = ReactScanInternals;
  exports.Store = Store;
  exports.getIsProduction = getIsProduction;
  exports.getOptions = getOptions;
  exports.getReport = getReport;
  exports.ignoreScan = ignoreScan;
  exports.ignoredProps = ignoredProps;
  exports.onRender = onRender;
  exports.scan = scan;
  exports.setOptions = setOptions;
  exports.start = start;
  exports.useScan = useScan;

  return exports;

})({});