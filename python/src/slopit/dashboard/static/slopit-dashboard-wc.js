var uf = { exports: {} },
  bu = {},
  nf = { exports: {} },
  cf = {};
/**
 * @license React
 * scheduler.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var hr;
function $v() {
  return (
    hr ||
      ((hr = 1),
      ((g) => {
        function A(S, M) {
          var X = S.length;
          S.push(M);
          while (0 < X) {
            var ml = (X - 1) >>> 1,
              gl = S[ml];
            if (0 < N(gl, M)) (S[ml] = M), (S[X] = gl), (X = ml);
            else break;
          }
        }
        function x(S) {
          return S.length === 0 ? null : S[0];
        }
        function s(S) {
          if (S.length === 0) return null;
          var M = S[0],
            X = S.pop();
          if (X !== M) {
            S[0] = X;
            for (var ml = 0, gl = S.length, r = gl >>> 1; ml < r; ) {
              var _ = 2 * (ml + 1) - 1,
                D = S[_],
                C = _ + 1,
                L = S[C];
              if (0 > N(D, X))
                C < gl && 0 > N(L, D)
                  ? ((S[ml] = L), (S[C] = X), (ml = C))
                  : ((S[ml] = D), (S[_] = X), (ml = _));
              else if (C < gl && 0 > N(L, X)) (S[ml] = L), (S[C] = X), (ml = C);
              else break;
            }
          }
          return M;
        }
        function N(S, M) {
          var X = S.sortIndex - M.sortIndex;
          return X !== 0 ? X : S.id - M.id;
        }
        if (
          ((g.unstable_now = void 0),
          typeof performance == "object" && typeof performance.now == "function")
        ) {
          var j = performance;
          g.unstable_now = () => j.now();
        } else {
          var Q = Date,
            Z = Q.now();
          g.unstable_now = () => Q.now() - Z;
        }
        var O = [],
          E = [],
          B = 1,
          R = null,
          ll = 3,
          ul = !1,
          cl = !1,
          rl = !1,
          Ul = !1,
          Y = typeof setTimeout == "function" ? setTimeout : null,
          Ql = typeof clearTimeout == "function" ? clearTimeout : null,
          fl = typeof setImmediate < "u" ? setImmediate : null;
        function bl(S) {
          for (var M = x(E); M !== null; ) {
            if (M.callback === null) s(E);
            else if (M.startTime <= S) s(E), (M.sortIndex = M.expirationTime), A(O, M);
            else break;
            M = x(E);
          }
        }
        function wl(S) {
          if (((rl = !1), bl(S), !cl))
            if (x(O) !== null) (cl = !0), Zl || ((Zl = !0), Wl());
            else {
              var M = x(E);
              M !== null && Tt(wl, M.startTime - S);
            }
        }
        var Zl = !1,
          w = -1,
          sl = 5,
          Vl = -1;
        function Qa() {
          return Ul ? !0 : !(g.unstable_now() - Vl < sl);
        }
        function Nt() {
          if (((Ul = !1), Zl)) {
            var S = g.unstable_now();
            Vl = S;
            var M = !0;
            try {
              l: {
                (cl = !1), rl && ((rl = !1), Ql(w), (w = -1)), (ul = !0);
                var X = ll;
                try {
                  t: {
                    for (bl(S), R = x(O); R !== null && !(R.expirationTime > S && Qa()); ) {
                      var ml = R.callback;
                      if (typeof ml == "function") {
                        (R.callback = null), (ll = R.priorityLevel);
                        var gl = ml(R.expirationTime <= S);
                        if (((S = g.unstable_now()), typeof gl == "function")) {
                          (R.callback = gl), bl(S), (M = !0);
                          break t;
                        }
                        R === x(O) && s(O), bl(S);
                      } else s(O);
                      R = x(O);
                    }
                    if (R !== null) M = !0;
                    else {
                      var r = x(E);
                      r !== null && Tt(wl, r.startTime - S), (M = !1);
                    }
                  }
                  break l;
                } finally {
                  (R = null), (ll = X), (ul = !1);
                }
                M = void 0;
              }
            } finally {
              M ? Wl() : (Zl = !1);
            }
          }
        }
        var Wl;
        if (typeof fl == "function")
          Wl = () => {
            fl(Nt);
          };
        else if (typeof MessageChannel < "u") {
          var za = new MessageChannel(),
            Dt = za.port2;
          (za.port1.onmessage = Nt),
            (Wl = () => {
              Dt.postMessage(null);
            });
        } else
          Wl = () => {
            Y(Nt, 0);
          };
        function Tt(S, M) {
          w = Y(() => {
            S(g.unstable_now());
          }, M);
        }
        (g.unstable_IdlePriority = 5),
          (g.unstable_ImmediatePriority = 1),
          (g.unstable_LowPriority = 4),
          (g.unstable_NormalPriority = 3),
          (g.unstable_Profiling = null),
          (g.unstable_UserBlockingPriority = 2),
          (g.unstable_cancelCallback = (S) => {
            S.callback = null;
          }),
          (g.unstable_forceFrameRate = (S) => {
            0 > S || 125 < S
              ? console.error(
                  "forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported",
                )
              : (sl = 0 < S ? Math.floor(1e3 / S) : 5);
          }),
          (g.unstable_getCurrentPriorityLevel = () => ll),
          (g.unstable_next = (S) => {
            switch (ll) {
              case 1:
              case 2:
              case 3:
                var M = 3;
                break;
              default:
                M = ll;
            }
            var X = ll;
            ll = M;
            try {
              return S();
            } finally {
              ll = X;
            }
          }),
          (g.unstable_requestPaint = () => {
            Ul = !0;
          }),
          (g.unstable_runWithPriority = (S, M) => {
            switch (S) {
              case 1:
              case 2:
              case 3:
              case 4:
              case 5:
                break;
              default:
                S = 3;
            }
            var X = ll;
            ll = S;
            try {
              return M();
            } finally {
              ll = X;
            }
          }),
          (g.unstable_scheduleCallback = (S, M, X) => {
            var ml = g.unstable_now();
            switch (
              (typeof X == "object" && X !== null
                ? ((X = X.delay), (X = typeof X == "number" && 0 < X ? ml + X : ml))
                : (X = ml),
              S)
            ) {
              case 1:
                var gl = -1;
                break;
              case 2:
                gl = 250;
                break;
              case 5:
                gl = 1073741823;
                break;
              case 4:
                gl = 1e4;
                break;
              default:
                gl = 5e3;
            }
            return (
              (gl = X + gl),
              (S = {
                id: B++,
                callback: M,
                priorityLevel: S,
                startTime: X,
                expirationTime: gl,
                sortIndex: -1,
              }),
              X > ml
                ? ((S.sortIndex = X),
                  A(E, S),
                  x(O) === null &&
                    S === x(E) &&
                    (rl ? (Ql(w), (w = -1)) : (rl = !0), Tt(wl, X - ml)))
                : ((S.sortIndex = gl), A(O, S), cl || ul || ((cl = !0), Zl || ((Zl = !0), Wl()))),
              S
            );
          }),
          (g.unstable_shouldYield = Qa),
          (g.unstable_wrapCallback = (S) => {
            var M = ll;
            return function () {
              var X = ll;
              ll = M;
              try {
                return S.apply(this, arguments);
              } finally {
                ll = X;
              }
            };
          });
      })(cf)),
    cf
  );
}
var yr;
function kv() {
  return yr || ((yr = 1), (nf.exports = $v())), nf.exports;
}
var ff = { exports: {} },
  V = {};
/**
 * @license React
 * react.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var gr;
function Fv() {
  if (gr) return V;
  gr = 1;
  var g = Symbol.for("react.transitional.element"),
    A = Symbol.for("react.portal"),
    x = Symbol.for("react.fragment"),
    s = Symbol.for("react.strict_mode"),
    N = Symbol.for("react.profiler"),
    j = Symbol.for("react.consumer"),
    Q = Symbol.for("react.context"),
    Z = Symbol.for("react.forward_ref"),
    O = Symbol.for("react.suspense"),
    E = Symbol.for("react.memo"),
    B = Symbol.for("react.lazy"),
    R = Symbol.for("react.activity"),
    ll = Symbol.iterator;
  function ul(r) {
    return r === null || typeof r != "object"
      ? null
      : ((r = (ll && r[ll]) || r["@@iterator"]), typeof r == "function" ? r : null);
  }
  var cl = {
      isMounted: () => !1,
      enqueueForceUpdate: () => {},
      enqueueReplaceState: () => {},
      enqueueSetState: () => {},
    },
    rl = Object.assign,
    Ul = {};
  function Y(r, _, D) {
    (this.props = r), (this.context = _), (this.refs = Ul), (this.updater = D || cl);
  }
  (Y.prototype.isReactComponent = {}),
    (Y.prototype.setState = function (r, _) {
      if (typeof r != "object" && typeof r != "function" && r != null)
        throw Error(
          "takes an object of state variables to update or a function which returns an object of state variables.",
        );
      this.updater.enqueueSetState(this, r, _, "setState");
    }),
    (Y.prototype.forceUpdate = function (r) {
      this.updater.enqueueForceUpdate(this, r, "forceUpdate");
    });
  function Ql() {}
  Ql.prototype = Y.prototype;
  function fl(r, _, D) {
    (this.props = r), (this.context = _), (this.refs = Ul), (this.updater = D || cl);
  }
  var bl = (fl.prototype = new Ql());
  (bl.constructor = fl), rl(bl, Y.prototype), (bl.isPureReactComponent = !0);
  var wl = Array.isArray;
  function Zl() {}
  var w = { H: null, A: null, T: null, S: null },
    sl = Object.prototype.hasOwnProperty;
  function Vl(r, _, D) {
    var C = D.ref;
    return {
      $$typeof: g,
      type: r,
      key: _,
      ref: C !== void 0 ? C : null,
      props: D,
    };
  }
  function Qa(r, _) {
    return Vl(r.type, _, r.props);
  }
  function Nt(r) {
    return typeof r == "object" && r !== null && r.$$typeof === g;
  }
  function Wl(r) {
    var _ = { "=": "=0", ":": "=2" };
    return "$" + r.replace(/[=:]/g, (D) => _[D]);
  }
  var za = /\/+/g;
  function Dt(r, _) {
    return typeof r == "object" && r !== null && r.key != null ? Wl("" + r.key) : _.toString(36);
  }
  function Tt(r) {
    switch (r.status) {
      case "fulfilled":
        return r.value;
      case "rejected":
        throw r.reason;
      default:
        switch (
          (typeof r.status == "string"
            ? r.then(Zl, Zl)
            : ((r.status = "pending"),
              r.then(
                (_) => {
                  r.status === "pending" && ((r.status = "fulfilled"), (r.value = _));
                },
                (_) => {
                  r.status === "pending" && ((r.status = "rejected"), (r.reason = _));
                },
              )),
          r.status)
        ) {
          case "fulfilled":
            return r.value;
          case "rejected":
            throw r.reason;
        }
    }
    throw r;
  }
  function S(r, _, D, C, L) {
    var W = typeof r;
    (W === "undefined" || W === "boolean") && (r = null);
    var il = !1;
    if (r === null) il = !0;
    else
      switch (W) {
        case "bigint":
        case "string":
        case "number":
          il = !0;
          break;
        case "object":
          switch (r.$$typeof) {
            case g:
            case A:
              il = !0;
              break;
            case B:
              return (il = r._init), S(il(r._payload), _, D, C, L);
          }
      }
    if (il)
      return (
        (L = L(r)),
        (il = C === "" ? "." + Dt(r, 0) : C),
        wl(L)
          ? ((D = ""), il != null && (D = il.replace(za, "$&/") + "/"), S(L, _, D, "", (Ne) => Ne))
          : L != null &&
            (Nt(L) &&
              (L = Qa(
                L,
                D +
                  (L.key == null || (r && r.key === L.key)
                    ? ""
                    : ("" + L.key).replace(za, "$&/") + "/") +
                  il,
              )),
            _.push(L)),
        1
      );
    il = 0;
    var Kl = C === "" ? "." : C + ":";
    if (wl(r))
      for (var _l = 0; _l < r.length; _l++)
        (C = r[_l]), (W = Kl + Dt(C, _l)), (il += S(C, _, D, W, L));
    else if (((_l = ul(r)), typeof _l == "function"))
      for (r = _l.call(r), _l = 0; !(C = r.next()).done; )
        (C = C.value), (W = Kl + Dt(C, _l++)), (il += S(C, _, D, W, L));
    else if (W === "object") {
      if (typeof r.then == "function") return S(Tt(r), _, D, C, L);
      throw (
        ((_ = String(r)),
        Error(
          "Objects are not valid as a React child (found: " +
            (_ === "[object Object]" ? "object with keys {" + Object.keys(r).join(", ") + "}" : _) +
            "). If you meant to render a collection of children, use an array instead.",
        ))
      );
    }
    return il;
  }
  function M(r, _, D) {
    if (r == null) return r;
    var C = [],
      L = 0;
    return S(r, C, "", "", (W) => _.call(D, W, L++)), C;
  }
  function X(r) {
    if (r._status === -1) {
      var _ = r._result;
      (_ = _()),
        _.then(
          (D) => {
            (r._status === 0 || r._status === -1) && ((r._status = 1), (r._result = D));
          },
          (D) => {
            (r._status === 0 || r._status === -1) && ((r._status = 2), (r._result = D));
          },
        ),
        r._status === -1 && ((r._status = 0), (r._result = _));
    }
    if (r._status === 1) return r._result.default;
    throw r._result;
  }
  var ml =
      typeof reportError == "function"
        ? reportError
        : (r) => {
            if (typeof window == "object" && typeof window.ErrorEvent == "function") {
              var _ = new window.ErrorEvent("error", {
                bubbles: !0,
                cancelable: !0,
                message:
                  typeof r == "object" && r !== null && typeof r.message == "string"
                    ? String(r.message)
                    : String(r),
                error: r,
              });
              if (!window.dispatchEvent(_)) return;
            } else if (typeof process == "object" && typeof process.emit == "function") {
              process.emit("uncaughtException", r);
              return;
            }
            console.error(r);
          },
    gl = {
      map: M,
      forEach: (r, _, D) => {
        M(
          r,
          function () {
            _.apply(this, arguments);
          },
          D,
        );
      },
      count: (r) => {
        var _ = 0;
        return (
          M(r, () => {
            _++;
          }),
          _
        );
      },
      toArray: (r) => M(r, (_) => _) || [],
      only: (r) => {
        if (!Nt(r))
          throw Error("React.Children.only expected to receive a single React element child.");
        return r;
      },
    };
  return (
    (V.Activity = R),
    (V.Children = gl),
    (V.Component = Y),
    (V.Fragment = x),
    (V.Profiler = N),
    (V.PureComponent = fl),
    (V.StrictMode = s),
    (V.Suspense = O),
    (V.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = w),
    (V.__COMPILER_RUNTIME = {
      __proto__: null,
      c: (r) => w.H.useMemoCache(r),
    }),
    (V.cache = (r) => () => r.apply(null, arguments)),
    (V.cacheSignal = () => null),
    (V.cloneElement = (r, _, D) => {
      if (r == null) throw Error("The argument must be a React element, but you passed " + r + ".");
      var C = rl({}, r.props),
        L = r.key;
      if (_ != null)
        for (W in (_.key !== void 0 && (L = "" + _.key), _))
          !sl.call(_, W) ||
            W === "key" ||
            W === "__self" ||
            W === "__source" ||
            (W === "ref" && _.ref === void 0) ||
            (C[W] = _[W]);
      var W = arguments.length - 2;
      if (W === 1) C.children = D;
      else if (1 < W) {
        for (var il = Array(W), Kl = 0; Kl < W; Kl++) il[Kl] = arguments[Kl + 2];
        C.children = il;
      }
      return Vl(r.type, L, C);
    }),
    (V.createContext = (r) => (
      (r = {
        $$typeof: Q,
        _currentValue: r,
        _currentValue2: r,
        _threadCount: 0,
        Provider: null,
        Consumer: null,
      }),
      (r.Provider = r),
      (r.Consumer = {
        $$typeof: j,
        _context: r,
      }),
      r
    )),
    (V.createElement = (r, _, D) => {
      var C,
        L = {},
        W = null;
      if (_ != null)
        for (C in (_.key !== void 0 && (W = "" + _.key), _))
          sl.call(_, C) && C !== "key" && C !== "__self" && C !== "__source" && (L[C] = _[C]);
      var il = arguments.length - 2;
      if (il === 1) L.children = D;
      else if (1 < il) {
        for (var Kl = Array(il), _l = 0; _l < il; _l++) Kl[_l] = arguments[_l + 2];
        L.children = Kl;
      }
      if (r && r.defaultProps)
        for (C in ((il = r.defaultProps), il)) L[C] === void 0 && (L[C] = il[C]);
      return Vl(r, W, L);
    }),
    (V.createRef = () => ({ current: null })),
    (V.forwardRef = (r) => ({ $$typeof: Z, render: r })),
    (V.isValidElement = Nt),
    (V.lazy = (r) => ({
      $$typeof: B,
      _payload: { _status: -1, _result: r },
      _init: X,
    })),
    (V.memo = (r, _) => ({
      $$typeof: E,
      type: r,
      compare: _ === void 0 ? null : _,
    })),
    (V.startTransition = (r) => {
      var _ = w.T,
        D = {};
      w.T = D;
      try {
        var C = r(),
          L = w.S;
        L !== null && L(D, C),
          typeof C == "object" && C !== null && typeof C.then == "function" && C.then(Zl, ml);
      } catch (W) {
        ml(W);
      } finally {
        _ !== null && D.types !== null && (_.types = D.types), (w.T = _);
      }
    }),
    (V.unstable_useCacheRefresh = () => w.H.useCacheRefresh()),
    (V.use = (r) => w.H.use(r)),
    (V.useActionState = (r, _, D) => w.H.useActionState(r, _, D)),
    (V.useCallback = (r, _) => w.H.useCallback(r, _)),
    (V.useContext = (r) => w.H.useContext(r)),
    (V.useDebugValue = () => {}),
    (V.useDeferredValue = (r, _) => w.H.useDeferredValue(r, _)),
    (V.useEffect = (r, _) => w.H.useEffect(r, _)),
    (V.useEffectEvent = (r) => w.H.useEffectEvent(r)),
    (V.useId = () => w.H.useId()),
    (V.useImperativeHandle = (r, _, D) => w.H.useImperativeHandle(r, _, D)),
    (V.useInsertionEffect = (r, _) => w.H.useInsertionEffect(r, _)),
    (V.useLayoutEffect = (r, _) => w.H.useLayoutEffect(r, _)),
    (V.useMemo = (r, _) => w.H.useMemo(r, _)),
    (V.useOptimistic = (r, _) => w.H.useOptimistic(r, _)),
    (V.useReducer = (r, _, D) => w.H.useReducer(r, _, D)),
    (V.useRef = (r) => w.H.useRef(r)),
    (V.useState = (r) => w.H.useState(r)),
    (V.useSyncExternalStore = (r, _, D) => w.H.useSyncExternalStore(r, _, D)),
    (V.useTransition = () => w.H.useTransition()),
    (V.version = "19.2.3"),
    V
  );
}
var pr;
function df() {
  return pr || ((pr = 1), (ff.exports = Fv())), ff.exports;
}
var sf = { exports: {} },
  Ll = {};
/**
 * @license React
 * react-dom.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var br;
function Iv() {
  if (br) return Ll;
  br = 1;
  var g = df();
  function A(O) {
    var E = "https://react.dev/errors/" + O;
    if (1 < arguments.length) {
      E += "?args[]=" + encodeURIComponent(arguments[1]);
      for (var B = 2; B < arguments.length; B++) E += "&args[]=" + encodeURIComponent(arguments[B]);
    }
    return (
      "Minified React error #" +
      O +
      "; visit " +
      E +
      " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
    );
  }
  function x() {}
  var s = {
      d: {
        f: x,
        r: () => {
          throw Error(A(522));
        },
        D: x,
        C: x,
        L: x,
        m: x,
        X: x,
        S: x,
        M: x,
      },
      p: 0,
      findDOMNode: null,
    },
    N = Symbol.for("react.portal");
  function j(O, E, B) {
    var R = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
    return {
      $$typeof: N,
      key: R == null ? null : "" + R,
      children: O,
      containerInfo: E,
      implementation: B,
    };
  }
  var Q = g.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
  function Z(O, E) {
    if (O === "font") return "";
    if (typeof E == "string") return E === "use-credentials" ? E : "";
  }
  return (
    (Ll.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = s),
    (Ll.createPortal = (O, E) => {
      var B = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
      if (!E || (E.nodeType !== 1 && E.nodeType !== 9 && E.nodeType !== 11)) throw Error(A(299));
      return j(O, E, null, B);
    }),
    (Ll.flushSync = (O) => {
      var E = Q.T,
        B = s.p;
      try {
        if (((Q.T = null), (s.p = 2), O)) return O();
      } finally {
        (Q.T = E), (s.p = B), s.d.f();
      }
    }),
    (Ll.preconnect = (O, E) => {
      typeof O == "string" &&
        (E
          ? ((E = E.crossOrigin),
            (E = typeof E == "string" ? (E === "use-credentials" ? E : "") : void 0))
          : (E = null),
        s.d.C(O, E));
    }),
    (Ll.prefetchDNS = (O) => {
      typeof O == "string" && s.d.D(O);
    }),
    (Ll.preinit = (O, E) => {
      if (typeof O == "string" && E && typeof E.as == "string") {
        var B = E.as,
          R = Z(B, E.crossOrigin),
          ll = typeof E.integrity == "string" ? E.integrity : void 0,
          ul = typeof E.fetchPriority == "string" ? E.fetchPriority : void 0;
        B === "style"
          ? s.d.S(O, typeof E.precedence == "string" ? E.precedence : void 0, {
              crossOrigin: R,
              integrity: ll,
              fetchPriority: ul,
            })
          : B === "script" &&
            s.d.X(O, {
              crossOrigin: R,
              integrity: ll,
              fetchPriority: ul,
              nonce: typeof E.nonce == "string" ? E.nonce : void 0,
            });
      }
    }),
    (Ll.preinitModule = (O, E) => {
      if (typeof O == "string")
        if (typeof E == "object" && E !== null) {
          if (E.as == null || E.as === "script") {
            var B = Z(E.as, E.crossOrigin);
            s.d.M(O, {
              crossOrigin: B,
              integrity: typeof E.integrity == "string" ? E.integrity : void 0,
              nonce: typeof E.nonce == "string" ? E.nonce : void 0,
            });
          }
        } else E == null && s.d.M(O);
    }),
    (Ll.preload = (O, E) => {
      if (typeof O == "string" && typeof E == "object" && E !== null && typeof E.as == "string") {
        var B = E.as,
          R = Z(B, E.crossOrigin);
        s.d.L(O, B, {
          crossOrigin: R,
          integrity: typeof E.integrity == "string" ? E.integrity : void 0,
          nonce: typeof E.nonce == "string" ? E.nonce : void 0,
          type: typeof E.type == "string" ? E.type : void 0,
          fetchPriority: typeof E.fetchPriority == "string" ? E.fetchPriority : void 0,
          referrerPolicy: typeof E.referrerPolicy == "string" ? E.referrerPolicy : void 0,
          imageSrcSet: typeof E.imageSrcSet == "string" ? E.imageSrcSet : void 0,
          imageSizes: typeof E.imageSizes == "string" ? E.imageSizes : void 0,
          media: typeof E.media == "string" ? E.media : void 0,
        });
      }
    }),
    (Ll.preloadModule = (O, E) => {
      if (typeof O == "string")
        if (E) {
          var B = Z(E.as, E.crossOrigin);
          s.d.m(O, {
            as: typeof E.as == "string" && E.as !== "script" ? E.as : void 0,
            crossOrigin: B,
            integrity: typeof E.integrity == "string" ? E.integrity : void 0,
          });
        } else s.d.m(O);
    }),
    (Ll.requestFormReset = (O) => {
      s.d.r(O);
    }),
    (Ll.unstable_batchedUpdates = (O, E) => O(E)),
    (Ll.useFormState = (O, E, B) => Q.H.useFormState(O, E, B)),
    (Ll.useFormStatus = () => Q.H.useHostTransitionStatus()),
    (Ll.version = "19.2.3"),
    Ll
  );
}
var Sr;
function Pv() {
  if (Sr) return sf.exports;
  Sr = 1;
  function g() {
    if (
      !(
        typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" ||
        typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"
      )
    )
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(g);
      } catch (A) {
        console.error(A);
      }
  }
  return g(), (sf.exports = Iv()), sf.exports;
}
/**
 * @license React
 * react-dom-client.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var zr;
function lh() {
  if (zr) return bu;
  zr = 1;
  var g = kv(),
    A = df(),
    x = Pv();
  function s(l) {
    var t = "https://react.dev/errors/" + l;
    if (1 < arguments.length) {
      t += "?args[]=" + encodeURIComponent(arguments[1]);
      for (var a = 2; a < arguments.length; a++) t += "&args[]=" + encodeURIComponent(arguments[a]);
    }
    return (
      "Minified React error #" +
      l +
      "; visit " +
      t +
      " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
    );
  }
  function N(l) {
    return !(!l || (l.nodeType !== 1 && l.nodeType !== 9 && l.nodeType !== 11));
  }
  function j(l) {
    var t = l,
      a = l;
    if (l.alternate) while (t.return) t = t.return;
    else {
      l = t;
      do (t = l), (t.flags & 4098) !== 0 && (a = t.return), (l = t.return);
      while (l);
    }
    return t.tag === 3 ? a : null;
  }
  function Q(l) {
    if (l.tag === 13) {
      var t = l.memoizedState;
      if ((t === null && ((l = l.alternate), l !== null && (t = l.memoizedState)), t !== null))
        return t.dehydrated;
    }
    return null;
  }
  function Z(l) {
    if (l.tag === 31) {
      var t = l.memoizedState;
      if ((t === null && ((l = l.alternate), l !== null && (t = l.memoizedState)), t !== null))
        return t.dehydrated;
    }
    return null;
  }
  function O(l) {
    if (j(l) !== l) throw Error(s(188));
  }
  function E(l) {
    var t = l.alternate;
    if (!t) {
      if (((t = j(l)), t === null)) throw Error(s(188));
      return t !== l ? null : l;
    }
    for (var a = l, e = t; ; ) {
      var u = a.return;
      if (u === null) break;
      var n = u.alternate;
      if (n === null) {
        if (((e = u.return), e !== null)) {
          a = e;
          continue;
        }
        break;
      }
      if (u.child === n.child) {
        for (n = u.child; n; ) {
          if (n === a) return O(u), l;
          if (n === e) return O(u), t;
          n = n.sibling;
        }
        throw Error(s(188));
      }
      if (a.return !== e.return) (a = u), (e = n);
      else {
        for (var i = !1, c = u.child; c; ) {
          if (c === a) {
            (i = !0), (a = u), (e = n);
            break;
          }
          if (c === e) {
            (i = !0), (e = u), (a = n);
            break;
          }
          c = c.sibling;
        }
        if (!i) {
          for (c = n.child; c; ) {
            if (c === a) {
              (i = !0), (a = n), (e = u);
              break;
            }
            if (c === e) {
              (i = !0), (e = n), (a = u);
              break;
            }
            c = c.sibling;
          }
          if (!i) throw Error(s(189));
        }
      }
      if (a.alternate !== e) throw Error(s(190));
    }
    if (a.tag !== 3) throw Error(s(188));
    return a.stateNode.current === a ? l : t;
  }
  function B(l) {
    var t = l.tag;
    if (t === 5 || t === 26 || t === 27 || t === 6) return l;
    for (l = l.child; l !== null; ) {
      if (((t = B(l)), t !== null)) return t;
      l = l.sibling;
    }
    return null;
  }
  var R = Object.assign,
    ll = Symbol.for("react.element"),
    ul = Symbol.for("react.transitional.element"),
    cl = Symbol.for("react.portal"),
    rl = Symbol.for("react.fragment"),
    Ul = Symbol.for("react.strict_mode"),
    Y = Symbol.for("react.profiler"),
    Ql = Symbol.for("react.consumer"),
    fl = Symbol.for("react.context"),
    bl = Symbol.for("react.forward_ref"),
    wl = Symbol.for("react.suspense"),
    Zl = Symbol.for("react.suspense_list"),
    w = Symbol.for("react.memo"),
    sl = Symbol.for("react.lazy"),
    Vl = Symbol.for("react.activity"),
    Qa = Symbol.for("react.memo_cache_sentinel"),
    Nt = Symbol.iterator;
  function Wl(l) {
    return l === null || typeof l != "object"
      ? null
      : ((l = (Nt && l[Nt]) || l["@@iterator"]), typeof l == "function" ? l : null);
  }
  var za = Symbol.for("react.client.reference");
  function Dt(l) {
    if (l == null) return null;
    if (typeof l == "function") return l.$$typeof === za ? null : l.displayName || l.name || null;
    if (typeof l == "string") return l;
    switch (l) {
      case rl:
        return "Fragment";
      case Y:
        return "Profiler";
      case Ul:
        return "StrictMode";
      case wl:
        return "Suspense";
      case Zl:
        return "SuspenseList";
      case Vl:
        return "Activity";
    }
    if (typeof l == "object")
      switch (l.$$typeof) {
        case cl:
          return "Portal";
        case fl:
          return l.displayName || "Context";
        case Ql:
          return (l._context.displayName || "Context") + ".Consumer";
        case bl:
          var t = l.render;
          return (
            (l = l.displayName),
            l ||
              ((l = t.displayName || t.name || ""),
              (l = l !== "" ? "ForwardRef(" + l + ")" : "ForwardRef")),
            l
          );
        case w:
          return (t = l.displayName || null), t !== null ? t : Dt(l.type) || "Memo";
        case sl:
          (t = l._payload), (l = l._init);
          try {
            return Dt(l(t));
          } catch {}
      }
    return null;
  }
  var Tt = Array.isArray,
    S = A.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,
    M = x.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,
    X = {
      pending: !1,
      data: null,
      method: null,
      action: null,
    },
    ml = [],
    gl = -1;
  function r(l) {
    return { current: l };
  }
  function _(l) {
    0 > gl || ((l.current = ml[gl]), (ml[gl] = null), gl--);
  }
  function D(l, t) {
    gl++, (ml[gl] = l.current), (l.current = t);
  }
  var C = r(null),
    L = r(null),
    W = r(null),
    il = r(null);
  function Kl(l, t) {
    switch ((D(W, t), D(L, l), D(C, null), t.nodeType)) {
      case 9:
      case 11:
        l = (l = t.documentElement) && (l = l.namespaceURI) ? Yd(l) : 0;
        break;
      default:
        if (((l = t.tagName), (t = t.namespaceURI))) (t = Yd(t)), (l = Gd(t, l));
        else
          switch (l) {
            case "svg":
              l = 1;
              break;
            case "math":
              l = 2;
              break;
            default:
              l = 0;
          }
    }
    _(C), D(C, l);
  }
  function _l() {
    _(C), _(L), _(W);
  }
  function Ne(l) {
    l.memoizedState !== null && D(il, l);
    var t = C.current,
      a = Gd(t, l.type);
    t !== a && (D(L, l), D(C, a));
  }
  function zu(l) {
    L.current === l && (_(C), _(L)), il.current === l && (_(il), (hu._currentValue = X));
  }
  var Xn, mf;
  function Ta(l) {
    if (Xn === void 0)
      try {
        throw Error();
      } catch (a) {
        var t = a.stack.trim().match(/\n( *(at )?)/);
        (Xn = (t && t[1]) || ""),
          (mf =
            -1 <
            a.stack.indexOf(`
    at`)
              ? " (<anonymous>)"
              : -1 < a.stack.indexOf("@")
                ? "@unknown:0:0"
                : "");
      }
    return (
      `
` +
      Xn +
      l +
      mf
    );
  }
  var Qn = !1;
  function Zn(l, t) {
    if (!l || Qn) return "";
    Qn = !0;
    var a = Error.prepareStackTrace;
    Error.prepareStackTrace = void 0;
    try {
      var e = {
        DetermineComponentFrameRoot: () => {
          try {
            if (t) {
              var T = () => {
                throw Error();
              };
              if (
                (Object.defineProperty(T.prototype, "props", {
                  set: () => {
                    throw Error();
                  },
                }),
                typeof Reflect == "object" && Reflect.construct)
              ) {
                try {
                  Reflect.construct(T, []);
                } catch (p) {
                  var y = p;
                }
                Reflect.construct(l, [], T);
              } else {
                try {
                  T.call();
                } catch (p) {
                  y = p;
                }
                l.call(T.prototype);
              }
            } else {
              try {
                throw Error();
              } catch (p) {
                y = p;
              }
              (T = l()) && typeof T.catch == "function" && T.catch(() => {});
            }
          } catch (p) {
            if (p && y && typeof p.stack == "string") return [p.stack, y.stack];
          }
          return [null, null];
        },
      };
      e.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
      var u = Object.getOwnPropertyDescriptor(e.DetermineComponentFrameRoot, "name");
      u &&
        u.configurable &&
        Object.defineProperty(e.DetermineComponentFrameRoot, "name", {
          value: "DetermineComponentFrameRoot",
        });
      var n = e.DetermineComponentFrameRoot(),
        i = n[0],
        c = n[1];
      if (i && c) {
        var f = i.split(`
`),
          h = c.split(`
`);
        for (u = e = 0; e < f.length && !f[e].includes("DetermineComponentFrameRoot"); ) e++;
        while (u < h.length && !h[u].includes("DetermineComponentFrameRoot")) u++;
        if (e === f.length || u === h.length)
          for (e = f.length - 1, u = h.length - 1; 1 <= e && 0 <= u && f[e] !== h[u]; ) u--;
        for (; 1 <= e && 0 <= u; e--, u--)
          if (f[e] !== h[u]) {
            if (e !== 1 || u !== 1)
              do
                if ((e--, u--, 0 > u || f[e] !== h[u])) {
                  var b =
                    `
` + f[e].replace(" at new ", " at ");
                  return (
                    l.displayName &&
                      b.includes("<anonymous>") &&
                      (b = b.replace("<anonymous>", l.displayName)),
                    b
                  );
                }
              while (1 <= e && 0 <= u);
            break;
          }
      }
    } finally {
      (Qn = !1), (Error.prepareStackTrace = a);
    }
    return (a = l ? l.displayName || l.name : "") ? Ta(a) : "";
  }
  function Nr(l, t) {
    switch (l.tag) {
      case 26:
      case 27:
      case 5:
        return Ta(l.type);
      case 16:
        return Ta("Lazy");
      case 13:
        return l.child !== t && t !== null ? Ta("Suspense Fallback") : Ta("Suspense");
      case 19:
        return Ta("SuspenseList");
      case 0:
      case 15:
        return Zn(l.type, !1);
      case 11:
        return Zn(l.type.render, !1);
      case 1:
        return Zn(l.type, !0);
      case 31:
        return Ta("Activity");
      default:
        return "";
    }
  }
  function vf(l) {
    try {
      var t = "",
        a = null;
      do (t += Nr(l, a)), (a = l), (l = l.return);
      while (l);
      return t;
    } catch (e) {
      return (
        `
Error generating stack: ` +
        e.message +
        `
` +
        e.stack
      );
    }
  }
  var Vn = Object.prototype.hasOwnProperty,
    Ln = g.unstable_scheduleCallback,
    Kn = g.unstable_cancelCallback,
    xr = g.unstable_shouldYield,
    jr = g.unstable_requestPaint,
    at = g.unstable_now,
    Mr = g.unstable_getCurrentPriorityLevel,
    hf = g.unstable_ImmediatePriority,
    yf = g.unstable_UserBlockingPriority,
    Tu = g.unstable_NormalPriority,
    Or = g.unstable_LowPriority,
    gf = g.unstable_IdlePriority,
    Dr = g.log,
    Ur = g.unstable_setDisableYieldValue,
    xe = null,
    et = null;
  function kt(l) {
    if ((typeof Dr == "function" && Ur(l), et && typeof et.setStrictMode == "function"))
      try {
        et.setStrictMode(xe, l);
      } catch {}
  }
  var ut = Math.clz32 ? Math.clz32 : Rr,
    Cr = Math.log,
    Hr = Math.LN2;
  function Rr(l) {
    return (l >>>= 0), l === 0 ? 32 : (31 - ((Cr(l) / Hr) | 0)) | 0;
  }
  var Eu = 256,
    Au = 262144,
    _u = 4194304;
  function Ea(l) {
    var t = l & 42;
    if (t !== 0) return t;
    switch (l & -l) {
      case 1:
        return 1;
      case 2:
        return 2;
      case 4:
        return 4;
      case 8:
        return 8;
      case 16:
        return 16;
      case 32:
        return 32;
      case 64:
        return 64;
      case 128:
        return 128;
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
        return l & 261888;
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return l & 3932160;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        return l & 62914560;
      case 67108864:
        return 67108864;
      case 134217728:
        return 134217728;
      case 268435456:
        return 268435456;
      case 536870912:
        return 536870912;
      case 1073741824:
        return 0;
      default:
        return l;
    }
  }
  function Nu(l, t, a) {
    var e = l.pendingLanes;
    if (e === 0) return 0;
    var u = 0,
      n = l.suspendedLanes,
      i = l.pingedLanes;
    l = l.warmLanes;
    var c = e & 134217727;
    return (
      c !== 0
        ? ((e = c & ~n),
          e !== 0
            ? (u = Ea(e))
            : ((i &= c), i !== 0 ? (u = Ea(i)) : a || ((a = c & ~l), a !== 0 && (u = Ea(a)))))
        : ((c = e & ~n),
          c !== 0
            ? (u = Ea(c))
            : i !== 0
              ? (u = Ea(i))
              : a || ((a = e & ~l), a !== 0 && (u = Ea(a)))),
      u === 0
        ? 0
        : t !== 0 &&
            t !== u &&
            (t & n) === 0 &&
            ((n = u & -u), (a = t & -t), n >= a || (n === 32 && (a & 4194048) !== 0))
          ? t
          : u
    );
  }
  function je(l, t) {
    return (l.pendingLanes & ~(l.suspendedLanes & ~l.pingedLanes) & t) === 0;
  }
  function qr(l, t) {
    switch (l) {
      case 1:
      case 2:
      case 4:
      case 8:
      case 64:
        return t + 250;
      case 16:
      case 32:
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return t + 5e3;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        return -1;
      case 67108864:
      case 134217728:
      case 268435456:
      case 536870912:
      case 1073741824:
        return -1;
      default:
        return -1;
    }
  }
  function pf() {
    var l = _u;
    return (_u <<= 1), (_u & 62914560) === 0 && (_u = 4194304), l;
  }
  function Jn(l) {
    for (var t = [], a = 0; 31 > a; a++) t.push(l);
    return t;
  }
  function Me(l, t) {
    (l.pendingLanes |= t),
      t !== 268435456 && ((l.suspendedLanes = 0), (l.pingedLanes = 0), (l.warmLanes = 0));
  }
  function Br(l, t, a, e, u, n) {
    var i = l.pendingLanes;
    (l.pendingLanes = a),
      (l.suspendedLanes = 0),
      (l.pingedLanes = 0),
      (l.warmLanes = 0),
      (l.expiredLanes &= a),
      (l.entangledLanes &= a),
      (l.errorRecoveryDisabledLanes &= a),
      (l.shellSuspendCounter = 0);
    var c = l.entanglements,
      f = l.expirationTimes,
      h = l.hiddenUpdates;
    for (a = i & ~a; 0 < a; ) {
      var b = 31 - ut(a),
        T = 1 << b;
      (c[b] = 0), (f[b] = -1);
      var y = h[b];
      if (y !== null)
        for (h[b] = null, b = 0; b < y.length; b++) {
          var p = y[b];
          p !== null && (p.lane &= -536870913);
        }
      a &= ~T;
    }
    e !== 0 && bf(l, e, 0),
      n !== 0 && u === 0 && l.tag !== 0 && (l.suspendedLanes |= n & ~(i & ~t));
  }
  function bf(l, t, a) {
    (l.pendingLanes |= t), (l.suspendedLanes &= ~t);
    var e = 31 - ut(t);
    (l.entangledLanes |= t), (l.entanglements[e] = l.entanglements[e] | 1073741824 | (a & 261930));
  }
  function Sf(l, t) {
    var a = (l.entangledLanes |= t);
    for (l = l.entanglements; a; ) {
      var e = 31 - ut(a),
        u = 1 << e;
      (u & t) | (l[e] & t) && (l[e] |= t), (a &= ~u);
    }
  }
  function zf(l, t) {
    var a = t & -t;
    return (a = (a & 42) !== 0 ? 1 : wn(a)), (a & (l.suspendedLanes | t)) !== 0 ? 0 : a;
  }
  function wn(l) {
    switch (l) {
      case 2:
        l = 1;
        break;
      case 8:
        l = 4;
        break;
      case 32:
        l = 16;
        break;
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        l = 128;
        break;
      case 268435456:
        l = 134217728;
        break;
      default:
        l = 0;
    }
    return l;
  }
  function Wn(l) {
    return (l &= -l), 2 < l ? (8 < l ? ((l & 134217727) !== 0 ? 32 : 268435456) : 8) : 2;
  }
  function Tf() {
    var l = M.p;
    return l !== 0 ? l : ((l = window.event), l === void 0 ? 32 : fr(l.type));
  }
  function Ef(l, t) {
    var a = M.p;
    try {
      return (M.p = l), t();
    } finally {
      M.p = a;
    }
  }
  var Ft = Math.random().toString(36).slice(2),
    ql = "__reactFiber$" + Ft,
    $l = "__reactProps$" + Ft,
    Za = "__reactContainer$" + Ft,
    $n = "__reactEvents$" + Ft,
    Yr = "__reactListeners$" + Ft,
    Gr = "__reactHandles$" + Ft,
    Af = "__reactResources$" + Ft,
    Oe = "__reactMarker$" + Ft;
  function kn(l) {
    delete l[ql], delete l[$l], delete l[$n], delete l[Yr], delete l[Gr];
  }
  function Va(l) {
    var t = l[ql];
    if (t) return t;
    for (var a = l.parentNode; a; ) {
      if ((t = a[Za] || a[ql])) {
        if (((a = t.alternate), t.child !== null || (a !== null && a.child !== null)))
          for (l = Jd(l); l !== null; ) {
            if ((a = l[ql])) return a;
            l = Jd(l);
          }
        return t;
      }
      (l = a), (a = l.parentNode);
    }
    return null;
  }
  function La(l) {
    if ((l = l[ql] || l[Za])) {
      var t = l.tag;
      if (t === 5 || t === 6 || t === 13 || t === 31 || t === 26 || t === 27 || t === 3) return l;
    }
    return null;
  }
  function De(l) {
    var t = l.tag;
    if (t === 5 || t === 26 || t === 27 || t === 6) return l.stateNode;
    throw Error(s(33));
  }
  function Ka(l) {
    var t = l[Af];
    return (
      t ||
        (t = l[Af] =
          {
            hoistableStyles: /* @__PURE__ */ new Map(),
            hoistableScripts: /* @__PURE__ */ new Map(),
          }),
      t
    );
  }
  function Hl(l) {
    l[Oe] = !0;
  }
  var _f = /* @__PURE__ */ new Set(),
    Nf = {};
  function Aa(l, t) {
    Ja(l, t), Ja(l + "Capture", t);
  }
  function Ja(l, t) {
    for (Nf[l] = t, l = 0; l < t.length; l++) _f.add(t[l]);
  }
  var Xr =
      /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,
    xf = {},
    jf = {};
  function Qr(l) {
    return Vn.call(jf, l)
      ? !0
      : Vn.call(xf, l)
        ? !1
        : Xr.test(l)
          ? (jf[l] = !0)
          : ((xf[l] = !0), !1);
  }
  function xu(l, t, a) {
    if (Qr(t))
      if (a === null) l.removeAttribute(t);
      else {
        switch (typeof a) {
          case "undefined":
          case "function":
          case "symbol":
            l.removeAttribute(t);
            return;
          case "boolean":
            var e = t.toLowerCase().slice(0, 5);
            if (e !== "data-" && e !== "aria-") {
              l.removeAttribute(t);
              return;
            }
        }
        l.setAttribute(t, "" + a);
      }
  }
  function ju(l, t, a) {
    if (a === null) l.removeAttribute(t);
    else {
      switch (typeof a) {
        case "undefined":
        case "function":
        case "symbol":
        case "boolean":
          l.removeAttribute(t);
          return;
      }
      l.setAttribute(t, "" + a);
    }
  }
  function Ut(l, t, a, e) {
    if (e === null) l.removeAttribute(a);
    else {
      switch (typeof e) {
        case "undefined":
        case "function":
        case "symbol":
        case "boolean":
          l.removeAttribute(a);
          return;
      }
      l.setAttributeNS(t, a, "" + e);
    }
  }
  function rt(l) {
    switch (typeof l) {
      case "bigint":
      case "boolean":
      case "number":
      case "string":
      case "undefined":
        return l;
      case "object":
        return l;
      default:
        return "";
    }
  }
  function Mf(l) {
    var t = l.type;
    return (l = l.nodeName) && l.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
  }
  function Zr(l, t, a) {
    var e = Object.getOwnPropertyDescriptor(l.constructor.prototype, t);
    if (
      !l.hasOwnProperty(t) &&
      typeof e < "u" &&
      typeof e.get == "function" &&
      typeof e.set == "function"
    ) {
      var u = e.get,
        n = e.set;
      return (
        Object.defineProperty(l, t, {
          configurable: !0,
          get: function () {
            return u.call(this);
          },
          set: function (i) {
            (a = "" + i), n.call(this, i);
          },
        }),
        Object.defineProperty(l, t, {
          enumerable: e.enumerable,
        }),
        {
          getValue: () => a,
          setValue: (i) => {
            a = "" + i;
          },
          stopTracking: () => {
            (l._valueTracker = null), delete l[t];
          },
        }
      );
    }
  }
  function Fn(l) {
    if (!l._valueTracker) {
      var t = Mf(l) ? "checked" : "value";
      l._valueTracker = Zr(l, t, "" + l[t]);
    }
  }
  function Of(l) {
    if (!l) return !1;
    var t = l._valueTracker;
    if (!t) return !0;
    var a = t.getValue(),
      e = "";
    return (
      l && (e = Mf(l) ? (l.checked ? "true" : "false") : l.value),
      (l = e),
      l !== a ? (t.setValue(l), !0) : !1
    );
  }
  function Mu(l) {
    if (((l = l || (typeof document < "u" ? document : void 0)), typeof l > "u")) return null;
    try {
      return l.activeElement || l.body;
    } catch {
      return l.body;
    }
  }
  var Vr = /[\n"\\]/g;
  function mt(l) {
    return l.replace(Vr, (t) => "\\" + t.charCodeAt(0).toString(16) + " ");
  }
  function In(l, t, a, e, u, n, i, c) {
    (l.name = ""),
      i != null && typeof i != "function" && typeof i != "symbol" && typeof i != "boolean"
        ? (l.type = i)
        : l.removeAttribute("type"),
      t != null
        ? i === "number"
          ? ((t === 0 && l.value === "") || l.value != t) && (l.value = "" + rt(t))
          : l.value !== "" + rt(t) && (l.value = "" + rt(t))
        : (i !== "submit" && i !== "reset") || l.removeAttribute("value"),
      t != null
        ? Pn(l, i, rt(t))
        : a != null
          ? Pn(l, i, rt(a))
          : e != null && l.removeAttribute("value"),
      u == null && n != null && (l.defaultChecked = !!n),
      u != null && (l.checked = u && typeof u != "function" && typeof u != "symbol"),
      c != null && typeof c != "function" && typeof c != "symbol" && typeof c != "boolean"
        ? (l.name = "" + rt(c))
        : l.removeAttribute("name");
  }
  function Df(l, t, a, e, u, n, i, c) {
    if (
      (n != null &&
        typeof n != "function" &&
        typeof n != "symbol" &&
        typeof n != "boolean" &&
        (l.type = n),
      t != null || a != null)
    ) {
      if (!((n !== "submit" && n !== "reset") || t != null)) {
        Fn(l);
        return;
      }
      (a = a != null ? "" + rt(a) : ""),
        (t = t != null ? "" + rt(t) : a),
        c || t === l.value || (l.value = t),
        (l.defaultValue = t);
    }
    (e = e ?? u),
      (e = typeof e != "function" && typeof e != "symbol" && !!e),
      (l.checked = c ? l.checked : !!e),
      (l.defaultChecked = !!e),
      i != null &&
        typeof i != "function" &&
        typeof i != "symbol" &&
        typeof i != "boolean" &&
        (l.name = i),
      Fn(l);
  }
  function Pn(l, t, a) {
    (t === "number" && Mu(l.ownerDocument) === l) ||
      l.defaultValue === "" + a ||
      (l.defaultValue = "" + a);
  }
  function wa(l, t, a, e) {
    if (((l = l.options), t)) {
      t = {};
      for (var u = 0; u < a.length; u++) t["$" + a[u]] = !0;
      for (a = 0; a < l.length; a++)
        (u = t.hasOwnProperty("$" + l[a].value)),
          l[a].selected !== u && (l[a].selected = u),
          u && e && (l[a].defaultSelected = !0);
    } else {
      for (a = "" + rt(a), t = null, u = 0; u < l.length; u++) {
        if (l[u].value === a) {
          (l[u].selected = !0), e && (l[u].defaultSelected = !0);
          return;
        }
        t !== null || l[u].disabled || (t = l[u]);
      }
      t !== null && (t.selected = !0);
    }
  }
  function Uf(l, t, a) {
    if (t != null && ((t = "" + rt(t)), t !== l.value && (l.value = t), a == null)) {
      l.defaultValue !== t && (l.defaultValue = t);
      return;
    }
    l.defaultValue = a != null ? "" + rt(a) : "";
  }
  function Cf(l, t, a, e) {
    if (t == null) {
      if (e != null) {
        if (a != null) throw Error(s(92));
        if (Tt(e)) {
          if (1 < e.length) throw Error(s(93));
          e = e[0];
        }
        a = e;
      }
      a == null && (a = ""), (t = a);
    }
    (a = rt(t)),
      (l.defaultValue = a),
      (e = l.textContent),
      e === a && e !== "" && e !== null && (l.value = e),
      Fn(l);
  }
  function Wa(l, t) {
    if (t) {
      var a = l.firstChild;
      if (a && a === l.lastChild && a.nodeType === 3) {
        a.nodeValue = t;
        return;
      }
    }
    l.textContent = t;
  }
  var Lr = new Set(
    "animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(
      " ",
    ),
  );
  function Hf(l, t, a) {
    var e = t.indexOf("--") === 0;
    a == null || typeof a == "boolean" || a === ""
      ? e
        ? l.setProperty(t, "")
        : t === "float"
          ? (l.cssFloat = "")
          : (l[t] = "")
      : e
        ? l.setProperty(t, a)
        : typeof a != "number" || a === 0 || Lr.has(t)
          ? t === "float"
            ? (l.cssFloat = a)
            : (l[t] = ("" + a).trim())
          : (l[t] = a + "px");
  }
  function Rf(l, t, a) {
    if (t != null && typeof t != "object") throw Error(s(62));
    if (((l = l.style), a != null)) {
      for (var e in a)
        !a.hasOwnProperty(e) ||
          (t != null && t.hasOwnProperty(e)) ||
          (e.indexOf("--") === 0
            ? l.setProperty(e, "")
            : e === "float"
              ? (l.cssFloat = "")
              : (l[e] = ""));
      for (var u in t) (e = t[u]), t.hasOwnProperty(u) && a[u] !== e && Hf(l, u, e);
    } else for (var n in t) t.hasOwnProperty(n) && Hf(l, n, t[n]);
  }
  function li(l) {
    if (l.indexOf("-") === -1) return !1;
    switch (l) {
      case "annotation-xml":
      case "color-profile":
      case "font-face":
      case "font-face-src":
      case "font-face-uri":
      case "font-face-format":
      case "font-face-name":
      case "missing-glyph":
        return !1;
      default:
        return !0;
    }
  }
  var Kr = /* @__PURE__ */ new Map([
      ["acceptCharset", "accept-charset"],
      ["htmlFor", "for"],
      ["httpEquiv", "http-equiv"],
      ["crossOrigin", "crossorigin"],
      ["accentHeight", "accent-height"],
      ["alignmentBaseline", "alignment-baseline"],
      ["arabicForm", "arabic-form"],
      ["baselineShift", "baseline-shift"],
      ["capHeight", "cap-height"],
      ["clipPath", "clip-path"],
      ["clipRule", "clip-rule"],
      ["colorInterpolation", "color-interpolation"],
      ["colorInterpolationFilters", "color-interpolation-filters"],
      ["colorProfile", "color-profile"],
      ["colorRendering", "color-rendering"],
      ["dominantBaseline", "dominant-baseline"],
      ["enableBackground", "enable-background"],
      ["fillOpacity", "fill-opacity"],
      ["fillRule", "fill-rule"],
      ["floodColor", "flood-color"],
      ["floodOpacity", "flood-opacity"],
      ["fontFamily", "font-family"],
      ["fontSize", "font-size"],
      ["fontSizeAdjust", "font-size-adjust"],
      ["fontStretch", "font-stretch"],
      ["fontStyle", "font-style"],
      ["fontVariant", "font-variant"],
      ["fontWeight", "font-weight"],
      ["glyphName", "glyph-name"],
      ["glyphOrientationHorizontal", "glyph-orientation-horizontal"],
      ["glyphOrientationVertical", "glyph-orientation-vertical"],
      ["horizAdvX", "horiz-adv-x"],
      ["horizOriginX", "horiz-origin-x"],
      ["imageRendering", "image-rendering"],
      ["letterSpacing", "letter-spacing"],
      ["lightingColor", "lighting-color"],
      ["markerEnd", "marker-end"],
      ["markerMid", "marker-mid"],
      ["markerStart", "marker-start"],
      ["overlinePosition", "overline-position"],
      ["overlineThickness", "overline-thickness"],
      ["paintOrder", "paint-order"],
      ["panose-1", "panose-1"],
      ["pointerEvents", "pointer-events"],
      ["renderingIntent", "rendering-intent"],
      ["shapeRendering", "shape-rendering"],
      ["stopColor", "stop-color"],
      ["stopOpacity", "stop-opacity"],
      ["strikethroughPosition", "strikethrough-position"],
      ["strikethroughThickness", "strikethrough-thickness"],
      ["strokeDasharray", "stroke-dasharray"],
      ["strokeDashoffset", "stroke-dashoffset"],
      ["strokeLinecap", "stroke-linecap"],
      ["strokeLinejoin", "stroke-linejoin"],
      ["strokeMiterlimit", "stroke-miterlimit"],
      ["strokeOpacity", "stroke-opacity"],
      ["strokeWidth", "stroke-width"],
      ["textAnchor", "text-anchor"],
      ["textDecoration", "text-decoration"],
      ["textRendering", "text-rendering"],
      ["transformOrigin", "transform-origin"],
      ["underlinePosition", "underline-position"],
      ["underlineThickness", "underline-thickness"],
      ["unicodeBidi", "unicode-bidi"],
      ["unicodeRange", "unicode-range"],
      ["unitsPerEm", "units-per-em"],
      ["vAlphabetic", "v-alphabetic"],
      ["vHanging", "v-hanging"],
      ["vIdeographic", "v-ideographic"],
      ["vMathematical", "v-mathematical"],
      ["vectorEffect", "vector-effect"],
      ["vertAdvY", "vert-adv-y"],
      ["vertOriginX", "vert-origin-x"],
      ["vertOriginY", "vert-origin-y"],
      ["wordSpacing", "word-spacing"],
      ["writingMode", "writing-mode"],
      ["xmlnsXlink", "xmlns:xlink"],
      ["xHeight", "x-height"],
    ]),
    Jr =
      /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
  function Ou(l) {
    return Jr.test("" + l)
      ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')"
      : l;
  }
  function Ct() {}
  var ti = null;
  function ai(l) {
    return (
      (l = l.target || l.srcElement || window),
      l.correspondingUseElement && (l = l.correspondingUseElement),
      l.nodeType === 3 ? l.parentNode : l
    );
  }
  var $a = null,
    ka = null;
  function qf(l) {
    var t = La(l);
    if (t && (l = t.stateNode)) {
      var a = l[$l] || null;
      switch (((l = t.stateNode), t.type)) {
        case "input":
          if (
            (In(
              l,
              a.value,
              a.defaultValue,
              a.defaultValue,
              a.checked,
              a.defaultChecked,
              a.type,
              a.name,
            ),
            (t = a.name),
            a.type === "radio" && t != null)
          ) {
            for (a = l; a.parentNode; ) a = a.parentNode;
            for (
              a = a.querySelectorAll('input[name="' + mt("" + t) + '"][type="radio"]'), t = 0;
              t < a.length;
              t++
            ) {
              var e = a[t];
              if (e !== l && e.form === l.form) {
                var u = e[$l] || null;
                if (!u) throw Error(s(90));
                In(
                  e,
                  u.value,
                  u.defaultValue,
                  u.defaultValue,
                  u.checked,
                  u.defaultChecked,
                  u.type,
                  u.name,
                );
              }
            }
            for (t = 0; t < a.length; t++) (e = a[t]), e.form === l.form && Of(e);
          }
          break;
        case "textarea":
          Uf(l, a.value, a.defaultValue);
          break;
        case "select":
          (t = a.value), t != null && wa(l, !!a.multiple, t, !1);
      }
    }
  }
  var ei = !1;
  function Bf(l, t, a) {
    if (ei) return l(t, a);
    ei = !0;
    try {
      var e = l(t);
      return e;
    } finally {
      if (
        ((ei = !1),
        ($a !== null || ka !== null) &&
          (pn(), $a && ((t = $a), (l = ka), (ka = $a = null), qf(t), l)))
      )
        for (t = 0; t < l.length; t++) qf(l[t]);
    }
  }
  function Ue(l, t) {
    var a = l.stateNode;
    if (a === null) return null;
    var e = a[$l] || null;
    if (e === null) return null;
    a = e[t];
    switch (t) {
      case "onClick":
      case "onClickCapture":
      case "onDoubleClick":
      case "onDoubleClickCapture":
      case "onMouseDown":
      case "onMouseDownCapture":
      case "onMouseMove":
      case "onMouseMoveCapture":
      case "onMouseUp":
      case "onMouseUpCapture":
      case "onMouseEnter":
        (e = !e.disabled) ||
          ((l = l.type),
          (e = !(l === "button" || l === "input" || l === "select" || l === "textarea"))),
          (l = !e);
        break;
      default:
        l = !1;
    }
    if (l) return null;
    if (a && typeof a != "function") throw Error(s(231, t, typeof a));
    return a;
  }
  var Ht = !(
      typeof window > "u" ||
      typeof window.document > "u" ||
      typeof window.document.createElement > "u"
    ),
    ui = !1;
  if (Ht)
    try {
      var Ce = {};
      Object.defineProperty(Ce, "passive", {
        get: () => {
          ui = !0;
        },
      }),
        window.addEventListener("test", Ce, Ce),
        window.removeEventListener("test", Ce, Ce);
    } catch {
      ui = !1;
    }
  var It = null,
    ni = null,
    Du = null;
  function Yf() {
    if (Du) return Du;
    var l,
      t = ni,
      a = t.length,
      e,
      u = "value" in It ? It.value : It.textContent,
      n = u.length;
    for (l = 0; l < a && t[l] === u[l]; l++);
    var i = a - l;
    for (e = 1; e <= i && t[a - e] === u[n - e]; e++);
    return (Du = u.slice(l, 1 < e ? 1 - e : void 0));
  }
  function Uu(l) {
    var t = l.keyCode;
    return (
      "charCode" in l ? ((l = l.charCode), l === 0 && t === 13 && (l = 13)) : (l = t),
      l === 10 && (l = 13),
      32 <= l || l === 13 ? l : 0
    );
  }
  function Cu() {
    return !0;
  }
  function Gf() {
    return !1;
  }
  function kl(l) {
    function t(a, e, u, n, i) {
      (this._reactName = a),
        (this._targetInst = u),
        (this.type = e),
        (this.nativeEvent = n),
        (this.target = i),
        (this.currentTarget = null);
      for (var c in l) l.hasOwnProperty(c) && ((a = l[c]), (this[c] = a ? a(n) : n[c]));
      return (
        (this.isDefaultPrevented = (
          n.defaultPrevented != null
            ? n.defaultPrevented
            : n.returnValue === !1
        )
          ? Cu
          : Gf),
        (this.isPropagationStopped = Gf),
        this
      );
    }
    return (
      R(t.prototype, {
        preventDefault: function () {
          this.defaultPrevented = !0;
          var a = this.nativeEvent;
          a &&
            (a.preventDefault
              ? a.preventDefault()
              : typeof a.returnValue != "unknown" && (a.returnValue = !1),
            (this.isDefaultPrevented = Cu));
        },
        stopPropagation: function () {
          var a = this.nativeEvent;
          a &&
            (a.stopPropagation
              ? a.stopPropagation()
              : typeof a.cancelBubble != "unknown" && (a.cancelBubble = !0),
            (this.isPropagationStopped = Cu));
        },
        persist: () => {},
        isPersistent: Cu,
      }),
      t
    );
  }
  var _a = {
      eventPhase: 0,
      bubbles: 0,
      cancelable: 0,
      timeStamp: (l) => l.timeStamp || Date.now(),
      defaultPrevented: 0,
      isTrusted: 0,
    },
    Hu = kl(_a),
    He = R({}, _a, { view: 0, detail: 0 }),
    wr = kl(He),
    ii,
    ci,
    Re,
    Ru = R({}, He, {
      screenX: 0,
      screenY: 0,
      clientX: 0,
      clientY: 0,
      pageX: 0,
      pageY: 0,
      ctrlKey: 0,
      shiftKey: 0,
      altKey: 0,
      metaKey: 0,
      getModifierState: si,
      button: 0,
      buttons: 0,
      relatedTarget: (l) =>
        l.relatedTarget === void 0
          ? l.fromElement === l.srcElement
            ? l.toElement
            : l.fromElement
          : l.relatedTarget,
      movementX: (l) =>
        "movementX" in l
          ? l.movementX
          : (l !== Re &&
              (Re && l.type === "mousemove"
                ? ((ii = l.screenX - Re.screenX), (ci = l.screenY - Re.screenY))
                : (ci = ii = 0),
              (Re = l)),
            ii),
      movementY: (l) => ("movementY" in l ? l.movementY : ci),
    }),
    Xf = kl(Ru),
    Wr = R({}, Ru, { dataTransfer: 0 }),
    $r = kl(Wr),
    kr = R({}, He, { relatedTarget: 0 }),
    fi = kl(kr),
    Fr = R({}, _a, {
      animationName: 0,
      elapsedTime: 0,
      pseudoElement: 0,
    }),
    Ir = kl(Fr),
    Pr = R({}, _a, {
      clipboardData: (l) => ("clipboardData" in l ? l.clipboardData : window.clipboardData),
    }),
    lm = kl(Pr),
    tm = R({}, _a, { data: 0 }),
    Qf = kl(tm),
    am = {
      Esc: "Escape",
      Spacebar: " ",
      Left: "ArrowLeft",
      Up: "ArrowUp",
      Right: "ArrowRight",
      Down: "ArrowDown",
      Del: "Delete",
      Win: "OS",
      Menu: "ContextMenu",
      Apps: "ContextMenu",
      Scroll: "ScrollLock",
      MozPrintableKey: "Unidentified",
    },
    em = {
      8: "Backspace",
      9: "Tab",
      12: "Clear",
      13: "Enter",
      16: "Shift",
      17: "Control",
      18: "Alt",
      19: "Pause",
      20: "CapsLock",
      27: "Escape",
      32: " ",
      33: "PageUp",
      34: "PageDown",
      35: "End",
      36: "Home",
      37: "ArrowLeft",
      38: "ArrowUp",
      39: "ArrowRight",
      40: "ArrowDown",
      45: "Insert",
      46: "Delete",
      112: "F1",
      113: "F2",
      114: "F3",
      115: "F4",
      116: "F5",
      117: "F6",
      118: "F7",
      119: "F8",
      120: "F9",
      121: "F10",
      122: "F11",
      123: "F12",
      144: "NumLock",
      145: "ScrollLock",
      224: "Meta",
    },
    um = {
      Alt: "altKey",
      Control: "ctrlKey",
      Meta: "metaKey",
      Shift: "shiftKey",
    };
  function nm(l) {
    var t = this.nativeEvent;
    return t.getModifierState ? t.getModifierState(l) : (l = um[l]) ? !!t[l] : !1;
  }
  function si() {
    return nm;
  }
  var im = R({}, He, {
      key: (l) => {
        if (l.key) {
          var t = am[l.key] || l.key;
          if (t !== "Unidentified") return t;
        }
        return l.type === "keypress"
          ? ((l = Uu(l)), l === 13 ? "Enter" : String.fromCharCode(l))
          : l.type === "keydown" || l.type === "keyup"
            ? em[l.keyCode] || "Unidentified"
            : "";
      },
      code: 0,
      location: 0,
      ctrlKey: 0,
      shiftKey: 0,
      altKey: 0,
      metaKey: 0,
      repeat: 0,
      locale: 0,
      getModifierState: si,
      charCode: (l) => (l.type === "keypress" ? Uu(l) : 0),
      keyCode: (l) => (l.type === "keydown" || l.type === "keyup" ? l.keyCode : 0),
      which: (l) =>
        l.type === "keypress" ? Uu(l) : l.type === "keydown" || l.type === "keyup" ? l.keyCode : 0,
    }),
    cm = kl(im),
    fm = R({}, Ru, {
      pointerId: 0,
      width: 0,
      height: 0,
      pressure: 0,
      tangentialPressure: 0,
      tiltX: 0,
      tiltY: 0,
      twist: 0,
      pointerType: 0,
      isPrimary: 0,
    }),
    Zf = kl(fm),
    sm = R({}, He, {
      touches: 0,
      targetTouches: 0,
      changedTouches: 0,
      altKey: 0,
      metaKey: 0,
      ctrlKey: 0,
      shiftKey: 0,
      getModifierState: si,
    }),
    om = kl(sm),
    dm = R({}, _a, {
      propertyName: 0,
      elapsedTime: 0,
      pseudoElement: 0,
    }),
    rm = kl(dm),
    mm = R({}, Ru, {
      deltaX: (l) => ("deltaX" in l ? l.deltaX : "wheelDeltaX" in l ? -l.wheelDeltaX : 0),
      deltaY: (l) =>
        "deltaY" in l
          ? l.deltaY
          : "wheelDeltaY" in l
            ? -l.wheelDeltaY
            : "wheelDelta" in l
              ? -l.wheelDelta
              : 0,
      deltaZ: 0,
      deltaMode: 0,
    }),
    vm = kl(mm),
    hm = R({}, _a, {
      newState: 0,
      oldState: 0,
    }),
    ym = kl(hm),
    gm = [9, 13, 27, 32],
    oi = Ht && "CompositionEvent" in window,
    qe = null;
  Ht && "documentMode" in document && (qe = document.documentMode);
  var pm = Ht && "TextEvent" in window && !qe,
    Vf = Ht && (!oi || (qe && 8 < qe && 11 >= qe)),
    Lf = " ",
    Kf = !1;
  function Jf(l, t) {
    switch (l) {
      case "keyup":
        return gm.indexOf(t.keyCode) !== -1;
      case "keydown":
        return t.keyCode !== 229;
      case "keypress":
      case "mousedown":
      case "focusout":
        return !0;
      default:
        return !1;
    }
  }
  function wf(l) {
    return (l = l.detail), typeof l == "object" && "data" in l ? l.data : null;
  }
  var Fa = !1;
  function bm(l, t) {
    switch (l) {
      case "compositionend":
        return wf(t);
      case "keypress":
        return t.which !== 32 ? null : ((Kf = !0), Lf);
      case "textInput":
        return (l = t.data), l === Lf && Kf ? null : l;
      default:
        return null;
    }
  }
  function Sm(l, t) {
    if (Fa)
      return l === "compositionend" || (!oi && Jf(l, t))
        ? ((l = Yf()), (Du = ni = It = null), (Fa = !1), l)
        : null;
    switch (l) {
      case "paste":
        return null;
      case "keypress":
        if (!(t.ctrlKey || t.altKey || t.metaKey) || (t.ctrlKey && t.altKey)) {
          if (t.char && 1 < t.char.length) return t.char;
          if (t.which) return String.fromCharCode(t.which);
        }
        return null;
      case "compositionend":
        return Vf && t.locale !== "ko" ? null : t.data;
      default:
        return null;
    }
  }
  var zm = {
    color: !0,
    date: !0,
    datetime: !0,
    "datetime-local": !0,
    email: !0,
    month: !0,
    number: !0,
    password: !0,
    range: !0,
    search: !0,
    tel: !0,
    text: !0,
    time: !0,
    url: !0,
    week: !0,
  };
  function Wf(l) {
    var t = l && l.nodeName && l.nodeName.toLowerCase();
    return t === "input" ? !!zm[l.type] : t === "textarea";
  }
  function $f(l, t, a, e) {
    $a ? (ka ? ka.push(e) : (ka = [e])) : ($a = e),
      (t = _n(t, "onChange")),
      0 < t.length &&
        ((a = new Hu("onChange", "change", null, a, e)), l.push({ event: a, listeners: t }));
  }
  var Be = null,
    Ye = null;
  function Tm(l) {
    Ud(l, 0);
  }
  function qu(l) {
    var t = De(l);
    if (Of(t)) return l;
  }
  function kf(l, t) {
    if (l === "change") return t;
  }
  var Ff = !1;
  if (Ht) {
    var di;
    if (Ht) {
      var ri = "oninput" in document;
      if (!ri) {
        var If = document.createElement("div");
        If.setAttribute("oninput", "return;"), (ri = typeof If.oninput == "function");
      }
      di = ri;
    } else di = !1;
    Ff = di && (!document.documentMode || 9 < document.documentMode);
  }
  function Pf() {
    Be && (Be.detachEvent("onpropertychange", ls), (Ye = Be = null));
  }
  function ls(l) {
    if (l.propertyName === "value" && qu(Ye)) {
      var t = [];
      $f(t, Ye, l, ai(l)), Bf(Tm, t);
    }
  }
  function Em(l, t, a) {
    l === "focusin"
      ? (Pf(), (Be = t), (Ye = a), Be.attachEvent("onpropertychange", ls))
      : l === "focusout" && Pf();
  }
  function Am(l) {
    if (l === "selectionchange" || l === "keyup" || l === "keydown") return qu(Ye);
  }
  function _m(l, t) {
    if (l === "click") return qu(t);
  }
  function Nm(l, t) {
    if (l === "input" || l === "change") return qu(t);
  }
  function xm(l, t) {
    return (l === t && (l !== 0 || 1 / l === 1 / t)) || (l !== l && t !== t);
  }
  var nt = typeof Object.is == "function" ? Object.is : xm;
  function Ge(l, t) {
    if (nt(l, t)) return !0;
    if (typeof l != "object" || l === null || typeof t != "object" || t === null) return !1;
    var a = Object.keys(l),
      e = Object.keys(t);
    if (a.length !== e.length) return !1;
    for (e = 0; e < a.length; e++) {
      var u = a[e];
      if (!Vn.call(t, u) || !nt(l[u], t[u])) return !1;
    }
    return !0;
  }
  function ts(l) {
    while (l && l.firstChild) l = l.firstChild;
    return l;
  }
  function as(l, t) {
    var a = ts(l);
    l = 0;
    for (var e; a; ) {
      if (a.nodeType === 3) {
        if (((e = l + a.textContent.length), l <= t && e >= t)) return { node: a, offset: t - l };
        l = e;
      }
      l: {
        while (a) {
          if (a.nextSibling) {
            a = a.nextSibling;
            break l;
          }
          a = a.parentNode;
        }
        a = void 0;
      }
      a = ts(a);
    }
  }
  function es(l, t) {
    return l && t
      ? l === t
        ? !0
        : l && l.nodeType === 3
          ? !1
          : t && t.nodeType === 3
            ? es(l, t.parentNode)
            : "contains" in l
              ? l.contains(t)
              : l.compareDocumentPosition
                ? !!(l.compareDocumentPosition(t) & 16)
                : !1
      : !1;
  }
  function us(l) {
    l =
      l != null && l.ownerDocument != null && l.ownerDocument.defaultView != null
        ? l.ownerDocument.defaultView
        : window;
    for (var t = Mu(l.document); t instanceof l.HTMLIFrameElement; ) {
      try {
        var a = typeof t.contentWindow.location.href == "string";
      } catch {
        a = !1;
      }
      if (a) l = t.contentWindow;
      else break;
      t = Mu(l.document);
    }
    return t;
  }
  function mi(l) {
    var t = l && l.nodeName && l.nodeName.toLowerCase();
    return (
      t &&
      ((t === "input" &&
        (l.type === "text" ||
          l.type === "search" ||
          l.type === "tel" ||
          l.type === "url" ||
          l.type === "password")) ||
        t === "textarea" ||
        l.contentEditable === "true")
    );
  }
  var jm = Ht && "documentMode" in document && 11 >= document.documentMode,
    Ia = null,
    vi = null,
    Xe = null,
    hi = !1;
  function ns(l, t, a) {
    var e = a.window === a ? a.document : a.nodeType === 9 ? a : a.ownerDocument;
    hi ||
      Ia == null ||
      Ia !== Mu(e) ||
      ((e = Ia),
      "selectionStart" in e && mi(e)
        ? (e = { start: e.selectionStart, end: e.selectionEnd })
        : ((e = ((e.ownerDocument && e.ownerDocument.defaultView) || window).getSelection()),
          (e = {
            anchorNode: e.anchorNode,
            anchorOffset: e.anchorOffset,
            focusNode: e.focusNode,
            focusOffset: e.focusOffset,
          })),
      (Xe && Ge(Xe, e)) ||
        ((Xe = e),
        (e = _n(vi, "onSelect")),
        0 < e.length &&
          ((t = new Hu("onSelect", "select", null, t, a)),
          l.push({ event: t, listeners: e }),
          (t.target = Ia))));
  }
  function Na(l, t) {
    var a = {};
    return (
      (a[l.toLowerCase()] = t.toLowerCase()),
      (a["Webkit" + l] = "webkit" + t),
      (a["Moz" + l] = "moz" + t),
      a
    );
  }
  var Pa = {
      animationend: Na("Animation", "AnimationEnd"),
      animationiteration: Na("Animation", "AnimationIteration"),
      animationstart: Na("Animation", "AnimationStart"),
      transitionrun: Na("Transition", "TransitionRun"),
      transitionstart: Na("Transition", "TransitionStart"),
      transitioncancel: Na("Transition", "TransitionCancel"),
      transitionend: Na("Transition", "TransitionEnd"),
    },
    yi = {},
    is = {};
  Ht &&
    ((is = document.createElement("div").style),
    "AnimationEvent" in window ||
      (delete Pa.animationend.animation,
      delete Pa.animationiteration.animation,
      delete Pa.animationstart.animation),
    "TransitionEvent" in window || delete Pa.transitionend.transition);
  function xa(l) {
    if (yi[l]) return yi[l];
    if (!Pa[l]) return l;
    var t = Pa[l],
      a;
    for (a in t) if (t.hasOwnProperty(a) && a in is) return (yi[l] = t[a]);
    return l;
  }
  var cs = xa("animationend"),
    fs = xa("animationiteration"),
    ss = xa("animationstart"),
    Mm = xa("transitionrun"),
    Om = xa("transitionstart"),
    Dm = xa("transitioncancel"),
    os = xa("transitionend"),
    ds = /* @__PURE__ */ new Map(),
    gi =
      "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(
        " ",
      );
  gi.push("scrollEnd");
  function Et(l, t) {
    ds.set(l, t), Aa(t, [l]);
  }
  var Bu =
      typeof reportError == "function"
        ? reportError
        : (l) => {
            if (typeof window == "object" && typeof window.ErrorEvent == "function") {
              var t = new window.ErrorEvent("error", {
                bubbles: !0,
                cancelable: !0,
                message:
                  typeof l == "object" && l !== null && typeof l.message == "string"
                    ? String(l.message)
                    : String(l),
                error: l,
              });
              if (!window.dispatchEvent(t)) return;
            } else if (typeof process == "object" && typeof process.emit == "function") {
              process.emit("uncaughtException", l);
              return;
            }
            console.error(l);
          },
    vt = [],
    le = 0,
    pi = 0;
  function Yu() {
    for (var l = le, t = (pi = le = 0); t < l; ) {
      var a = vt[t];
      vt[t++] = null;
      var e = vt[t];
      vt[t++] = null;
      var u = vt[t];
      vt[t++] = null;
      var n = vt[t];
      if (((vt[t++] = null), e !== null && u !== null)) {
        var i = e.pending;
        i === null ? (u.next = u) : ((u.next = i.next), (i.next = u)), (e.pending = u);
      }
      n !== 0 && rs(a, u, n);
    }
  }
  function Gu(l, t, a, e) {
    (vt[le++] = l),
      (vt[le++] = t),
      (vt[le++] = a),
      (vt[le++] = e),
      (pi |= e),
      (l.lanes |= e),
      (l = l.alternate),
      l !== null && (l.lanes |= e);
  }
  function bi(l, t, a, e) {
    return Gu(l, t, a, e), Xu(l);
  }
  function ja(l, t) {
    return Gu(l, null, null, t), Xu(l);
  }
  function rs(l, t, a) {
    l.lanes |= a;
    var e = l.alternate;
    e !== null && (e.lanes |= a);
    for (var u = !1, n = l.return; n !== null; )
      (n.childLanes |= a),
        (e = n.alternate),
        e !== null && (e.childLanes |= a),
        n.tag === 22 && ((l = n.stateNode), l === null || l._visibility & 1 || (u = !0)),
        (l = n),
        (n = n.return);
    return l.tag === 3
      ? ((n = l.stateNode),
        u &&
          t !== null &&
          ((u = 31 - ut(a)),
          (l = n.hiddenUpdates),
          (e = l[u]),
          e === null ? (l[u] = [t]) : e.push(t),
          (t.lane = a | 536870912)),
        n)
      : null;
  }
  function Xu(l) {
    if (50 < fu) throw ((fu = 0), (jc = null), Error(s(185)));
    for (var t = l.return; t !== null; ) (l = t), (t = l.return);
    return l.tag === 3 ? l.stateNode : null;
  }
  var te = {};
  function Um(l, t, a, e) {
    (this.tag = l),
      (this.key = a),
      (this.sibling =
        this.child =
        this.return =
        this.stateNode =
        this.type =
        this.elementType =
          null),
      (this.index = 0),
      (this.refCleanup = this.ref = null),
      (this.pendingProps = t),
      (this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null),
      (this.mode = e),
      (this.subtreeFlags = this.flags = 0),
      (this.deletions = null),
      (this.childLanes = this.lanes = 0),
      (this.alternate = null);
  }
  function it(l, t, a, e) {
    return new Um(l, t, a, e);
  }
  function Si(l) {
    return (l = l.prototype), !(!l || !l.isReactComponent);
  }
  function Rt(l, t) {
    var a = l.alternate;
    return (
      a === null
        ? ((a = it(l.tag, t, l.key, l.mode)),
          (a.elementType = l.elementType),
          (a.type = l.type),
          (a.stateNode = l.stateNode),
          (a.alternate = l),
          (l.alternate = a))
        : ((a.pendingProps = t),
          (a.type = l.type),
          (a.flags = 0),
          (a.subtreeFlags = 0),
          (a.deletions = null)),
      (a.flags = l.flags & 65011712),
      (a.childLanes = l.childLanes),
      (a.lanes = l.lanes),
      (a.child = l.child),
      (a.memoizedProps = l.memoizedProps),
      (a.memoizedState = l.memoizedState),
      (a.updateQueue = l.updateQueue),
      (t = l.dependencies),
      (a.dependencies = t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }),
      (a.sibling = l.sibling),
      (a.index = l.index),
      (a.ref = l.ref),
      (a.refCleanup = l.refCleanup),
      a
    );
  }
  function ms(l, t) {
    l.flags &= 65011714;
    var a = l.alternate;
    return (
      a === null
        ? ((l.childLanes = 0),
          (l.lanes = t),
          (l.child = null),
          (l.subtreeFlags = 0),
          (l.memoizedProps = null),
          (l.memoizedState = null),
          (l.updateQueue = null),
          (l.dependencies = null),
          (l.stateNode = null))
        : ((l.childLanes = a.childLanes),
          (l.lanes = a.lanes),
          (l.child = a.child),
          (l.subtreeFlags = 0),
          (l.deletions = null),
          (l.memoizedProps = a.memoizedProps),
          (l.memoizedState = a.memoizedState),
          (l.updateQueue = a.updateQueue),
          (l.type = a.type),
          (t = a.dependencies),
          (l.dependencies =
            t === null
              ? null
              : {
                  lanes: t.lanes,
                  firstContext: t.firstContext,
                })),
      l
    );
  }
  function Qu(l, t, a, e, u, n) {
    var i = 0;
    if (((e = l), typeof l == "function")) Si(l) && (i = 1);
    else if (typeof l == "string")
      i = Bv(l, a, C.current) ? 26 : l === "html" || l === "head" || l === "body" ? 27 : 5;
    else
      l: switch (l) {
        case Vl:
          return (l = it(31, a, t, u)), (l.elementType = Vl), (l.lanes = n), l;
        case rl:
          return Ma(a.children, u, n, t);
        case Ul:
          (i = 8), (u |= 24);
          break;
        case Y:
          return (l = it(12, a, t, u | 2)), (l.elementType = Y), (l.lanes = n), l;
        case wl:
          return (l = it(13, a, t, u)), (l.elementType = wl), (l.lanes = n), l;
        case Zl:
          return (l = it(19, a, t, u)), (l.elementType = Zl), (l.lanes = n), l;
        default:
          if (typeof l == "object" && l !== null)
            switch (l.$$typeof) {
              case fl:
                i = 10;
                break l;
              case Ql:
                i = 9;
                break l;
              case bl:
                i = 11;
                break l;
              case w:
                i = 14;
                break l;
              case sl:
                (i = 16), (e = null);
                break l;
            }
          (i = 29), (a = Error(s(130, l === null ? "null" : typeof l, ""))), (e = null);
      }
    return (t = it(i, a, t, u)), (t.elementType = l), (t.type = e), (t.lanes = n), t;
  }
  function Ma(l, t, a, e) {
    return (l = it(7, l, e, t)), (l.lanes = a), l;
  }
  function zi(l, t, a) {
    return (l = it(6, l, null, t)), (l.lanes = a), l;
  }
  function vs(l) {
    var t = it(18, null, null, 0);
    return (t.stateNode = l), t;
  }
  function Ti(l, t, a) {
    return (
      (t = it(4, l.children !== null ? l.children : [], l.key, t)),
      (t.lanes = a),
      (t.stateNode = {
        containerInfo: l.containerInfo,
        pendingChildren: null,
        implementation: l.implementation,
      }),
      t
    );
  }
  var hs = /* @__PURE__ */ new WeakMap();
  function ht(l, t) {
    if (typeof l == "object" && l !== null) {
      var a = hs.get(l);
      return a !== void 0
        ? a
        : ((t = {
            value: l,
            source: t,
            stack: vf(t),
          }),
          hs.set(l, t),
          t);
    }
    return {
      value: l,
      source: t,
      stack: vf(t),
    };
  }
  var ae = [],
    ee = 0,
    Zu = null,
    Qe = 0,
    yt = [],
    gt = 0,
    Pt = null,
    xt = 1,
    jt = "";
  function qt(l, t) {
    (ae[ee++] = Qe), (ae[ee++] = Zu), (Zu = l), (Qe = t);
  }
  function ys(l, t, a) {
    (yt[gt++] = xt), (yt[gt++] = jt), (yt[gt++] = Pt), (Pt = l);
    var e = xt;
    l = jt;
    var u = 32 - ut(e) - 1;
    (e &= ~(1 << u)), (a += 1);
    var n = 32 - ut(t) + u;
    if (30 < n) {
      var i = u - (u % 5);
      (n = (e & ((1 << i) - 1)).toString(32)),
        (e >>= i),
        (u -= i),
        (xt = (1 << (32 - ut(t) + u)) | (a << u) | e),
        (jt = n + l);
    } else (xt = (1 << n) | (a << u) | e), (jt = l);
  }
  function Ei(l) {
    l.return !== null && (qt(l, 1), ys(l, 1, 0));
  }
  function Ai(l) {
    while (l === Zu) (Zu = ae[--ee]), (ae[ee] = null), (Qe = ae[--ee]), (ae[ee] = null);
    while (l === Pt)
      (Pt = yt[--gt]),
        (yt[gt] = null),
        (jt = yt[--gt]),
        (yt[gt] = null),
        (xt = yt[--gt]),
        (yt[gt] = null);
  }
  function gs(l, t) {
    (yt[gt++] = xt), (yt[gt++] = jt), (yt[gt++] = Pt), (xt = t.id), (jt = t.overflow), (Pt = l);
  }
  var Bl = null,
    Sl = null,
    tl = !1,
    la = null,
    pt = !1,
    _i = Error(s(519));
  function ta(l) {
    var t = Error(
      s(418, 1 < arguments.length && arguments[1] !== void 0 && arguments[1] ? "text" : "HTML", ""),
    );
    throw (Ze(ht(t, l)), _i);
  }
  function ps(l) {
    var t = l.stateNode,
      a = l.type,
      e = l.memoizedProps;
    switch (((t[ql] = l), (t[$l] = e), a)) {
      case "dialog":
        k("cancel", t), k("close", t);
        break;
      case "iframe":
      case "object":
      case "embed":
        k("load", t);
        break;
      case "video":
      case "audio":
        for (a = 0; a < ou.length; a++) k(ou[a], t);
        break;
      case "source":
        k("error", t);
        break;
      case "img":
      case "image":
      case "link":
        k("error", t), k("load", t);
        break;
      case "details":
        k("toggle", t);
        break;
      case "input":
        k("invalid", t),
          Df(t, e.value, e.defaultValue, e.checked, e.defaultChecked, e.type, e.name, !0);
        break;
      case "select":
        k("invalid", t);
        break;
      case "textarea":
        k("invalid", t), Cf(t, e.value, e.defaultValue, e.children);
    }
    (a = e.children),
      (typeof a != "string" && typeof a != "number" && typeof a != "bigint") ||
      t.textContent === "" + a ||
      e.suppressHydrationWarning === !0 ||
      qd(t.textContent, a)
        ? (e.popover != null && (k("beforetoggle", t), k("toggle", t)),
          e.onScroll != null && k("scroll", t),
          e.onScrollEnd != null && k("scrollend", t),
          e.onClick != null && (t.onclick = Ct),
          (t = !0))
        : (t = !1),
      t || ta(l, !0);
  }
  function bs(l) {
    for (Bl = l.return; Bl; )
      switch (Bl.tag) {
        case 5:
        case 31:
        case 13:
          pt = !1;
          return;
        case 27:
        case 3:
          pt = !0;
          return;
        default:
          Bl = Bl.return;
      }
  }
  function ue(l) {
    if (l !== Bl) return !1;
    if (!tl) return bs(l), (tl = !0), !1;
    var t = l.tag,
      a;
    if (
      ((a = t !== 3 && t !== 27) &&
        ((a = t === 5) &&
          ((a = l.type), (a = !(a !== "form" && a !== "button") || Vc(l.type, l.memoizedProps))),
        (a = !a)),
      a && Sl && ta(l),
      bs(l),
      t === 13)
    ) {
      if (((l = l.memoizedState), (l = l !== null ? l.dehydrated : null), !l)) throw Error(s(317));
      Sl = Kd(l);
    } else if (t === 31) {
      if (((l = l.memoizedState), (l = l !== null ? l.dehydrated : null), !l)) throw Error(s(317));
      Sl = Kd(l);
    } else
      t === 27
        ? ((t = Sl), ha(l.type) ? ((l = Wc), (Wc = null), (Sl = l)) : (Sl = t))
        : (Sl = Bl ? St(l.stateNode.nextSibling) : null);
    return !0;
  }
  function Oa() {
    (Sl = Bl = null), (tl = !1);
  }
  function Ni() {
    var l = la;
    return l !== null && (lt === null ? (lt = l) : lt.push.apply(lt, l), (la = null)), l;
  }
  function Ze(l) {
    la === null ? (la = [l]) : la.push(l);
  }
  var xi = r(null),
    Da = null,
    Bt = null;
  function aa(l, t, a) {
    D(xi, t._currentValue), (t._currentValue = a);
  }
  function Yt(l) {
    (l._currentValue = xi.current), _(xi);
  }
  function ji(l, t, a) {
    while (l !== null) {
      var e = l.alternate;
      if (
        ((l.childLanes & t) !== t
          ? ((l.childLanes |= t), e !== null && (e.childLanes |= t))
          : e !== null && (e.childLanes & t) !== t && (e.childLanes |= t),
        l === a)
      )
        break;
      l = l.return;
    }
  }
  function Mi(l, t, a, e) {
    var u = l.child;
    for (u !== null && (u.return = l); u !== null; ) {
      var n = u.dependencies;
      if (n !== null) {
        var i = u.child;
        n = n.firstContext;
        l: while (n !== null) {
          var c = n;
          n = u;
          for (var f = 0; f < t.length; f++)
            if (c.context === t[f]) {
              (n.lanes |= a),
                (c = n.alternate),
                c !== null && (c.lanes |= a),
                ji(n.return, a, l),
                e || (i = null);
              break l;
            }
          n = c.next;
        }
      } else if (u.tag === 18) {
        if (((i = u.return), i === null)) throw Error(s(341));
        (i.lanes |= a), (n = i.alternate), n !== null && (n.lanes |= a), ji(i, a, l), (i = null);
      } else i = u.child;
      if (i !== null) i.return = u;
      else
        for (i = u; i !== null; ) {
          if (i === l) {
            i = null;
            break;
          }
          if (((u = i.sibling), u !== null)) {
            (u.return = i.return), (i = u);
            break;
          }
          i = i.return;
        }
      u = i;
    }
  }
  function ne(l, t, a, e) {
    l = null;
    for (var u = t, n = !1; u !== null; ) {
      if (!n) {
        if ((u.flags & 524288) !== 0) n = !0;
        else if ((u.flags & 262144) !== 0) break;
      }
      if (u.tag === 10) {
        var i = u.alternate;
        if (i === null) throw Error(s(387));
        if (((i = i.memoizedProps), i !== null)) {
          var c = u.type;
          nt(u.pendingProps.value, i.value) || (l !== null ? l.push(c) : (l = [c]));
        }
      } else if (u === il.current) {
        if (((i = u.alternate), i === null)) throw Error(s(387));
        i.memoizedState.memoizedState !== u.memoizedState.memoizedState &&
          (l !== null ? l.push(hu) : (l = [hu]));
      }
      u = u.return;
    }
    l !== null && Mi(t, l, a, e), (t.flags |= 262144);
  }
  function Vu(l) {
    for (l = l.firstContext; l !== null; ) {
      if (!nt(l.context._currentValue, l.memoizedValue)) return !0;
      l = l.next;
    }
    return !1;
  }
  function Ua(l) {
    (Da = l), (Bt = null), (l = l.dependencies), l !== null && (l.firstContext = null);
  }
  function Yl(l) {
    return Ss(Da, l);
  }
  function Lu(l, t) {
    return Da === null && Ua(l), Ss(l, t);
  }
  function Ss(l, t) {
    var a = t._currentValue;
    if (((t = { context: t, memoizedValue: a, next: null }), Bt === null)) {
      if (l === null) throw Error(s(308));
      (Bt = t), (l.dependencies = { lanes: 0, firstContext: t }), (l.flags |= 524288);
    } else Bt = Bt.next = t;
    return a;
  }
  var Cm =
      typeof AbortController < "u"
        ? AbortController
        : function () {
            var l = [],
              t = (this.signal = {
                aborted: !1,
                addEventListener: (a, e) => {
                  l.push(e);
                },
              });
            this.abort = () => {
              (t.aborted = !0), l.forEach((a) => a());
            };
          },
    Hm = g.unstable_scheduleCallback,
    Rm = g.unstable_NormalPriority,
    jl = {
      $$typeof: fl,
      Consumer: null,
      Provider: null,
      _currentValue: null,
      _currentValue2: null,
      _threadCount: 0,
    };
  function Oi() {
    return {
      controller: new Cm(),
      data: /* @__PURE__ */ new Map(),
      refCount: 0,
    };
  }
  function Ve(l) {
    l.refCount--,
      l.refCount === 0 &&
        Hm(Rm, () => {
          l.controller.abort();
        });
  }
  var Le = null,
    Di = 0,
    ie = 0,
    ce = null;
  function qm(l, t) {
    if (Le === null) {
      var a = (Le = []);
      (Di = 0),
        (ie = Hc()),
        (ce = {
          status: "pending",
          value: void 0,
          then: (e) => {
            a.push(e);
          },
        });
    }
    return Di++, t.then(zs, zs), t;
  }
  function zs() {
    if (--Di === 0 && Le !== null) {
      ce !== null && (ce.status = "fulfilled");
      var l = Le;
      (Le = null), (ie = 0), (ce = null);
      for (var t = 0; t < l.length; t++) (0, l[t])();
    }
  }
  function Bm(l, t) {
    var a = [],
      e = {
        status: "pending",
        value: null,
        reason: null,
        then: (u) => {
          a.push(u);
        },
      };
    return (
      l.then(
        () => {
          (e.status = "fulfilled"), (e.value = t);
          for (var u = 0; u < a.length; u++) (0, a[u])(t);
        },
        (u) => {
          for (e.status = "rejected", e.reason = u, u = 0; u < a.length; u++) (0, a[u])(void 0);
        },
      ),
      e
    );
  }
  var Ts = S.S;
  S.S = (l, t) => {
    (id = at()),
      typeof t == "object" && t !== null && typeof t.then == "function" && qm(l, t),
      Ts !== null && Ts(l, t);
  };
  var Ca = r(null);
  function Ui() {
    var l = Ca.current;
    return l !== null ? l : pl.pooledCache;
  }
  function Ku(l, t) {
    t === null ? D(Ca, Ca.current) : D(Ca, t.pool);
  }
  function Es() {
    var l = Ui();
    return l === null ? null : { parent: jl._currentValue, pool: l };
  }
  var fe = Error(s(460)),
    Ci = Error(s(474)),
    Ju = Error(s(542)),
    wu = { then: () => {} };
  function As(l) {
    return (l = l.status), l === "fulfilled" || l === "rejected";
  }
  function _s(l, t, a) {
    switch (
      ((a = l[a]), a === void 0 ? l.push(t) : a !== t && (t.then(Ct, Ct), (t = a)), t.status)
    ) {
      case "fulfilled":
        return t.value;
      case "rejected":
        throw ((l = t.reason), xs(l), l);
      default:
        if (typeof t.status == "string") t.then(Ct, Ct);
        else {
          if (((l = pl), l !== null && 100 < l.shellSuspendCounter)) throw Error(s(482));
          (l = t),
            (l.status = "pending"),
            l.then(
              (e) => {
                if (t.status === "pending") {
                  var u = t;
                  (u.status = "fulfilled"), (u.value = e);
                }
              },
              (e) => {
                if (t.status === "pending") {
                  var u = t;
                  (u.status = "rejected"), (u.reason = e);
                }
              },
            );
        }
        switch (t.status) {
          case "fulfilled":
            return t.value;
          case "rejected":
            throw ((l = t.reason), xs(l), l);
        }
        throw ((Ra = t), fe);
    }
  }
  function Ha(l) {
    try {
      var t = l._init;
      return t(l._payload);
    } catch (a) {
      throw a !== null && typeof a == "object" && typeof a.then == "function" ? ((Ra = a), fe) : a;
    }
  }
  var Ra = null;
  function Ns() {
    if (Ra === null) throw Error(s(459));
    var l = Ra;
    return (Ra = null), l;
  }
  function xs(l) {
    if (l === fe || l === Ju) throw Error(s(483));
  }
  var se = null,
    Ke = 0;
  function Wu(l) {
    var t = Ke;
    return (Ke += 1), se === null && (se = []), _s(se, l, t);
  }
  function Je(l, t) {
    (t = t.props.ref), (l.ref = t !== void 0 ? t : null);
  }
  function $u(l, t) {
    throw t.$$typeof === ll
      ? Error(s(525))
      : ((l = Object.prototype.toString.call(t)),
        Error(
          s(
            31,
            l === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : l,
          ),
        ));
  }
  function js(l) {
    function t(m, d) {
      if (l) {
        var v = m.deletions;
        v === null ? ((m.deletions = [d]), (m.flags |= 16)) : v.push(d);
      }
    }
    function a(m, d) {
      if (!l) return null;
      while (d !== null) t(m, d), (d = d.sibling);
      return null;
    }
    function e(m) {
      for (var d = /* @__PURE__ */ new Map(); m !== null; )
        m.key !== null ? d.set(m.key, m) : d.set(m.index, m), (m = m.sibling);
      return d;
    }
    function u(m, d) {
      return (m = Rt(m, d)), (m.index = 0), (m.sibling = null), m;
    }
    function n(m, d, v) {
      return (
        (m.index = v),
        l
          ? ((v = m.alternate),
            v !== null
              ? ((v = v.index), v < d ? ((m.flags |= 67108866), d) : v)
              : ((m.flags |= 67108866), d))
          : ((m.flags |= 1048576), d)
      );
    }
    function i(m) {
      return l && m.alternate === null && (m.flags |= 67108866), m;
    }
    function c(m, d, v, z) {
      return d === null || d.tag !== 6
        ? ((d = zi(v, m.mode, z)), (d.return = m), d)
        : ((d = u(d, v)), (d.return = m), d);
    }
    function f(m, d, v, z) {
      var q = v.type;
      return q === rl
        ? b(m, d, v.props.children, z, v.key)
        : d !== null &&
            (d.elementType === q ||
              (typeof q == "object" && q !== null && q.$$typeof === sl && Ha(q) === d.type))
          ? ((d = u(d, v.props)), Je(d, v), (d.return = m), d)
          : ((d = Qu(v.type, v.key, v.props, null, m.mode, z)), Je(d, v), (d.return = m), d);
    }
    function h(m, d, v, z) {
      return d === null ||
        d.tag !== 4 ||
        d.stateNode.containerInfo !== v.containerInfo ||
        d.stateNode.implementation !== v.implementation
        ? ((d = Ti(v, m.mode, z)), (d.return = m), d)
        : ((d = u(d, v.children || [])), (d.return = m), d);
    }
    function b(m, d, v, z, q) {
      return d === null || d.tag !== 7
        ? ((d = Ma(v, m.mode, z, q)), (d.return = m), d)
        : ((d = u(d, v)), (d.return = m), d);
    }
    function T(m, d, v) {
      if ((typeof d == "string" && d !== "") || typeof d == "number" || typeof d == "bigint")
        return (d = zi("" + d, m.mode, v)), (d.return = m), d;
      if (typeof d == "object" && d !== null) {
        switch (d.$$typeof) {
          case ul:
            return (v = Qu(d.type, d.key, d.props, null, m.mode, v)), Je(v, d), (v.return = m), v;
          case cl:
            return (d = Ti(d, m.mode, v)), (d.return = m), d;
          case sl:
            return (d = Ha(d)), T(m, d, v);
        }
        if (Tt(d) || Wl(d)) return (d = Ma(d, m.mode, v, null)), (d.return = m), d;
        if (typeof d.then == "function") return T(m, Wu(d), v);
        if (d.$$typeof === fl) return T(m, Lu(m, d), v);
        $u(m, d);
      }
      return null;
    }
    function y(m, d, v, z) {
      var q = d !== null ? d.key : null;
      if ((typeof v == "string" && v !== "") || typeof v == "number" || typeof v == "bigint")
        return q !== null ? null : c(m, d, "" + v, z);
      if (typeof v == "object" && v !== null) {
        switch (v.$$typeof) {
          case ul:
            return v.key === q ? f(m, d, v, z) : null;
          case cl:
            return v.key === q ? h(m, d, v, z) : null;
          case sl:
            return (v = Ha(v)), y(m, d, v, z);
        }
        if (Tt(v) || Wl(v)) return q !== null ? null : b(m, d, v, z, null);
        if (typeof v.then == "function") return y(m, d, Wu(v), z);
        if (v.$$typeof === fl) return y(m, d, Lu(m, v), z);
        $u(m, v);
      }
      return null;
    }
    function p(m, d, v, z, q) {
      if ((typeof z == "string" && z !== "") || typeof z == "number" || typeof z == "bigint")
        return (m = m.get(v) || null), c(d, m, "" + z, q);
      if (typeof z == "object" && z !== null) {
        switch (z.$$typeof) {
          case ul:
            return (m = m.get(z.key === null ? v : z.key) || null), f(d, m, z, q);
          case cl:
            return (m = m.get(z.key === null ? v : z.key) || null), h(d, m, z, q);
          case sl:
            return (z = Ha(z)), p(m, d, v, z, q);
        }
        if (Tt(z) || Wl(z)) return (m = m.get(v) || null), b(d, m, z, q, null);
        if (typeof z.then == "function") return p(m, d, v, Wu(z), q);
        if (z.$$typeof === fl) return p(m, d, v, Lu(d, z), q);
        $u(d, z);
      }
      return null;
    }
    function U(m, d, v, z) {
      for (var q = null, al = null, H = d, J = (d = 0), I = null; H !== null && J < v.length; J++) {
        H.index > J ? ((I = H), (H = null)) : (I = H.sibling);
        var el = y(m, H, v[J], z);
        if (el === null) {
          H === null && (H = I);
          break;
        }
        l && H && el.alternate === null && t(m, H),
          (d = n(el, d, J)),
          al === null ? (q = el) : (al.sibling = el),
          (al = el),
          (H = I);
      }
      if (J === v.length) return a(m, H), tl && qt(m, J), q;
      if (H === null) {
        for (; J < v.length; J++)
          (H = T(m, v[J], z)),
            H !== null && ((d = n(H, d, J)), al === null ? (q = H) : (al.sibling = H), (al = H));
        return tl && qt(m, J), q;
      }
      for (H = e(H); J < v.length; J++)
        (I = p(H, m, J, v[J], z)),
          I !== null &&
            (l && I.alternate !== null && H.delete(I.key === null ? J : I.key),
            (d = n(I, d, J)),
            al === null ? (q = I) : (al.sibling = I),
            (al = I));
      return l && H.forEach((Sa) => t(m, Sa)), tl && qt(m, J), q;
    }
    function G(m, d, v, z) {
      if (v == null) throw Error(s(151));
      for (
        var q = null, al = null, H = d, J = (d = 0), I = null, el = v.next();
        H !== null && !el.done;
        J++, el = v.next()
      ) {
        H.index > J ? ((I = H), (H = null)) : (I = H.sibling);
        var Sa = y(m, H, el.value, z);
        if (Sa === null) {
          H === null && (H = I);
          break;
        }
        l && H && Sa.alternate === null && t(m, H),
          (d = n(Sa, d, J)),
          al === null ? (q = Sa) : (al.sibling = Sa),
          (al = Sa),
          (H = I);
      }
      if (el.done) return a(m, H), tl && qt(m, J), q;
      if (H === null) {
        for (; !el.done; J++, el = v.next())
          (el = T(m, el.value, z)),
            el !== null &&
              ((d = n(el, d, J)), al === null ? (q = el) : (al.sibling = el), (al = el));
        return tl && qt(m, J), q;
      }
      for (H = e(H); !el.done; J++, el = v.next())
        (el = p(H, m, J, el.value, z)),
          el !== null &&
            (l && el.alternate !== null && H.delete(el.key === null ? J : el.key),
            (d = n(el, d, J)),
            al === null ? (q = el) : (al.sibling = el),
            (al = el));
      return l && H.forEach((Wv) => t(m, Wv)), tl && qt(m, J), q;
    }
    function yl(m, d, v, z) {
      if (
        (typeof v == "object" &&
          v !== null &&
          v.type === rl &&
          v.key === null &&
          (v = v.props.children),
        typeof v == "object" && v !== null)
      ) {
        switch (v.$$typeof) {
          case ul:
            l: {
              for (var q = v.key; d !== null; ) {
                if (d.key === q) {
                  if (((q = v.type), q === rl)) {
                    if (d.tag === 7) {
                      a(m, d.sibling), (z = u(d, v.props.children)), (z.return = m), (m = z);
                      break l;
                    }
                  } else if (
                    d.elementType === q ||
                    (typeof q == "object" && q !== null && q.$$typeof === sl && Ha(q) === d.type)
                  ) {
                    a(m, d.sibling), (z = u(d, v.props)), Je(z, v), (z.return = m), (m = z);
                    break l;
                  }
                  a(m, d);
                  break;
                } else t(m, d);
                d = d.sibling;
              }
              v.type === rl
                ? ((z = Ma(v.props.children, m.mode, z, v.key)), (z.return = m), (m = z))
                : ((z = Qu(v.type, v.key, v.props, null, m.mode, z)),
                  Je(z, v),
                  (z.return = m),
                  (m = z));
            }
            return i(m);
          case cl:
            l: {
              for (q = v.key; d !== null; ) {
                if (d.key === q)
                  if (
                    d.tag === 4 &&
                    d.stateNode.containerInfo === v.containerInfo &&
                    d.stateNode.implementation === v.implementation
                  ) {
                    a(m, d.sibling), (z = u(d, v.children || [])), (z.return = m), (m = z);
                    break l;
                  } else {
                    a(m, d);
                    break;
                  }
                else t(m, d);
                d = d.sibling;
              }
              (z = Ti(v, m.mode, z)), (z.return = m), (m = z);
            }
            return i(m);
          case sl:
            return (v = Ha(v)), yl(m, d, v, z);
        }
        if (Tt(v)) return U(m, d, v, z);
        if (Wl(v)) {
          if (((q = Wl(v)), typeof q != "function")) throw Error(s(150));
          return (v = q.call(v)), G(m, d, v, z);
        }
        if (typeof v.then == "function") return yl(m, d, Wu(v), z);
        if (v.$$typeof === fl) return yl(m, d, Lu(m, v), z);
        $u(m, v);
      }
      return (typeof v == "string" && v !== "") || typeof v == "number" || typeof v == "bigint"
        ? ((v = "" + v),
          d !== null && d.tag === 6
            ? (a(m, d.sibling), (z = u(d, v)), (z.return = m), (m = z))
            : (a(m, d), (z = zi(v, m.mode, z)), (z.return = m), (m = z)),
          i(m))
        : a(m, d);
    }
    return (m, d, v, z) => {
      try {
        Ke = 0;
        var q = yl(m, d, v, z);
        return (se = null), q;
      } catch (H) {
        if (H === fe || H === Ju) throw H;
        var al = it(29, H, null, m.mode);
        return (al.lanes = z), (al.return = m), al;
      } finally {
      }
    };
  }
  var qa = js(!0),
    Ms = js(!1),
    ea = !1;
  function Hi(l) {
    l.updateQueue = {
      baseState: l.memoizedState,
      firstBaseUpdate: null,
      lastBaseUpdate: null,
      shared: { pending: null, lanes: 0, hiddenCallbacks: null },
      callbacks: null,
    };
  }
  function Ri(l, t) {
    (l = l.updateQueue),
      t.updateQueue === l &&
        (t.updateQueue = {
          baseState: l.baseState,
          firstBaseUpdate: l.firstBaseUpdate,
          lastBaseUpdate: l.lastBaseUpdate,
          shared: l.shared,
          callbacks: null,
        });
  }
  function ua(l) {
    return { lane: l, tag: 0, payload: null, callback: null, next: null };
  }
  function na(l, t, a) {
    var e = l.updateQueue;
    if (e === null) return null;
    if (((e = e.shared), (nl & 2) !== 0)) {
      var u = e.pending;
      return (
        u === null ? (t.next = t) : ((t.next = u.next), (u.next = t)),
        (e.pending = t),
        (t = Xu(l)),
        rs(l, null, a),
        t
      );
    }
    return Gu(l, e, t, a), Xu(l);
  }
  function we(l, t, a) {
    if (((t = t.updateQueue), t !== null && ((t = t.shared), (a & 4194048) !== 0))) {
      var e = t.lanes;
      (e &= l.pendingLanes), (a |= e), (t.lanes = a), Sf(l, a);
    }
  }
  function qi(l, t) {
    var a = l.updateQueue,
      e = l.alternate;
    if (e !== null && ((e = e.updateQueue), a === e)) {
      var u = null,
        n = null;
      if (((a = a.firstBaseUpdate), a !== null)) {
        do {
          var i = {
            lane: a.lane,
            tag: a.tag,
            payload: a.payload,
            callback: null,
            next: null,
          };
          n === null ? (u = n = i) : (n = n.next = i), (a = a.next);
        } while (a !== null);
        n === null ? (u = n = t) : (n = n.next = t);
      } else u = n = t;
      (a = {
        baseState: e.baseState,
        firstBaseUpdate: u,
        lastBaseUpdate: n,
        shared: e.shared,
        callbacks: e.callbacks,
      }),
        (l.updateQueue = a);
      return;
    }
    (l = a.lastBaseUpdate),
      l === null ? (a.firstBaseUpdate = t) : (l.next = t),
      (a.lastBaseUpdate = t);
  }
  var Bi = !1;
  function We() {
    if (Bi) {
      var l = ce;
      if (l !== null) throw l;
    }
  }
  function $e(l, t, a, e) {
    Bi = !1;
    var u = l.updateQueue;
    ea = !1;
    var n = u.firstBaseUpdate,
      i = u.lastBaseUpdate,
      c = u.shared.pending;
    if (c !== null) {
      u.shared.pending = null;
      var f = c,
        h = f.next;
      (f.next = null), i === null ? (n = h) : (i.next = h), (i = f);
      var b = l.alternate;
      b !== null &&
        ((b = b.updateQueue),
        (c = b.lastBaseUpdate),
        c !== i && (c === null ? (b.firstBaseUpdate = h) : (c.next = h), (b.lastBaseUpdate = f)));
    }
    if (n !== null) {
      var T = u.baseState;
      (i = 0), (b = h = f = null), (c = n);
      do {
        var y = c.lane & -536870913,
          p = y !== c.lane;
        if (p ? (F & y) === y : (e & y) === y) {
          y !== 0 && y === ie && (Bi = !0),
            b !== null &&
              (b = b.next =
                {
                  lane: 0,
                  tag: c.tag,
                  payload: c.payload,
                  callback: null,
                  next: null,
                });
          l: {
            var U = l,
              G = c;
            y = t;
            var yl = a;
            switch (G.tag) {
              case 1:
                if (((U = G.payload), typeof U == "function")) {
                  T = U.call(yl, T, y);
                  break l;
                }
                T = U;
                break l;
              case 3:
                U.flags = (U.flags & -65537) | 128;
              case 0:
                if (
                  ((U = G.payload), (y = typeof U == "function" ? U.call(yl, T, y) : U), y == null)
                )
                  break l;
                T = R({}, T, y);
                break l;
              case 2:
                ea = !0;
            }
          }
          (y = c.callback),
            y !== null &&
              ((l.flags |= 64),
              p && (l.flags |= 8192),
              (p = u.callbacks),
              p === null ? (u.callbacks = [y]) : p.push(y));
        } else
          (p = {
            lane: y,
            tag: c.tag,
            payload: c.payload,
            callback: c.callback,
            next: null,
          }),
            b === null ? ((h = b = p), (f = T)) : (b = b.next = p),
            (i |= y);
        if (((c = c.next), c === null)) {
          if (((c = u.shared.pending), c === null)) break;
          (p = c), (c = p.next), (p.next = null), (u.lastBaseUpdate = p), (u.shared.pending = null);
        }
      } while (!0);
      b === null && (f = T),
        (u.baseState = f),
        (u.firstBaseUpdate = h),
        (u.lastBaseUpdate = b),
        n === null && (u.shared.lanes = 0),
        (oa |= i),
        (l.lanes = i),
        (l.memoizedState = T);
    }
  }
  function Os(l, t) {
    if (typeof l != "function") throw Error(s(191, l));
    l.call(t);
  }
  function Ds(l, t) {
    var a = l.callbacks;
    if (a !== null) for (l.callbacks = null, l = 0; l < a.length; l++) Os(a[l], t);
  }
  var oe = r(null),
    ku = r(0);
  function Us(l, t) {
    (l = wt), D(ku, l), D(oe, t), (wt = l | t.baseLanes);
  }
  function Yi() {
    D(ku, wt), D(oe, oe.current);
  }
  function Gi() {
    (wt = ku.current), _(oe), _(ku);
  }
  var ct = r(null),
    bt = null;
  function ia(l) {
    var t = l.alternate;
    D(Nl, Nl.current & 1),
      D(ct, l),
      bt === null && (t === null || oe.current !== null || t.memoizedState !== null) && (bt = l);
  }
  function Xi(l) {
    D(Nl, Nl.current), D(ct, l), bt === null && (bt = l);
  }
  function Cs(l) {
    l.tag === 22 ? (D(Nl, Nl.current), D(ct, l), bt === null && (bt = l)) : ca();
  }
  function ca() {
    D(Nl, Nl.current), D(ct, ct.current);
  }
  function ft(l) {
    _(ct), bt === l && (bt = null), _(Nl);
  }
  var Nl = r(0);
  function Fu(l) {
    for (var t = l; t !== null; ) {
      if (t.tag === 13) {
        var a = t.memoizedState;
        if (a !== null && ((a = a.dehydrated), a === null || Jc(a) || wc(a))) return t;
      } else if (
        t.tag === 19 &&
        (t.memoizedProps.revealOrder === "forwards" ||
          t.memoizedProps.revealOrder === "backwards" ||
          t.memoizedProps.revealOrder === "unstable_legacy-backwards" ||
          t.memoizedProps.revealOrder === "together")
      ) {
        if ((t.flags & 128) !== 0) return t;
      } else if (t.child !== null) {
        (t.child.return = t), (t = t.child);
        continue;
      }
      if (t === l) break;
      while (t.sibling === null) {
        if (t.return === null || t.return === l) return null;
        t = t.return;
      }
      (t.sibling.return = t.return), (t = t.sibling);
    }
    return null;
  }
  var Gt = 0,
    K = null,
    vl = null,
    Ml = null,
    Iu = !1,
    de = !1,
    Ba = !1,
    Pu = 0,
    ke = 0,
    re = null,
    Ym = 0;
  function El() {
    throw Error(s(321));
  }
  function Qi(l, t) {
    if (t === null) return !1;
    for (var a = 0; a < t.length && a < l.length; a++) if (!nt(l[a], t[a])) return !1;
    return !0;
  }
  function Zi(l, t, a, e, u, n) {
    return (
      (Gt = n),
      (K = t),
      (t.memoizedState = null),
      (t.updateQueue = null),
      (t.lanes = 0),
      (S.H = l === null || l.memoizedState === null ? go : ec),
      (Ba = !1),
      (n = a(e, u)),
      (Ba = !1),
      de && (n = Rs(t, a, e, u)),
      Hs(l),
      n
    );
  }
  function Hs(l) {
    S.H = Pe;
    var t = vl !== null && vl.next !== null;
    if (((Gt = 0), (Ml = vl = K = null), (Iu = !1), (ke = 0), (re = null), t)) throw Error(s(300));
    l === null || Ol || ((l = l.dependencies), l !== null && Vu(l) && (Ol = !0));
  }
  function Rs(l, t, a, e) {
    K = l;
    var u = 0;
    do {
      if ((de && (re = null), (ke = 0), (de = !1), 25 <= u)) throw Error(s(301));
      if (((u += 1), (Ml = vl = null), l.updateQueue != null)) {
        var n = l.updateQueue;
        (n.lastEffect = null),
          (n.events = null),
          (n.stores = null),
          n.memoCache != null && (n.memoCache.index = 0);
      }
      (S.H = po), (n = t(a, e));
    } while (de);
    return n;
  }
  function Gm() {
    var l = S.H,
      t = l.useState()[0];
    return (
      (t = typeof t.then == "function" ? Fe(t) : t),
      (l = l.useState()[0]),
      (vl !== null ? vl.memoizedState : null) !== l && (K.flags |= 1024),
      t
    );
  }
  function Vi() {
    var l = Pu !== 0;
    return (Pu = 0), l;
  }
  function Li(l, t, a) {
    (t.updateQueue = l.updateQueue), (t.flags &= -2053), (l.lanes &= ~a);
  }
  function Ki(l) {
    if (Iu) {
      for (l = l.memoizedState; l !== null; ) {
        var t = l.queue;
        t !== null && (t.pending = null), (l = l.next);
      }
      Iu = !1;
    }
    (Gt = 0), (Ml = vl = K = null), (de = !1), (ke = Pu = 0), (re = null);
  }
  function Jl() {
    var l = {
      memoizedState: null,
      baseState: null,
      baseQueue: null,
      queue: null,
      next: null,
    };
    return Ml === null ? (K.memoizedState = Ml = l) : (Ml = Ml.next = l), Ml;
  }
  function xl() {
    if (vl === null) {
      var l = K.alternate;
      l = l !== null ? l.memoizedState : null;
    } else l = vl.next;
    var t = Ml === null ? K.memoizedState : Ml.next;
    if (t !== null) (Ml = t), (vl = l);
    else {
      if (l === null) throw K.alternate === null ? Error(s(467)) : Error(s(310));
      (vl = l),
        (l = {
          memoizedState: vl.memoizedState,
          baseState: vl.baseState,
          baseQueue: vl.baseQueue,
          queue: vl.queue,
          next: null,
        }),
        Ml === null ? (K.memoizedState = Ml = l) : (Ml = Ml.next = l);
    }
    return Ml;
  }
  function ln() {
    return { lastEffect: null, events: null, stores: null, memoCache: null };
  }
  function Fe(l) {
    var t = ke;
    return (
      (ke += 1),
      re === null && (re = []),
      (l = _s(re, l, t)),
      (t = K),
      (Ml === null ? t.memoizedState : Ml.next) === null &&
        ((t = t.alternate), (S.H = t === null || t.memoizedState === null ? go : ec)),
      l
    );
  }
  function tn(l) {
    if (l !== null && typeof l == "object") {
      if (typeof l.then == "function") return Fe(l);
      if (l.$$typeof === fl) return Yl(l);
    }
    throw Error(s(438, String(l)));
  }
  function Ji(l) {
    var t = null,
      a = K.updateQueue;
    if ((a !== null && (t = a.memoCache), t == null)) {
      var e = K.alternate;
      e !== null &&
        ((e = e.updateQueue),
        e !== null &&
          ((e = e.memoCache),
          e != null &&
            (t = {
              data: e.data.map((u) => u.slice()),
              index: 0,
            })));
    }
    if (
      (t == null && (t = { data: [], index: 0 }),
      a === null && ((a = ln()), (K.updateQueue = a)),
      (a.memoCache = t),
      (a = t.data[t.index]),
      a === void 0)
    )
      for (a = t.data[t.index] = Array(l), e = 0; e < l; e++) a[e] = Qa;
    return t.index++, a;
  }
  function Xt(l, t) {
    return typeof t == "function" ? t(l) : t;
  }
  function an(l) {
    var t = xl();
    return wi(t, vl, l);
  }
  function wi(l, t, a) {
    var e = l.queue;
    if (e === null) throw Error(s(311));
    e.lastRenderedReducer = a;
    var u = l.baseQueue,
      n = e.pending;
    if (n !== null) {
      if (u !== null) {
        var i = u.next;
        (u.next = n.next), (n.next = i);
      }
      (t.baseQueue = u = n), (e.pending = null);
    }
    if (((n = l.baseState), u === null)) l.memoizedState = n;
    else {
      t = u.next;
      var c = (i = null),
        f = null,
        h = t,
        b = !1;
      do {
        var T = h.lane & -536870913;
        if (T !== h.lane ? (F & T) === T : (Gt & T) === T) {
          var y = h.revertLane;
          if (y === 0)
            f !== null &&
              (f = f.next =
                {
                  lane: 0,
                  revertLane: 0,
                  gesture: null,
                  action: h.action,
                  hasEagerState: h.hasEagerState,
                  eagerState: h.eagerState,
                  next: null,
                }),
              T === ie && (b = !0);
          else if ((Gt & y) === y) {
            (h = h.next), y === ie && (b = !0);
            continue;
          } else
            (T = {
              lane: 0,
              revertLane: h.revertLane,
              gesture: null,
              action: h.action,
              hasEagerState: h.hasEagerState,
              eagerState: h.eagerState,
              next: null,
            }),
              f === null ? ((c = f = T), (i = n)) : (f = f.next = T),
              (K.lanes |= y),
              (oa |= y);
          (T = h.action), Ba && a(n, T), (n = h.hasEagerState ? h.eagerState : a(n, T));
        } else
          (y = {
            lane: T,
            revertLane: h.revertLane,
            gesture: h.gesture,
            action: h.action,
            hasEagerState: h.hasEagerState,
            eagerState: h.eagerState,
            next: null,
          }),
            f === null ? ((c = f = y), (i = n)) : (f = f.next = y),
            (K.lanes |= T),
            (oa |= T);
        h = h.next;
      } while (h !== null && h !== t);
      if (
        (f === null ? (i = n) : (f.next = c),
        !nt(n, l.memoizedState) && ((Ol = !0), b && ((a = ce), a !== null)))
      )
        throw a;
      (l.memoizedState = n), (l.baseState = i), (l.baseQueue = f), (e.lastRenderedState = n);
    }
    return u === null && (e.lanes = 0), [l.memoizedState, e.dispatch];
  }
  function Wi(l) {
    var t = xl(),
      a = t.queue;
    if (a === null) throw Error(s(311));
    a.lastRenderedReducer = l;
    var e = a.dispatch,
      u = a.pending,
      n = t.memoizedState;
    if (u !== null) {
      a.pending = null;
      var i = (u = u.next);
      do (n = l(n, i.action)), (i = i.next);
      while (i !== u);
      nt(n, t.memoizedState) || (Ol = !0),
        (t.memoizedState = n),
        t.baseQueue === null && (t.baseState = n),
        (a.lastRenderedState = n);
    }
    return [n, e];
  }
  function qs(l, t, a) {
    var e = K,
      u = xl(),
      n = tl;
    if (n) {
      if (a === void 0) throw Error(s(407));
      a = a();
    } else a = t();
    var i = !nt((vl || u).memoizedState, a);
    if (
      (i && ((u.memoizedState = a), (Ol = !0)),
      (u = u.queue),
      Fi(Gs.bind(null, e, u, l), [l]),
      u.getSnapshot !== t || i || (Ml !== null && Ml.memoizedState.tag & 1))
    ) {
      if (
        ((e.flags |= 2048),
        me(9, { destroy: void 0 }, Ys.bind(null, e, u, a, t), null),
        pl === null)
      )
        throw Error(s(349));
      n || (Gt & 127) !== 0 || Bs(e, t, a);
    }
    return a;
  }
  function Bs(l, t, a) {
    (l.flags |= 16384),
      (l = { getSnapshot: t, value: a }),
      (t = K.updateQueue),
      t === null
        ? ((t = ln()), (K.updateQueue = t), (t.stores = [l]))
        : ((a = t.stores), a === null ? (t.stores = [l]) : a.push(l));
  }
  function Ys(l, t, a, e) {
    (t.value = a), (t.getSnapshot = e), Xs(t) && Qs(l);
  }
  function Gs(l, t, a) {
    return a(() => {
      Xs(t) && Qs(l);
    });
  }
  function Xs(l) {
    var t = l.getSnapshot;
    l = l.value;
    try {
      var a = t();
      return !nt(l, a);
    } catch {
      return !0;
    }
  }
  function Qs(l) {
    var t = ja(l, 2);
    t !== null && tt(t, l, 2);
  }
  function $i(l) {
    var t = Jl();
    if (typeof l == "function") {
      var a = l;
      if (((l = a()), Ba)) {
        kt(!0);
        try {
          a();
        } finally {
          kt(!1);
        }
      }
    }
    return (
      (t.memoizedState = t.baseState = l),
      (t.queue = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: Xt,
        lastRenderedState: l,
      }),
      t
    );
  }
  function Zs(l, t, a, e) {
    return (l.baseState = a), wi(l, vl, typeof e == "function" ? e : Xt);
  }
  function Xm(l, t, a, e, u) {
    if (nn(l)) throw Error(s(485));
    if (((l = t.action), l !== null)) {
      var n = {
        payload: u,
        action: l,
        next: null,
        isTransition: !0,
        status: "pending",
        value: null,
        reason: null,
        listeners: [],
        then: (i) => {
          n.listeners.push(i);
        },
      };
      S.T !== null ? a(!0) : (n.isTransition = !1),
        e(n),
        (a = t.pending),
        a === null
          ? ((n.next = t.pending = n), Vs(t, n))
          : ((n.next = a.next), (t.pending = a.next = n));
    }
  }
  function Vs(l, t) {
    var a = t.action,
      e = t.payload,
      u = l.state;
    if (t.isTransition) {
      var n = S.T,
        i = {};
      S.T = i;
      try {
        var c = a(u, e),
          f = S.S;
        f !== null && f(i, c), Ls(l, t, c);
      } catch (h) {
        ki(l, t, h);
      } finally {
        n !== null && i.types !== null && (n.types = i.types), (S.T = n);
      }
    } else
      try {
        (n = a(u, e)), Ls(l, t, n);
      } catch (h) {
        ki(l, t, h);
      }
  }
  function Ls(l, t, a) {
    a !== null && typeof a == "object" && typeof a.then == "function"
      ? a.then(
          (e) => {
            Ks(l, t, e);
          },
          (e) => ki(l, t, e),
        )
      : Ks(l, t, a);
  }
  function Ks(l, t, a) {
    (t.status = "fulfilled"),
      (t.value = a),
      Js(t),
      (l.state = a),
      (t = l.pending),
      t !== null &&
        ((a = t.next), a === t ? (l.pending = null) : ((a = a.next), (t.next = a), Vs(l, a)));
  }
  function ki(l, t, a) {
    var e = l.pending;
    if (((l.pending = null), e !== null)) {
      e = e.next;
      do (t.status = "rejected"), (t.reason = a), Js(t), (t = t.next);
      while (t !== e);
    }
    l.action = null;
  }
  function Js(l) {
    l = l.listeners;
    for (var t = 0; t < l.length; t++) (0, l[t])();
  }
  function ws(l, t) {
    return t;
  }
  function Ws(l, t) {
    if (tl) {
      var a = pl.formState;
      if (a !== null) {
        l: {
          var e = K;
          if (tl) {
            if (Sl) {
              t: {
                for (var u = Sl, n = pt; u.nodeType !== 8; ) {
                  if (!n) {
                    u = null;
                    break t;
                  }
                  if (((u = St(u.nextSibling)), u === null)) {
                    u = null;
                    break t;
                  }
                }
                (n = u.data), (u = n === "F!" || n === "F" ? u : null);
              }
              if (u) {
                (Sl = St(u.nextSibling)), (e = u.data === "F!");
                break l;
              }
            }
            ta(e);
          }
          e = !1;
        }
        e && (t = a[0]);
      }
    }
    return (
      (a = Jl()),
      (a.memoizedState = a.baseState = t),
      (e = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: ws,
        lastRenderedState: t,
      }),
      (a.queue = e),
      (a = vo.bind(null, K, e)),
      (e.dispatch = a),
      (e = $i(!1)),
      (n = ac.bind(null, K, !1, e.queue)),
      (e = Jl()),
      (u = {
        state: t,
        dispatch: null,
        action: l,
        pending: null,
      }),
      (e.queue = u),
      (a = Xm.bind(null, K, u, n, a)),
      (u.dispatch = a),
      (e.memoizedState = l),
      [t, a, !1]
    );
  }
  function $s(l) {
    var t = xl();
    return ks(t, vl, l);
  }
  function ks(l, t, a) {
    if (
      ((t = wi(l, t, ws)[0]),
      (l = an(Xt)[0]),
      typeof t == "object" && t !== null && typeof t.then == "function")
    )
      try {
        var e = Fe(t);
      } catch (i) {
        throw i === fe ? Ju : i;
      }
    else e = t;
    t = xl();
    var u = t.queue,
      n = u.dispatch;
    return (
      a !== t.memoizedState &&
        ((K.flags |= 2048), me(9, { destroy: void 0 }, Qm.bind(null, u, a), null)),
      [e, n, l]
    );
  }
  function Qm(l, t) {
    l.action = t;
  }
  function Fs(l) {
    var t = xl(),
      a = vl;
    if (a !== null) return ks(t, a, l);
    xl(), (t = t.memoizedState), (a = xl());
    var e = a.queue.dispatch;
    return (a.memoizedState = l), [t, e, !1];
  }
  function me(l, t, a, e) {
    return (
      (l = { tag: l, create: a, deps: e, inst: t, next: null }),
      (t = K.updateQueue),
      t === null && ((t = ln()), (K.updateQueue = t)),
      (a = t.lastEffect),
      a === null
        ? (t.lastEffect = l.next = l)
        : ((e = a.next), (a.next = l), (l.next = e), (t.lastEffect = l)),
      l
    );
  }
  function Is() {
    return xl().memoizedState;
  }
  function en(l, t, a, e) {
    var u = Jl();
    (K.flags |= l), (u.memoizedState = me(1 | t, { destroy: void 0 }, a, e === void 0 ? null : e));
  }
  function un(l, t, a, e) {
    var u = xl();
    e = e === void 0 ? null : e;
    var n = u.memoizedState.inst;
    vl !== null && e !== null && Qi(e, vl.memoizedState.deps)
      ? (u.memoizedState = me(t, n, a, e))
      : ((K.flags |= l), (u.memoizedState = me(1 | t, n, a, e)));
  }
  function Ps(l, t) {
    en(8390656, 8, l, t);
  }
  function Fi(l, t) {
    un(2048, 8, l, t);
  }
  function Zm(l) {
    K.flags |= 4;
    var t = K.updateQueue;
    if (t === null) (t = ln()), (K.updateQueue = t), (t.events = [l]);
    else {
      var a = t.events;
      a === null ? (t.events = [l]) : a.push(l);
    }
  }
  function lo(l) {
    var t = xl().memoizedState;
    return (
      Zm({ ref: t, nextImpl: l }),
      () => {
        if ((nl & 2) !== 0) throw Error(s(440));
        return t.impl.apply(void 0, arguments);
      }
    );
  }
  function to(l, t) {
    return un(4, 2, l, t);
  }
  function ao(l, t) {
    return un(4, 4, l, t);
  }
  function eo(l, t) {
    if (typeof t == "function") {
      l = l();
      var a = t(l);
      return () => {
        typeof a == "function" ? a() : t(null);
      };
    }
    if (t != null)
      return (
        (l = l()),
        (t.current = l),
        () => {
          t.current = null;
        }
      );
  }
  function uo(l, t, a) {
    (a = a != null ? a.concat([l]) : null), un(4, 4, eo.bind(null, t, l), a);
  }
  function Ii() {}
  function no(l, t) {
    var a = xl();
    t = t === void 0 ? null : t;
    var e = a.memoizedState;
    return t !== null && Qi(t, e[1]) ? e[0] : ((a.memoizedState = [l, t]), l);
  }
  function io(l, t) {
    var a = xl();
    t = t === void 0 ? null : t;
    var e = a.memoizedState;
    if (t !== null && Qi(t, e[1])) return e[0];
    if (((e = l()), Ba)) {
      kt(!0);
      try {
        l();
      } finally {
        kt(!1);
      }
    }
    return (a.memoizedState = [e, t]), e;
  }
  function Pi(l, t, a) {
    return a === void 0 || ((Gt & 1073741824) !== 0 && (F & 261930) === 0)
      ? (l.memoizedState = t)
      : ((l.memoizedState = a), (l = fd()), (K.lanes |= l), (oa |= l), a);
  }
  function co(l, t, a, e) {
    return nt(a, t)
      ? a
      : oe.current !== null
        ? ((l = Pi(l, a, e)), nt(l, t) || (Ol = !0), l)
        : (Gt & 42) === 0 || ((Gt & 1073741824) !== 0 && (F & 261930) === 0)
          ? ((Ol = !0), (l.memoizedState = a))
          : ((l = fd()), (K.lanes |= l), (oa |= l), t);
  }
  function fo(l, t, a, e, u) {
    var n = M.p;
    M.p = n !== 0 && 8 > n ? n : 8;
    var i = S.T,
      c = {};
    (S.T = c), ac(l, !1, t, a);
    try {
      var f = u(),
        h = S.S;
      if (
        (h !== null && h(c, f), f !== null && typeof f == "object" && typeof f.then == "function")
      ) {
        var b = Bm(f, e);
        Ie(l, t, b, dt(l));
      } else Ie(l, t, e, dt(l));
    } catch (T) {
      Ie(l, t, { then: () => {}, status: "rejected", reason: T }, dt());
    } finally {
      (M.p = n), i !== null && c.types !== null && (i.types = c.types), (S.T = i);
    }
  }
  function Vm() {}
  function lc(l, t, a, e) {
    if (l.tag !== 5) throw Error(s(476));
    var u = so(l).queue;
    fo(l, u, t, X, a === null ? Vm : () => (oo(l), a(e)));
  }
  function so(l) {
    var t = l.memoizedState;
    if (t !== null) return t;
    t = {
      memoizedState: X,
      baseState: X,
      baseQueue: null,
      queue: {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: Xt,
        lastRenderedState: X,
      },
      next: null,
    };
    var a = {};
    return (
      (t.next = {
        memoizedState: a,
        baseState: a,
        baseQueue: null,
        queue: {
          pending: null,
          lanes: 0,
          dispatch: null,
          lastRenderedReducer: Xt,
          lastRenderedState: a,
        },
        next: null,
      }),
      (l.memoizedState = t),
      (l = l.alternate),
      l !== null && (l.memoizedState = t),
      t
    );
  }
  function oo(l) {
    var t = so(l);
    t.next === null && (t = l.alternate.memoizedState), Ie(l, t.next.queue, {}, dt());
  }
  function tc() {
    return Yl(hu);
  }
  function ro() {
    return xl().memoizedState;
  }
  function mo() {
    return xl().memoizedState;
  }
  function Lm(l) {
    for (var t = l.return; t !== null; ) {
      switch (t.tag) {
        case 24:
        case 3:
          var a = dt();
          l = ua(a);
          var e = na(t, l, a);
          e !== null && (tt(e, t, a), we(e, t, a)), (t = { cache: Oi() }), (l.payload = t);
          return;
      }
      t = t.return;
    }
  }
  function Km(l, t, a) {
    var e = dt();
    (a = {
      lane: e,
      revertLane: 0,
      gesture: null,
      action: a,
      hasEagerState: !1,
      eagerState: null,
      next: null,
    }),
      nn(l) ? ho(t, a) : ((a = bi(l, t, a, e)), a !== null && (tt(a, l, e), yo(a, t, e)));
  }
  function vo(l, t, a) {
    var e = dt();
    Ie(l, t, a, e);
  }
  function Ie(l, t, a, e) {
    var u = {
      lane: e,
      revertLane: 0,
      gesture: null,
      action: a,
      hasEagerState: !1,
      eagerState: null,
      next: null,
    };
    if (nn(l)) ho(t, u);
    else {
      var n = l.alternate;
      if (
        l.lanes === 0 &&
        (n === null || n.lanes === 0) &&
        ((n = t.lastRenderedReducer), n !== null)
      )
        try {
          var i = t.lastRenderedState,
            c = n(i, a);
          if (((u.hasEagerState = !0), (u.eagerState = c), nt(c, i)))
            return Gu(l, t, u, 0), pl === null && Yu(), !1;
        } catch {
        } finally {
        }
      if (((a = bi(l, t, u, e)), a !== null)) return tt(a, l, e), yo(a, t, e), !0;
    }
    return !1;
  }
  function ac(l, t, a, e) {
    if (
      ((e = {
        lane: 2,
        revertLane: Hc(),
        gesture: null,
        action: e,
        hasEagerState: !1,
        eagerState: null,
        next: null,
      }),
      nn(l))
    ) {
      if (t) throw Error(s(479));
    } else (t = bi(l, a, e, 2)), t !== null && tt(t, l, 2);
  }
  function nn(l) {
    var t = l.alternate;
    return l === K || (t !== null && t === K);
  }
  function ho(l, t) {
    de = Iu = !0;
    var a = l.pending;
    a === null ? (t.next = t) : ((t.next = a.next), (a.next = t)), (l.pending = t);
  }
  function yo(l, t, a) {
    if ((a & 4194048) !== 0) {
      var e = t.lanes;
      (e &= l.pendingLanes), (a |= e), (t.lanes = a), Sf(l, a);
    }
  }
  var Pe = {
    readContext: Yl,
    use: tn,
    useCallback: El,
    useContext: El,
    useEffect: El,
    useImperativeHandle: El,
    useLayoutEffect: El,
    useInsertionEffect: El,
    useMemo: El,
    useReducer: El,
    useRef: El,
    useState: El,
    useDebugValue: El,
    useDeferredValue: El,
    useTransition: El,
    useSyncExternalStore: El,
    useId: El,
    useHostTransitionStatus: El,
    useFormState: El,
    useActionState: El,
    useOptimistic: El,
    useMemoCache: El,
    useCacheRefresh: El,
  };
  Pe.useEffectEvent = El;
  var go = {
      readContext: Yl,
      use: tn,
      useCallback: (l, t) => ((Jl().memoizedState = [l, t === void 0 ? null : t]), l),
      useContext: Yl,
      useEffect: Ps,
      useImperativeHandle: (l, t, a) => {
        (a = a != null ? a.concat([l]) : null), en(4194308, 4, eo.bind(null, t, l), a);
      },
      useLayoutEffect: (l, t) => en(4194308, 4, l, t),
      useInsertionEffect: (l, t) => {
        en(4, 2, l, t);
      },
      useMemo: (l, t) => {
        var a = Jl();
        t = t === void 0 ? null : t;
        var e = l();
        if (Ba) {
          kt(!0);
          try {
            l();
          } finally {
            kt(!1);
          }
        }
        return (a.memoizedState = [e, t]), e;
      },
      useReducer: (l, t, a) => {
        var e = Jl();
        if (a !== void 0) {
          var u = a(t);
          if (Ba) {
            kt(!0);
            try {
              a(t);
            } finally {
              kt(!1);
            }
          }
        } else u = t;
        return (
          (e.memoizedState = e.baseState = u),
          (l = {
            pending: null,
            lanes: 0,
            dispatch: null,
            lastRenderedReducer: l,
            lastRenderedState: u,
          }),
          (e.queue = l),
          (l = l.dispatch = Km.bind(null, K, l)),
          [e.memoizedState, l]
        );
      },
      useRef: (l) => {
        var t = Jl();
        return (l = { current: l }), (t.memoizedState = l);
      },
      useState: (l) => {
        l = $i(l);
        var t = l.queue,
          a = vo.bind(null, K, t);
        return (t.dispatch = a), [l.memoizedState, a];
      },
      useDebugValue: Ii,
      useDeferredValue: (l, t) => {
        var a = Jl();
        return Pi(a, l, t);
      },
      useTransition: () => {
        var l = $i(!1);
        return (l = fo.bind(null, K, l.queue, !0, !1)), (Jl().memoizedState = l), [!1, l];
      },
      useSyncExternalStore: (l, t, a) => {
        var e = K,
          u = Jl();
        if (tl) {
          if (a === void 0) throw Error(s(407));
          a = a();
        } else {
          if (((a = t()), pl === null)) throw Error(s(349));
          (F & 127) !== 0 || Bs(e, t, a);
        }
        u.memoizedState = a;
        var n = { value: a, getSnapshot: t };
        return (
          (u.queue = n),
          Ps(Gs.bind(null, e, n, l), [l]),
          (e.flags |= 2048),
          me(9, { destroy: void 0 }, Ys.bind(null, e, n, a, t), null),
          a
        );
      },
      useId: () => {
        var l = Jl(),
          t = pl.identifierPrefix;
        if (tl) {
          var a = jt,
            e = xt;
          (a = (e & ~(1 << (32 - ut(e) - 1))).toString(32) + a),
            (t = "_" + t + "R_" + a),
            (a = Pu++),
            0 < a && (t += "H" + a.toString(32)),
            (t += "_");
        } else (a = Ym++), (t = "_" + t + "r_" + a.toString(32) + "_");
        return (l.memoizedState = t);
      },
      useHostTransitionStatus: tc,
      useFormState: Ws,
      useActionState: Ws,
      useOptimistic: (l) => {
        var t = Jl();
        t.memoizedState = t.baseState = l;
        var a = {
          pending: null,
          lanes: 0,
          dispatch: null,
          lastRenderedReducer: null,
          lastRenderedState: null,
        };
        return (t.queue = a), (t = ac.bind(null, K, !0, a)), (a.dispatch = t), [l, t];
      },
      useMemoCache: Ji,
      useCacheRefresh: () => (Jl().memoizedState = Lm.bind(null, K)),
      useEffectEvent: (l) => {
        var t = Jl(),
          a = { impl: l };
        return (
          (t.memoizedState = a),
          () => {
            if ((nl & 2) !== 0) throw Error(s(440));
            return a.impl.apply(void 0, arguments);
          }
        );
      },
    },
    ec = {
      readContext: Yl,
      use: tn,
      useCallback: no,
      useContext: Yl,
      useEffect: Fi,
      useImperativeHandle: uo,
      useInsertionEffect: to,
      useLayoutEffect: ao,
      useMemo: io,
      useReducer: an,
      useRef: Is,
      useState: () => an(Xt),
      useDebugValue: Ii,
      useDeferredValue: (l, t) => {
        var a = xl();
        return co(a, vl.memoizedState, l, t);
      },
      useTransition: () => {
        var l = an(Xt)[0],
          t = xl().memoizedState;
        return [typeof l == "boolean" ? l : Fe(l), t];
      },
      useSyncExternalStore: qs,
      useId: ro,
      useHostTransitionStatus: tc,
      useFormState: $s,
      useActionState: $s,
      useOptimistic: (l, t) => {
        var a = xl();
        return Zs(a, vl, l, t);
      },
      useMemoCache: Ji,
      useCacheRefresh: mo,
    };
  ec.useEffectEvent = lo;
  var po = {
    readContext: Yl,
    use: tn,
    useCallback: no,
    useContext: Yl,
    useEffect: Fi,
    useImperativeHandle: uo,
    useInsertionEffect: to,
    useLayoutEffect: ao,
    useMemo: io,
    useReducer: Wi,
    useRef: Is,
    useState: () => Wi(Xt),
    useDebugValue: Ii,
    useDeferredValue: (l, t) => {
      var a = xl();
      return vl === null ? Pi(a, l, t) : co(a, vl.memoizedState, l, t);
    },
    useTransition: () => {
      var l = Wi(Xt)[0],
        t = xl().memoizedState;
      return [typeof l == "boolean" ? l : Fe(l), t];
    },
    useSyncExternalStore: qs,
    useId: ro,
    useHostTransitionStatus: tc,
    useFormState: Fs,
    useActionState: Fs,
    useOptimistic: (l, t) => {
      var a = xl();
      return vl !== null ? Zs(a, vl, l, t) : ((a.baseState = l), [l, a.queue.dispatch]);
    },
    useMemoCache: Ji,
    useCacheRefresh: mo,
  };
  po.useEffectEvent = lo;
  function uc(l, t, a, e) {
    (t = l.memoizedState),
      (a = a(e, t)),
      (a = a == null ? t : R({}, t, a)),
      (l.memoizedState = a),
      l.lanes === 0 && (l.updateQueue.baseState = a);
  }
  var nc = {
    enqueueSetState: (l, t, a) => {
      l = l._reactInternals;
      var e = dt(),
        u = ua(e);
      (u.payload = t),
        a != null && (u.callback = a),
        (t = na(l, u, e)),
        t !== null && (tt(t, l, e), we(t, l, e));
    },
    enqueueReplaceState: (l, t, a) => {
      l = l._reactInternals;
      var e = dt(),
        u = ua(e);
      (u.tag = 1),
        (u.payload = t),
        a != null && (u.callback = a),
        (t = na(l, u, e)),
        t !== null && (tt(t, l, e), we(t, l, e));
    },
    enqueueForceUpdate: (l, t) => {
      l = l._reactInternals;
      var a = dt(),
        e = ua(a);
      (e.tag = 2),
        t != null && (e.callback = t),
        (t = na(l, e, a)),
        t !== null && (tt(t, l, a), we(t, l, a));
    },
  };
  function bo(l, t, a, e, u, n, i) {
    return (
      (l = l.stateNode),
      typeof l.shouldComponentUpdate == "function"
        ? l.shouldComponentUpdate(e, n, i)
        : t.prototype && t.prototype.isPureReactComponent
          ? !Ge(a, e) || !Ge(u, n)
          : !0
    );
  }
  function So(l, t, a, e) {
    (l = t.state),
      typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(a, e),
      typeof t.UNSAFE_componentWillReceiveProps == "function" &&
        t.UNSAFE_componentWillReceiveProps(a, e),
      t.state !== l && nc.enqueueReplaceState(t, t.state, null);
  }
  function Ya(l, t) {
    var a = t;
    if ("ref" in t) {
      a = {};
      for (var e in t) e !== "ref" && (a[e] = t[e]);
    }
    if ((l = l.defaultProps)) {
      a === t && (a = R({}, a));
      for (var u in l) a[u] === void 0 && (a[u] = l[u]);
    }
    return a;
  }
  function zo(l) {
    Bu(l);
  }
  function To(l) {
    console.error(l);
  }
  function Eo(l) {
    Bu(l);
  }
  function cn(l, t) {
    try {
      var a = l.onUncaughtError;
      a(t.value, { componentStack: t.stack });
    } catch (e) {
      setTimeout(() => {
        throw e;
      });
    }
  }
  function Ao(l, t, a) {
    try {
      var e = l.onCaughtError;
      e(a.value, {
        componentStack: a.stack,
        errorBoundary: t.tag === 1 ? t.stateNode : null,
      });
    } catch (u) {
      setTimeout(() => {
        throw u;
      });
    }
  }
  function ic(l, t, a) {
    return (
      (a = ua(a)),
      (a.tag = 3),
      (a.payload = { element: null }),
      (a.callback = () => {
        cn(l, t);
      }),
      a
    );
  }
  function _o(l) {
    return (l = ua(l)), (l.tag = 3), l;
  }
  function No(l, t, a, e) {
    var u = a.type.getDerivedStateFromError;
    if (typeof u == "function") {
      var n = e.value;
      (l.payload = () => u(n)),
        (l.callback = () => {
          Ao(t, a, e);
        });
    }
    var i = a.stateNode;
    i !== null &&
      typeof i.componentDidCatch == "function" &&
      (l.callback = function () {
        Ao(t, a, e),
          typeof u != "function" &&
            (da === null ? (da = /* @__PURE__ */ new Set([this])) : da.add(this));
        var c = e.stack;
        this.componentDidCatch(e.value, {
          componentStack: c !== null ? c : "",
        });
      });
  }
  function Jm(l, t, a, e, u) {
    if (((a.flags |= 32768), e !== null && typeof e == "object" && typeof e.then == "function")) {
      if (((t = a.alternate), t !== null && ne(t, a, u, !0), (a = ct.current), a !== null)) {
        switch (a.tag) {
          case 31:
          case 13:
            return (
              bt === null ? bn() : a.alternate === null && Al === 0 && (Al = 3),
              (a.flags &= -257),
              (a.flags |= 65536),
              (a.lanes = u),
              e === wu
                ? (a.flags |= 16384)
                : ((t = a.updateQueue),
                  t === null ? (a.updateQueue = /* @__PURE__ */ new Set([e])) : t.add(e),
                  Dc(l, e, u)),
              !1
            );
          case 22:
            return (
              (a.flags |= 65536),
              e === wu
                ? (a.flags |= 16384)
                : ((t = a.updateQueue),
                  t === null
                    ? ((t = {
                        transitions: null,
                        markerInstances: null,
                        retryQueue: /* @__PURE__ */ new Set([e]),
                      }),
                      (a.updateQueue = t))
                    : ((a = t.retryQueue),
                      a === null ? (t.retryQueue = /* @__PURE__ */ new Set([e])) : a.add(e)),
                  Dc(l, e, u)),
              !1
            );
        }
        throw Error(s(435, a.tag));
      }
      return Dc(l, e, u), bn(), !1;
    }
    if (tl)
      return (
        (t = ct.current),
        t !== null
          ? ((t.flags & 65536) === 0 && (t.flags |= 256),
            (t.flags |= 65536),
            (t.lanes = u),
            e !== _i && ((l = Error(s(422), { cause: e })), Ze(ht(l, a))))
          : (e !== _i &&
              ((t = Error(s(423), {
                cause: e,
              })),
              Ze(ht(t, a))),
            (l = l.current.alternate),
            (l.flags |= 65536),
            (u &= -u),
            (l.lanes |= u),
            (e = ht(e, a)),
            (u = ic(l.stateNode, e, u)),
            qi(l, u),
            Al !== 4 && (Al = 2)),
        !1
      );
    var n = Error(s(520), { cause: e });
    if (((n = ht(n, a)), cu === null ? (cu = [n]) : cu.push(n), Al !== 4 && (Al = 2), t === null))
      return !0;
    (e = ht(e, a)), (a = t);
    do {
      switch (a.tag) {
        case 3:
          return (
            (a.flags |= 65536),
            (l = u & -u),
            (a.lanes |= l),
            (l = ic(a.stateNode, e, l)),
            qi(a, l),
            !1
          );
        case 1:
          if (
            ((t = a.type),
            (n = a.stateNode),
            (a.flags & 128) === 0 &&
              (typeof t.getDerivedStateFromError == "function" ||
                (n !== null &&
                  typeof n.componentDidCatch == "function" &&
                  (da === null || !da.has(n)))))
          )
            return (
              (a.flags |= 65536),
              (u &= -u),
              (a.lanes |= u),
              (u = _o(u)),
              No(u, l, a, e),
              qi(a, u),
              !1
            );
      }
      a = a.return;
    } while (a !== null);
    return !1;
  }
  var cc = Error(s(461)),
    Ol = !1;
  function Gl(l, t, a, e) {
    t.child = l === null ? Ms(t, null, a, e) : qa(t, l.child, a, e);
  }
  function xo(l, t, a, e, u) {
    a = a.render;
    var n = t.ref;
    if ("ref" in e) {
      var i = {};
      for (var c in e) c !== "ref" && (i[c] = e[c]);
    } else i = e;
    return (
      Ua(t),
      (e = Zi(l, t, a, i, n, u)),
      (c = Vi()),
      l !== null && !Ol
        ? (Li(l, t, u), Qt(l, t, u))
        : (tl && c && Ei(t), (t.flags |= 1), Gl(l, t, e, u), t.child)
    );
  }
  function jo(l, t, a, e, u) {
    if (l === null) {
      var n = a.type;
      return typeof n == "function" && !Si(n) && n.defaultProps === void 0 && a.compare === null
        ? ((t.tag = 15), (t.type = n), Mo(l, t, n, e, u))
        : ((l = Qu(a.type, null, e, t, t.mode, u)), (l.ref = t.ref), (l.return = t), (t.child = l));
    }
    if (((n = l.child), !hc(l, u))) {
      var i = n.memoizedProps;
      if (((a = a.compare), (a = a !== null ? a : Ge), a(i, e) && l.ref === t.ref))
        return Qt(l, t, u);
    }
    return (t.flags |= 1), (l = Rt(n, e)), (l.ref = t.ref), (l.return = t), (t.child = l);
  }
  function Mo(l, t, a, e, u) {
    if (l !== null) {
      var n = l.memoizedProps;
      if (Ge(n, e) && l.ref === t.ref)
        if (((Ol = !1), (t.pendingProps = e = n), hc(l, u))) (l.flags & 131072) !== 0 && (Ol = !0);
        else return (t.lanes = l.lanes), Qt(l, t, u);
    }
    return fc(l, t, a, e, u);
  }
  function Oo(l, t, a, e) {
    var u = e.children,
      n = l !== null ? l.memoizedState : null;
    if (
      (l === null &&
        t.stateNode === null &&
        (t.stateNode = {
          _visibility: 1,
          _pendingMarkers: null,
          _retryCache: null,
          _transitions: null,
        }),
      e.mode === "hidden")
    ) {
      if ((t.flags & 128) !== 0) {
        if (((n = n !== null ? n.baseLanes | a : a), l !== null)) {
          for (e = t.child = l.child, u = 0; e !== null; )
            (u = u | e.lanes | e.childLanes), (e = e.sibling);
          e = u & ~n;
        } else (e = 0), (t.child = null);
        return Do(l, t, n, a, e);
      }
      if ((a & 536870912) !== 0)
        (t.memoizedState = { baseLanes: 0, cachePool: null }),
          l !== null && Ku(t, n !== null ? n.cachePool : null),
          n !== null ? Us(t, n) : Yi(),
          Cs(t);
      else return (e = t.lanes = 536870912), Do(l, t, n !== null ? n.baseLanes | a : a, a, e);
    } else
      n !== null
        ? (Ku(t, n.cachePool), Us(t, n), ca(), (t.memoizedState = null))
        : (l !== null && Ku(t, null), Yi(), ca());
    return Gl(l, t, u, a), t.child;
  }
  function lu(l, t) {
    return (
      (l !== null && l.tag === 22) ||
        t.stateNode !== null ||
        (t.stateNode = {
          _visibility: 1,
          _pendingMarkers: null,
          _retryCache: null,
          _transitions: null,
        }),
      t.sibling
    );
  }
  function Do(l, t, a, e, u) {
    var n = Ui();
    return (
      (n = n === null ? null : { parent: jl._currentValue, pool: n }),
      (t.memoizedState = {
        baseLanes: a,
        cachePool: n,
      }),
      l !== null && Ku(t, null),
      Yi(),
      Cs(t),
      l !== null && ne(l, t, e, !0),
      (t.childLanes = u),
      null
    );
  }
  function fn(l, t) {
    return (
      (t = on({ mode: t.mode, children: t.children }, l.mode)),
      (t.ref = l.ref),
      (l.child = t),
      (t.return = l),
      t
    );
  }
  function Uo(l, t, a) {
    return (
      qa(t, l.child, null, a),
      (l = fn(t, t.pendingProps)),
      (l.flags |= 2),
      ft(t),
      (t.memoizedState = null),
      l
    );
  }
  function wm(l, t, a) {
    var e = t.pendingProps,
      u = (t.flags & 128) !== 0;
    if (((t.flags &= -129), l === null)) {
      if (tl) {
        if (e.mode === "hidden") return (l = fn(t, e)), (t.lanes = 536870912), lu(null, l);
        if (
          (Xi(t),
          (l = Sl)
            ? ((l = Ld(l, pt)),
              (l = l !== null && l.data === "&" ? l : null),
              l !== null &&
                ((t.memoizedState = {
                  dehydrated: l,
                  treeContext: Pt !== null ? { id: xt, overflow: jt } : null,
                  retryLane: 536870912,
                  hydrationErrors: null,
                }),
                (a = vs(l)),
                (a.return = t),
                (t.child = a),
                (Bl = t),
                (Sl = null)))
            : (l = null),
          l === null)
        )
          throw ta(t);
        return (t.lanes = 536870912), null;
      }
      return fn(t, e);
    }
    var n = l.memoizedState;
    if (n !== null) {
      var i = n.dehydrated;
      if ((Xi(t), u))
        if (t.flags & 256) (t.flags &= -257), (t = Uo(l, t, a));
        else if (t.memoizedState !== null) (t.child = l.child), (t.flags |= 128), (t = null);
        else throw Error(s(558));
      else if ((Ol || ne(l, t, a, !1), (u = (a & l.childLanes) !== 0), Ol || u)) {
        if (((e = pl), e !== null && ((i = zf(e, a)), i !== 0 && i !== n.retryLane)))
          throw ((n.retryLane = i), ja(l, i), tt(e, l, i), cc);
        bn(), (t = Uo(l, t, a));
      } else
        (l = n.treeContext),
          (Sl = St(i.nextSibling)),
          (Bl = t),
          (tl = !0),
          (la = null),
          (pt = !1),
          l !== null && gs(t, l),
          (t = fn(t, e)),
          (t.flags |= 4096);
      return t;
    }
    return (
      (l = Rt(l.child, {
        mode: e.mode,
        children: e.children,
      })),
      (l.ref = t.ref),
      (t.child = l),
      (l.return = t),
      l
    );
  }
  function sn(l, t) {
    var a = t.ref;
    if (a === null) l !== null && l.ref !== null && (t.flags |= 4194816);
    else {
      if (typeof a != "function" && typeof a != "object") throw Error(s(284));
      (l === null || l.ref !== a) && (t.flags |= 4194816);
    }
  }
  function fc(l, t, a, e, u) {
    return (
      Ua(t),
      (a = Zi(l, t, a, e, void 0, u)),
      (e = Vi()),
      l !== null && !Ol
        ? (Li(l, t, u), Qt(l, t, u))
        : (tl && e && Ei(t), (t.flags |= 1), Gl(l, t, a, u), t.child)
    );
  }
  function Co(l, t, a, e, u, n) {
    return (
      Ua(t),
      (t.updateQueue = null),
      (a = Rs(t, e, a, u)),
      Hs(l),
      (e = Vi()),
      l !== null && !Ol
        ? (Li(l, t, n), Qt(l, t, n))
        : (tl && e && Ei(t), (t.flags |= 1), Gl(l, t, a, n), t.child)
    );
  }
  function Ho(l, t, a, e, u) {
    if ((Ua(t), t.stateNode === null)) {
      var n = te,
        i = a.contextType;
      typeof i == "object" && i !== null && (n = Yl(i)),
        (n = new a(e, n)),
        (t.memoizedState = n.state !== null && n.state !== void 0 ? n.state : null),
        (n.updater = nc),
        (t.stateNode = n),
        (n._reactInternals = t),
        (n = t.stateNode),
        (n.props = e),
        (n.state = t.memoizedState),
        (n.refs = {}),
        Hi(t),
        (i = a.contextType),
        (n.context = typeof i == "object" && i !== null ? Yl(i) : te),
        (n.state = t.memoizedState),
        (i = a.getDerivedStateFromProps),
        typeof i == "function" && (uc(t, a, i, e), (n.state = t.memoizedState)),
        typeof a.getDerivedStateFromProps == "function" ||
          typeof n.getSnapshotBeforeUpdate == "function" ||
          (typeof n.UNSAFE_componentWillMount != "function" &&
            typeof n.componentWillMount != "function") ||
          ((i = n.state),
          typeof n.componentWillMount == "function" && n.componentWillMount(),
          typeof n.UNSAFE_componentWillMount == "function" && n.UNSAFE_componentWillMount(),
          i !== n.state && nc.enqueueReplaceState(n, n.state, null),
          $e(t, e, n, u),
          We(),
          (n.state = t.memoizedState)),
        typeof n.componentDidMount == "function" && (t.flags |= 4194308),
        (e = !0);
    } else if (l === null) {
      n = t.stateNode;
      var c = t.memoizedProps,
        f = Ya(a, c);
      n.props = f;
      var h = n.context,
        b = a.contextType;
      (i = te), typeof b == "object" && b !== null && (i = Yl(b));
      var T = a.getDerivedStateFromProps;
      (b = typeof T == "function" || typeof n.getSnapshotBeforeUpdate == "function"),
        (c = t.pendingProps !== c),
        b ||
          (typeof n.UNSAFE_componentWillReceiveProps != "function" &&
            typeof n.componentWillReceiveProps != "function") ||
          ((c || h !== i) && So(t, n, e, i)),
        (ea = !1);
      var y = t.memoizedState;
      (n.state = y),
        $e(t, e, n, u),
        We(),
        (h = t.memoizedState),
        c || y !== h || ea
          ? (typeof T == "function" && (uc(t, a, T, e), (h = t.memoizedState)),
            (f = ea || bo(t, a, f, e, y, h, i))
              ? (b ||
                  (typeof n.UNSAFE_componentWillMount != "function" &&
                    typeof n.componentWillMount != "function") ||
                  (typeof n.componentWillMount == "function" && n.componentWillMount(),
                  typeof n.UNSAFE_componentWillMount == "function" &&
                    n.UNSAFE_componentWillMount()),
                typeof n.componentDidMount == "function" && (t.flags |= 4194308))
              : (typeof n.componentDidMount == "function" && (t.flags |= 4194308),
                (t.memoizedProps = e),
                (t.memoizedState = h)),
            (n.props = e),
            (n.state = h),
            (n.context = i),
            (e = f))
          : (typeof n.componentDidMount == "function" && (t.flags |= 4194308), (e = !1));
    } else {
      (n = t.stateNode),
        Ri(l, t),
        (i = t.memoizedProps),
        (b = Ya(a, i)),
        (n.props = b),
        (T = t.pendingProps),
        (y = n.context),
        (h = a.contextType),
        (f = te),
        typeof h == "object" && h !== null && (f = Yl(h)),
        (c = a.getDerivedStateFromProps),
        (h = typeof c == "function" || typeof n.getSnapshotBeforeUpdate == "function") ||
          (typeof n.UNSAFE_componentWillReceiveProps != "function" &&
            typeof n.componentWillReceiveProps != "function") ||
          ((i !== T || y !== f) && So(t, n, e, f)),
        (ea = !1),
        (y = t.memoizedState),
        (n.state = y),
        $e(t, e, n, u),
        We();
      var p = t.memoizedState;
      i !== T || y !== p || ea || (l !== null && l.dependencies !== null && Vu(l.dependencies))
        ? (typeof c == "function" && (uc(t, a, c, e), (p = t.memoizedState)),
          (b =
            ea ||
            bo(t, a, b, e, y, p, f) ||
            (l !== null && l.dependencies !== null && Vu(l.dependencies)))
            ? (h ||
                (typeof n.UNSAFE_componentWillUpdate != "function" &&
                  typeof n.componentWillUpdate != "function") ||
                (typeof n.componentWillUpdate == "function" && n.componentWillUpdate(e, p, f),
                typeof n.UNSAFE_componentWillUpdate == "function" &&
                  n.UNSAFE_componentWillUpdate(e, p, f)),
              typeof n.componentDidUpdate == "function" && (t.flags |= 4),
              typeof n.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024))
            : (typeof n.componentDidUpdate != "function" ||
                (i === l.memoizedProps && y === l.memoizedState) ||
                (t.flags |= 4),
              typeof n.getSnapshotBeforeUpdate != "function" ||
                (i === l.memoizedProps && y === l.memoizedState) ||
                (t.flags |= 1024),
              (t.memoizedProps = e),
              (t.memoizedState = p)),
          (n.props = e),
          (n.state = p),
          (n.context = f),
          (e = b))
        : (typeof n.componentDidUpdate != "function" ||
            (i === l.memoizedProps && y === l.memoizedState) ||
            (t.flags |= 4),
          typeof n.getSnapshotBeforeUpdate != "function" ||
            (i === l.memoizedProps && y === l.memoizedState) ||
            (t.flags |= 1024),
          (e = !1));
    }
    return (
      (n = e),
      sn(l, t),
      (e = (t.flags & 128) !== 0),
      n || e
        ? ((n = t.stateNode),
          (a = e && typeof a.getDerivedStateFromError != "function" ? null : n.render()),
          (t.flags |= 1),
          l !== null && e
            ? ((t.child = qa(t, l.child, null, u)), (t.child = qa(t, null, a, u)))
            : Gl(l, t, a, u),
          (t.memoizedState = n.state),
          (l = t.child))
        : (l = Qt(l, t, u)),
      l
    );
  }
  function Ro(l, t, a, e) {
    return Oa(), (t.flags |= 256), Gl(l, t, a, e), t.child;
  }
  var sc = {
    dehydrated: null,
    treeContext: null,
    retryLane: 0,
    hydrationErrors: null,
  };
  function oc(l) {
    return { baseLanes: l, cachePool: Es() };
  }
  function dc(l, t, a) {
    return (l = l !== null ? l.childLanes & ~a : 0), t && (l |= ot), l;
  }
  function qo(l, t, a) {
    var e = t.pendingProps,
      u = !1,
      n = (t.flags & 128) !== 0,
      i;
    if (
      ((i = n) || (i = l !== null && l.memoizedState === null ? !1 : (Nl.current & 2) !== 0),
      i && ((u = !0), (t.flags &= -129)),
      (i = (t.flags & 32) !== 0),
      (t.flags &= -33),
      l === null)
    ) {
      if (tl) {
        if (
          (u ? ia(t) : ca(),
          (l = Sl)
            ? ((l = Ld(l, pt)),
              (l = l !== null && l.data !== "&" ? l : null),
              l !== null &&
                ((t.memoizedState = {
                  dehydrated: l,
                  treeContext: Pt !== null ? { id: xt, overflow: jt } : null,
                  retryLane: 536870912,
                  hydrationErrors: null,
                }),
                (a = vs(l)),
                (a.return = t),
                (t.child = a),
                (Bl = t),
                (Sl = null)))
            : (l = null),
          l === null)
        )
          throw ta(t);
        return wc(l) ? (t.lanes = 32) : (t.lanes = 536870912), null;
      }
      var c = e.children;
      return (
        (e = e.fallback),
        u
          ? (ca(),
            (u = t.mode),
            (c = on({ mode: "hidden", children: c }, u)),
            (e = Ma(e, u, a, null)),
            (c.return = t),
            (e.return = t),
            (c.sibling = e),
            (t.child = c),
            (e = t.child),
            (e.memoizedState = oc(a)),
            (e.childLanes = dc(l, i, a)),
            (t.memoizedState = sc),
            lu(null, e))
          : (ia(t), rc(t, c))
      );
    }
    var f = l.memoizedState;
    if (f !== null && ((c = f.dehydrated), c !== null)) {
      if (n)
        t.flags & 256
          ? (ia(t), (t.flags &= -257), (t = mc(l, t, a)))
          : t.memoizedState !== null
            ? (ca(), (t.child = l.child), (t.flags |= 128), (t = null))
            : (ca(),
              (c = e.fallback),
              (u = t.mode),
              (e = on({ mode: "visible", children: e.children }, u)),
              (c = Ma(c, u, a, null)),
              (c.flags |= 2),
              (e.return = t),
              (c.return = t),
              (e.sibling = c),
              (t.child = e),
              qa(t, l.child, null, a),
              (e = t.child),
              (e.memoizedState = oc(a)),
              (e.childLanes = dc(l, i, a)),
              (t.memoizedState = sc),
              (t = lu(null, e)));
      else if ((ia(t), wc(c))) {
        if (((i = c.nextSibling && c.nextSibling.dataset), i)) var h = i.dgst;
        (i = h),
          (e = Error(s(419))),
          (e.stack = ""),
          (e.digest = i),
          Ze({ value: e, source: null, stack: null }),
          (t = mc(l, t, a));
      } else if ((Ol || ne(l, t, a, !1), (i = (a & l.childLanes) !== 0), Ol || i)) {
        if (((i = pl), i !== null && ((e = zf(i, a)), e !== 0 && e !== f.retryLane)))
          throw ((f.retryLane = e), ja(l, e), tt(i, l, e), cc);
        Jc(c) || bn(), (t = mc(l, t, a));
      } else
        Jc(c)
          ? ((t.flags |= 192), (t.child = l.child), (t = null))
          : ((l = f.treeContext),
            (Sl = St(c.nextSibling)),
            (Bl = t),
            (tl = !0),
            (la = null),
            (pt = !1),
            l !== null && gs(t, l),
            (t = rc(t, e.children)),
            (t.flags |= 4096));
      return t;
    }
    return u
      ? (ca(),
        (c = e.fallback),
        (u = t.mode),
        (f = l.child),
        (h = f.sibling),
        (e = Rt(f, {
          mode: "hidden",
          children: e.children,
        })),
        (e.subtreeFlags = f.subtreeFlags & 65011712),
        h !== null ? (c = Rt(h, c)) : ((c = Ma(c, u, a, null)), (c.flags |= 2)),
        (c.return = t),
        (e.return = t),
        (e.sibling = c),
        (t.child = e),
        lu(null, e),
        (e = t.child),
        (c = l.child.memoizedState),
        c === null
          ? (c = oc(a))
          : ((u = c.cachePool),
            u !== null
              ? ((f = jl._currentValue), (u = u.parent !== f ? { parent: f, pool: f } : u))
              : (u = Es()),
            (c = {
              baseLanes: c.baseLanes | a,
              cachePool: u,
            })),
        (e.memoizedState = c),
        (e.childLanes = dc(l, i, a)),
        (t.memoizedState = sc),
        lu(l.child, e))
      : (ia(t),
        (a = l.child),
        (l = a.sibling),
        (a = Rt(a, {
          mode: "visible",
          children: e.children,
        })),
        (a.return = t),
        (a.sibling = null),
        l !== null &&
          ((i = t.deletions), i === null ? ((t.deletions = [l]), (t.flags |= 16)) : i.push(l)),
        (t.child = a),
        (t.memoizedState = null),
        a);
  }
  function rc(l, t) {
    return (t = on({ mode: "visible", children: t }, l.mode)), (t.return = l), (l.child = t);
  }
  function on(l, t) {
    return (l = it(22, l, null, t)), (l.lanes = 0), l;
  }
  function mc(l, t, a) {
    return (
      qa(t, l.child, null, a),
      (l = rc(t, t.pendingProps.children)),
      (l.flags |= 2),
      (t.memoizedState = null),
      l
    );
  }
  function Bo(l, t, a) {
    l.lanes |= t;
    var e = l.alternate;
    e !== null && (e.lanes |= t), ji(l.return, t, a);
  }
  function vc(l, t, a, e, u, n) {
    var i = l.memoizedState;
    i === null
      ? (l.memoizedState = {
          isBackwards: t,
          rendering: null,
          renderingStartTime: 0,
          last: e,
          tail: a,
          tailMode: u,
          treeForkCount: n,
        })
      : ((i.isBackwards = t),
        (i.rendering = null),
        (i.renderingStartTime = 0),
        (i.last = e),
        (i.tail = a),
        (i.tailMode = u),
        (i.treeForkCount = n));
  }
  function Yo(l, t, a) {
    var e = t.pendingProps,
      u = e.revealOrder,
      n = e.tail;
    e = e.children;
    var i = Nl.current,
      c = (i & 2) !== 0;
    if (
      (c ? ((i = (i & 1) | 2), (t.flags |= 128)) : (i &= 1),
      D(Nl, i),
      Gl(l, t, e, a),
      (e = tl ? Qe : 0),
      !c && l !== null && (l.flags & 128) !== 0)
    )
      l: for (l = t.child; l !== null; ) {
        if (l.tag === 13) l.memoizedState !== null && Bo(l, a, t);
        else if (l.tag === 19) Bo(l, a, t);
        else if (l.child !== null) {
          (l.child.return = l), (l = l.child);
          continue;
        }
        if (l === t) break;
        while (l.sibling === null) {
          if (l.return === null || l.return === t) break l;
          l = l.return;
        }
        (l.sibling.return = l.return), (l = l.sibling);
      }
    switch (u) {
      case "forwards":
        for (a = t.child, u = null; a !== null; )
          (l = a.alternate), l !== null && Fu(l) === null && (u = a), (a = a.sibling);
        (a = u),
          a === null ? ((u = t.child), (t.child = null)) : ((u = a.sibling), (a.sibling = null)),
          vc(t, !1, u, a, n, e);
        break;
      case "backwards":
      case "unstable_legacy-backwards":
        for (a = null, u = t.child, t.child = null; u !== null; ) {
          if (((l = u.alternate), l !== null && Fu(l) === null)) {
            t.child = u;
            break;
          }
          (l = u.sibling), (u.sibling = a), (a = u), (u = l);
        }
        vc(t, !0, a, null, n, e);
        break;
      case "together":
        vc(t, !1, null, null, void 0, e);
        break;
      default:
        t.memoizedState = null;
    }
    return t.child;
  }
  function Qt(l, t, a) {
    if (
      (l !== null && (t.dependencies = l.dependencies), (oa |= t.lanes), (a & t.childLanes) === 0)
    )
      if (l !== null) {
        if ((ne(l, t, a, !1), (a & t.childLanes) === 0)) return null;
      } else return null;
    if (l !== null && t.child !== l.child) throw Error(s(153));
    if (t.child !== null) {
      for (l = t.child, a = Rt(l, l.pendingProps), t.child = a, a.return = t; l.sibling !== null; )
        (l = l.sibling), (a = a.sibling = Rt(l, l.pendingProps)), (a.return = t);
      a.sibling = null;
    }
    return t.child;
  }
  function hc(l, t) {
    return (l.lanes & t) !== 0 ? !0 : ((l = l.dependencies), !!(l !== null && Vu(l)));
  }
  function Wm(l, t, a) {
    switch (t.tag) {
      case 3:
        Kl(t, t.stateNode.containerInfo), aa(t, jl, l.memoizedState.cache), Oa();
        break;
      case 27:
      case 5:
        Ne(t);
        break;
      case 4:
        Kl(t, t.stateNode.containerInfo);
        break;
      case 10:
        aa(t, t.type, t.memoizedProps.value);
        break;
      case 31:
        if (t.memoizedState !== null) return (t.flags |= 128), Xi(t), null;
        break;
      case 13:
        var e = t.memoizedState;
        if (e !== null)
          return e.dehydrated !== null
            ? (ia(t), (t.flags |= 128), null)
            : (a & t.child.childLanes) !== 0
              ? qo(l, t, a)
              : (ia(t), (l = Qt(l, t, a)), l !== null ? l.sibling : null);
        ia(t);
        break;
      case 19:
        var u = (l.flags & 128) !== 0;
        if (
          ((e = (a & t.childLanes) !== 0),
          e || (ne(l, t, a, !1), (e = (a & t.childLanes) !== 0)),
          u)
        ) {
          if (e) return Yo(l, t, a);
          t.flags |= 128;
        }
        if (
          ((u = t.memoizedState),
          u !== null && ((u.rendering = null), (u.tail = null), (u.lastEffect = null)),
          D(Nl, Nl.current),
          e)
        )
          break;
        return null;
      case 22:
        return (t.lanes = 0), Oo(l, t, a, t.pendingProps);
      case 24:
        aa(t, jl, l.memoizedState.cache);
    }
    return Qt(l, t, a);
  }
  function Go(l, t, a) {
    if (l !== null)
      if (l.memoizedProps !== t.pendingProps) Ol = !0;
      else {
        if (!hc(l, a) && (t.flags & 128) === 0) return (Ol = !1), Wm(l, t, a);
        Ol = (l.flags & 131072) !== 0;
      }
    else (Ol = !1), tl && (t.flags & 1048576) !== 0 && ys(t, Qe, t.index);
    switch (((t.lanes = 0), t.tag)) {
      case 16:
        l: {
          var e = t.pendingProps;
          if (((l = Ha(t.elementType)), (t.type = l), typeof l == "function"))
            Si(l)
              ? ((e = Ya(l, e)), (t.tag = 1), (t = Ho(null, t, l, e, a)))
              : ((t.tag = 0), (t = fc(null, t, l, e, a)));
          else {
            if (l != null) {
              var u = l.$$typeof;
              if (u === bl) {
                (t.tag = 11), (t = xo(null, t, l, e, a));
                break l;
              } else if (u === w) {
                (t.tag = 14), (t = jo(null, t, l, e, a));
                break l;
              }
            }
            throw ((t = Dt(l) || l), Error(s(306, t, "")));
          }
        }
        return t;
      case 0:
        return fc(l, t, t.type, t.pendingProps, a);
      case 1:
        return (e = t.type), (u = Ya(e, t.pendingProps)), Ho(l, t, e, u, a);
      case 3:
        l: {
          if ((Kl(t, t.stateNode.containerInfo), l === null)) throw Error(s(387));
          e = t.pendingProps;
          var n = t.memoizedState;
          (u = n.element), Ri(l, t), $e(t, e, null, a);
          var i = t.memoizedState;
          if (
            ((e = i.cache),
            aa(t, jl, e),
            e !== n.cache && Mi(t, [jl], a, !0),
            We(),
            (e = i.element),
            n.isDehydrated)
          )
            if (
              ((n = {
                element: e,
                isDehydrated: !1,
                cache: i.cache,
              }),
              (t.updateQueue.baseState = n),
              (t.memoizedState = n),
              t.flags & 256)
            ) {
              t = Ro(l, t, e, a);
              break l;
            } else if (e !== u) {
              (u = ht(Error(s(424)), t)), Ze(u), (t = Ro(l, t, e, a));
              break l;
            } else {
              switch (((l = t.stateNode.containerInfo), l.nodeType)) {
                case 9:
                  l = l.body;
                  break;
                default:
                  l = l.nodeName === "HTML" ? l.ownerDocument.body : l;
              }
              for (
                Sl = St(l.firstChild),
                  Bl = t,
                  tl = !0,
                  la = null,
                  pt = !0,
                  a = Ms(t, null, e, a),
                  t.child = a;
                a;
              )
                (a.flags = (a.flags & -3) | 4096), (a = a.sibling);
            }
          else {
            if ((Oa(), e === u)) {
              t = Qt(l, t, a);
              break l;
            }
            Gl(l, t, e, a);
          }
          t = t.child;
        }
        return t;
      case 26:
        return (
          sn(l, t),
          l === null
            ? (a = kd(t.type, null, t.pendingProps, null))
              ? (t.memoizedState = a)
              : tl ||
                ((a = t.type),
                (l = t.pendingProps),
                (e = Nn(W.current).createElement(a)),
                (e[ql] = t),
                (e[$l] = l),
                Xl(e, a, l),
                Hl(e),
                (t.stateNode = e))
            : (t.memoizedState = kd(t.type, l.memoizedProps, t.pendingProps, l.memoizedState)),
          null
        );
      case 27:
        return (
          Ne(t),
          l === null &&
            tl &&
            ((e = t.stateNode = wd(t.type, t.pendingProps, W.current)),
            (Bl = t),
            (pt = !0),
            (u = Sl),
            ha(t.type) ? ((Wc = u), (Sl = St(e.firstChild))) : (Sl = u)),
          Gl(l, t, t.pendingProps.children, a),
          sn(l, t),
          l === null && (t.flags |= 4194304),
          t.child
        );
      case 5:
        return (
          l === null &&
            tl &&
            ((u = e = Sl) &&
              ((e = Av(e, t.type, t.pendingProps, pt)),
              e !== null
                ? ((t.stateNode = e), (Bl = t), (Sl = St(e.firstChild)), (pt = !1), (u = !0))
                : (u = !1)),
            u || ta(t)),
          Ne(t),
          (u = t.type),
          (n = t.pendingProps),
          (i = l !== null ? l.memoizedProps : null),
          (e = n.children),
          Vc(u, n) ? (e = null) : i !== null && Vc(u, i) && (t.flags |= 32),
          t.memoizedState !== null && ((u = Zi(l, t, Gm, null, null, a)), (hu._currentValue = u)),
          sn(l, t),
          Gl(l, t, e, a),
          t.child
        );
      case 6:
        return (
          l === null &&
            tl &&
            ((l = a = Sl) &&
              ((a = _v(a, t.pendingProps, pt)),
              a !== null ? ((t.stateNode = a), (Bl = t), (Sl = null), (l = !0)) : (l = !1)),
            l || ta(t)),
          null
        );
      case 13:
        return qo(l, t, a);
      case 4:
        return (
          Kl(t, t.stateNode.containerInfo),
          (e = t.pendingProps),
          l === null ? (t.child = qa(t, null, e, a)) : Gl(l, t, e, a),
          t.child
        );
      case 11:
        return xo(l, t, t.type, t.pendingProps, a);
      case 7:
        return Gl(l, t, t.pendingProps, a), t.child;
      case 8:
        return Gl(l, t, t.pendingProps.children, a), t.child;
      case 12:
        return Gl(l, t, t.pendingProps.children, a), t.child;
      case 10:
        return (e = t.pendingProps), aa(t, t.type, e.value), Gl(l, t, e.children, a), t.child;
      case 9:
        return (
          (u = t.type._context),
          (e = t.pendingProps.children),
          Ua(t),
          (u = Yl(u)),
          (e = e(u)),
          (t.flags |= 1),
          Gl(l, t, e, a),
          t.child
        );
      case 14:
        return jo(l, t, t.type, t.pendingProps, a);
      case 15:
        return Mo(l, t, t.type, t.pendingProps, a);
      case 19:
        return Yo(l, t, a);
      case 31:
        return wm(l, t, a);
      case 22:
        return Oo(l, t, a, t.pendingProps);
      case 24:
        return (
          Ua(t),
          (e = Yl(jl)),
          l === null
            ? ((u = Ui()),
              u === null &&
                ((u = pl),
                (n = Oi()),
                (u.pooledCache = n),
                n.refCount++,
                n !== null && (u.pooledCacheLanes |= a),
                (u = n)),
              (t.memoizedState = { parent: e, cache: u }),
              Hi(t),
              aa(t, jl, u))
            : ((l.lanes & a) !== 0 && (Ri(l, t), $e(t, null, null, a), We()),
              (u = l.memoizedState),
              (n = t.memoizedState),
              u.parent !== e
                ? ((u = { parent: e, cache: e }),
                  (t.memoizedState = u),
                  t.lanes === 0 && (t.memoizedState = t.updateQueue.baseState = u),
                  aa(t, jl, e))
                : ((e = n.cache), aa(t, jl, e), e !== u.cache && Mi(t, [jl], a, !0))),
          Gl(l, t, t.pendingProps.children, a),
          t.child
        );
      case 29:
        throw t.pendingProps;
    }
    throw Error(s(156, t.tag));
  }
  function Zt(l) {
    l.flags |= 4;
  }
  function yc(l, t, a, e, u) {
    if (((t = (l.mode & 32) !== 0) && (t = !1), t)) {
      if (((l.flags |= 16777216), (u & 335544128) === u))
        if (l.stateNode.complete) l.flags |= 8192;
        else if (rd()) l.flags |= 8192;
        else throw ((Ra = wu), Ci);
    } else l.flags &= -16777217;
  }
  function Xo(l, t) {
    if (t.type !== "stylesheet" || (t.state.loading & 4) !== 0) l.flags &= -16777217;
    else if (((l.flags |= 16777216), !tr(t)))
      if (rd()) l.flags |= 8192;
      else throw ((Ra = wu), Ci);
  }
  function dn(l, t) {
    t !== null && (l.flags |= 4),
      l.flags & 16384 && ((t = l.tag !== 22 ? pf() : 536870912), (l.lanes |= t), (ge |= t));
  }
  function tu(l, t) {
    if (!tl)
      switch (l.tailMode) {
        case "hidden":
          t = l.tail;
          for (var a = null; t !== null; ) t.alternate !== null && (a = t), (t = t.sibling);
          a === null ? (l.tail = null) : (a.sibling = null);
          break;
        case "collapsed":
          a = l.tail;
          for (var e = null; a !== null; ) a.alternate !== null && (e = a), (a = a.sibling);
          e === null
            ? t || l.tail === null
              ? (l.tail = null)
              : (l.tail.sibling = null)
            : (e.sibling = null);
      }
  }
  function zl(l) {
    var t = l.alternate !== null && l.alternate.child === l.child,
      a = 0,
      e = 0;
    if (t)
      for (var u = l.child; u !== null; )
        (a |= u.lanes | u.childLanes),
          (e |= u.subtreeFlags & 65011712),
          (e |= u.flags & 65011712),
          (u.return = l),
          (u = u.sibling);
    else
      for (u = l.child; u !== null; )
        (a |= u.lanes | u.childLanes),
          (e |= u.subtreeFlags),
          (e |= u.flags),
          (u.return = l),
          (u = u.sibling);
    return (l.subtreeFlags |= e), (l.childLanes = a), t;
  }
  function $m(l, t, a) {
    var e = t.pendingProps;
    switch ((Ai(t), t.tag)) {
      case 16:
      case 15:
      case 0:
      case 11:
      case 7:
      case 8:
      case 12:
      case 9:
      case 14:
        return zl(t), null;
      case 1:
        return zl(t), null;
      case 3:
        return (
          (a = t.stateNode),
          (e = null),
          l !== null && (e = l.memoizedState.cache),
          t.memoizedState.cache !== e && (t.flags |= 2048),
          Yt(jl),
          _l(),
          a.pendingContext && ((a.context = a.pendingContext), (a.pendingContext = null)),
          (l === null || l.child === null) &&
            (ue(t)
              ? Zt(t)
              : l === null ||
                (l.memoizedState.isDehydrated && (t.flags & 256) === 0) ||
                ((t.flags |= 1024), Ni())),
          zl(t),
          null
        );
      case 26:
        var u = t.type,
          n = t.memoizedState;
        return (
          l === null
            ? (Zt(t), n !== null ? (zl(t), Xo(t, n)) : (zl(t), yc(t, u, null, e, a)))
            : n
              ? n !== l.memoizedState
                ? (Zt(t), zl(t), Xo(t, n))
                : (zl(t), (t.flags &= -16777217))
              : ((l = l.memoizedProps), l !== e && Zt(t), zl(t), yc(t, u, l, e, a)),
          null
        );
      case 27:
        if ((zu(t), (a = W.current), (u = t.type), l !== null && t.stateNode != null))
          l.memoizedProps !== e && Zt(t);
        else {
          if (!e) {
            if (t.stateNode === null) throw Error(s(166));
            return zl(t), null;
          }
          (l = C.current), ue(t) ? ps(t) : ((l = wd(u, e, a)), (t.stateNode = l), Zt(t));
        }
        return zl(t), null;
      case 5:
        if ((zu(t), (u = t.type), l !== null && t.stateNode != null))
          l.memoizedProps !== e && Zt(t);
        else {
          if (!e) {
            if (t.stateNode === null) throw Error(s(166));
            return zl(t), null;
          }
          if (((n = C.current), ue(t))) ps(t);
          else {
            var i = Nn(W.current);
            switch (n) {
              case 1:
                n = i.createElementNS("http://www.w3.org/2000/svg", u);
                break;
              case 2:
                n = i.createElementNS("http://www.w3.org/1998/Math/MathML", u);
                break;
              default:
                switch (u) {
                  case "svg":
                    n = i.createElementNS("http://www.w3.org/2000/svg", u);
                    break;
                  case "math":
                    n = i.createElementNS("http://www.w3.org/1998/Math/MathML", u);
                    break;
                  case "script":
                    (n = i.createElement("div")),
                      (n.innerHTML = "<script></script>"),
                      (n = n.removeChild(n.firstChild));
                    break;
                  case "select":
                    (n =
                      typeof e.is == "string"
                        ? i.createElement("select", {
                            is: e.is,
                          })
                        : i.createElement("select")),
                      e.multiple ? (n.multiple = !0) : e.size && (n.size = e.size);
                    break;
                  default:
                    n =
                      typeof e.is == "string"
                        ? i.createElement(u, { is: e.is })
                        : i.createElement(u);
                }
            }
            (n[ql] = t), (n[$l] = e);
            l: for (i = t.child; i !== null; ) {
              if (i.tag === 5 || i.tag === 6) n.appendChild(i.stateNode);
              else if (i.tag !== 4 && i.tag !== 27 && i.child !== null) {
                (i.child.return = i), (i = i.child);
                continue;
              }
              if (i === t) break;
              while (i.sibling === null) {
                if (i.return === null || i.return === t) break l;
                i = i.return;
              }
              (i.sibling.return = i.return), (i = i.sibling);
            }
            t.stateNode = n;
            switch ((Xl(n, u, e), u)) {
              case "button":
              case "input":
              case "select":
              case "textarea":
                e = !!e.autoFocus;
                break;
              case "img":
                e = !0;
                break;
              default:
                e = !1;
            }
            e && Zt(t);
          }
        }
        return zl(t), yc(t, t.type, l === null ? null : l.memoizedProps, t.pendingProps, a), null;
      case 6:
        if (l && t.stateNode != null) l.memoizedProps !== e && Zt(t);
        else {
          if (typeof e != "string" && t.stateNode === null) throw Error(s(166));
          if (((l = W.current), ue(t))) {
            if (((l = t.stateNode), (a = t.memoizedProps), (e = null), (u = Bl), u !== null))
              switch (u.tag) {
                case 27:
                case 5:
                  e = u.memoizedProps;
              }
            (l[ql] = t),
              (l = !!(
                l.nodeValue === a ||
                (e !== null && e.suppressHydrationWarning === !0) ||
                qd(l.nodeValue, a)
              )),
              l || ta(t, !0);
          } else (l = Nn(l).createTextNode(e)), (l[ql] = t), (t.stateNode = l);
        }
        return zl(t), null;
      case 31:
        if (((a = t.memoizedState), l === null || l.memoizedState !== null)) {
          if (((e = ue(t)), a !== null)) {
            if (l === null) {
              if (!e) throw Error(s(318));
              if (((l = t.memoizedState), (l = l !== null ? l.dehydrated : null), !l))
                throw Error(s(557));
              l[ql] = t;
            } else Oa(), (t.flags & 128) === 0 && (t.memoizedState = null), (t.flags |= 4);
            zl(t), (l = !1);
          } else
            (a = Ni()),
              l !== null && l.memoizedState !== null && (l.memoizedState.hydrationErrors = a),
              (l = !0);
          if (!l) return t.flags & 256 ? (ft(t), t) : (ft(t), null);
          if ((t.flags & 128) !== 0) throw Error(s(558));
        }
        return zl(t), null;
      case 13:
        if (
          ((e = t.memoizedState),
          l === null || (l.memoizedState !== null && l.memoizedState.dehydrated !== null))
        ) {
          if (((u = ue(t)), e !== null && e.dehydrated !== null)) {
            if (l === null) {
              if (!u) throw Error(s(318));
              if (((u = t.memoizedState), (u = u !== null ? u.dehydrated : null), !u))
                throw Error(s(317));
              u[ql] = t;
            } else Oa(), (t.flags & 128) === 0 && (t.memoizedState = null), (t.flags |= 4);
            zl(t), (u = !1);
          } else
            (u = Ni()),
              l !== null && l.memoizedState !== null && (l.memoizedState.hydrationErrors = u),
              (u = !0);
          if (!u) return t.flags & 256 ? (ft(t), t) : (ft(t), null);
        }
        return (
          ft(t),
          (t.flags & 128) !== 0
            ? ((t.lanes = a), t)
            : ((a = e !== null),
              (l = l !== null && l.memoizedState !== null),
              a &&
                ((e = t.child),
                (u = null),
                e.alternate !== null &&
                  e.alternate.memoizedState !== null &&
                  e.alternate.memoizedState.cachePool !== null &&
                  (u = e.alternate.memoizedState.cachePool.pool),
                (n = null),
                e.memoizedState !== null &&
                  e.memoizedState.cachePool !== null &&
                  (n = e.memoizedState.cachePool.pool),
                n !== u && (e.flags |= 2048)),
              a !== l && a && (t.child.flags |= 8192),
              dn(t, t.updateQueue),
              zl(t),
              null)
        );
      case 4:
        return _l(), l === null && Yc(t.stateNode.containerInfo), zl(t), null;
      case 10:
        return Yt(t.type), zl(t), null;
      case 19:
        if ((_(Nl), (e = t.memoizedState), e === null)) return zl(t), null;
        if (((u = (t.flags & 128) !== 0), (n = e.rendering), n === null))
          if (u) tu(e, !1);
          else {
            if (Al !== 0 || (l !== null && (l.flags & 128) !== 0))
              for (l = t.child; l !== null; ) {
                if (((n = Fu(l)), n !== null)) {
                  for (
                    t.flags |= 128,
                      tu(e, !1),
                      l = n.updateQueue,
                      t.updateQueue = l,
                      dn(t, l),
                      t.subtreeFlags = 0,
                      l = a,
                      a = t.child;
                    a !== null;
                  )
                    ms(a, l), (a = a.sibling);
                  return D(Nl, (Nl.current & 1) | 2), tl && qt(t, e.treeForkCount), t.child;
                }
                l = l.sibling;
              }
            e.tail !== null &&
              at() > yn &&
              ((t.flags |= 128), (u = !0), tu(e, !1), (t.lanes = 4194304));
          }
        else {
          if (!u)
            if (((l = Fu(n)), l !== null)) {
              if (
                ((t.flags |= 128),
                (u = !0),
                (l = l.updateQueue),
                (t.updateQueue = l),
                dn(t, l),
                tu(e, !0),
                e.tail === null && e.tailMode === "hidden" && !n.alternate && !tl)
              )
                return zl(t), null;
            } else
              2 * at() - e.renderingStartTime > yn &&
                a !== 536870912 &&
                ((t.flags |= 128), (u = !0), tu(e, !1), (t.lanes = 4194304));
          e.isBackwards
            ? ((n.sibling = t.child), (t.child = n))
            : ((l = e.last), l !== null ? (l.sibling = n) : (t.child = n), (e.last = n));
        }
        return e.tail !== null
          ? ((l = e.tail),
            (e.rendering = l),
            (e.tail = l.sibling),
            (e.renderingStartTime = at()),
            (l.sibling = null),
            (a = Nl.current),
            D(Nl, u ? (a & 1) | 2 : a & 1),
            tl && qt(t, e.treeForkCount),
            l)
          : (zl(t), null);
      case 22:
      case 23:
        return (
          ft(t),
          Gi(),
          (e = t.memoizedState !== null),
          l !== null
            ? (l.memoizedState !== null) !== e && (t.flags |= 8192)
            : e && (t.flags |= 8192),
          e
            ? (a & 536870912) !== 0 &&
              (t.flags & 128) === 0 &&
              (zl(t), t.subtreeFlags & 6 && (t.flags |= 8192))
            : zl(t),
          (a = t.updateQueue),
          a !== null && dn(t, a.retryQueue),
          (a = null),
          l !== null &&
            l.memoizedState !== null &&
            l.memoizedState.cachePool !== null &&
            (a = l.memoizedState.cachePool.pool),
          (e = null),
          t.memoizedState !== null &&
            t.memoizedState.cachePool !== null &&
            (e = t.memoizedState.cachePool.pool),
          e !== a && (t.flags |= 2048),
          l !== null && _(Ca),
          null
        );
      case 24:
        return (
          (a = null),
          l !== null && (a = l.memoizedState.cache),
          t.memoizedState.cache !== a && (t.flags |= 2048),
          Yt(jl),
          zl(t),
          null
        );
      case 25:
        return null;
      case 30:
        return null;
    }
    throw Error(s(156, t.tag));
  }
  function km(l, t) {
    switch ((Ai(t), t.tag)) {
      case 1:
        return (l = t.flags), l & 65536 ? ((t.flags = (l & -65537) | 128), t) : null;
      case 3:
        return (
          Yt(jl),
          _l(),
          (l = t.flags),
          (l & 65536) !== 0 && (l & 128) === 0 ? ((t.flags = (l & -65537) | 128), t) : null
        );
      case 26:
      case 27:
      case 5:
        return zu(t), null;
      case 31:
        if (t.memoizedState !== null) {
          if ((ft(t), t.alternate === null)) throw Error(s(340));
          Oa();
        }
        return (l = t.flags), l & 65536 ? ((t.flags = (l & -65537) | 128), t) : null;
      case 13:
        if ((ft(t), (l = t.memoizedState), l !== null && l.dehydrated !== null)) {
          if (t.alternate === null) throw Error(s(340));
          Oa();
        }
        return (l = t.flags), l & 65536 ? ((t.flags = (l & -65537) | 128), t) : null;
      case 19:
        return _(Nl), null;
      case 4:
        return _l(), null;
      case 10:
        return Yt(t.type), null;
      case 22:
      case 23:
        return (
          ft(t),
          Gi(),
          l !== null && _(Ca),
          (l = t.flags),
          l & 65536 ? ((t.flags = (l & -65537) | 128), t) : null
        );
      case 24:
        return Yt(jl), null;
      case 25:
        return null;
      default:
        return null;
    }
  }
  function Qo(l, t) {
    switch ((Ai(t), t.tag)) {
      case 3:
        Yt(jl), _l();
        break;
      case 26:
      case 27:
      case 5:
        zu(t);
        break;
      case 4:
        _l();
        break;
      case 31:
        t.memoizedState !== null && ft(t);
        break;
      case 13:
        ft(t);
        break;
      case 19:
        _(Nl);
        break;
      case 10:
        Yt(t.type);
        break;
      case 22:
      case 23:
        ft(t), Gi(), l !== null && _(Ca);
        break;
      case 24:
        Yt(jl);
    }
  }
  function au(l, t) {
    try {
      var a = t.updateQueue,
        e = a !== null ? a.lastEffect : null;
      if (e !== null) {
        var u = e.next;
        a = u;
        do {
          if ((a.tag & l) === l) {
            e = void 0;
            var n = a.create,
              i = a.inst;
            (e = n()), (i.destroy = e);
          }
          a = a.next;
        } while (a !== u);
      }
    } catch (c) {
      dl(t, t.return, c);
    }
  }
  function fa(l, t, a) {
    try {
      var e = t.updateQueue,
        u = e !== null ? e.lastEffect : null;
      if (u !== null) {
        var n = u.next;
        e = n;
        do {
          if ((e.tag & l) === l) {
            var i = e.inst,
              c = i.destroy;
            if (c !== void 0) {
              (i.destroy = void 0), (u = t);
              var f = a,
                h = c;
              try {
                h();
              } catch (b) {
                dl(u, f, b);
              }
            }
          }
          e = e.next;
        } while (e !== n);
      }
    } catch (b) {
      dl(t, t.return, b);
    }
  }
  function Zo(l) {
    var t = l.updateQueue;
    if (t !== null) {
      var a = l.stateNode;
      try {
        Ds(t, a);
      } catch (e) {
        dl(l, l.return, e);
      }
    }
  }
  function Vo(l, t, a) {
    (a.props = Ya(l.type, l.memoizedProps)), (a.state = l.memoizedState);
    try {
      a.componentWillUnmount();
    } catch (e) {
      dl(l, t, e);
    }
  }
  function eu(l, t) {
    try {
      var a = l.ref;
      if (a !== null) {
        switch (l.tag) {
          case 26:
          case 27:
          case 5:
            var e = l.stateNode;
            break;
          case 30:
            e = l.stateNode;
            break;
          default:
            e = l.stateNode;
        }
        typeof a == "function" ? (l.refCleanup = a(e)) : (a.current = e);
      }
    } catch (u) {
      dl(l, t, u);
    }
  }
  function Mt(l, t) {
    var a = l.ref,
      e = l.refCleanup;
    if (a !== null)
      if (typeof e == "function")
        try {
          e();
        } catch (u) {
          dl(l, t, u);
        } finally {
          (l.refCleanup = null), (l = l.alternate), l != null && (l.refCleanup = null);
        }
      else if (typeof a == "function")
        try {
          a(null);
        } catch (u) {
          dl(l, t, u);
        }
      else a.current = null;
  }
  function Lo(l) {
    var t = l.type,
      a = l.memoizedProps,
      e = l.stateNode;
    try {
      switch (t) {
        case "button":
        case "input":
        case "select":
        case "textarea":
          a.autoFocus && e.focus();
          break;
        case "img":
          a.src ? (e.src = a.src) : a.srcSet && (e.srcset = a.srcSet);
      }
    } catch (u) {
      dl(l, l.return, u);
    }
  }
  function gc(l, t, a) {
    try {
      var e = l.stateNode;
      pv(e, l.type, a, t), (e[$l] = t);
    } catch (u) {
      dl(l, l.return, u);
    }
  }
  function Ko(l) {
    return (
      l.tag === 5 || l.tag === 3 || l.tag === 26 || (l.tag === 27 && ha(l.type)) || l.tag === 4
    );
  }
  function pc(l) {
    l: for (;;) {
      while (l.sibling === null) {
        if (l.return === null || Ko(l.return)) return null;
        l = l.return;
      }
      for (
        l.sibling.return = l.return, l = l.sibling;
        l.tag !== 5 && l.tag !== 6 && l.tag !== 18;
      ) {
        if ((l.tag === 27 && ha(l.type)) || l.flags & 2 || l.child === null || l.tag === 4)
          continue l;
        (l.child.return = l), (l = l.child);
      }
      if (!(l.flags & 2)) return l.stateNode;
    }
  }
  function bc(l, t, a) {
    var e = l.tag;
    if (e === 5 || e === 6)
      (l = l.stateNode),
        t
          ? (a.nodeType === 9
              ? a.body
              : a.nodeName === "HTML"
                ? a.ownerDocument.body
                : a
            ).insertBefore(l, t)
          : ((t = a.nodeType === 9 ? a.body : a.nodeName === "HTML" ? a.ownerDocument.body : a),
            t.appendChild(l),
            (a = a._reactRootContainer),
            a != null || t.onclick !== null || (t.onclick = Ct));
    else if (
      e !== 4 &&
      (e === 27 && ha(l.type) && ((a = l.stateNode), (t = null)), (l = l.child), l !== null)
    )
      for (bc(l, t, a), l = l.sibling; l !== null; ) bc(l, t, a), (l = l.sibling);
  }
  function rn(l, t, a) {
    var e = l.tag;
    if (e === 5 || e === 6) (l = l.stateNode), t ? a.insertBefore(l, t) : a.appendChild(l);
    else if (e !== 4 && (e === 27 && ha(l.type) && (a = l.stateNode), (l = l.child), l !== null))
      for (rn(l, t, a), l = l.sibling; l !== null; ) rn(l, t, a), (l = l.sibling);
  }
  function Jo(l) {
    var t = l.stateNode,
      a = l.memoizedProps;
    try {
      for (var e = l.type, u = t.attributes; u.length; ) t.removeAttributeNode(u[0]);
      Xl(t, e, a), (t[ql] = l), (t[$l] = a);
    } catch (n) {
      dl(l, l.return, n);
    }
  }
  var Vt = !1,
    Dl = !1,
    Sc = !1,
    wo = typeof WeakSet == "function" ? WeakSet : Set,
    Rl = null;
  function Fm(l, t) {
    if (((l = l.containerInfo), (Qc = Cn), (l = us(l)), mi(l))) {
      if ("selectionStart" in l)
        var a = {
          start: l.selectionStart,
          end: l.selectionEnd,
        };
      else
        l: {
          a = ((a = l.ownerDocument) && a.defaultView) || window;
          var e = a.getSelection && a.getSelection();
          if (e && e.rangeCount !== 0) {
            a = e.anchorNode;
            var u = e.anchorOffset,
              n = e.focusNode;
            e = e.focusOffset;
            try {
              a.nodeType, n.nodeType;
            } catch {
              a = null;
              break l;
            }
            var i = 0,
              c = -1,
              f = -1,
              h = 0,
              b = 0,
              T = l,
              y = null;
            t: for (;;) {
              for (
                var p;
                T !== a || (u !== 0 && T.nodeType !== 3) || (c = i + u),
                  T !== n || (e !== 0 && T.nodeType !== 3) || (f = i + e),
                  T.nodeType === 3 && (i += T.nodeValue.length),
                  (p = T.firstChild) !== null;
              )
                (y = T), (T = p);
              for (;;) {
                if (T === l) break t;
                if (
                  (y === a && ++h === u && (c = i),
                  y === n && ++b === e && (f = i),
                  (p = T.nextSibling) !== null)
                )
                  break;
                (T = y), (y = T.parentNode);
              }
              T = p;
            }
            a = c === -1 || f === -1 ? null : { start: c, end: f };
          } else a = null;
        }
      a = a || { start: 0, end: 0 };
    } else a = null;
    for (Zc = { focusedElem: l, selectionRange: a }, Cn = !1, Rl = t; Rl !== null; )
      if (((t = Rl), (l = t.child), (t.subtreeFlags & 1028) !== 0 && l !== null))
        (l.return = t), (Rl = l);
      else
        while (Rl !== null) {
          switch (((t = Rl), (n = t.alternate), (l = t.flags), t.tag)) {
            case 0:
              if (
                (l & 4) !== 0 &&
                ((l = t.updateQueue), (l = l !== null ? l.events : null), l !== null)
              )
                for (a = 0; a < l.length; a++) (u = l[a]), (u.ref.impl = u.nextImpl);
              break;
            case 11:
            case 15:
              break;
            case 1:
              if ((l & 1024) !== 0 && n !== null) {
                (l = void 0),
                  (a = t),
                  (u = n.memoizedProps),
                  (n = n.memoizedState),
                  (e = a.stateNode);
                try {
                  var U = Ya(a.type, u);
                  (l = e.getSnapshotBeforeUpdate(U, n)),
                    (e.__reactInternalSnapshotBeforeUpdate = l);
                } catch (G) {
                  dl(a, a.return, G);
                }
              }
              break;
            case 3:
              if ((l & 1024) !== 0) {
                if (((l = t.stateNode.containerInfo), (a = l.nodeType), a === 9)) Kc(l);
                else if (a === 1)
                  switch (l.nodeName) {
                    case "HEAD":
                    case "HTML":
                    case "BODY":
                      Kc(l);
                      break;
                    default:
                      l.textContent = "";
                  }
              }
              break;
            case 5:
            case 26:
            case 27:
            case 6:
            case 4:
            case 17:
              break;
            default:
              if ((l & 1024) !== 0) throw Error(s(163));
          }
          if (((l = t.sibling), l !== null)) {
            (l.return = t.return), (Rl = l);
            break;
          }
          Rl = t.return;
        }
  }
  function Wo(l, t, a) {
    var e = a.flags;
    switch (a.tag) {
      case 0:
      case 11:
      case 15:
        Kt(l, a), e & 4 && au(5, a);
        break;
      case 1:
        if ((Kt(l, a), e & 4))
          if (((l = a.stateNode), t === null))
            try {
              l.componentDidMount();
            } catch (i) {
              dl(a, a.return, i);
            }
          else {
            var u = Ya(a.type, t.memoizedProps);
            t = t.memoizedState;
            try {
              l.componentDidUpdate(u, t, l.__reactInternalSnapshotBeforeUpdate);
            } catch (i) {
              dl(a, a.return, i);
            }
          }
        e & 64 && Zo(a), e & 512 && eu(a, a.return);
        break;
      case 3:
        if ((Kt(l, a), e & 64 && ((l = a.updateQueue), l !== null))) {
          if (((t = null), a.child !== null))
            switch (a.child.tag) {
              case 27:
              case 5:
                t = a.child.stateNode;
                break;
              case 1:
                t = a.child.stateNode;
            }
          try {
            Ds(l, t);
          } catch (i) {
            dl(a, a.return, i);
          }
        }
        break;
      case 27:
        t === null && e & 4 && Jo(a);
      case 26:
      case 5:
        Kt(l, a), t === null && e & 4 && Lo(a), e & 512 && eu(a, a.return);
        break;
      case 12:
        Kt(l, a);
        break;
      case 31:
        Kt(l, a), e & 4 && Fo(l, a);
        break;
      case 13:
        Kt(l, a),
          e & 4 && Io(l, a),
          e & 64 &&
            ((l = a.memoizedState),
            l !== null && ((l = l.dehydrated), l !== null && ((a = iv.bind(null, a)), Nv(l, a))));
        break;
      case 22:
        if (((e = a.memoizedState !== null || Vt), !e)) {
          (t = (t !== null && t.memoizedState !== null) || Dl), (u = Vt);
          var n = Dl;
          (Vt = e),
            (Dl = t) && !n ? Jt(l, a, (a.subtreeFlags & 8772) !== 0) : Kt(l, a),
            (Vt = u),
            (Dl = n);
        }
        break;
      case 30:
        break;
      default:
        Kt(l, a);
    }
  }
  function $o(l) {
    var t = l.alternate;
    t !== null && ((l.alternate = null), $o(t)),
      (l.child = null),
      (l.deletions = null),
      (l.sibling = null),
      l.tag === 5 && ((t = l.stateNode), t !== null && kn(t)),
      (l.stateNode = null),
      (l.return = null),
      (l.dependencies = null),
      (l.memoizedProps = null),
      (l.memoizedState = null),
      (l.pendingProps = null),
      (l.stateNode = null),
      (l.updateQueue = null);
  }
  var Tl = null,
    Fl = !1;
  function Lt(l, t, a) {
    for (a = a.child; a !== null; ) ko(l, t, a), (a = a.sibling);
  }
  function ko(l, t, a) {
    if (et && typeof et.onCommitFiberUnmount == "function")
      try {
        et.onCommitFiberUnmount(xe, a);
      } catch {}
    switch (a.tag) {
      case 26:
        Dl || Mt(a, t),
          Lt(l, t, a),
          a.memoizedState
            ? a.memoizedState.count--
            : a.stateNode && ((a = a.stateNode), a.parentNode.removeChild(a));
        break;
      case 27:
        Dl || Mt(a, t);
        var e = Tl,
          u = Fl;
        ha(a.type) && ((Tl = a.stateNode), (Fl = !1)),
          Lt(l, t, a),
          ru(a.stateNode),
          (Tl = e),
          (Fl = u);
        break;
      case 5:
        Dl || Mt(a, t);
      case 6:
        if (((e = Tl), (u = Fl), (Tl = null), Lt(l, t, a), (Tl = e), (Fl = u), Tl !== null))
          if (Fl)
            try {
              (Tl.nodeType === 9
                ? Tl.body
                : Tl.nodeName === "HTML"
                  ? Tl.ownerDocument.body
                  : Tl
              ).removeChild(a.stateNode);
            } catch (n) {
              dl(a, t, n);
            }
          else
            try {
              Tl.removeChild(a.stateNode);
            } catch (n) {
              dl(a, t, n);
            }
        break;
      case 18:
        Tl !== null &&
          (Fl
            ? ((l = Tl),
              Zd(
                l.nodeType === 9 ? l.body : l.nodeName === "HTML" ? l.ownerDocument.body : l,
                a.stateNode,
              ),
              _e(l))
            : Zd(Tl, a.stateNode));
        break;
      case 4:
        (e = Tl),
          (u = Fl),
          (Tl = a.stateNode.containerInfo),
          (Fl = !0),
          Lt(l, t, a),
          (Tl = e),
          (Fl = u);
        break;
      case 0:
      case 11:
      case 14:
      case 15:
        fa(2, a, t), Dl || fa(4, a, t), Lt(l, t, a);
        break;
      case 1:
        Dl ||
          (Mt(a, t), (e = a.stateNode), typeof e.componentWillUnmount == "function" && Vo(a, t, e)),
          Lt(l, t, a);
        break;
      case 21:
        Lt(l, t, a);
        break;
      case 22:
        (Dl = (e = Dl) || a.memoizedState !== null), Lt(l, t, a), (Dl = e);
        break;
      default:
        Lt(l, t, a);
    }
  }
  function Fo(l, t) {
    if (
      t.memoizedState === null &&
      ((l = t.alternate), l !== null && ((l = l.memoizedState), l !== null))
    ) {
      l = l.dehydrated;
      try {
        _e(l);
      } catch (a) {
        dl(t, t.return, a);
      }
    }
  }
  function Io(l, t) {
    if (
      t.memoizedState === null &&
      ((l = t.alternate),
      l !== null && ((l = l.memoizedState), l !== null && ((l = l.dehydrated), l !== null)))
    )
      try {
        _e(l);
      } catch (a) {
        dl(t, t.return, a);
      }
  }
  function Im(l) {
    switch (l.tag) {
      case 31:
      case 13:
      case 19:
        var t = l.stateNode;
        return t === null && (t = l.stateNode = new wo()), t;
      case 22:
        return (
          (l = l.stateNode), (t = l._retryCache), t === null && (t = l._retryCache = new wo()), t
        );
      default:
        throw Error(s(435, l.tag));
    }
  }
  function mn(l, t) {
    var a = Im(l);
    t.forEach((e) => {
      if (!a.has(e)) {
        a.add(e);
        var u = cv.bind(null, l, e);
        e.then(u, u);
      }
    });
  }
  function Il(l, t) {
    var a = t.deletions;
    if (a !== null)
      for (var e = 0; e < a.length; e++) {
        var u = a[e],
          n = l,
          i = t,
          c = i;
        l: while (c !== null) {
          switch (c.tag) {
            case 27:
              if (ha(c.type)) {
                (Tl = c.stateNode), (Fl = !1);
                break l;
              }
              break;
            case 5:
              (Tl = c.stateNode), (Fl = !1);
              break l;
            case 3:
            case 4:
              (Tl = c.stateNode.containerInfo), (Fl = !0);
              break l;
          }
          c = c.return;
        }
        if (Tl === null) throw Error(s(160));
        ko(n, i, u),
          (Tl = null),
          (Fl = !1),
          (n = u.alternate),
          n !== null && (n.return = null),
          (u.return = null);
      }
    if (t.subtreeFlags & 13886) for (t = t.child; t !== null; ) Po(t, l), (t = t.sibling);
  }
  var At = null;
  function Po(l, t) {
    var a = l.alternate,
      e = l.flags;
    switch (l.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        Il(t, l), Pl(l), e & 4 && (fa(3, l, l.return), au(3, l), fa(5, l, l.return));
        break;
      case 1:
        Il(t, l),
          Pl(l),
          e & 512 && (Dl || a === null || Mt(a, a.return)),
          e & 64 &&
            Vt &&
            ((l = l.updateQueue),
            l !== null &&
              ((e = l.callbacks),
              e !== null &&
                ((a = l.shared.hiddenCallbacks),
                (l.shared.hiddenCallbacks = a === null ? e : a.concat(e)))));
        break;
      case 26:
        var u = At;
        if ((Il(t, l), Pl(l), e & 512 && (Dl || a === null || Mt(a, a.return)), e & 4)) {
          var n = a !== null ? a.memoizedState : null;
          if (((e = l.memoizedState), a === null))
            if (e === null)
              if (l.stateNode === null) {
                l: {
                  (e = l.type), (a = l.memoizedProps), (u = u.ownerDocument || u);
                  t: switch (e) {
                    case "title":
                      (n = u.getElementsByTagName("title")[0]),
                        (!n ||
                          n[Oe] ||
                          n[ql] ||
                          n.namespaceURI === "http://www.w3.org/2000/svg" ||
                          n.hasAttribute("itemprop")) &&
                          ((n = u.createElement(e)),
                          u.head.insertBefore(n, u.querySelector("head > title"))),
                        Xl(n, e, a),
                        (n[ql] = l),
                        Hl(n),
                        (e = n);
                      break l;
                    case "link":
                      var i = Pd("link", "href", u).get(e + (a.href || ""));
                      if (i) {
                        for (var c = 0; c < i.length; c++)
                          if (
                            ((n = i[c]),
                            n.getAttribute("href") ===
                              (a.href == null || a.href === "" ? null : a.href) &&
                              n.getAttribute("rel") === (a.rel == null ? null : a.rel) &&
                              n.getAttribute("title") === (a.title == null ? null : a.title) &&
                              n.getAttribute("crossorigin") ===
                                (a.crossOrigin == null ? null : a.crossOrigin))
                          ) {
                            i.splice(c, 1);
                            break t;
                          }
                      }
                      (n = u.createElement(e)), Xl(n, e, a), u.head.appendChild(n);
                      break;
                    case "meta":
                      if ((i = Pd("meta", "content", u).get(e + (a.content || "")))) {
                        for (c = 0; c < i.length; c++)
                          if (
                            ((n = i[c]),
                            n.getAttribute("content") ===
                              (a.content == null ? null : "" + a.content) &&
                              n.getAttribute("name") === (a.name == null ? null : a.name) &&
                              n.getAttribute("property") ===
                                (a.property == null ? null : a.property) &&
                              n.getAttribute("http-equiv") ===
                                (a.httpEquiv == null ? null : a.httpEquiv) &&
                              n.getAttribute("charset") === (a.charSet == null ? null : a.charSet))
                          ) {
                            i.splice(c, 1);
                            break t;
                          }
                      }
                      (n = u.createElement(e)), Xl(n, e, a), u.head.appendChild(n);
                      break;
                    default:
                      throw Error(s(468, e));
                  }
                  (n[ql] = l), Hl(n), (e = n);
                }
                l.stateNode = e;
              } else lr(u, l.type, l.stateNode);
            else l.stateNode = Id(u, e, l.memoizedProps);
          else
            n !== e
              ? (n === null
                  ? a.stateNode !== null && ((a = a.stateNode), a.parentNode.removeChild(a))
                  : n.count--,
                e === null ? lr(u, l.type, l.stateNode) : Id(u, e, l.memoizedProps))
              : e === null && l.stateNode !== null && gc(l, l.memoizedProps, a.memoizedProps);
        }
        break;
      case 27:
        Il(t, l),
          Pl(l),
          e & 512 && (Dl || a === null || Mt(a, a.return)),
          a !== null && e & 4 && gc(l, l.memoizedProps, a.memoizedProps);
        break;
      case 5:
        if ((Il(t, l), Pl(l), e & 512 && (Dl || a === null || Mt(a, a.return)), l.flags & 32)) {
          u = l.stateNode;
          try {
            Wa(u, "");
          } catch (U) {
            dl(l, l.return, U);
          }
        }
        e & 4 &&
          l.stateNode != null &&
          ((u = l.memoizedProps), gc(l, u, a !== null ? a.memoizedProps : u)),
          e & 1024 && (Sc = !0);
        break;
      case 6:
        if ((Il(t, l), Pl(l), e & 4)) {
          if (l.stateNode === null) throw Error(s(162));
          (e = l.memoizedProps), (a = l.stateNode);
          try {
            a.nodeValue = e;
          } catch (U) {
            dl(l, l.return, U);
          }
        }
        break;
      case 3:
        if (
          ((Mn = null),
          (u = At),
          (At = xn(t.containerInfo)),
          Il(t, l),
          (At = u),
          Pl(l),
          e & 4 && a !== null && a.memoizedState.isDehydrated)
        )
          try {
            _e(t.containerInfo);
          } catch (U) {
            dl(l, l.return, U);
          }
        Sc && ((Sc = !1), ld(l));
        break;
      case 4:
        (e = At), (At = xn(l.stateNode.containerInfo)), Il(t, l), Pl(l), (At = e);
        break;
      case 12:
        Il(t, l), Pl(l);
        break;
      case 31:
        Il(t, l),
          Pl(l),
          e & 4 && ((e = l.updateQueue), e !== null && ((l.updateQueue = null), mn(l, e)));
        break;
      case 13:
        Il(t, l),
          Pl(l),
          l.child.flags & 8192 &&
            (l.memoizedState !== null) != (a !== null && a.memoizedState !== null) &&
            (hn = at()),
          e & 4 && ((e = l.updateQueue), e !== null && ((l.updateQueue = null), mn(l, e)));
        break;
      case 22:
        u = l.memoizedState !== null;
        var f = a !== null && a.memoizedState !== null,
          h = Vt,
          b = Dl;
        if (((Vt = h || u), (Dl = b || f), Il(t, l), (Dl = b), (Vt = h), Pl(l), e & 8192))
          l: for (
            t = l.stateNode,
              t._visibility = u ? t._visibility & -2 : t._visibility | 1,
              u && (a === null || f || Vt || Dl || Ga(l)),
              a = null,
              t = l;
            ;
          ) {
            if (t.tag === 5 || t.tag === 26) {
              if (a === null) {
                f = a = t;
                try {
                  if (((n = f.stateNode), u))
                    (i = n.style),
                      typeof i.setProperty == "function"
                        ? i.setProperty("display", "none", "important")
                        : (i.display = "none");
                  else {
                    c = f.stateNode;
                    var T = f.memoizedProps.style,
                      y = T != null && T.hasOwnProperty("display") ? T.display : null;
                    c.style.display = y == null || typeof y == "boolean" ? "" : ("" + y).trim();
                  }
                } catch (U) {
                  dl(f, f.return, U);
                }
              }
            } else if (t.tag === 6) {
              if (a === null) {
                f = t;
                try {
                  f.stateNode.nodeValue = u ? "" : f.memoizedProps;
                } catch (U) {
                  dl(f, f.return, U);
                }
              }
            } else if (t.tag === 18) {
              if (a === null) {
                f = t;
                try {
                  var p = f.stateNode;
                  u ? Vd(p, !0) : Vd(f.stateNode, !1);
                } catch (U) {
                  dl(f, f.return, U);
                }
              }
            } else if (
              ((t.tag !== 22 && t.tag !== 23) || t.memoizedState === null || t === l) &&
              t.child !== null
            ) {
              (t.child.return = t), (t = t.child);
              continue;
            }
            if (t === l) break;
            while (t.sibling === null) {
              if (t.return === null || t.return === l) break l;
              a === t && (a = null), (t = t.return);
            }
            a === t && (a = null), (t.sibling.return = t.return), (t = t.sibling);
          }
        e & 4 &&
          ((e = l.updateQueue),
          e !== null && ((a = e.retryQueue), a !== null && ((e.retryQueue = null), mn(l, a))));
        break;
      case 19:
        Il(t, l),
          Pl(l),
          e & 4 && ((e = l.updateQueue), e !== null && ((l.updateQueue = null), mn(l, e)));
        break;
      case 30:
        break;
      case 21:
        break;
      default:
        Il(t, l), Pl(l);
    }
  }
  function Pl(l) {
    var t = l.flags;
    if (t & 2) {
      try {
        for (var a, e = l.return; e !== null; ) {
          if (Ko(e)) {
            a = e;
            break;
          }
          e = e.return;
        }
        if (a == null) throw Error(s(160));
        switch (a.tag) {
          case 27:
            var u = a.stateNode,
              n = pc(l);
            rn(l, n, u);
            break;
          case 5:
            var i = a.stateNode;
            a.flags & 32 && (Wa(i, ""), (a.flags &= -33));
            var c = pc(l);
            rn(l, c, i);
            break;
          case 3:
          case 4:
            var f = a.stateNode.containerInfo,
              h = pc(l);
            bc(l, h, f);
            break;
          default:
            throw Error(s(161));
        }
      } catch (b) {
        dl(l, l.return, b);
      }
      l.flags &= -3;
    }
    t & 4096 && (l.flags &= -4097);
  }
  function ld(l) {
    if (l.subtreeFlags & 1024)
      for (l = l.child; l !== null; ) {
        var t = l;
        ld(t), t.tag === 5 && t.flags & 1024 && t.stateNode.reset(), (l = l.sibling);
      }
  }
  function Kt(l, t) {
    if (t.subtreeFlags & 8772)
      for (t = t.child; t !== null; ) Wo(l, t.alternate, t), (t = t.sibling);
  }
  function Ga(l) {
    for (l = l.child; l !== null; ) {
      var t = l;
      switch (t.tag) {
        case 0:
        case 11:
        case 14:
        case 15:
          fa(4, t, t.return), Ga(t);
          break;
        case 1:
          Mt(t, t.return);
          var a = t.stateNode;
          typeof a.componentWillUnmount == "function" && Vo(t, t.return, a), Ga(t);
          break;
        case 27:
          ru(t.stateNode);
        case 26:
        case 5:
          Mt(t, t.return), Ga(t);
          break;
        case 22:
          t.memoizedState === null && Ga(t);
          break;
        case 30:
          Ga(t);
          break;
        default:
          Ga(t);
      }
      l = l.sibling;
    }
  }
  function Jt(l, t, a) {
    for (a = a && (t.subtreeFlags & 8772) !== 0, t = t.child; t !== null; ) {
      var e = t.alternate,
        u = l,
        n = t,
        i = n.flags;
      switch (n.tag) {
        case 0:
        case 11:
        case 15:
          Jt(u, n, a), au(4, n);
          break;
        case 1:
          if ((Jt(u, n, a), (e = n), (u = e.stateNode), typeof u.componentDidMount == "function"))
            try {
              u.componentDidMount();
            } catch (h) {
              dl(e, e.return, h);
            }
          if (((e = n), (u = e.updateQueue), u !== null)) {
            var c = e.stateNode;
            try {
              var f = u.shared.hiddenCallbacks;
              if (f !== null)
                for (u.shared.hiddenCallbacks = null, u = 0; u < f.length; u++) Os(f[u], c);
            } catch (h) {
              dl(e, e.return, h);
            }
          }
          a && i & 64 && Zo(n), eu(n, n.return);
          break;
        case 27:
          Jo(n);
        case 26:
        case 5:
          Jt(u, n, a), a && e === null && i & 4 && Lo(n), eu(n, n.return);
          break;
        case 12:
          Jt(u, n, a);
          break;
        case 31:
          Jt(u, n, a), a && i & 4 && Fo(u, n);
          break;
        case 13:
          Jt(u, n, a), a && i & 4 && Io(u, n);
          break;
        case 22:
          n.memoizedState === null && Jt(u, n, a), eu(n, n.return);
          break;
        case 30:
          break;
        default:
          Jt(u, n, a);
      }
      t = t.sibling;
    }
  }
  function zc(l, t) {
    var a = null;
    l !== null &&
      l.memoizedState !== null &&
      l.memoizedState.cachePool !== null &&
      (a = l.memoizedState.cachePool.pool),
      (l = null),
      t.memoizedState !== null &&
        t.memoizedState.cachePool !== null &&
        (l = t.memoizedState.cachePool.pool),
      l !== a && (l != null && l.refCount++, a != null && Ve(a));
  }
  function Tc(l, t) {
    (l = null),
      t.alternate !== null && (l = t.alternate.memoizedState.cache),
      (t = t.memoizedState.cache),
      t !== l && (t.refCount++, l != null && Ve(l));
  }
  function _t(l, t, a, e) {
    if (t.subtreeFlags & 10256) for (t = t.child; t !== null; ) td(l, t, a, e), (t = t.sibling);
  }
  function td(l, t, a, e) {
    var u = t.flags;
    switch (t.tag) {
      case 0:
      case 11:
      case 15:
        _t(l, t, a, e), u & 2048 && au(9, t);
        break;
      case 1:
        _t(l, t, a, e);
        break;
      case 3:
        _t(l, t, a, e),
          u & 2048 &&
            ((l = null),
            t.alternate !== null && (l = t.alternate.memoizedState.cache),
            (t = t.memoizedState.cache),
            t !== l && (t.refCount++, l != null && Ve(l)));
        break;
      case 12:
        if (u & 2048) {
          _t(l, t, a, e), (l = t.stateNode);
          try {
            var n = t.memoizedProps,
              i = n.id,
              c = n.onPostCommit;
            typeof c == "function" &&
              c(i, t.alternate === null ? "mount" : "update", l.passiveEffectDuration, -0);
          } catch (f) {
            dl(t, t.return, f);
          }
        } else _t(l, t, a, e);
        break;
      case 31:
        _t(l, t, a, e);
        break;
      case 13:
        _t(l, t, a, e);
        break;
      case 23:
        break;
      case 22:
        (n = t.stateNode),
          (i = t.alternate),
          t.memoizedState !== null
            ? n._visibility & 2
              ? _t(l, t, a, e)
              : uu(l, t)
            : n._visibility & 2
              ? _t(l, t, a, e)
              : ((n._visibility |= 2), ve(l, t, a, e, (t.subtreeFlags & 10256) !== 0 || !1)),
          u & 2048 && zc(i, t);
        break;
      case 24:
        _t(l, t, a, e), u & 2048 && Tc(t.alternate, t);
        break;
      default:
        _t(l, t, a, e);
    }
  }
  function ve(l, t, a, e, u) {
    for (u = u && ((t.subtreeFlags & 10256) !== 0 || !1), t = t.child; t !== null; ) {
      var n = l,
        i = t,
        c = a,
        f = e,
        h = i.flags;
      switch (i.tag) {
        case 0:
        case 11:
        case 15:
          ve(n, i, c, f, u), au(8, i);
          break;
        case 23:
          break;
        case 22:
          var b = i.stateNode;
          i.memoizedState !== null
            ? b._visibility & 2
              ? ve(n, i, c, f, u)
              : uu(n, i)
            : ((b._visibility |= 2), ve(n, i, c, f, u)),
            u && h & 2048 && zc(i.alternate, i);
          break;
        case 24:
          ve(n, i, c, f, u), u && h & 2048 && Tc(i.alternate, i);
          break;
        default:
          ve(n, i, c, f, u);
      }
      t = t.sibling;
    }
  }
  function uu(l, t) {
    if (t.subtreeFlags & 10256)
      for (t = t.child; t !== null; ) {
        var a = l,
          e = t,
          u = e.flags;
        switch (e.tag) {
          case 22:
            uu(a, e), u & 2048 && zc(e.alternate, e);
            break;
          case 24:
            uu(a, e), u & 2048 && Tc(e.alternate, e);
            break;
          default:
            uu(a, e);
        }
        t = t.sibling;
      }
  }
  var nu = 8192;
  function he(l, t, a) {
    if (l.subtreeFlags & nu) for (l = l.child; l !== null; ) ad(l, t, a), (l = l.sibling);
  }
  function ad(l, t, a) {
    switch (l.tag) {
      case 26:
        he(l, t, a),
          l.flags & nu && l.memoizedState !== null && Yv(a, At, l.memoizedState, l.memoizedProps);
        break;
      case 5:
        he(l, t, a);
        break;
      case 3:
      case 4:
        var e = At;
        (At = xn(l.stateNode.containerInfo)), he(l, t, a), (At = e);
        break;
      case 22:
        l.memoizedState === null &&
          ((e = l.alternate),
          e !== null && e.memoizedState !== null
            ? ((e = nu), (nu = 16777216), he(l, t, a), (nu = e))
            : he(l, t, a));
        break;
      default:
        he(l, t, a);
    }
  }
  function ed(l) {
    var t = l.alternate;
    if (t !== null && ((l = t.child), l !== null)) {
      t.child = null;
      do (t = l.sibling), (l.sibling = null), (l = t);
      while (l !== null);
    }
  }
  function iu(l) {
    var t = l.deletions;
    if ((l.flags & 16) !== 0) {
      if (t !== null)
        for (var a = 0; a < t.length; a++) {
          var e = t[a];
          (Rl = e), nd(e, l);
        }
      ed(l);
    }
    if (l.subtreeFlags & 10256) for (l = l.child; l !== null; ) ud(l), (l = l.sibling);
  }
  function ud(l) {
    switch (l.tag) {
      case 0:
      case 11:
      case 15:
        iu(l), l.flags & 2048 && fa(9, l, l.return);
        break;
      case 3:
        iu(l);
        break;
      case 12:
        iu(l);
        break;
      case 22:
        var t = l.stateNode;
        l.memoizedState !== null && t._visibility & 2 && (l.return === null || l.return.tag !== 13)
          ? ((t._visibility &= -3), vn(l))
          : iu(l);
        break;
      default:
        iu(l);
    }
  }
  function vn(l) {
    var t = l.deletions;
    if ((l.flags & 16) !== 0) {
      if (t !== null)
        for (var a = 0; a < t.length; a++) {
          var e = t[a];
          (Rl = e), nd(e, l);
        }
      ed(l);
    }
    for (l = l.child; l !== null; ) {
      switch (((t = l), t.tag)) {
        case 0:
        case 11:
        case 15:
          fa(8, t, t.return), vn(t);
          break;
        case 22:
          (a = t.stateNode), a._visibility & 2 && ((a._visibility &= -3), vn(t));
          break;
        default:
          vn(t);
      }
      l = l.sibling;
    }
  }
  function nd(l, t) {
    while (Rl !== null) {
      var a = Rl;
      switch (a.tag) {
        case 0:
        case 11:
        case 15:
          fa(8, a, t);
          break;
        case 23:
        case 22:
          if (a.memoizedState !== null && a.memoizedState.cachePool !== null) {
            var e = a.memoizedState.cachePool.pool;
            e != null && e.refCount++;
          }
          break;
        case 24:
          Ve(a.memoizedState.cache);
      }
      if (((e = a.child), e !== null)) (e.return = a), (Rl = e);
      else
        for (a = l; Rl !== null; ) {
          e = Rl;
          var u = e.sibling,
            n = e.return;
          if (($o(e), e === a)) {
            Rl = null;
            break;
          }
          if (u !== null) {
            (u.return = n), (Rl = u);
            break;
          }
          Rl = n;
        }
    }
  }
  var Pm = {
      getCacheForType: (l) => {
        var t = Yl(jl),
          a = t.data.get(l);
        return a === void 0 && ((a = l()), t.data.set(l, a)), a;
      },
      cacheSignal: () => Yl(jl).controller.signal,
    },
    lv = typeof WeakMap == "function" ? WeakMap : Map,
    nl = 0,
    pl = null,
    $ = null,
    F = 0,
    ol = 0,
    st = null,
    sa = !1,
    ye = !1,
    Ec = !1,
    wt = 0,
    Al = 0,
    oa = 0,
    Xa = 0,
    Ac = 0,
    ot = 0,
    ge = 0,
    cu = null,
    lt = null,
    _c = !1,
    hn = 0,
    id = 0,
    yn = 1 / 0,
    gn = null,
    da = null,
    Cl = 0,
    ra = null,
    pe = null,
    Wt = 0,
    Nc = 0,
    xc = null,
    cd = null,
    fu = 0,
    jc = null;
  function dt() {
    return (nl & 2) !== 0 && F !== 0 ? F & -F : S.T !== null ? Hc() : Tf();
  }
  function fd() {
    if (ot === 0)
      if ((F & 536870912) === 0 || tl) {
        var l = Au;
        (Au <<= 1), (Au & 3932160) === 0 && (Au = 262144), (ot = l);
      } else ot = 536870912;
    return (l = ct.current), l !== null && (l.flags |= 32), ot;
  }
  function tt(l, t, a) {
    ((l === pl && (ol === 2 || ol === 9)) || l.cancelPendingCommit !== null) &&
      (be(l, 0), ma(l, F, ot, !1)),
      Me(l, a),
      ((nl & 2) === 0 || l !== pl) &&
        (l === pl && ((nl & 2) === 0 && (Xa |= a), Al === 4 && ma(l, F, ot, !1)), Ot(l));
  }
  function sd(l, t, a) {
    if ((nl & 6) !== 0) throw Error(s(327));
    var e = (!a && (t & 127) === 0 && (t & l.expiredLanes) === 0) || je(l, t),
      u = e ? ev(l, t) : Oc(l, t, !0),
      n = e;
    do {
      if (u === 0) {
        ye && !e && ma(l, t, 0, !1);
        break;
      } else {
        if (((a = l.current.alternate), n && !tv(a))) {
          (u = Oc(l, t, !1)), (n = !1);
          continue;
        }
        if (u === 2) {
          if (((n = t), l.errorRecoveryDisabledLanes & n)) var i = 0;
          else (i = l.pendingLanes & -536870913), (i = i !== 0 ? i : i & 536870912 ? 536870912 : 0);
          if (i !== 0) {
            t = i;
            l: {
              var c = l;
              u = cu;
              var f = c.current.memoizedState.isDehydrated;
              if ((f && (be(c, i).flags |= 256), (i = Oc(c, i, !1)), i !== 2)) {
                if (Ec && !f) {
                  (c.errorRecoveryDisabledLanes |= n), (Xa |= n), (u = 4);
                  break l;
                }
                (n = lt), (lt = u), n !== null && (lt === null ? (lt = n) : lt.push.apply(lt, n));
              }
              u = i;
            }
            if (((n = !1), u !== 2)) continue;
          }
        }
        if (u === 1) {
          be(l, 0), ma(l, t, 0, !0);
          break;
        }
        l: {
          switch (((e = l), (n = u), n)) {
            case 0:
            case 1:
              throw Error(s(345));
            case 4:
              if ((t & 4194048) !== t) break;
            case 6:
              ma(e, t, ot, !sa);
              break l;
            case 2:
              lt = null;
              break;
            case 3:
            case 5:
              break;
            default:
              throw Error(s(329));
          }
          if ((t & 62914560) === t && ((u = hn + 300 - at()), 10 < u)) {
            if ((ma(e, t, ot, !sa), Nu(e, 0, !0) !== 0)) break l;
            (Wt = t),
              (e.timeoutHandle = Xd(
                od.bind(null, e, a, lt, gn, _c, t, ot, Xa, ge, sa, n, "Throttled", -0, 0),
                u,
              ));
            break l;
          }
          od(e, a, lt, gn, _c, t, ot, Xa, ge, sa, n, null, -0, 0);
        }
      }
      break;
    } while (!0);
    Ot(l);
  }
  function od(l, t, a, e, u, n, i, c, f, h, b, T, y, p) {
    if (((l.timeoutHandle = -1), (T = t.subtreeFlags), T & 8192 || (T & 16785408) === 16785408)) {
      (T = {
        stylesheets: null,
        count: 0,
        imgCount: 0,
        imgBytes: 0,
        suspenseyImages: [],
        waitingForImages: !0,
        waitingForViewTransition: !1,
        unsuspend: Ct,
      }),
        ad(t, n, T);
      var U = (n & 62914560) === n ? hn - at() : (n & 4194048) === n ? id - at() : 0;
      if (((U = Gv(T, U)), U !== null)) {
        (Wt = n),
          (l.cancelPendingCommit = U(pd.bind(null, l, t, n, a, e, u, i, c, f, b, T, null, y, p))),
          ma(l, n, i, !h);
        return;
      }
    }
    pd(l, t, n, a, e, u, i, c, f);
  }
  function tv(l) {
    for (var t = l; ; ) {
      var a = t.tag;
      if (
        (a === 0 || a === 11 || a === 15) &&
        t.flags & 16384 &&
        ((a = t.updateQueue), a !== null && ((a = a.stores), a !== null))
      )
        for (var e = 0; e < a.length; e++) {
          var u = a[e],
            n = u.getSnapshot;
          u = u.value;
          try {
            if (!nt(n(), u)) return !1;
          } catch {
            return !1;
          }
        }
      if (((a = t.child), t.subtreeFlags & 16384 && a !== null)) (a.return = t), (t = a);
      else {
        if (t === l) break;
        while (t.sibling === null) {
          if (t.return === null || t.return === l) return !0;
          t = t.return;
        }
        (t.sibling.return = t.return), (t = t.sibling);
      }
    }
    return !0;
  }
  function ma(l, t, a, e) {
    (t &= ~Ac),
      (t &= ~Xa),
      (l.suspendedLanes |= t),
      (l.pingedLanes &= ~t),
      e && (l.warmLanes |= t),
      (e = l.expirationTimes);
    for (var u = t; 0 < u; ) {
      var n = 31 - ut(u),
        i = 1 << n;
      (e[n] = -1), (u &= ~i);
    }
    a !== 0 && bf(l, a, t);
  }
  function pn() {
    return (nl & 6) === 0 ? (su(0), !1) : !0;
  }
  function Mc() {
    if ($ !== null) {
      if (ol === 0) var l = $.return;
      else (l = $), (Bt = Da = null), Ki(l), (se = null), (Ke = 0), (l = $);
      while (l !== null) Qo(l.alternate, l), (l = l.return);
      $ = null;
    }
  }
  function be(l, t) {
    var a = l.timeoutHandle;
    a !== -1 && ((l.timeoutHandle = -1), zv(a)),
      (a = l.cancelPendingCommit),
      a !== null && ((l.cancelPendingCommit = null), a()),
      (Wt = 0),
      Mc(),
      (pl = l),
      ($ = a = Rt(l.current, null)),
      (F = t),
      (ol = 0),
      (st = null),
      (sa = !1),
      (ye = je(l, t)),
      (Ec = !1),
      (ge = ot = Ac = Xa = oa = Al = 0),
      (lt = cu = null),
      (_c = !1),
      (t & 8) !== 0 && (t |= t & 32);
    var e = l.entangledLanes;
    if (e !== 0)
      for (l = l.entanglements, e &= t; 0 < e; ) {
        var u = 31 - ut(e),
          n = 1 << u;
        (t |= l[u]), (e &= ~n);
      }
    return (wt = t), Yu(), a;
  }
  function dd(l, t) {
    (K = null),
      (S.H = Pe),
      t === fe || t === Ju
        ? ((t = Ns()), (ol = 3))
        : t === Ci
          ? ((t = Ns()), (ol = 4))
          : (ol =
              t === cc
                ? 8
                : t !== null && typeof t == "object" && typeof t.then == "function"
                  ? 6
                  : 1),
      (st = t),
      $ === null && ((Al = 1), cn(l, ht(t, l.current)));
  }
  function rd() {
    var l = ct.current;
    return l === null
      ? !0
      : (F & 4194048) === F
        ? bt === null
        : (F & 62914560) === F || (F & 536870912) !== 0
          ? l === bt
          : !1;
  }
  function md() {
    var l = S.H;
    return (S.H = Pe), l === null ? Pe : l;
  }
  function vd() {
    var l = S.A;
    return (S.A = Pm), l;
  }
  function bn() {
    (Al = 4),
      sa || ((F & 4194048) !== F && ct.current !== null) || (ye = !0),
      ((oa & 134217727) === 0 && (Xa & 134217727) === 0) || pl === null || ma(pl, F, ot, !1);
  }
  function Oc(l, t, a) {
    var e = nl;
    nl |= 2;
    var u = md(),
      n = vd();
    (pl !== l || F !== t) && ((gn = null), be(l, t)), (t = !1);
    var i = Al;
    l: do
      try {
        if (ol !== 0 && $ !== null) {
          var c = $,
            f = st;
          switch (ol) {
            case 8:
              Mc(), (i = 6);
              break l;
            case 3:
            case 2:
            case 9:
            case 6:
              ct.current === null && (t = !0);
              var h = ol;
              if (((ol = 0), (st = null), Se(l, c, f, h), a && ye)) {
                i = 0;
                break l;
              }
              break;
            default:
              (h = ol), (ol = 0), (st = null), Se(l, c, f, h);
          }
        }
        av(), (i = Al);
        break;
      } catch (b) {
        dd(l, b);
      }
    while (!0);
    return (
      t && l.shellSuspendCounter++,
      (Bt = Da = null),
      (nl = e),
      (S.H = u),
      (S.A = n),
      $ === null && ((pl = null), (F = 0), Yu()),
      i
    );
  }
  function av() {
    while ($ !== null) hd($);
  }
  function ev(l, t) {
    var a = nl;
    nl |= 2;
    var e = md(),
      u = vd();
    pl !== l || F !== t ? ((gn = null), (yn = at() + 500), be(l, t)) : (ye = je(l, t));
    l: do
      try {
        if (ol !== 0 && $ !== null) {
          t = $;
          var n = st;
          t: switch (ol) {
            case 1:
              (ol = 0), (st = null), Se(l, t, n, 1);
              break;
            case 2:
            case 9:
              if (As(n)) {
                (ol = 0), (st = null), yd(t);
                break;
              }
              (t = () => {
                (ol !== 2 && ol !== 9) || pl !== l || (ol = 7), Ot(l);
              }),
                n.then(t, t);
              break l;
            case 3:
              ol = 7;
              break l;
            case 4:
              ol = 5;
              break l;
            case 7:
              As(n) ? ((ol = 0), (st = null), yd(t)) : ((ol = 0), (st = null), Se(l, t, n, 7));
              break;
            case 5:
              var i = null;
              switch ($.tag) {
                case 26:
                  i = $.memoizedState;
                case 5:
                case 27:
                  var c = $;
                  if (i ? tr(i) : c.stateNode.complete) {
                    (ol = 0), (st = null);
                    var f = c.sibling;
                    if (f !== null) $ = f;
                    else {
                      var h = c.return;
                      h !== null ? (($ = h), Sn(h)) : ($ = null);
                    }
                    break t;
                  }
              }
              (ol = 0), (st = null), Se(l, t, n, 5);
              break;
            case 6:
              (ol = 0), (st = null), Se(l, t, n, 6);
              break;
            case 8:
              Mc(), (Al = 6);
              break l;
            default:
              throw Error(s(462));
          }
        }
        uv();
        break;
      } catch (b) {
        dd(l, b);
      }
    while (!0);
    return (
      (Bt = Da = null),
      (S.H = e),
      (S.A = u),
      (nl = a),
      $ !== null ? 0 : ((pl = null), (F = 0), Yu(), Al)
    );
  }
  function uv() {
    while ($ !== null && !xr()) hd($);
  }
  function hd(l) {
    var t = Go(l.alternate, l, wt);
    (l.memoizedProps = l.pendingProps), t === null ? Sn(l) : ($ = t);
  }
  function yd(l) {
    var t = l,
      a = t.alternate;
    switch (t.tag) {
      case 15:
      case 0:
        t = Co(a, t, t.pendingProps, t.type, void 0, F);
        break;
      case 11:
        t = Co(a, t, t.pendingProps, t.type.render, t.ref, F);
        break;
      case 5:
        Ki(t);
      default:
        Qo(a, t), (t = $ = ms(t, wt)), (t = Go(a, t, wt));
    }
    (l.memoizedProps = l.pendingProps), t === null ? Sn(l) : ($ = t);
  }
  function Se(l, t, a, e) {
    (Bt = Da = null), Ki(t), (se = null), (Ke = 0);
    var u = t.return;
    try {
      if (Jm(l, u, t, a, F)) {
        (Al = 1), cn(l, ht(a, l.current)), ($ = null);
        return;
      }
    } catch (n) {
      if (u !== null) throw (($ = u), n);
      (Al = 1), cn(l, ht(a, l.current)), ($ = null);
      return;
    }
    t.flags & 32768
      ? (tl || e === 1
          ? (l = !0)
          : ye || (F & 536870912) !== 0
            ? (l = !1)
            : ((sa = l = !0),
              (e === 2 || e === 9 || e === 3 || e === 6) &&
                ((e = ct.current), e !== null && e.tag === 13 && (e.flags |= 16384))),
        gd(t, l))
      : Sn(t);
  }
  function Sn(l) {
    var t = l;
    do {
      if ((t.flags & 32768) !== 0) {
        gd(t, sa);
        return;
      }
      l = t.return;
      var a = $m(t.alternate, t, wt);
      if (a !== null) {
        $ = a;
        return;
      }
      if (((t = t.sibling), t !== null)) {
        $ = t;
        return;
      }
      $ = t = l;
    } while (t !== null);
    Al === 0 && (Al = 5);
  }
  function gd(l, t) {
    do {
      var a = km(l.alternate, l);
      if (a !== null) {
        (a.flags &= 32767), ($ = a);
        return;
      }
      if (
        ((a = l.return),
        a !== null && ((a.flags |= 32768), (a.subtreeFlags = 0), (a.deletions = null)),
        !t && ((l = l.sibling), l !== null))
      ) {
        $ = l;
        return;
      }
      $ = l = a;
    } while (l !== null);
    (Al = 6), ($ = null);
  }
  function pd(l, t, a, e, u, n, i, c, f) {
    l.cancelPendingCommit = null;
    do zn();
    while (Cl !== 0);
    if ((nl & 6) !== 0) throw Error(s(327));
    if (t !== null) {
      if (t === l.current) throw Error(s(177));
      if (
        ((n = t.lanes | t.childLanes),
        (n |= pi),
        Br(l, a, n, i, c, f),
        l === pl && (($ = pl = null), (F = 0)),
        (pe = t),
        (ra = l),
        (Wt = a),
        (Nc = n),
        (xc = u),
        (cd = e),
        (t.subtreeFlags & 10256) !== 0 || (t.flags & 10256) !== 0
          ? ((l.callbackNode = null), (l.callbackPriority = 0), fv(Tu, () => (Ed(), null)))
          : ((l.callbackNode = null), (l.callbackPriority = 0)),
        (e = (t.flags & 13878) !== 0),
        (t.subtreeFlags & 13878) !== 0 || e)
      ) {
        (e = S.T), (S.T = null), (u = M.p), (M.p = 2), (i = nl), (nl |= 4);
        try {
          Fm(l, t, a);
        } finally {
          (nl = i), (M.p = u), (S.T = e);
        }
      }
      (Cl = 1), bd(), Sd(), zd();
    }
  }
  function bd() {
    if (Cl === 1) {
      Cl = 0;
      var l = ra,
        t = pe,
        a = (t.flags & 13878) !== 0;
      if ((t.subtreeFlags & 13878) !== 0 || a) {
        (a = S.T), (S.T = null);
        var e = M.p;
        M.p = 2;
        var u = nl;
        nl |= 4;
        try {
          Po(t, l);
          var n = Zc,
            i = us(l.containerInfo),
            c = n.focusedElem,
            f = n.selectionRange;
          if (i !== c && c && c.ownerDocument && es(c.ownerDocument.documentElement, c)) {
            if (f !== null && mi(c)) {
              var h = f.start,
                b = f.end;
              if ((b === void 0 && (b = h), "selectionStart" in c))
                (c.selectionStart = h), (c.selectionEnd = Math.min(b, c.value.length));
              else {
                var T = c.ownerDocument || document,
                  y = (T && T.defaultView) || window;
                if (y.getSelection) {
                  var p = y.getSelection(),
                    U = c.textContent.length,
                    G = Math.min(f.start, U),
                    yl = f.end === void 0 ? G : Math.min(f.end, U);
                  !p.extend && G > yl && ((i = yl), (yl = G), (G = i));
                  var m = as(c, G),
                    d = as(c, yl);
                  if (
                    m &&
                    d &&
                    (p.rangeCount !== 1 ||
                      p.anchorNode !== m.node ||
                      p.anchorOffset !== m.offset ||
                      p.focusNode !== d.node ||
                      p.focusOffset !== d.offset)
                  ) {
                    var v = T.createRange();
                    v.setStart(m.node, m.offset),
                      p.removeAllRanges(),
                      G > yl
                        ? (p.addRange(v), p.extend(d.node, d.offset))
                        : (v.setEnd(d.node, d.offset), p.addRange(v));
                  }
                }
              }
            }
            for (T = [], p = c; (p = p.parentNode); )
              p.nodeType === 1 &&
                T.push({
                  element: p,
                  left: p.scrollLeft,
                  top: p.scrollTop,
                });
            for (typeof c.focus == "function" && c.focus(), c = 0; c < T.length; c++) {
              var z = T[c];
              (z.element.scrollLeft = z.left), (z.element.scrollTop = z.top);
            }
          }
          (Cn = !!Qc), (Zc = Qc = null);
        } finally {
          (nl = u), (M.p = e), (S.T = a);
        }
      }
      (l.current = t), (Cl = 2);
    }
  }
  function Sd() {
    if (Cl === 2) {
      Cl = 0;
      var l = ra,
        t = pe,
        a = (t.flags & 8772) !== 0;
      if ((t.subtreeFlags & 8772) !== 0 || a) {
        (a = S.T), (S.T = null);
        var e = M.p;
        M.p = 2;
        var u = nl;
        nl |= 4;
        try {
          Wo(l, t.alternate, t);
        } finally {
          (nl = u), (M.p = e), (S.T = a);
        }
      }
      Cl = 3;
    }
  }
  function zd() {
    if (Cl === 4 || Cl === 3) {
      (Cl = 0), jr();
      var l = ra,
        t = pe,
        a = Wt,
        e = cd;
      (t.subtreeFlags & 10256) !== 0 || (t.flags & 10256) !== 0
        ? (Cl = 5)
        : ((Cl = 0), (pe = ra = null), Td(l, l.pendingLanes));
      var u = l.pendingLanes;
      if (
        (u === 0 && (da = null),
        Wn(a),
        (t = t.stateNode),
        et && typeof et.onCommitFiberRoot == "function")
      )
        try {
          et.onCommitFiberRoot(xe, t, void 0, (t.current.flags & 128) === 128);
        } catch {}
      if (e !== null) {
        (t = S.T), (u = M.p), (M.p = 2), (S.T = null);
        try {
          for (var n = l.onRecoverableError, i = 0; i < e.length; i++) {
            var c = e[i];
            n(c.value, {
              componentStack: c.stack,
            });
          }
        } finally {
          (S.T = t), (M.p = u);
        }
      }
      (Wt & 3) !== 0 && zn(),
        Ot(l),
        (u = l.pendingLanes),
        (a & 261930) !== 0 && (u & 42) !== 0 ? (l === jc ? fu++ : ((fu = 0), (jc = l))) : (fu = 0),
        su(0);
    }
  }
  function Td(l, t) {
    (l.pooledCacheLanes &= t) === 0 &&
      ((t = l.pooledCache), t != null && ((l.pooledCache = null), Ve(t)));
  }
  function zn() {
    return bd(), Sd(), zd(), Ed();
  }
  function Ed() {
    if (Cl !== 5) return !1;
    var l = ra,
      t = Nc;
    Nc = 0;
    var a = Wn(Wt),
      e = S.T,
      u = M.p;
    try {
      (M.p = 32 > a ? 32 : a), (S.T = null), (a = xc), (xc = null);
      var n = ra,
        i = Wt;
      if (((Cl = 0), (pe = ra = null), (Wt = 0), (nl & 6) !== 0)) throw Error(s(331));
      var c = nl;
      if (
        ((nl |= 4),
        ud(n.current),
        td(n, n.current, i, a),
        (nl = c),
        su(0, !1),
        et && typeof et.onPostCommitFiberRoot == "function")
      )
        try {
          et.onPostCommitFiberRoot(xe, n);
        } catch {}
      return !0;
    } finally {
      (M.p = u), (S.T = e), Td(l, t);
    }
  }
  function Ad(l, t, a) {
    (t = ht(a, t)), (t = ic(l.stateNode, t, 2)), (l = na(l, t, 2)), l !== null && (Me(l, 2), Ot(l));
  }
  function dl(l, t, a) {
    if (l.tag === 3) Ad(l, l, a);
    else
      while (t !== null) {
        if (t.tag === 3) {
          Ad(t, l, a);
          break;
        } else if (t.tag === 1) {
          var e = t.stateNode;
          if (
            typeof t.type.getDerivedStateFromError == "function" ||
            (typeof e.componentDidCatch == "function" && (da === null || !da.has(e)))
          ) {
            (l = ht(a, l)),
              (a = _o(2)),
              (e = na(t, a, 2)),
              e !== null && (No(a, e, t, l), Me(e, 2), Ot(e));
            break;
          }
        }
        t = t.return;
      }
  }
  function Dc(l, t, a) {
    var e = l.pingCache;
    if (e === null) {
      e = l.pingCache = new lv();
      var u = /* @__PURE__ */ new Set();
      e.set(t, u);
    } else (u = e.get(t)), u === void 0 && ((u = /* @__PURE__ */ new Set()), e.set(t, u));
    u.has(a) || ((Ec = !0), u.add(a), (l = nv.bind(null, l, t, a)), t.then(l, l));
  }
  function nv(l, t, a) {
    var e = l.pingCache;
    e !== null && e.delete(t),
      (l.pingedLanes |= l.suspendedLanes & a),
      (l.warmLanes &= ~a),
      pl === l &&
        (F & a) === a &&
        (Al === 4 || (Al === 3 && (F & 62914560) === F && 300 > at() - hn)
          ? (nl & 2) === 0 && be(l, 0)
          : (Ac |= a),
        ge === F && (ge = 0)),
      Ot(l);
  }
  function _d(l, t) {
    t === 0 && (t = pf()), (l = ja(l, t)), l !== null && (Me(l, t), Ot(l));
  }
  function iv(l) {
    var t = l.memoizedState,
      a = 0;
    t !== null && (a = t.retryLane), _d(l, a);
  }
  function cv(l, t) {
    var a = 0;
    switch (l.tag) {
      case 31:
      case 13:
        var e = l.stateNode,
          u = l.memoizedState;
        u !== null && (a = u.retryLane);
        break;
      case 19:
        e = l.stateNode;
        break;
      case 22:
        e = l.stateNode._retryCache;
        break;
      default:
        throw Error(s(314));
    }
    e !== null && e.delete(t), _d(l, a);
  }
  function fv(l, t) {
    return Ln(l, t);
  }
  var Tn = null,
    ze = null,
    Uc = !1,
    En = !1,
    Cc = !1,
    va = 0;
  function Ot(l) {
    l !== ze && l.next === null && (ze === null ? (Tn = ze = l) : (ze = ze.next = l)),
      (En = !0),
      Uc || ((Uc = !0), ov());
  }
  function su(l, t) {
    if (!Cc && En) {
      Cc = !0;
      do
        for (var a = !1, e = Tn; e !== null; ) {
          if (l !== 0) {
            var u = e.pendingLanes;
            if (u === 0) var n = 0;
            else {
              var i = e.suspendedLanes,
                c = e.pingedLanes;
              (n = (1 << (31 - ut(42 | l) + 1)) - 1),
                (n &= u & ~(i & ~c)),
                (n = n & 201326741 ? (n & 201326741) | 1 : n ? n | 2 : 0);
            }
            n !== 0 && ((a = !0), Md(e, n));
          } else
            (n = F),
              (n = Nu(
                e,
                e === pl ? n : 0,
                e.cancelPendingCommit !== null || e.timeoutHandle !== -1,
              )),
              (n & 3) === 0 || je(e, n) || ((a = !0), Md(e, n));
          e = e.next;
        }
      while (a);
      Cc = !1;
    }
  }
  function sv() {
    Nd();
  }
  function Nd() {
    En = Uc = !1;
    var l = 0;
    va !== 0 && Sv() && (l = va);
    for (var t = at(), a = null, e = Tn; e !== null; ) {
      var u = e.next,
        n = xd(e, t);
      n === 0
        ? ((e.next = null), a === null ? (Tn = u) : (a.next = u), u === null && (ze = a))
        : ((a = e), (l !== 0 || (n & 3) !== 0) && (En = !0)),
        (e = u);
    }
    (Cl !== 0 && Cl !== 5) || su(l), va !== 0 && (va = 0);
  }
  function xd(l, t) {
    for (
      var a = l.suspendedLanes,
        e = l.pingedLanes,
        u = l.expirationTimes,
        n = l.pendingLanes & -62914561;
      0 < n;
    ) {
      var i = 31 - ut(n),
        c = 1 << i,
        f = u[i];
      f === -1
        ? ((c & a) === 0 || (c & e) !== 0) && (u[i] = qr(c, t))
        : f <= t && (l.expiredLanes |= c),
        (n &= ~c);
    }
    if (
      ((t = pl),
      (a = F),
      (a = Nu(l, l === t ? a : 0, l.cancelPendingCommit !== null || l.timeoutHandle !== -1)),
      (e = l.callbackNode),
      a === 0 || (l === t && (ol === 2 || ol === 9)) || l.cancelPendingCommit !== null)
    )
      return e !== null && e !== null && Kn(e), (l.callbackNode = null), (l.callbackPriority = 0);
    if ((a & 3) === 0 || je(l, a)) {
      if (((t = a & -a), t === l.callbackPriority)) return t;
      switch ((e !== null && Kn(e), Wn(a))) {
        case 2:
        case 8:
          a = yf;
          break;
        case 32:
          a = Tu;
          break;
        case 268435456:
          a = gf;
          break;
        default:
          a = Tu;
      }
      return (
        (e = jd.bind(null, l)), (a = Ln(a, e)), (l.callbackPriority = t), (l.callbackNode = a), t
      );
    }
    return e !== null && e !== null && Kn(e), (l.callbackPriority = 2), (l.callbackNode = null), 2;
  }
  function jd(l, t) {
    if (Cl !== 0 && Cl !== 5) return (l.callbackNode = null), (l.callbackPriority = 0), null;
    var a = l.callbackNode;
    if (zn() && l.callbackNode !== a) return null;
    var e = F;
    return (
      (e = Nu(l, l === pl ? e : 0, l.cancelPendingCommit !== null || l.timeoutHandle !== -1)),
      e === 0
        ? null
        : (sd(l, e, t),
          xd(l, at()),
          l.callbackNode != null && l.callbackNode === a ? jd.bind(null, l) : null)
    );
  }
  function Md(l, t) {
    if (zn()) return null;
    sd(l, t, !0);
  }
  function ov() {
    Tv(() => {
      (nl & 6) !== 0 ? Ln(hf, sv) : Nd();
    });
  }
  function Hc() {
    if (va === 0) {
      var l = ie;
      l === 0 && ((l = Eu), (Eu <<= 1), (Eu & 261888) === 0 && (Eu = 256)), (va = l);
    }
    return va;
  }
  function Od(l) {
    return l == null || typeof l == "symbol" || typeof l == "boolean"
      ? null
      : typeof l == "function"
        ? l
        : Ou("" + l);
  }
  function Dd(l, t) {
    var a = t.ownerDocument.createElement("input");
    return (
      (a.name = t.name),
      (a.value = t.value),
      l.id && a.setAttribute("form", l.id),
      t.parentNode.insertBefore(a, t),
      (l = new FormData(l)),
      a.parentNode.removeChild(a),
      l
    );
  }
  function dv(l, t, a, e, u) {
    if (t === "submit" && a && a.stateNode === u) {
      var n = Od((u[$l] || null).action),
        i = e.submitter;
      i &&
        ((t = (t = i[$l] || null) ? Od(t.formAction) : i.getAttribute("formAction")),
        t !== null && ((n = t), (i = null)));
      var c = new Hu("action", "action", null, e, u);
      l.push({
        event: c,
        listeners: [
          {
            instance: null,
            listener: () => {
              if (e.defaultPrevented) {
                if (va !== 0) {
                  var f = i ? Dd(u, i) : new FormData(u);
                  lc(
                    a,
                    {
                      pending: !0,
                      data: f,
                      method: u.method,
                      action: n,
                    },
                    null,
                    f,
                  );
                }
              } else
                typeof n == "function" &&
                  (c.preventDefault(),
                  (f = i ? Dd(u, i) : new FormData(u)),
                  lc(
                    a,
                    {
                      pending: !0,
                      data: f,
                      method: u.method,
                      action: n,
                    },
                    n,
                    f,
                  ));
            },
            currentTarget: u,
          },
        ],
      });
    }
  }
  for (var Rc = 0; Rc < gi.length; Rc++) {
    var qc = gi[Rc],
      rv = qc.toLowerCase(),
      mv = qc[0].toUpperCase() + qc.slice(1);
    Et(rv, "on" + mv);
  }
  Et(cs, "onAnimationEnd"),
    Et(fs, "onAnimationIteration"),
    Et(ss, "onAnimationStart"),
    Et("dblclick", "onDoubleClick"),
    Et("focusin", "onFocus"),
    Et("focusout", "onBlur"),
    Et(Mm, "onTransitionRun"),
    Et(Om, "onTransitionStart"),
    Et(Dm, "onTransitionCancel"),
    Et(os, "onTransitionEnd"),
    Ja("onMouseEnter", ["mouseout", "mouseover"]),
    Ja("onMouseLeave", ["mouseout", "mouseover"]),
    Ja("onPointerEnter", ["pointerout", "pointerover"]),
    Ja("onPointerLeave", ["pointerout", "pointerover"]),
    Aa("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")),
    Aa(
      "onSelect",
      "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(
        " ",
      ),
    ),
    Aa("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]),
    Aa("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")),
    Aa(
      "onCompositionStart",
      "compositionstart focusout keydown keypress keyup mousedown".split(" "),
    ),
    Aa(
      "onCompositionUpdate",
      "compositionupdate focusout keydown keypress keyup mousedown".split(" "),
    );
  var ou =
      "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(
        " ",
      ),
    vv = new Set(
      "beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(ou),
    );
  function Ud(l, t) {
    t = (t & 4) !== 0;
    for (var a = 0; a < l.length; a++) {
      var e = l[a],
        u = e.event;
      e = e.listeners;
      l: {
        var n = void 0;
        if (t)
          for (var i = e.length - 1; 0 <= i; i--) {
            var c = e[i],
              f = c.instance,
              h = c.currentTarget;
            if (((c = c.listener), f !== n && u.isPropagationStopped())) break l;
            (n = c), (u.currentTarget = h);
            try {
              n(u);
            } catch (b) {
              Bu(b);
            }
            (u.currentTarget = null), (n = f);
          }
        else
          for (i = 0; i < e.length; i++) {
            if (
              ((c = e[i]),
              (f = c.instance),
              (h = c.currentTarget),
              (c = c.listener),
              f !== n && u.isPropagationStopped())
            )
              break l;
            (n = c), (u.currentTarget = h);
            try {
              n(u);
            } catch (b) {
              Bu(b);
            }
            (u.currentTarget = null), (n = f);
          }
      }
    }
  }
  function k(l, t) {
    var a = t[$n];
    a === void 0 && (a = t[$n] = /* @__PURE__ */ new Set());
    var e = l + "__bubble";
    a.has(e) || (Cd(t, l, 2, !1), a.add(e));
  }
  function Bc(l, t, a) {
    var e = 0;
    t && (e |= 4), Cd(a, l, e, t);
  }
  var An = "_reactListening" + Math.random().toString(36).slice(2);
  function Yc(l) {
    if (!l[An]) {
      (l[An] = !0),
        _f.forEach((a) => {
          a !== "selectionchange" && (vv.has(a) || Bc(a, !1, l), Bc(a, !0, l));
        });
      var t = l.nodeType === 9 ? l : l.ownerDocument;
      t === null || t[An] || ((t[An] = !0), Bc("selectionchange", !1, t));
    }
  }
  function Cd(l, t, a, e) {
    switch (fr(t)) {
      case 2:
        var u = Zv;
        break;
      case 8:
        u = Vv;
        break;
      default:
        u = Pc;
    }
    (a = u.bind(null, t, a, l)),
      (u = void 0),
      !ui || (t !== "touchstart" && t !== "touchmove" && t !== "wheel") || (u = !0),
      e
        ? u !== void 0
          ? l.addEventListener(t, a, {
              capture: !0,
              passive: u,
            })
          : l.addEventListener(t, a, !0)
        : u !== void 0
          ? l.addEventListener(t, a, {
              passive: u,
            })
          : l.addEventListener(t, a, !1);
  }
  function Gc(l, t, a, e, u) {
    var n = e;
    if ((t & 1) === 0 && (t & 2) === 0 && e !== null)
      l: for (;;) {
        if (e === null) return;
        var i = e.tag;
        if (i === 3 || i === 4) {
          var c = e.stateNode.containerInfo;
          if (c === u) break;
          if (i === 4)
            for (i = e.return; i !== null; ) {
              var f = i.tag;
              if ((f === 3 || f === 4) && i.stateNode.containerInfo === u) return;
              i = i.return;
            }
          while (c !== null) {
            if (((i = Va(c)), i === null)) return;
            if (((f = i.tag), f === 5 || f === 6 || f === 26 || f === 27)) {
              e = n = i;
              continue l;
            }
            c = c.parentNode;
          }
        }
        e = e.return;
      }
    Bf(() => {
      var h = n,
        b = ai(a),
        T = [];
      l: {
        var y = ds.get(l);
        if (y !== void 0) {
          var p = Hu,
            U = l;
          switch (l) {
            case "keypress":
              if (Uu(a) === 0) break l;
            case "keydown":
            case "keyup":
              p = cm;
              break;
            case "focusin":
              (U = "focus"), (p = fi);
              break;
            case "focusout":
              (U = "blur"), (p = fi);
              break;
            case "beforeblur":
            case "afterblur":
              p = fi;
              break;
            case "click":
              if (a.button === 2) break l;
            case "auxclick":
            case "dblclick":
            case "mousedown":
            case "mousemove":
            case "mouseup":
            case "mouseout":
            case "mouseover":
            case "contextmenu":
              p = Xf;
              break;
            case "drag":
            case "dragend":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "dragstart":
            case "drop":
              p = $r;
              break;
            case "touchcancel":
            case "touchend":
            case "touchmove":
            case "touchstart":
              p = om;
              break;
            case cs:
            case fs:
            case ss:
              p = Ir;
              break;
            case os:
              p = rm;
              break;
            case "scroll":
            case "scrollend":
              p = wr;
              break;
            case "wheel":
              p = vm;
              break;
            case "copy":
            case "cut":
            case "paste":
              p = lm;
              break;
            case "gotpointercapture":
            case "lostpointercapture":
            case "pointercancel":
            case "pointerdown":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "pointerup":
              p = Zf;
              break;
            case "toggle":
            case "beforetoggle":
              p = ym;
          }
          var G = (t & 4) !== 0,
            yl = !G && (l === "scroll" || l === "scrollend"),
            m = G ? (y !== null ? y + "Capture" : null) : y;
          G = [];
          for (var d = h, v; d !== null; ) {
            var z = d;
            if (
              ((v = z.stateNode),
              (z = z.tag),
              (z !== 5 && z !== 26 && z !== 27) ||
                v === null ||
                m === null ||
                ((z = Ue(d, m)), z != null && G.push(du(d, z, v))),
              yl)
            )
              break;
            d = d.return;
          }
          0 < G.length && ((y = new p(y, U, null, a, b)), T.push({ event: y, listeners: G }));
        }
      }
      if ((t & 7) === 0) {
        l: {
          if (
            ((y = l === "mouseover" || l === "pointerover"),
            (p = l === "mouseout" || l === "pointerout"),
            y && a !== ti && (U = a.relatedTarget || a.fromElement) && (Va(U) || U[Za]))
          )
            break l;
          if (
            (p || y) &&
            ((y =
              b.window === b
                ? b
                : (y = b.ownerDocument)
                  ? y.defaultView || y.parentWindow
                  : window),
            p
              ? ((U = a.relatedTarget || a.toElement),
                (p = h),
                (U = U ? Va(U) : null),
                U !== null &&
                  ((yl = j(U)), (G = U.tag), U !== yl || (G !== 5 && G !== 27 && G !== 6)) &&
                  (U = null))
              : ((p = null), (U = h)),
            p !== U)
          ) {
            if (
              ((G = Xf),
              (z = "onMouseLeave"),
              (m = "onMouseEnter"),
              (d = "mouse"),
              (l === "pointerout" || l === "pointerover") &&
                ((G = Zf), (z = "onPointerLeave"), (m = "onPointerEnter"), (d = "pointer")),
              (yl = p == null ? y : De(p)),
              (v = U == null ? y : De(U)),
              (y = new G(z, d + "leave", p, a, b)),
              (y.target = yl),
              (y.relatedTarget = v),
              (z = null),
              Va(b) === h &&
                ((G = new G(m, d + "enter", U, a, b)),
                (G.target = v),
                (G.relatedTarget = yl),
                (z = G)),
              (yl = z),
              p && U)
            )
              t: {
                for (G = hv, m = p, d = U, v = 0, z = m; z; z = G(z)) v++;
                z = 0;
                for (var q = d; q; q = G(q)) z++;
                while (0 < v - z) (m = G(m)), v--;
                while (0 < z - v) (d = G(d)), z--;
                while (v--) {
                  if (m === d || (d !== null && m === d.alternate)) {
                    G = m;
                    break t;
                  }
                  (m = G(m)), (d = G(d));
                }
                G = null;
              }
            else G = null;
            p !== null && Hd(T, y, p, G, !1), U !== null && yl !== null && Hd(T, yl, U, G, !0);
          }
        }
        l: {
          if (
            ((y = h ? De(h) : window),
            (p = y.nodeName && y.nodeName.toLowerCase()),
            p === "select" || (p === "input" && y.type === "file"))
          )
            var al = kf;
          else if (Wf(y))
            if (Ff) al = Nm;
            else {
              al = Am;
              var H = Em;
            }
          else
            (p = y.nodeName),
              !p || p.toLowerCase() !== "input" || (y.type !== "checkbox" && y.type !== "radio")
                ? h && li(h.elementType) && (al = kf)
                : (al = _m);
          if (al && (al = al(l, h))) {
            $f(T, al, a, b);
            break l;
          }
          H && H(l, y, h),
            l === "focusout" &&
              h &&
              y.type === "number" &&
              h.memoizedProps.value != null &&
              Pn(y, "number", y.value);
        }
        switch (((H = h ? De(h) : window), l)) {
          case "focusin":
            (Wf(H) || H.contentEditable === "true") && ((Ia = H), (vi = h), (Xe = null));
            break;
          case "focusout":
            Xe = vi = Ia = null;
            break;
          case "mousedown":
            hi = !0;
            break;
          case "contextmenu":
          case "mouseup":
          case "dragend":
            (hi = !1), ns(T, a, b);
            break;
          case "selectionchange":
            if (jm) break;
          case "keydown":
          case "keyup":
            ns(T, a, b);
        }
        var J;
        if (oi)
          l: {
            switch (l) {
              case "compositionstart":
                var I = "onCompositionStart";
                break l;
              case "compositionend":
                I = "onCompositionEnd";
                break l;
              case "compositionupdate":
                I = "onCompositionUpdate";
                break l;
            }
            I = void 0;
          }
        else
          Fa
            ? Jf(l, a) && (I = "onCompositionEnd")
            : l === "keydown" && a.keyCode === 229 && (I = "onCompositionStart");
        I &&
          (Vf &&
            a.locale !== "ko" &&
            (Fa || I !== "onCompositionStart"
              ? I === "onCompositionEnd" && Fa && (J = Yf())
              : ((It = b), (ni = "value" in It ? It.value : It.textContent), (Fa = !0))),
          (H = _n(h, I)),
          0 < H.length &&
            ((I = new Qf(I, l, null, a, b)),
            T.push({ event: I, listeners: H }),
            J ? (I.data = J) : ((J = wf(a)), J !== null && (I.data = J)))),
          (J = pm ? bm(l, a) : Sm(l, a)) &&
            ((I = _n(h, "onBeforeInput")),
            0 < I.length &&
              ((H = new Qf("onBeforeInput", "beforeinput", null, a, b)),
              T.push({
                event: H,
                listeners: I,
              }),
              (H.data = J))),
          dv(T, l, h, a, b);
      }
      Ud(T, t);
    });
  }
  function du(l, t, a) {
    return {
      instance: l,
      listener: t,
      currentTarget: a,
    };
  }
  function _n(l, t) {
    for (var a = t + "Capture", e = []; l !== null; ) {
      var u = l,
        n = u.stateNode;
      if (
        ((u = u.tag),
        (u !== 5 && u !== 26 && u !== 27) ||
          n === null ||
          ((u = Ue(l, a)),
          u != null && e.unshift(du(l, u, n)),
          (u = Ue(l, t)),
          u != null && e.push(du(l, u, n))),
        l.tag === 3)
      )
        return e;
      l = l.return;
    }
    return [];
  }
  function hv(l) {
    if (l === null) return null;
    do l = l.return;
    while (l && l.tag !== 5 && l.tag !== 27);
    return l || null;
  }
  function Hd(l, t, a, e, u) {
    for (var n = t._reactName, i = []; a !== null && a !== e; ) {
      var c = a,
        f = c.alternate,
        h = c.stateNode;
      if (((c = c.tag), f !== null && f === e)) break;
      (c !== 5 && c !== 26 && c !== 27) ||
        h === null ||
        ((f = h),
        u
          ? ((h = Ue(a, n)), h != null && i.unshift(du(a, h, f)))
          : u || ((h = Ue(a, n)), h != null && i.push(du(a, h, f)))),
        (a = a.return);
    }
    i.length !== 0 && l.push({ event: t, listeners: i });
  }
  var yv = /\r\n?/g,
    gv = /\u0000|\uFFFD/g;
  function Rd(l) {
    return (typeof l == "string" ? l : "" + l)
      .replace(
        yv,
        `
`,
      )
      .replace(gv, "");
  }
  function qd(l, t) {
    return (t = Rd(t)), Rd(l) === t;
  }
  function hl(l, t, a, e, u, n) {
    switch (a) {
      case "children":
        typeof e == "string"
          ? t === "body" || (t === "textarea" && e === "") || Wa(l, e)
          : (typeof e == "number" || typeof e == "bigint") && t !== "body" && Wa(l, "" + e);
        break;
      case "className":
        ju(l, "class", e);
        break;
      case "tabIndex":
        ju(l, "tabindex", e);
        break;
      case "dir":
      case "role":
      case "viewBox":
      case "width":
      case "height":
        ju(l, a, e);
        break;
      case "style":
        Rf(l, e, n);
        break;
      case "data":
        if (t !== "object") {
          ju(l, "data", e);
          break;
        }
      case "src":
      case "href":
        if (e === "" && (t !== "a" || a !== "href")) {
          l.removeAttribute(a);
          break;
        }
        if (e == null || typeof e == "function" || typeof e == "symbol" || typeof e == "boolean") {
          l.removeAttribute(a);
          break;
        }
        (e = Ou("" + e)), l.setAttribute(a, e);
        break;
      case "action":
      case "formAction":
        if (typeof e == "function") {
          l.setAttribute(
            a,
            "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')",
          );
          break;
        } else
          typeof n == "function" &&
            (a === "formAction"
              ? (t !== "input" && hl(l, t, "name", u.name, u, null),
                hl(l, t, "formEncType", u.formEncType, u, null),
                hl(l, t, "formMethod", u.formMethod, u, null),
                hl(l, t, "formTarget", u.formTarget, u, null))
              : (hl(l, t, "encType", u.encType, u, null),
                hl(l, t, "method", u.method, u, null),
                hl(l, t, "target", u.target, u, null)));
        if (e == null || typeof e == "symbol" || typeof e == "boolean") {
          l.removeAttribute(a);
          break;
        }
        (e = Ou("" + e)), l.setAttribute(a, e);
        break;
      case "onClick":
        e != null && (l.onclick = Ct);
        break;
      case "onScroll":
        e != null && k("scroll", l);
        break;
      case "onScrollEnd":
        e != null && k("scrollend", l);
        break;
      case "dangerouslySetInnerHTML":
        if (e != null) {
          if (typeof e != "object" || !("__html" in e)) throw Error(s(61));
          if (((a = e.__html), a != null)) {
            if (u.children != null) throw Error(s(60));
            l.innerHTML = a;
          }
        }
        break;
      case "multiple":
        l.multiple = e && typeof e != "function" && typeof e != "symbol";
        break;
      case "muted":
        l.muted = e && typeof e != "function" && typeof e != "symbol";
        break;
      case "suppressContentEditableWarning":
      case "suppressHydrationWarning":
      case "defaultValue":
      case "defaultChecked":
      case "innerHTML":
      case "ref":
        break;
      case "autoFocus":
        break;
      case "xlinkHref":
        if (e == null || typeof e == "function" || typeof e == "boolean" || typeof e == "symbol") {
          l.removeAttribute("xlink:href");
          break;
        }
        (a = Ou("" + e)), l.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", a);
        break;
      case "contentEditable":
      case "spellCheck":
      case "draggable":
      case "value":
      case "autoReverse":
      case "externalResourcesRequired":
      case "focusable":
      case "preserveAlpha":
        e != null && typeof e != "function" && typeof e != "symbol"
          ? l.setAttribute(a, "" + e)
          : l.removeAttribute(a);
        break;
      case "inert":
      case "allowFullScreen":
      case "async":
      case "autoPlay":
      case "controls":
      case "default":
      case "defer":
      case "disabled":
      case "disablePictureInPicture":
      case "disableRemotePlayback":
      case "formNoValidate":
      case "hidden":
      case "loop":
      case "noModule":
      case "noValidate":
      case "open":
      case "playsInline":
      case "readOnly":
      case "required":
      case "reversed":
      case "scoped":
      case "seamless":
      case "itemScope":
        e && typeof e != "function" && typeof e != "symbol"
          ? l.setAttribute(a, "")
          : l.removeAttribute(a);
        break;
      case "capture":
      case "download":
        e === !0
          ? l.setAttribute(a, "")
          : e !== !1 && e != null && typeof e != "function" && typeof e != "symbol"
            ? l.setAttribute(a, e)
            : l.removeAttribute(a);
        break;
      case "cols":
      case "rows":
      case "size":
      case "span":
        e != null && typeof e != "function" && typeof e != "symbol" && !isNaN(e) && 1 <= e
          ? l.setAttribute(a, e)
          : l.removeAttribute(a);
        break;
      case "rowSpan":
      case "start":
        e == null || typeof e == "function" || typeof e == "symbol" || isNaN(e)
          ? l.removeAttribute(a)
          : l.setAttribute(a, e);
        break;
      case "popover":
        k("beforetoggle", l), k("toggle", l), xu(l, "popover", e);
        break;
      case "xlinkActuate":
        Ut(l, "http://www.w3.org/1999/xlink", "xlink:actuate", e);
        break;
      case "xlinkArcrole":
        Ut(l, "http://www.w3.org/1999/xlink", "xlink:arcrole", e);
        break;
      case "xlinkRole":
        Ut(l, "http://www.w3.org/1999/xlink", "xlink:role", e);
        break;
      case "xlinkShow":
        Ut(l, "http://www.w3.org/1999/xlink", "xlink:show", e);
        break;
      case "xlinkTitle":
        Ut(l, "http://www.w3.org/1999/xlink", "xlink:title", e);
        break;
      case "xlinkType":
        Ut(l, "http://www.w3.org/1999/xlink", "xlink:type", e);
        break;
      case "xmlBase":
        Ut(l, "http://www.w3.org/XML/1998/namespace", "xml:base", e);
        break;
      case "xmlLang":
        Ut(l, "http://www.w3.org/XML/1998/namespace", "xml:lang", e);
        break;
      case "xmlSpace":
        Ut(l, "http://www.w3.org/XML/1998/namespace", "xml:space", e);
        break;
      case "is":
        xu(l, "is", e);
        break;
      case "innerText":
      case "textContent":
        break;
      default:
        (!(2 < a.length) || (a[0] !== "o" && a[0] !== "O") || (a[1] !== "n" && a[1] !== "N")) &&
          ((a = Kr.get(a) || a), xu(l, a, e));
    }
  }
  function Xc(l, t, a, e, u, n) {
    switch (a) {
      case "style":
        Rf(l, e, n);
        break;
      case "dangerouslySetInnerHTML":
        if (e != null) {
          if (typeof e != "object" || !("__html" in e)) throw Error(s(61));
          if (((a = e.__html), a != null)) {
            if (u.children != null) throw Error(s(60));
            l.innerHTML = a;
          }
        }
        break;
      case "children":
        typeof e == "string"
          ? Wa(l, e)
          : (typeof e == "number" || typeof e == "bigint") && Wa(l, "" + e);
        break;
      case "onScroll":
        e != null && k("scroll", l);
        break;
      case "onScrollEnd":
        e != null && k("scrollend", l);
        break;
      case "onClick":
        e != null && (l.onclick = Ct);
        break;
      case "suppressContentEditableWarning":
      case "suppressHydrationWarning":
      case "innerHTML":
      case "ref":
        break;
      case "innerText":
      case "textContent":
        break;
      default:
        if (!Nf.hasOwnProperty(a))
          l: {
            if (
              a[0] === "o" &&
              a[1] === "n" &&
              ((u = a.endsWith("Capture")),
              (t = a.slice(2, u ? a.length - 7 : void 0)),
              (n = l[$l] || null),
              (n = n != null ? n[a] : null),
              typeof n == "function" && l.removeEventListener(t, n, u),
              typeof e == "function")
            ) {
              typeof n != "function" &&
                n !== null &&
                (a in l ? (l[a] = null) : l.hasAttribute(a) && l.removeAttribute(a)),
                l.addEventListener(t, e, u);
              break l;
            }
            a in l ? (l[a] = e) : e === !0 ? l.setAttribute(a, "") : xu(l, a, e);
          }
    }
  }
  function Xl(l, t, a) {
    switch (t) {
      case "div":
      case "span":
      case "svg":
      case "path":
      case "a":
      case "g":
      case "p":
      case "li":
        break;
      case "img":
        k("error", l), k("load", l);
        var e = !1,
          u = !1,
          n;
        for (n in a)
          if (a.hasOwnProperty(n)) {
            var i = a[n];
            if (i != null)
              switch (n) {
                case "src":
                  e = !0;
                  break;
                case "srcSet":
                  u = !0;
                  break;
                case "children":
                case "dangerouslySetInnerHTML":
                  throw Error(s(137, t));
                default:
                  hl(l, t, n, i, a, null);
              }
          }
        u && hl(l, t, "srcSet", a.srcSet, a, null), e && hl(l, t, "src", a.src, a, null);
        return;
      case "input":
        k("invalid", l);
        var c = (n = i = u = null),
          f = null,
          h = null;
        for (e in a)
          if (a.hasOwnProperty(e)) {
            var b = a[e];
            if (b != null)
              switch (e) {
                case "name":
                  u = b;
                  break;
                case "type":
                  i = b;
                  break;
                case "checked":
                  f = b;
                  break;
                case "defaultChecked":
                  h = b;
                  break;
                case "value":
                  n = b;
                  break;
                case "defaultValue":
                  c = b;
                  break;
                case "children":
                case "dangerouslySetInnerHTML":
                  if (b != null) throw Error(s(137, t));
                  break;
                default:
                  hl(l, t, e, b, a, null);
              }
          }
        Df(l, n, c, f, h, i, u, !1);
        return;
      case "select":
        k("invalid", l), (e = i = n = null);
        for (u in a)
          if (a.hasOwnProperty(u) && ((c = a[u]), c != null))
            switch (u) {
              case "value":
                n = c;
                break;
              case "defaultValue":
                i = c;
                break;
              case "multiple":
                e = c;
              default:
                hl(l, t, u, c, a, null);
            }
        (t = n),
          (a = i),
          (l.multiple = !!e),
          t != null ? wa(l, !!e, t, !1) : a != null && wa(l, !!e, a, !0);
        return;
      case "textarea":
        k("invalid", l), (n = u = e = null);
        for (i in a)
          if (a.hasOwnProperty(i) && ((c = a[i]), c != null))
            switch (i) {
              case "value":
                e = c;
                break;
              case "defaultValue":
                u = c;
                break;
              case "children":
                n = c;
                break;
              case "dangerouslySetInnerHTML":
                if (c != null) throw Error(s(91));
                break;
              default:
                hl(l, t, i, c, a, null);
            }
        Cf(l, e, u, n);
        return;
      case "option":
        for (f in a)
          if (a.hasOwnProperty(f) && ((e = a[f]), e != null))
            switch (f) {
              case "selected":
                l.selected = e && typeof e != "function" && typeof e != "symbol";
                break;
              default:
                hl(l, t, f, e, a, null);
            }
        return;
      case "dialog":
        k("beforetoggle", l), k("toggle", l), k("cancel", l), k("close", l);
        break;
      case "iframe":
      case "object":
        k("load", l);
        break;
      case "video":
      case "audio":
        for (e = 0; e < ou.length; e++) k(ou[e], l);
        break;
      case "image":
        k("error", l), k("load", l);
        break;
      case "details":
        k("toggle", l);
        break;
      case "embed":
      case "source":
      case "link":
        k("error", l), k("load", l);
      case "area":
      case "base":
      case "br":
      case "col":
      case "hr":
      case "keygen":
      case "meta":
      case "param":
      case "track":
      case "wbr":
      case "menuitem":
        for (h in a)
          if (a.hasOwnProperty(h) && ((e = a[h]), e != null))
            switch (h) {
              case "children":
              case "dangerouslySetInnerHTML":
                throw Error(s(137, t));
              default:
                hl(l, t, h, e, a, null);
            }
        return;
      default:
        if (li(t)) {
          for (b in a)
            a.hasOwnProperty(b) && ((e = a[b]), e !== void 0 && Xc(l, t, b, e, a, void 0));
          return;
        }
    }
    for (c in a) a.hasOwnProperty(c) && ((e = a[c]), e != null && hl(l, t, c, e, a, null));
  }
  function pv(l, t, a, e) {
    switch (t) {
      case "div":
      case "span":
      case "svg":
      case "path":
      case "a":
      case "g":
      case "p":
      case "li":
        break;
      case "input":
        var u = null,
          n = null,
          i = null,
          c = null,
          f = null,
          h = null,
          b = null;
        for (p in a) {
          var T = a[p];
          if (a.hasOwnProperty(p) && T != null)
            switch (p) {
              case "checked":
                break;
              case "value":
                break;
              case "defaultValue":
                f = T;
              default:
                e.hasOwnProperty(p) || hl(l, t, p, null, e, T);
            }
        }
        for (var y in e) {
          var p = e[y];
          if (((T = a[y]), e.hasOwnProperty(y) && (p != null || T != null)))
            switch (y) {
              case "type":
                n = p;
                break;
              case "name":
                u = p;
                break;
              case "checked":
                h = p;
                break;
              case "defaultChecked":
                b = p;
                break;
              case "value":
                i = p;
                break;
              case "defaultValue":
                c = p;
                break;
              case "children":
              case "dangerouslySetInnerHTML":
                if (p != null) throw Error(s(137, t));
                break;
              default:
                p !== T && hl(l, t, y, p, e, T);
            }
        }
        In(l, i, c, f, h, b, n, u);
        return;
      case "select":
        p = i = c = y = null;
        for (n in a)
          if (((f = a[n]), a.hasOwnProperty(n) && f != null))
            switch (n) {
              case "value":
                break;
              case "multiple":
                p = f;
              default:
                e.hasOwnProperty(n) || hl(l, t, n, null, e, f);
            }
        for (u in e)
          if (((n = e[u]), (f = a[u]), e.hasOwnProperty(u) && (n != null || f != null)))
            switch (u) {
              case "value":
                y = n;
                break;
              case "defaultValue":
                c = n;
                break;
              case "multiple":
                i = n;
              default:
                n !== f && hl(l, t, u, n, e, f);
            }
        (t = c),
          (a = i),
          (e = p),
          y != null
            ? wa(l, !!a, y, !1)
            : !!e != !!a && (t != null ? wa(l, !!a, t, !0) : wa(l, !!a, a ? [] : "", !1));
        return;
      case "textarea":
        p = y = null;
        for (c in a)
          if (((u = a[c]), a.hasOwnProperty(c) && u != null && !e.hasOwnProperty(c)))
            switch (c) {
              case "value":
                break;
              case "children":
                break;
              default:
                hl(l, t, c, null, e, u);
            }
        for (i in e)
          if (((u = e[i]), (n = a[i]), e.hasOwnProperty(i) && (u != null || n != null)))
            switch (i) {
              case "value":
                y = u;
                break;
              case "defaultValue":
                p = u;
                break;
              case "children":
                break;
              case "dangerouslySetInnerHTML":
                if (u != null) throw Error(s(91));
                break;
              default:
                u !== n && hl(l, t, i, u, e, n);
            }
        Uf(l, y, p);
        return;
      case "option":
        for (var U in a)
          if (((y = a[U]), a.hasOwnProperty(U) && y != null && !e.hasOwnProperty(U)))
            switch (U) {
              case "selected":
                l.selected = !1;
                break;
              default:
                hl(l, t, U, null, e, y);
            }
        for (f in e)
          if (((y = e[f]), (p = a[f]), e.hasOwnProperty(f) && y !== p && (y != null || p != null)))
            switch (f) {
              case "selected":
                l.selected = y && typeof y != "function" && typeof y != "symbol";
                break;
              default:
                hl(l, t, f, y, e, p);
            }
        return;
      case "img":
      case "link":
      case "area":
      case "base":
      case "br":
      case "col":
      case "embed":
      case "hr":
      case "keygen":
      case "meta":
      case "param":
      case "source":
      case "track":
      case "wbr":
      case "menuitem":
        for (var G in a)
          (y = a[G]),
            a.hasOwnProperty(G) && y != null && !e.hasOwnProperty(G) && hl(l, t, G, null, e, y);
        for (h in e)
          if (((y = e[h]), (p = a[h]), e.hasOwnProperty(h) && y !== p && (y != null || p != null)))
            switch (h) {
              case "children":
              case "dangerouslySetInnerHTML":
                if (y != null) throw Error(s(137, t));
                break;
              default:
                hl(l, t, h, y, e, p);
            }
        return;
      default:
        if (li(t)) {
          for (var yl in a)
            (y = a[yl]),
              a.hasOwnProperty(yl) &&
                y !== void 0 &&
                !e.hasOwnProperty(yl) &&
                Xc(l, t, yl, void 0, e, y);
          for (b in e)
            (y = e[b]),
              (p = a[b]),
              !e.hasOwnProperty(b) ||
                y === p ||
                (y === void 0 && p === void 0) ||
                Xc(l, t, b, y, e, p);
          return;
        }
    }
    for (var m in a)
      (y = a[m]),
        a.hasOwnProperty(m) && y != null && !e.hasOwnProperty(m) && hl(l, t, m, null, e, y);
    for (T in e)
      (y = e[T]),
        (p = a[T]),
        !e.hasOwnProperty(T) || y === p || (y == null && p == null) || hl(l, t, T, y, e, p);
  }
  function Bd(l) {
    switch (l) {
      case "css":
      case "script":
      case "font":
      case "img":
      case "image":
      case "input":
      case "link":
        return !0;
      default:
        return !1;
    }
  }
  function bv() {
    if (typeof performance.getEntriesByType == "function") {
      for (
        var l = 0, t = 0, a = performance.getEntriesByType("resource"), e = 0;
        e < a.length;
        e++
      ) {
        var u = a[e],
          n = u.transferSize,
          i = u.initiatorType,
          c = u.duration;
        if (n && c && Bd(i)) {
          for (i = 0, c = u.responseEnd, e += 1; e < a.length; e++) {
            var f = a[e],
              h = f.startTime;
            if (h > c) break;
            var b = f.transferSize,
              T = f.initiatorType;
            b && Bd(T) && ((f = f.responseEnd), (i += b * (f < c ? 1 : (c - h) / (f - h))));
          }
          if ((--e, (t += (8 * (n + i)) / (u.duration / 1e3)), l++, 10 < l)) break;
        }
      }
      if (0 < l) return t / l / 1e6;
    }
    return navigator.connection && ((l = navigator.connection.downlink), typeof l == "number")
      ? l
      : 5;
  }
  var Qc = null,
    Zc = null;
  function Nn(l) {
    return l.nodeType === 9 ? l : l.ownerDocument;
  }
  function Yd(l) {
    switch (l) {
      case "http://www.w3.org/2000/svg":
        return 1;
      case "http://www.w3.org/1998/Math/MathML":
        return 2;
      default:
        return 0;
    }
  }
  function Gd(l, t) {
    if (l === 0)
      switch (t) {
        case "svg":
          return 1;
        case "math":
          return 2;
        default:
          return 0;
      }
    return l === 1 && t === "foreignObject" ? 0 : l;
  }
  function Vc(l, t) {
    return (
      l === "textarea" ||
      l === "noscript" ||
      typeof t.children == "string" ||
      typeof t.children == "number" ||
      typeof t.children == "bigint" ||
      (typeof t.dangerouslySetInnerHTML == "object" &&
        t.dangerouslySetInnerHTML !== null &&
        t.dangerouslySetInnerHTML.__html != null)
    );
  }
  var Lc = null;
  function Sv() {
    var l = window.event;
    return l && l.type === "popstate" ? (l === Lc ? !1 : ((Lc = l), !0)) : ((Lc = null), !1);
  }
  var Xd = typeof setTimeout == "function" ? setTimeout : void 0,
    zv = typeof clearTimeout == "function" ? clearTimeout : void 0,
    Qd = typeof Promise == "function" ? Promise : void 0,
    Tv =
      typeof queueMicrotask == "function"
        ? queueMicrotask
        : typeof Qd < "u"
          ? (l) => Qd.resolve(null).then(l).catch(Ev)
          : Xd;
  function Ev(l) {
    setTimeout(() => {
      throw l;
    });
  }
  function ha(l) {
    return l === "head";
  }
  function Zd(l, t) {
    var a = t,
      e = 0;
    do {
      var u = a.nextSibling;
      if ((l.removeChild(a), u && u.nodeType === 8))
        if (((a = u.data), a === "/$" || a === "/&")) {
          if (e === 0) {
            l.removeChild(u), _e(t);
            return;
          }
          e--;
        } else if (a === "$" || a === "$?" || a === "$~" || a === "$!" || a === "&") e++;
        else if (a === "html") ru(l.ownerDocument.documentElement);
        else if (a === "head") {
          (a = l.ownerDocument.head), ru(a);
          for (var n = a.firstChild; n; ) {
            var i = n.nextSibling,
              c = n.nodeName;
            n[Oe] ||
              c === "SCRIPT" ||
              c === "STYLE" ||
              (c === "LINK" && n.rel.toLowerCase() === "stylesheet") ||
              a.removeChild(n),
              (n = i);
          }
        } else a === "body" && ru(l.ownerDocument.body);
      a = u;
    } while (a);
    _e(t);
  }
  function Vd(l, t) {
    var a = l;
    l = 0;
    do {
      var e = a.nextSibling;
      if (
        (a.nodeType === 1
          ? t
            ? ((a._stashedDisplay = a.style.display), (a.style.display = "none"))
            : ((a.style.display = a._stashedDisplay || ""),
              a.getAttribute("style") === "" && a.removeAttribute("style"))
          : a.nodeType === 3 &&
            (t
              ? ((a._stashedText = a.nodeValue), (a.nodeValue = ""))
              : (a.nodeValue = a._stashedText || "")),
        e && e.nodeType === 8)
      )
        if (((a = e.data), a === "/$")) {
          if (l === 0) break;
          l--;
        } else (a !== "$" && a !== "$?" && a !== "$~" && a !== "$!") || l++;
      a = e;
    } while (a);
  }
  function Kc(l) {
    var t = l.firstChild;
    for (t && t.nodeType === 10 && (t = t.nextSibling); t; ) {
      var a = t;
      switch (((t = t.nextSibling), a.nodeName)) {
        case "HTML":
        case "HEAD":
        case "BODY":
          Kc(a), kn(a);
          continue;
        case "SCRIPT":
        case "STYLE":
          continue;
        case "LINK":
          if (a.rel.toLowerCase() === "stylesheet") continue;
      }
      l.removeChild(a);
    }
  }
  function Av(l, t, a, e) {
    while (l.nodeType === 1) {
      var u = a;
      if (l.nodeName.toLowerCase() !== t.toLowerCase()) {
        if (!e && (l.nodeName !== "INPUT" || l.type !== "hidden")) break;
      } else if (e) {
        if (!l[Oe])
          switch (t) {
            case "meta":
              if (!l.hasAttribute("itemprop")) break;
              return l;
            case "link":
              if (
                ((n = l.getAttribute("rel")),
                n === "stylesheet" && l.hasAttribute("data-precedence"))
              )
                break;
              if (
                n !== u.rel ||
                l.getAttribute("href") !== (u.href == null || u.href === "" ? null : u.href) ||
                l.getAttribute("crossorigin") !== (u.crossOrigin == null ? null : u.crossOrigin) ||
                l.getAttribute("title") !== (u.title == null ? null : u.title)
              )
                break;
              return l;
            case "style":
              if (l.hasAttribute("data-precedence")) break;
              return l;
            case "script":
              if (
                ((n = l.getAttribute("src")),
                (n !== (u.src == null ? null : u.src) ||
                  l.getAttribute("type") !== (u.type == null ? null : u.type) ||
                  l.getAttribute("crossorigin") !==
                    (u.crossOrigin == null ? null : u.crossOrigin)) &&
                  n &&
                  l.hasAttribute("async") &&
                  !l.hasAttribute("itemprop"))
              )
                break;
              return l;
            default:
              return l;
          }
      } else if (t === "input" && l.type === "hidden") {
        var n = u.name == null ? null : "" + u.name;
        if (u.type === "hidden" && l.getAttribute("name") === n) return l;
      } else return l;
      if (((l = St(l.nextSibling)), l === null)) break;
    }
    return null;
  }
  function _v(l, t, a) {
    if (t === "") return null;
    while (l.nodeType !== 3)
      if (
        ((l.nodeType !== 1 || l.nodeName !== "INPUT" || l.type !== "hidden") && !a) ||
        ((l = St(l.nextSibling)), l === null)
      )
        return null;
    return l;
  }
  function Ld(l, t) {
    while (l.nodeType !== 8)
      if (
        ((l.nodeType !== 1 || l.nodeName !== "INPUT" || l.type !== "hidden") && !t) ||
        ((l = St(l.nextSibling)), l === null)
      )
        return null;
    return l;
  }
  function Jc(l) {
    return l.data === "$?" || l.data === "$~";
  }
  function wc(l) {
    return l.data === "$!" || (l.data === "$?" && l.ownerDocument.readyState !== "loading");
  }
  function Nv(l, t) {
    var a = l.ownerDocument;
    if (l.data === "$~") l._reactRetry = t;
    else if (l.data !== "$?" || a.readyState !== "loading") t();
    else {
      var e = () => {
        t(), a.removeEventListener("DOMContentLoaded", e);
      };
      a.addEventListener("DOMContentLoaded", e), (l._reactRetry = e);
    }
  }
  function St(l) {
    for (; l != null; l = l.nextSibling) {
      var t = l.nodeType;
      if (t === 1 || t === 3) break;
      if (t === 8) {
        if (
          ((t = l.data),
          t === "$" ||
            t === "$!" ||
            t === "$?" ||
            t === "$~" ||
            t === "&" ||
            t === "F!" ||
            t === "F")
        )
          break;
        if (t === "/$" || t === "/&") return null;
      }
    }
    return l;
  }
  var Wc = null;
  function Kd(l) {
    l = l.nextSibling;
    for (var t = 0; l; ) {
      if (l.nodeType === 8) {
        var a = l.data;
        if (a === "/$" || a === "/&") {
          if (t === 0) return St(l.nextSibling);
          t--;
        } else (a !== "$" && a !== "$!" && a !== "$?" && a !== "$~" && a !== "&") || t++;
      }
      l = l.nextSibling;
    }
    return null;
  }
  function Jd(l) {
    l = l.previousSibling;
    for (var t = 0; l; ) {
      if (l.nodeType === 8) {
        var a = l.data;
        if (a === "$" || a === "$!" || a === "$?" || a === "$~" || a === "&") {
          if (t === 0) return l;
          t--;
        } else (a !== "/$" && a !== "/&") || t++;
      }
      l = l.previousSibling;
    }
    return null;
  }
  function wd(l, t, a) {
    switch (((t = Nn(a)), l)) {
      case "html":
        if (((l = t.documentElement), !l)) throw Error(s(452));
        return l;
      case "head":
        if (((l = t.head), !l)) throw Error(s(453));
        return l;
      case "body":
        if (((l = t.body), !l)) throw Error(s(454));
        return l;
      default:
        throw Error(s(451));
    }
  }
  function ru(l) {
    for (var t = l.attributes; t.length; ) l.removeAttributeNode(t[0]);
    kn(l);
  }
  var zt = /* @__PURE__ */ new Map(),
    Wd = /* @__PURE__ */ new Set();
  function xn(l) {
    return typeof l.getRootNode == "function"
      ? l.getRootNode()
      : l.nodeType === 9
        ? l
        : l.ownerDocument;
  }
  var $t = M.d;
  M.d = {
    f: xv,
    r: jv,
    D: Mv,
    C: Ov,
    L: Dv,
    m: Uv,
    X: Hv,
    S: Cv,
    M: Rv,
  };
  function xv() {
    var l = $t.f(),
      t = pn();
    return l || t;
  }
  function jv(l) {
    var t = La(l);
    t !== null && t.tag === 5 && t.type === "form" ? oo(t) : $t.r(l);
  }
  var Te = typeof document > "u" ? null : document;
  function $d(l, t, a) {
    var e = Te;
    if (e && typeof t == "string" && t) {
      var u = mt(t);
      (u = 'link[rel="' + l + '"][href="' + u + '"]'),
        typeof a == "string" && (u += '[crossorigin="' + a + '"]'),
        Wd.has(u) ||
          (Wd.add(u),
          (l = { rel: l, crossOrigin: a, href: t }),
          e.querySelector(u) === null &&
            ((t = e.createElement("link")), Xl(t, "link", l), Hl(t), e.head.appendChild(t)));
    }
  }
  function Mv(l) {
    $t.D(l), $d("dns-prefetch", l, null);
  }
  function Ov(l, t) {
    $t.C(l, t), $d("preconnect", l, t);
  }
  function Dv(l, t, a) {
    $t.L(l, t, a);
    var e = Te;
    if (e && l && t) {
      var u = 'link[rel="preload"][as="' + mt(t) + '"]';
      t === "image" && a && a.imageSrcSet
        ? ((u += '[imagesrcset="' + mt(a.imageSrcSet) + '"]'),
          typeof a.imageSizes == "string" && (u += '[imagesizes="' + mt(a.imageSizes) + '"]'))
        : (u += '[href="' + mt(l) + '"]');
      var n = u;
      switch (t) {
        case "style":
          n = Ee(l);
          break;
        case "script":
          n = Ae(l);
      }
      zt.has(n) ||
        ((l = R(
          {
            rel: "preload",
            href: t === "image" && a && a.imageSrcSet ? void 0 : l,
            as: t,
          },
          a,
        )),
        zt.set(n, l),
        e.querySelector(u) !== null ||
          (t === "style" && e.querySelector(mu(n))) ||
          (t === "script" && e.querySelector(vu(n))) ||
          ((t = e.createElement("link")), Xl(t, "link", l), Hl(t), e.head.appendChild(t)));
    }
  }
  function Uv(l, t) {
    $t.m(l, t);
    var a = Te;
    if (a && l) {
      var e = t && typeof t.as == "string" ? t.as : "script",
        u = 'link[rel="modulepreload"][as="' + mt(e) + '"][href="' + mt(l) + '"]',
        n = u;
      switch (e) {
        case "audioworklet":
        case "paintworklet":
        case "serviceworker":
        case "sharedworker":
        case "worker":
        case "script":
          n = Ae(l);
      }
      if (
        !zt.has(n) &&
        ((l = R({ rel: "modulepreload", href: l }, t)), zt.set(n, l), a.querySelector(u) === null)
      ) {
        switch (e) {
          case "audioworklet":
          case "paintworklet":
          case "serviceworker":
          case "sharedworker":
          case "worker":
          case "script":
            if (a.querySelector(vu(n))) return;
        }
        (e = a.createElement("link")), Xl(e, "link", l), Hl(e), a.head.appendChild(e);
      }
    }
  }
  function Cv(l, t, a) {
    $t.S(l, t, a);
    var e = Te;
    if (e && l) {
      var u = Ka(e).hoistableStyles,
        n = Ee(l);
      t = t || "default";
      var i = u.get(n);
      if (!i) {
        var c = { loading: 0, preload: null };
        if ((i = e.querySelector(mu(n)))) c.loading = 5;
        else {
          (l = R({ rel: "stylesheet", href: l, "data-precedence": t }, a)),
            (a = zt.get(n)) && $c(l, a);
          var f = (i = e.createElement("link"));
          Hl(f),
            Xl(f, "link", l),
            (f._p = new Promise((h, b) => {
              (f.onload = h), (f.onerror = b);
            })),
            f.addEventListener("load", () => {
              c.loading |= 1;
            }),
            f.addEventListener("error", () => {
              c.loading |= 2;
            }),
            (c.loading |= 4),
            jn(i, t, e);
        }
        (i = {
          type: "stylesheet",
          instance: i,
          count: 1,
          state: c,
        }),
          u.set(n, i);
      }
    }
  }
  function Hv(l, t) {
    $t.X(l, t);
    var a = Te;
    if (a && l) {
      var e = Ka(a).hoistableScripts,
        u = Ae(l),
        n = e.get(u);
      n ||
        ((n = a.querySelector(vu(u))),
        n ||
          ((l = R({ src: l, async: !0 }, t)),
          (t = zt.get(u)) && kc(l, t),
          (n = a.createElement("script")),
          Hl(n),
          Xl(n, "link", l),
          a.head.appendChild(n)),
        (n = {
          type: "script",
          instance: n,
          count: 1,
          state: null,
        }),
        e.set(u, n));
    }
  }
  function Rv(l, t) {
    $t.M(l, t);
    var a = Te;
    if (a && l) {
      var e = Ka(a).hoistableScripts,
        u = Ae(l),
        n = e.get(u);
      n ||
        ((n = a.querySelector(vu(u))),
        n ||
          ((l = R({ src: l, async: !0, type: "module" }, t)),
          (t = zt.get(u)) && kc(l, t),
          (n = a.createElement("script")),
          Hl(n),
          Xl(n, "link", l),
          a.head.appendChild(n)),
        (n = {
          type: "script",
          instance: n,
          count: 1,
          state: null,
        }),
        e.set(u, n));
    }
  }
  function kd(l, t, a, e) {
    var u = (u = W.current) ? xn(u) : null;
    if (!u) throw Error(s(446));
    switch (l) {
      case "meta":
      case "title":
        return null;
      case "style":
        return typeof a.precedence == "string" && typeof a.href == "string"
          ? ((t = Ee(a.href)),
            (a = Ka(u).hoistableStyles),
            (e = a.get(t)),
            e ||
              ((e = {
                type: "style",
                instance: null,
                count: 0,
                state: null,
              }),
              a.set(t, e)),
            e)
          : { type: "void", instance: null, count: 0, state: null };
      case "link":
        if (
          a.rel === "stylesheet" &&
          typeof a.href == "string" &&
          typeof a.precedence == "string"
        ) {
          l = Ee(a.href);
          var n = Ka(u).hoistableStyles,
            i = n.get(l);
          if (
            (i ||
              ((u = u.ownerDocument || u),
              (i = {
                type: "stylesheet",
                instance: null,
                count: 0,
                state: { loading: 0, preload: null },
              }),
              n.set(l, i),
              (n = u.querySelector(mu(l))) && !n._p && ((i.instance = n), (i.state.loading = 5)),
              zt.has(l) ||
                ((a = {
                  rel: "preload",
                  as: "style",
                  href: a.href,
                  crossOrigin: a.crossOrigin,
                  integrity: a.integrity,
                  media: a.media,
                  hrefLang: a.hrefLang,
                  referrerPolicy: a.referrerPolicy,
                }),
                zt.set(l, a),
                n || qv(u, l, a, i.state))),
            t && e === null)
          )
            throw Error(s(528, ""));
          return i;
        }
        if (t && e !== null) throw Error(s(529, ""));
        return null;
      case "script":
        return (
          (t = a.async),
          (a = a.src),
          typeof a == "string" && t && typeof t != "function" && typeof t != "symbol"
            ? ((t = Ae(a)),
              (a = Ka(u).hoistableScripts),
              (e = a.get(t)),
              e ||
                ((e = {
                  type: "script",
                  instance: null,
                  count: 0,
                  state: null,
                }),
                a.set(t, e)),
              e)
            : { type: "void", instance: null, count: 0, state: null }
        );
      default:
        throw Error(s(444, l));
    }
  }
  function Ee(l) {
    return 'href="' + mt(l) + '"';
  }
  function mu(l) {
    return 'link[rel="stylesheet"][' + l + "]";
  }
  function Fd(l) {
    return R({}, l, {
      "data-precedence": l.precedence,
      precedence: null,
    });
  }
  function qv(l, t, a, e) {
    l.querySelector('link[rel="preload"][as="style"][' + t + "]")
      ? (e.loading = 1)
      : ((t = l.createElement("link")),
        (e.preload = t),
        t.addEventListener("load", () => (e.loading |= 1)),
        t.addEventListener("error", () => (e.loading |= 2)),
        Xl(t, "link", a),
        Hl(t),
        l.head.appendChild(t));
  }
  function Ae(l) {
    return '[src="' + mt(l) + '"]';
  }
  function vu(l) {
    return "script[async]" + l;
  }
  function Id(l, t, a) {
    if ((t.count++, t.instance === null))
      switch (t.type) {
        case "style":
          var e = l.querySelector('style[data-href~="' + mt(a.href) + '"]');
          if (e) return (t.instance = e), Hl(e), e;
          var u = R({}, a, {
            "data-href": a.href,
            "data-precedence": a.precedence,
            href: null,
            precedence: null,
          });
          return (
            (e = (l.ownerDocument || l).createElement("style")),
            Hl(e),
            Xl(e, "style", u),
            jn(e, a.precedence, l),
            (t.instance = e)
          );
        case "stylesheet":
          u = Ee(a.href);
          var n = l.querySelector(mu(u));
          if (n) return (t.state.loading |= 4), (t.instance = n), Hl(n), n;
          (e = Fd(a)),
            (u = zt.get(u)) && $c(e, u),
            (n = (l.ownerDocument || l).createElement("link")),
            Hl(n);
          var i = n;
          return (
            (i._p = new Promise((c, f) => {
              (i.onload = c), (i.onerror = f);
            })),
            Xl(n, "link", e),
            (t.state.loading |= 4),
            jn(n, a.precedence, l),
            (t.instance = n)
          );
        case "script":
          return (
            (n = Ae(a.src)),
            (u = l.querySelector(vu(n)))
              ? ((t.instance = u), Hl(u), u)
              : ((e = a),
                (u = zt.get(n)) && ((e = R({}, a)), kc(e, u)),
                (l = l.ownerDocument || l),
                (u = l.createElement("script")),
                Hl(u),
                Xl(u, "link", e),
                l.head.appendChild(u),
                (t.instance = u))
          );
        case "void":
          return null;
        default:
          throw Error(s(443, t.type));
      }
    else
      t.type === "stylesheet" &&
        (t.state.loading & 4) === 0 &&
        ((e = t.instance), (t.state.loading |= 4), jn(e, a.precedence, l));
    return t.instance;
  }
  function jn(l, t, a) {
    for (
      var e = a.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),
        u = e.length ? e[e.length - 1] : null,
        n = u,
        i = 0;
      i < e.length;
      i++
    ) {
      var c = e[i];
      if (c.dataset.precedence === t) n = c;
      else if (n !== u) break;
    }
    n
      ? n.parentNode.insertBefore(l, n.nextSibling)
      : ((t = a.nodeType === 9 ? a.head : a), t.insertBefore(l, t.firstChild));
  }
  function $c(l, t) {
    l.crossOrigin == null && (l.crossOrigin = t.crossOrigin),
      l.referrerPolicy == null && (l.referrerPolicy = t.referrerPolicy),
      l.title == null && (l.title = t.title);
  }
  function kc(l, t) {
    l.crossOrigin == null && (l.crossOrigin = t.crossOrigin),
      l.referrerPolicy == null && (l.referrerPolicy = t.referrerPolicy),
      l.integrity == null && (l.integrity = t.integrity);
  }
  var Mn = null;
  function Pd(l, t, a) {
    if (Mn === null) {
      var e = /* @__PURE__ */ new Map(),
        u = (Mn = /* @__PURE__ */ new Map());
      u.set(a, e);
    } else (u = Mn), (e = u.get(a)), e || ((e = /* @__PURE__ */ new Map()), u.set(a, e));
    if (e.has(l)) return e;
    for (e.set(l, null), a = a.getElementsByTagName(l), u = 0; u < a.length; u++) {
      var n = a[u];
      if (
        !(n[Oe] || n[ql] || (l === "link" && n.getAttribute("rel") === "stylesheet")) &&
        n.namespaceURI !== "http://www.w3.org/2000/svg"
      ) {
        var i = n.getAttribute(t) || "";
        i = l + i;
        var c = e.get(i);
        c ? c.push(n) : e.set(i, [n]);
      }
    }
    return e;
  }
  function lr(l, t, a) {
    (l = l.ownerDocument || l),
      l.head.insertBefore(a, t === "title" ? l.querySelector("head > title") : null);
  }
  function Bv(l, t, a) {
    if (a === 1 || t.itemProp != null) return !1;
    switch (l) {
      case "meta":
      case "title":
        return !0;
      case "style":
        if (typeof t.precedence != "string" || typeof t.href != "string" || t.href === "") break;
        return !0;
      case "link":
        if (
          typeof t.rel != "string" ||
          typeof t.href != "string" ||
          t.href === "" ||
          t.onLoad ||
          t.onError
        )
          break;
        switch (t.rel) {
          case "stylesheet":
            return (l = t.disabled), typeof t.precedence == "string" && l == null;
          default:
            return !0;
        }
      case "script":
        if (
          t.async &&
          typeof t.async != "function" &&
          typeof t.async != "symbol" &&
          !t.onLoad &&
          !t.onError &&
          t.src &&
          typeof t.src == "string"
        )
          return !0;
    }
    return !1;
  }
  function tr(l) {
    return !(l.type === "stylesheet" && (l.state.loading & 3) === 0);
  }
  function Yv(l, t, a, e) {
    if (
      a.type === "stylesheet" &&
      (typeof e.media != "string" || matchMedia(e.media).matches !== !1) &&
      (a.state.loading & 4) === 0
    ) {
      if (a.instance === null) {
        var u = Ee(e.href),
          n = t.querySelector(mu(u));
        if (n) {
          (t = n._p),
            t !== null &&
              typeof t == "object" &&
              typeof t.then == "function" &&
              (l.count++, (l = On.bind(l)), t.then(l, l)),
            (a.state.loading |= 4),
            (a.instance = n),
            Hl(n);
          return;
        }
        (n = t.ownerDocument || t),
          (e = Fd(e)),
          (u = zt.get(u)) && $c(e, u),
          (n = n.createElement("link")),
          Hl(n);
        var i = n;
        (i._p = new Promise((c, f) => {
          (i.onload = c), (i.onerror = f);
        })),
          Xl(n, "link", e),
          (a.instance = n);
      }
      l.stylesheets === null && (l.stylesheets = /* @__PURE__ */ new Map()),
        l.stylesheets.set(a, t),
        (t = a.state.preload) &&
          (a.state.loading & 3) === 0 &&
          (l.count++,
          (a = On.bind(l)),
          t.addEventListener("load", a),
          t.addEventListener("error", a));
    }
  }
  var Fc = 0;
  function Gv(l, t) {
    return (
      l.stylesheets && l.count === 0 && Un(l, l.stylesheets),
      0 < l.count || 0 < l.imgCount
        ? (a) => {
            var e = setTimeout(() => {
              if ((l.stylesheets && Un(l, l.stylesheets), l.unsuspend)) {
                var n = l.unsuspend;
                (l.unsuspend = null), n();
              }
            }, 6e4 + t);
            0 < l.imgBytes && Fc === 0 && (Fc = 62500 * bv());
            var u = setTimeout(
              () => {
                if (
                  ((l.waitingForImages = !1),
                  l.count === 0 && (l.stylesheets && Un(l, l.stylesheets), l.unsuspend))
                ) {
                  var n = l.unsuspend;
                  (l.unsuspend = null), n();
                }
              },
              (l.imgBytes > Fc ? 50 : 800) + t,
            );
            return (
              (l.unsuspend = a),
              () => {
                (l.unsuspend = null), clearTimeout(e), clearTimeout(u);
              }
            );
          }
        : null
    );
  }
  function On() {
    if ((this.count--, this.count === 0 && (this.imgCount === 0 || !this.waitingForImages))) {
      if (this.stylesheets) Un(this, this.stylesheets);
      else if (this.unsuspend) {
        var l = this.unsuspend;
        (this.unsuspend = null), l();
      }
    }
  }
  var Dn = null;
  function Un(l, t) {
    (l.stylesheets = null),
      l.unsuspend !== null &&
        (l.count++, (Dn = /* @__PURE__ */ new Map()), t.forEach(Xv, l), (Dn = null), On.call(l));
  }
  function Xv(l, t) {
    if (!(t.state.loading & 4)) {
      var a = Dn.get(l);
      if (a) var e = a.get(null);
      else {
        (a = /* @__PURE__ */ new Map()), Dn.set(l, a);
        for (
          var u = l.querySelectorAll("link[data-precedence],style[data-precedence]"), n = 0;
          n < u.length;
          n++
        ) {
          var i = u[n];
          (i.nodeName === "LINK" || i.getAttribute("media") !== "not all") &&
            (a.set(i.dataset.precedence, i), (e = i));
        }
        e && a.set(null, e);
      }
      (u = t.instance),
        (i = u.getAttribute("data-precedence")),
        (n = a.get(i) || e),
        n === e && a.set(null, u),
        a.set(i, u),
        this.count++,
        (e = On.bind(this)),
        u.addEventListener("load", e),
        u.addEventListener("error", e),
        n
          ? n.parentNode.insertBefore(u, n.nextSibling)
          : ((l = l.nodeType === 9 ? l.head : l), l.insertBefore(u, l.firstChild)),
        (t.state.loading |= 4);
    }
  }
  var hu = {
    $$typeof: fl,
    Provider: null,
    Consumer: null,
    _currentValue: X,
    _currentValue2: X,
    _threadCount: 0,
  };
  function Qv(l, t, a, e, u, n, i, c, f) {
    (this.tag = 1),
      (this.containerInfo = l),
      (this.pingCache = this.current = this.pendingChildren = null),
      (this.timeoutHandle = -1),
      (this.callbackNode =
        this.next =
        this.pendingContext =
        this.context =
        this.cancelPendingCommit =
          null),
      (this.callbackPriority = 0),
      (this.expirationTimes = Jn(-1)),
      (this.entangledLanes =
        this.shellSuspendCounter =
        this.errorRecoveryDisabledLanes =
        this.expiredLanes =
        this.warmLanes =
        this.pingedLanes =
        this.suspendedLanes =
        this.pendingLanes =
          0),
      (this.entanglements = Jn(0)),
      (this.hiddenUpdates = Jn(null)),
      (this.identifierPrefix = e),
      (this.onUncaughtError = u),
      (this.onCaughtError = n),
      (this.onRecoverableError = i),
      (this.pooledCache = null),
      (this.pooledCacheLanes = 0),
      (this.formState = f),
      (this.incompleteTransitions = /* @__PURE__ */ new Map());
  }
  function ar(l, t, a, e, u, n, i, c, f, h, b, T) {
    return (
      (l = new Qv(l, t, a, i, f, h, b, T, c)),
      (t = 1),
      n === !0 && (t |= 24),
      (n = it(3, null, null, t)),
      (l.current = n),
      (n.stateNode = l),
      (t = Oi()),
      t.refCount++,
      (l.pooledCache = t),
      t.refCount++,
      (n.memoizedState = {
        element: e,
        isDehydrated: a,
        cache: t,
      }),
      Hi(n),
      l
    );
  }
  function er(l) {
    return l ? ((l = te), l) : te;
  }
  function ur(l, t, a, e, u, n) {
    (u = er(u)),
      e.context === null ? (e.context = u) : (e.pendingContext = u),
      (e = ua(t)),
      (e.payload = { element: a }),
      (n = n === void 0 ? null : n),
      n !== null && (e.callback = n),
      (a = na(l, e, t)),
      a !== null && (tt(a, l, t), we(a, l, t));
  }
  function nr(l, t) {
    if (((l = l.memoizedState), l !== null && l.dehydrated !== null)) {
      var a = l.retryLane;
      l.retryLane = a !== 0 && a < t ? a : t;
    }
  }
  function Ic(l, t) {
    nr(l, t), (l = l.alternate) && nr(l, t);
  }
  function ir(l) {
    if (l.tag === 13 || l.tag === 31) {
      var t = ja(l, 67108864);
      t !== null && tt(t, l, 67108864), Ic(l, 67108864);
    }
  }
  function cr(l) {
    if (l.tag === 13 || l.tag === 31) {
      var t = dt();
      t = wn(t);
      var a = ja(l, t);
      a !== null && tt(a, l, t), Ic(l, t);
    }
  }
  var Cn = !0;
  function Zv(l, t, a, e) {
    var u = S.T;
    S.T = null;
    var n = M.p;
    try {
      (M.p = 2), Pc(l, t, a, e);
    } finally {
      (M.p = n), (S.T = u);
    }
  }
  function Vv(l, t, a, e) {
    var u = S.T;
    S.T = null;
    var n = M.p;
    try {
      (M.p = 8), Pc(l, t, a, e);
    } finally {
      (M.p = n), (S.T = u);
    }
  }
  function Pc(l, t, a, e) {
    if (Cn) {
      var u = lf(e);
      if (u === null) Gc(l, t, e, Hn, a), sr(l, e);
      else if (Kv(u, l, t, a, e)) e.stopPropagation();
      else if ((sr(l, e), t & 4 && -1 < Lv.indexOf(l))) {
        while (u !== null) {
          var n = La(u);
          if (n !== null)
            switch (n.tag) {
              case 3:
                if (((n = n.stateNode), n.current.memoizedState.isDehydrated)) {
                  var i = Ea(n.pendingLanes);
                  if (i !== 0) {
                    var c = n;
                    for (c.pendingLanes |= 2, c.entangledLanes |= 2; i; ) {
                      var f = 1 << (31 - ut(i));
                      (c.entanglements[1] |= f), (i &= ~f);
                    }
                    Ot(n), (nl & 6) === 0 && ((yn = at() + 500), su(0));
                  }
                }
                break;
              case 31:
              case 13:
                (c = ja(n, 2)), c !== null && tt(c, n, 2), pn(), Ic(n, 2);
            }
          if (((n = lf(e)), n === null && Gc(l, t, e, Hn, a), n === u)) break;
          u = n;
        }
        u !== null && e.stopPropagation();
      } else Gc(l, t, e, null, a);
    }
  }
  function lf(l) {
    return (l = ai(l)), tf(l);
  }
  var Hn = null;
  function tf(l) {
    if (((Hn = null), (l = Va(l)), l !== null)) {
      var t = j(l);
      if (t === null) l = null;
      else {
        var a = t.tag;
        if (a === 13) {
          if (((l = Q(t)), l !== null)) return l;
          l = null;
        } else if (a === 31) {
          if (((l = Z(t)), l !== null)) return l;
          l = null;
        } else if (a === 3) {
          if (t.stateNode.current.memoizedState.isDehydrated)
            return t.tag === 3 ? t.stateNode.containerInfo : null;
          l = null;
        } else t !== l && (l = null);
      }
    }
    return (Hn = l), null;
  }
  function fr(l) {
    switch (l) {
      case "beforetoggle":
      case "cancel":
      case "click":
      case "close":
      case "contextmenu":
      case "copy":
      case "cut":
      case "auxclick":
      case "dblclick":
      case "dragend":
      case "dragstart":
      case "drop":
      case "focusin":
      case "focusout":
      case "input":
      case "invalid":
      case "keydown":
      case "keypress":
      case "keyup":
      case "mousedown":
      case "mouseup":
      case "paste":
      case "pause":
      case "play":
      case "pointercancel":
      case "pointerdown":
      case "pointerup":
      case "ratechange":
      case "reset":
      case "resize":
      case "seeked":
      case "submit":
      case "toggle":
      case "touchcancel":
      case "touchend":
      case "touchstart":
      case "volumechange":
      case "change":
      case "selectionchange":
      case "textInput":
      case "compositionstart":
      case "compositionend":
      case "compositionupdate":
      case "beforeblur":
      case "afterblur":
      case "beforeinput":
      case "blur":
      case "fullscreenchange":
      case "focus":
      case "hashchange":
      case "popstate":
      case "select":
      case "selectstart":
        return 2;
      case "drag":
      case "dragenter":
      case "dragexit":
      case "dragleave":
      case "dragover":
      case "mousemove":
      case "mouseout":
      case "mouseover":
      case "pointermove":
      case "pointerout":
      case "pointerover":
      case "scroll":
      case "touchmove":
      case "wheel":
      case "mouseenter":
      case "mouseleave":
      case "pointerenter":
      case "pointerleave":
        return 8;
      case "message":
        switch (Mr()) {
          case hf:
            return 2;
          case yf:
            return 8;
          case Tu:
          case Or:
            return 32;
          case gf:
            return 268435456;
          default:
            return 32;
        }
      default:
        return 32;
    }
  }
  var af = !1,
    ya = null,
    ga = null,
    pa = null,
    yu = /* @__PURE__ */ new Map(),
    gu = /* @__PURE__ */ new Map(),
    ba = [],
    Lv =
      "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(
        " ",
      );
  function sr(l, t) {
    switch (l) {
      case "focusin":
      case "focusout":
        ya = null;
        break;
      case "dragenter":
      case "dragleave":
        ga = null;
        break;
      case "mouseover":
      case "mouseout":
        pa = null;
        break;
      case "pointerover":
      case "pointerout":
        yu.delete(t.pointerId);
        break;
      case "gotpointercapture":
      case "lostpointercapture":
        gu.delete(t.pointerId);
    }
  }
  function pu(l, t, a, e, u, n) {
    return l === null || l.nativeEvent !== n
      ? ((l = {
          blockedOn: t,
          domEventName: a,
          eventSystemFlags: e,
          nativeEvent: n,
          targetContainers: [u],
        }),
        t !== null && ((t = La(t)), t !== null && ir(t)),
        l)
      : ((l.eventSystemFlags |= e),
        (t = l.targetContainers),
        u !== null && t.indexOf(u) === -1 && t.push(u),
        l);
  }
  function Kv(l, t, a, e, u) {
    switch (t) {
      case "focusin":
        return (ya = pu(ya, l, t, a, e, u)), !0;
      case "dragenter":
        return (ga = pu(ga, l, t, a, e, u)), !0;
      case "mouseover":
        return (pa = pu(pa, l, t, a, e, u)), !0;
      case "pointerover":
        var n = u.pointerId;
        return yu.set(n, pu(yu.get(n) || null, l, t, a, e, u)), !0;
      case "gotpointercapture":
        return (n = u.pointerId), gu.set(n, pu(gu.get(n) || null, l, t, a, e, u)), !0;
    }
    return !1;
  }
  function or(l) {
    var t = Va(l.target);
    if (t !== null) {
      var a = j(t);
      if (a !== null) {
        if (((t = a.tag), t === 13)) {
          if (((t = Q(a)), t !== null)) {
            (l.blockedOn = t),
              Ef(l.priority, () => {
                cr(a);
              });
            return;
          }
        } else if (t === 31) {
          if (((t = Z(a)), t !== null)) {
            (l.blockedOn = t),
              Ef(l.priority, () => {
                cr(a);
              });
            return;
          }
        } else if (t === 3 && a.stateNode.current.memoizedState.isDehydrated) {
          l.blockedOn = a.tag === 3 ? a.stateNode.containerInfo : null;
          return;
        }
      }
    }
    l.blockedOn = null;
  }
  function Rn(l) {
    if (l.blockedOn !== null) return !1;
    for (var t = l.targetContainers; 0 < t.length; ) {
      var a = lf(l.nativeEvent);
      if (a === null) {
        a = l.nativeEvent;
        var e = new a.constructor(a.type, a);
        (ti = e), a.target.dispatchEvent(e), (ti = null);
      } else return (t = La(a)), t !== null && ir(t), (l.blockedOn = a), !1;
      t.shift();
    }
    return !0;
  }
  function dr(l, t, a) {
    Rn(l) && a.delete(t);
  }
  function Jv() {
    (af = !1),
      ya !== null && Rn(ya) && (ya = null),
      ga !== null && Rn(ga) && (ga = null),
      pa !== null && Rn(pa) && (pa = null),
      yu.forEach(dr),
      gu.forEach(dr);
  }
  function qn(l, t) {
    l.blockedOn === t &&
      ((l.blockedOn = null),
      af || ((af = !0), g.unstable_scheduleCallback(g.unstable_NormalPriority, Jv)));
  }
  var Bn = null;
  function rr(l) {
    Bn !== l &&
      ((Bn = l),
      g.unstable_scheduleCallback(g.unstable_NormalPriority, () => {
        Bn === l && (Bn = null);
        for (var t = 0; t < l.length; t += 3) {
          var a = l[t],
            e = l[t + 1],
            u = l[t + 2];
          if (typeof e != "function") {
            if (tf(e || a) === null) continue;
            break;
          }
          var n = La(a);
          n !== null &&
            (l.splice(t, 3),
            (t -= 3),
            lc(
              n,
              {
                pending: !0,
                data: u,
                method: a.method,
                action: e,
              },
              e,
              u,
            ));
        }
      }));
  }
  function _e(l) {
    function t(f) {
      return qn(f, l);
    }
    ya !== null && qn(ya, l),
      ga !== null && qn(ga, l),
      pa !== null && qn(pa, l),
      yu.forEach(t),
      gu.forEach(t);
    for (var a = 0; a < ba.length; a++) {
      var e = ba[a];
      e.blockedOn === l && (e.blockedOn = null);
    }
    while (0 < ba.length && ((a = ba[0]), a.blockedOn === null))
      or(a), a.blockedOn === null && ba.shift();
    if (((a = (l.ownerDocument || l).$$reactFormReplay), a != null))
      for (e = 0; e < a.length; e += 3) {
        var u = a[e],
          n = a[e + 1],
          i = u[$l] || null;
        if (typeof n == "function") i || rr(a);
        else if (i) {
          var c = null;
          if (n && n.hasAttribute("formAction")) {
            if (((u = n), (i = n[$l] || null))) c = i.formAction;
            else if (tf(u) !== null) continue;
          } else c = i.action;
          typeof c == "function" ? (a[e + 1] = c) : (a.splice(e, 3), (e -= 3)), rr(a);
        }
      }
  }
  function mr() {
    function l(n) {
      n.canIntercept &&
        n.info === "react-transition" &&
        n.intercept({
          handler: () => new Promise((i) => (u = i)),
          focusReset: "manual",
          scroll: "manual",
        });
    }
    function t() {
      u !== null && (u(), (u = null)), e || setTimeout(a, 20);
    }
    function a() {
      if (!e && !navigation.transition) {
        var n = navigation.currentEntry;
        n &&
          n.url != null &&
          navigation.navigate(n.url, {
            state: n.getState(),
            info: "react-transition",
            history: "replace",
          });
      }
    }
    if (typeof navigation == "object") {
      var e = !1,
        u = null;
      return (
        navigation.addEventListener("navigate", l),
        navigation.addEventListener("navigatesuccess", t),
        navigation.addEventListener("navigateerror", t),
        setTimeout(a, 100),
        () => {
          (e = !0),
            navigation.removeEventListener("navigate", l),
            navigation.removeEventListener("navigatesuccess", t),
            navigation.removeEventListener("navigateerror", t),
            u !== null && (u(), (u = null));
        }
      );
    }
  }
  function ef(l) {
    this._internalRoot = l;
  }
  (Yn.prototype.render = ef.prototype.render =
    function (l) {
      var t = this._internalRoot;
      if (t === null) throw Error(s(409));
      var a = t.current,
        e = dt();
      ur(a, e, l, t, null, null);
    }),
    (Yn.prototype.unmount = ef.prototype.unmount =
      function () {
        var l = this._internalRoot;
        if (l !== null) {
          this._internalRoot = null;
          var t = l.containerInfo;
          ur(l.current, 2, null, l, null, null), pn(), (t[Za] = null);
        }
      });
  function Yn(l) {
    this._internalRoot = l;
  }
  Yn.prototype.unstable_scheduleHydration = (l) => {
    if (l) {
      var t = Tf();
      l = { blockedOn: null, target: l, priority: t };
      for (var a = 0; a < ba.length && t !== 0 && t < ba[a].priority; a++);
      ba.splice(a, 0, l), a === 0 && or(l);
    }
  };
  var vr = A.version;
  if (vr !== "19.2.3") throw Error(s(527, vr, "19.2.3"));
  M.findDOMNode = (l) => {
    var t = l._reactInternals;
    if (t === void 0)
      throw typeof l.render == "function"
        ? Error(s(188))
        : ((l = Object.keys(l).join(",")), Error(s(268, l)));
    return (l = E(t)), (l = l !== null ? B(l) : null), (l = l === null ? null : l.stateNode), l;
  };
  var wv = {
    bundleType: 0,
    version: "19.2.3",
    rendererPackageName: "react-dom",
    currentDispatcherRef: S,
    reconcilerVersion: "19.2.3",
  };
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
    var Gn = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!Gn.isDisabled && Gn.supportsFiber)
      try {
        (xe = Gn.inject(wv)), (et = Gn);
      } catch {}
  }
  return (
    (bu.createRoot = (l, t) => {
      if (!N(l)) throw Error(s(299));
      var a = !1,
        e = "",
        u = zo,
        n = To,
        i = Eo;
      return (
        t != null &&
          (t.unstable_strictMode === !0 && (a = !0),
          t.identifierPrefix !== void 0 && (e = t.identifierPrefix),
          t.onUncaughtError !== void 0 && (u = t.onUncaughtError),
          t.onCaughtError !== void 0 && (n = t.onCaughtError),
          t.onRecoverableError !== void 0 && (i = t.onRecoverableError)),
        (t = ar(l, 1, !1, null, null, a, e, null, u, n, i, mr)),
        (l[Za] = t.current),
        Yc(l),
        new ef(t)
      );
    }),
    (bu.hydrateRoot = (l, t, a) => {
      if (!N(l)) throw Error(s(299));
      var e = !1,
        u = "",
        n = zo,
        i = To,
        c = Eo,
        f = null;
      return (
        a != null &&
          (a.unstable_strictMode === !0 && (e = !0),
          a.identifierPrefix !== void 0 && (u = a.identifierPrefix),
          a.onUncaughtError !== void 0 && (n = a.onUncaughtError),
          a.onCaughtError !== void 0 && (i = a.onCaughtError),
          a.onRecoverableError !== void 0 && (c = a.onRecoverableError),
          a.formState !== void 0 && (f = a.formState)),
        (t = ar(l, 1, !0, t, a ?? null, e, u, f, n, i, c, mr)),
        (t.context = er(null)),
        (a = t.current),
        (e = dt()),
        (e = wn(e)),
        (u = ua(e)),
        (u.callback = null),
        na(a, u, e),
        (a = e),
        (t.current.lanes = a),
        Me(t, a),
        Ot(t),
        (l[Za] = t.current),
        Yc(l),
        new Yn(t)
      );
    }),
    (bu.version = "19.2.3"),
    bu
  );
}
var Tr;
function th() {
  if (Tr) return uf.exports;
  Tr = 1;
  function g() {
    if (
      !(
        typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" ||
        typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"
      )
    )
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(g);
      } catch (A) {
        console.error(A);
      }
  }
  return g(), (uf.exports = lh()), uf.exports;
}
var ah = th(),
  P = df(),
  of = { exports: {} },
  Su = {};
/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Er;
function eh() {
  if (Er) return Su;
  Er = 1;
  var g = Symbol.for("react.transitional.element"),
    A = Symbol.for("react.fragment");
  function x(s, N, j) {
    var Q = null;
    if ((j !== void 0 && (Q = "" + j), N.key !== void 0 && (Q = "" + N.key), "key" in N)) {
      j = {};
      for (var Z in N) Z !== "key" && (j[Z] = N[Z]);
    } else j = N;
    return (
      (N = j.ref),
      {
        $$typeof: g,
        type: s,
        key: Q,
        ref: N !== void 0 ? N : null,
        props: j,
      }
    );
  }
  return (Su.Fragment = A), (Su.jsx = x), (Su.jsxs = x), Su;
}
var Ar;
function uh() {
  return Ar || ((Ar = 1), (of.exports = eh())), of.exports;
}
var o = uh();
class nh {
  constructor(A) {
    (this.baseUrl = A.baseUrl.replace(/\/$/, "")),
      (this.headers = {
        "Content-Type": "application/json",
        ...A.headers,
      });
  }
  async request(A, x = {}) {
    const s = `${this.baseUrl}${A}`,
      N = await fetch(s, {
        ...x,
        headers: {
          ...this.headers,
          ...x.headers,
        },
      });
    if (!N.ok) {
      const j = await N.text();
      throw new Error(`API error ${N.status}: ${j}`);
    }
    return N.json();
  }
  // Session endpoints
  /**
   * List sessions with pagination and filtering.
   */
  async listSessions(A = 1, x = 20, s) {
    const N = new URLSearchParams({
      page: String(A),
      page_size: String(x),
    });
    return (
      s != null && s.verdict && N.set("verdict", s.verdict),
      (s == null ? void 0 : s.minConfidence) !== void 0 &&
        N.set("min_confidence", String(s.minConfidence)),
      (s == null ? void 0 : s.maxConfidence) !== void 0 &&
        N.set("max_confidence", String(s.maxConfidence)),
      s != null && s.startDate && N.set("start_date", s.startDate),
      s != null && s.endDate && N.set("end_date", s.endDate),
      s != null && s.participantId && N.set("participant_id", s.participantId),
      this.request(`/sessions?${N}`)
    );
  }
  /**
   * Get a single session by ID.
   */
  async getSession(A) {
    return this.request(`/sessions/${A}`);
  }
  /**
   * Get trials for a session.
   */
  async getSessionTrials(A) {
    return this.request(`/sessions/${A}/trials`);
  }
  /**
   * Get verdict for a session.
   */
  async getSessionVerdict(A) {
    return this.request(`/sessions/${A}/verdict`);
  }
  // Analysis endpoints
  /**
   * Get analysis summary statistics.
   */
  async getAnalysisSummary() {
    return this.request("/analysis/summary");
  }
  /**
   * Get flag distribution.
   */
  async getFlagDistribution() {
    return this.request("/analysis/flags");
  }
  /**
   * Get verdict distribution.
   */
  async getVerdictDistribution() {
    return this.request("/analysis/verdicts");
  }
  /**
   * Trigger batch analysis.
   */
  async triggerBatchAnalysis(A) {
    return this.request("/analysis/batch", {
      method: "POST",
      body: JSON.stringify({ session_ids: A }),
    });
  }
  // Export endpoints
  /**
   * Export sessions to CSV or JSON.
   */
  async exportSessions(A) {
    var j;
    const x = new URLSearchParams({
      format: A.format,
    });
    A.includeTrials && x.set("include_trials", "true"),
      A.includeMetrics && x.set("include_metrics", "true"),
      (j = A.filters) != null && j.verdict && x.set("verdict", A.filters.verdict);
    const s = `${this.baseUrl}/export?${x}`,
      N = await fetch(s, { headers: this.headers });
    if (!N.ok) throw new Error(`Export failed: ${N.status}`);
    return N.blob();
  }
  // JATOS endpoints
  /**
   * Connect to JATOS instance.
   */
  async connectJatos(A, x) {
    return this.request("/jatos/connect", {
      method: "POST",
      body: JSON.stringify({ url: A, token: x }),
    });
  }
  /**
   * List JATOS studies.
   */
  async listJatosStudies() {
    return this.request("/jatos/studies");
  }
  /**
   * Sync JATOS study results.
   */
  async syncJatos(A) {
    return this.request("/jatos/sync", {
      method: "POST",
      body: JSON.stringify({ study_id: A }),
    });
  }
  /**
   * Get JATOS connection status.
   */
  async getJatosStatus() {
    return this.request("/jatos/status");
  }
  // Prolific endpoints
  /**
   * Connect to Prolific.
   */
  async connectProlific(A) {
    return this.request("/prolific/connect", {
      method: "POST",
      body: JSON.stringify({ token: A }),
    });
  }
  /**
   * List Prolific studies.
   */
  async listProlificStudies() {
    return this.request("/prolific/studies");
  }
  /**
   * Get recommendations for participant actions.
   */
  async getProlificRecommendations(A) {
    return this.request(`/prolific/studies/${A}/recommendations`);
  }
}
function ih(g) {
  return new nh({ baseUrl: g });
}
function ch(g) {
  const {
      url: A,
      reconnect: x = !0,
      reconnectInterval: s = 3e3,
      maxReconnectAttempts: N = 5,
      onSessionNew: j,
      onVerdictComputed: Q,
      onSyncProgress: Z,
      onError: O,
    } = g,
    [E, B] = P.useState("disconnected"),
    [R, ll] = P.useState(null),
    ul = P.useRef(null),
    cl = P.useRef(0),
    rl = P.useRef(null),
    Ul = P.useCallback(
      (fl) => {
        try {
          const bl = JSON.parse(fl.data);
          switch ((ll(bl), bl.type)) {
            case "session.new":
              j == null || j(bl.data);
              break;
            case "verdict.computed":
              Q == null || Q(bl.data);
              break;
            case "sync.progress":
              Z == null || Z(bl.data);
              break;
          }
        } catch {
          console.error("Failed to parse WebSocket message:", fl.data);
        }
      },
      [j, Q, Z],
    ),
    Y = P.useCallback(() => {
      var bl;
      if (((bl = ul.current) == null ? void 0 : bl.readyState) === WebSocket.OPEN) return;
      B("connecting");
      const fl = new WebSocket(A);
      (ul.current = fl),
        (fl.onopen = () => {
          B("connected"), (cl.current = 0);
        }),
        (fl.onmessage = Ul),
        (fl.onerror = (wl) => {
          B("error"), O == null || O(wl);
        }),
        (fl.onclose = () => {
          B("disconnected"),
            (ul.current = null),
            x &&
              cl.current < N &&
              ((cl.current += 1),
              (rl.current = setTimeout(() => {
                Y();
              }, s)));
        });
    }, [A, x, s, N, Ul, O]),
    Ql = P.useCallback(() => {
      rl.current && (clearTimeout(rl.current), (rl.current = null)),
        (cl.current = N),
        ul.current && (ul.current.close(), (ul.current = null)),
        B("disconnected");
    }, [N]);
  return (
    P.useEffect(
      () => (
        Y(),
        () => {
          Ql();
        }
      ),
      [Y, Ql],
    ),
    {
      connectionState: E,
      lastMessage: R,
      connect: Y,
      disconnect: Ql,
    }
  );
}
function rf({ verdict: g, confidence: A, showConfidence: x = !1, className: s = "" }) {
  const N = "slopit-verdict-badge",
    j = `${N}--${g}`;
  return /* @__PURE__ */ o.jsxs("span", {
    className: `${N} ${j} ${s}`.trim(),
    children: [
      /* @__PURE__ */ o.jsx(fh, { verdict: g }),
      /* @__PURE__ */ o.jsx("span", { children: g }),
      x &&
        A !== void 0 &&
        /* @__PURE__ */ o.jsxs("span", {
          className: "slopit-verdict-confidence",
          children: ["(", Math.round(A * 100), "%)"],
        }),
    ],
  });
}
function fh({ verdict: g }) {
  switch (g) {
    case "clean":
      return /* @__PURE__ */ o.jsx("svg", {
        width: "14",
        height: "14",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        children: /* @__PURE__ */ o.jsx("path", { d: "M20 6L9 17l-5-5" }),
      });
    case "suspicious":
      return /* @__PURE__ */ o.jsxs("svg", {
        width: "14",
        height: "14",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        children: [
          /* @__PURE__ */ o.jsx("circle", { cx: "12", cy: "12", r: "10" }),
          /* @__PURE__ */ o.jsx("line", { x1: "12", y1: "8", x2: "12", y2: "12" }),
          /* @__PURE__ */ o.jsx("line", { x1: "12", y1: "16", x2: "12.01", y2: "16" }),
        ],
      });
    case "flagged":
      return /* @__PURE__ */ o.jsxs("svg", {
        width: "14",
        height: "14",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        children: [
          /* @__PURE__ */ o.jsx("path", {
            d: "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z",
          }),
          /* @__PURE__ */ o.jsx("line", { x1: "4", y1: "22", x2: "4", y2: "15" }),
        ],
      });
  }
}
function sh({ summary: g }) {
  const A = ["clean", "suspicious", "flagged"];
  return /* @__PURE__ */ o.jsxs("div", {
    className: "slopit-analysis-summary",
    children: [
      /* @__PURE__ */ o.jsxs("div", {
        className: "slopit-summary-cards",
        children: [
          /* @__PURE__ */ o.jsx("div", {
            className: "slopit-card",
            children: /* @__PURE__ */ o.jsxs("div", {
              className: "slopit-card-body",
              children: [
                /* @__PURE__ */ o.jsx("div", {
                  className: "slopit-stat-large",
                  children: g.totalSessions,
                }),
                /* @__PURE__ */ o.jsx("div", {
                  className: "slopit-stat-label",
                  children: "Total Sessions",
                }),
              ],
            }),
          }),
          /* @__PURE__ */ o.jsx("div", {
            className: "slopit-card",
            children: /* @__PURE__ */ o.jsxs("div", {
              className: "slopit-card-body",
              children: [
                /* @__PURE__ */ o.jsx("div", {
                  className: "slopit-stat-large",
                  children: g.analyzedSessions,
                }),
                /* @__PURE__ */ o.jsx("div", {
                  className: "slopit-stat-label",
                  children: "Analyzed",
                }),
              ],
            }),
          }),
          /* @__PURE__ */ o.jsx("div", {
            className: "slopit-card",
            children: /* @__PURE__ */ o.jsxs("div", {
              className: "slopit-card-body",
              children: [
                /* @__PURE__ */ o.jsxs("div", {
                  className: "slopit-stat-large",
                  children: [(g.averageConfidence * 100).toFixed(0), "%"],
                }),
                /* @__PURE__ */ o.jsx("div", {
                  className: "slopit-stat-label",
                  children: "Avg Confidence",
                }),
              ],
            }),
          }),
        ],
      }),
      /* @__PURE__ */ o.jsxs("div", {
        className: "slopit-verdict-summary",
        children: [
          /* @__PURE__ */ o.jsx("h4", { children: "Verdict Distribution" }),
          /* @__PURE__ */ o.jsx("div", {
            className: "slopit-verdict-bars",
            children: A.map((x) => {
              const s = g.verdictDistribution[x] ?? 0,
                N = g.analyzedSessions > 0 ? (s / g.analyzedSessions) * 100 : 0;
              return /* @__PURE__ */ o.jsxs(
                "div",
                {
                  className: "slopit-verdict-bar-row",
                  children: [
                    /* @__PURE__ */ o.jsx(rf, { verdict: x }),
                    /* @__PURE__ */ o.jsx("div", {
                      className: "slopit-verdict-bar-track",
                      children: /* @__PURE__ */ o.jsx("div", {
                        className: `slopit-verdict-bar-fill slopit-verdict-bar-fill--${x}`,
                        style: { width: `${N}%` },
                      }),
                    }),
                    /* @__PURE__ */ o.jsxs("span", {
                      className: "slopit-verdict-count",
                      children: [s, " (", N.toFixed(0), "%)"],
                    }),
                  ],
                },
                x,
              );
            }),
          }),
        ],
      }),
    ],
  });
}
function oh({ scores: g, bins: A = 10, title: x }) {
  const s = dh(g, A),
    N = Math.max(...s.map((j) => j.count), 1);
  return g.length === 0
    ? /* @__PURE__ */ o.jsxs("div", {
        className: "slopit-confidence-histogram",
        children: [
          x && /* @__PURE__ */ o.jsx("h3", { className: "slopit-chart-title", children: x }),
          /* @__PURE__ */ o.jsx("div", {
            className: "slopit-empty-state",
            children: /* @__PURE__ */ o.jsx("p", { children: "No data to display" }),
          }),
        ],
      })
    : /* @__PURE__ */ o.jsxs("div", {
        className: "slopit-confidence-histogram",
        children: [
          x && /* @__PURE__ */ o.jsx("h3", { className: "slopit-chart-title", children: x }),
          /* @__PURE__ */ o.jsx("div", {
            className: "slopit-histogram",
            children: s.map((j) =>
              /* @__PURE__ */ o.jsx(
                "div",
                {
                  className: "slopit-histogram-bar",
                  style: { height: `${(j.count / N) * 100}%` },
                  title: `${j.min.toFixed(1)}-${j.max.toFixed(1)}: ${j.count}`,
                },
                j.min,
              ),
            ),
          }),
          /* @__PURE__ */ o.jsxs("div", {
            className: "slopit-histogram-axis",
            children: [
              /* @__PURE__ */ o.jsx("span", { children: "0" }),
              /* @__PURE__ */ o.jsx("span", { children: "0.5" }),
              /* @__PURE__ */ o.jsx("span", { children: "1.0" }),
            ],
          }),
        ],
      });
}
function dh(g, A) {
  const x = 1 / A,
    s = [];
  for (let N = 0; N < A; N++) {
    const j = N * x,
      Q = (N + 1) * x,
      Z = g.filter((O) => O >= j && (N === A - 1 ? O <= Q : O < Q)).length;
    s.push({ min: j, max: Q, count: Z });
  }
  return s;
}
function rh({ state: g, showLabel: A = !0 }) {
  const x = {
    connecting: "Connecting...",
    connected: "Connected",
    disconnected: "Disconnected",
    error: "Connection Error",
  };
  return /* @__PURE__ */ o.jsxs("div", {
    className: "slopit-connection-status",
    children: [
      /* @__PURE__ */ o.jsx("span", {
        className: `slopit-connection-indicator slopit-connection-indicator--${g}`,
      }),
      A && /* @__PURE__ */ o.jsx("span", { children: x[g] }),
    ],
  });
}
function mh({ distribution: g, title: A }) {
  const x = Object.entries(g).sort((N, j) => j[1] - N[1]),
    s = Math.max(...x.map(([N, j]) => j), 1);
  return x.length === 0
    ? /* @__PURE__ */ o.jsxs("div", {
        className: "slopit-flag-distribution",
        children: [
          A && /* @__PURE__ */ o.jsx("h3", { className: "slopit-chart-title", children: A }),
          /* @__PURE__ */ o.jsx("div", {
            className: "slopit-empty-state",
            children: /* @__PURE__ */ o.jsx("p", { children: "No flags to display" }),
          }),
        ],
      })
    : /* @__PURE__ */ o.jsxs("div", {
        className: "slopit-flag-distribution",
        children: [
          A && /* @__PURE__ */ o.jsx("h3", { className: "slopit-chart-title", children: A }),
          /* @__PURE__ */ o.jsx("div", {
            className: "slopit-flag-bars",
            children: x.map(([N, j]) =>
              /* @__PURE__ */ o.jsxs(
                "div",
                {
                  className: "slopit-flag-bar",
                  children: [
                    /* @__PURE__ */ o.jsx("span", {
                      className: "slopit-flag-label",
                      children: vh(N),
                    }),
                    /* @__PURE__ */ o.jsx("div", {
                      className: "slopit-flag-bar-track",
                      children: /* @__PURE__ */ o.jsx("div", {
                        className: "slopit-flag-bar-fill",
                        style: { width: `${(j / s) * 100}%` },
                      }),
                    }),
                    /* @__PURE__ */ o.jsx("span", { className: "slopit-flag-count", children: j }),
                  ],
                },
                N,
              ),
            ),
          }),
        ],
      });
}
function vh(g) {
  return g.replace(/_/g, " ").replace(/\b\w/g, (A) => A.toUpperCase());
}
function hh({ flags: g, groupByAnalyzer: A = !1 }) {
  if (g.length === 0)
    return /* @__PURE__ */ o.jsx("div", {
      className: "slopit-empty-state",
      children: /* @__PURE__ */ o.jsx("p", { children: "No flags detected" }),
    });
  if (A) {
    const x = g.reduce((s, N) => {
      const j = N.analyzer;
      return s[j] || (s[j] = []), s[j].push(N), s;
    }, {});
    return /* @__PURE__ */ o.jsx("div", {
      className: "slopit-flag-list slopit-flag-list--grouped",
      children: Object.entries(x).map(([s, N]) =>
        /* @__PURE__ */ o.jsxs(
          "div",
          {
            className: "slopit-flag-group",
            children: [
              /* @__PURE__ */ o.jsx("h4", { className: "slopit-flag-group-title", children: s }),
              /* @__PURE__ */ o.jsx("div", {
                className: "slopit-flag-group-items",
                children: N.map((j, Q) => /* @__PURE__ */ o.jsx(_r, { flag: j }, `${j.type}-${Q}`)),
              }),
            ],
          },
          s,
        ),
      ),
    });
  }
  return /* @__PURE__ */ o.jsx("div", {
    className: "slopit-flag-list",
    children: g.map((x, s) =>
      /* @__PURE__ */ o.jsx(_r, { flag: x, showAnalyzer: !0 }, `${x.type}-${s}`),
    ),
  });
}
function _r({ flag: g, showAnalyzer: A = !1 }) {
  return /* @__PURE__ */ o.jsxs("div", {
    className: `slopit-flag-item slopit-flag-item--${g.severity}`,
    children: [
      /* @__PURE__ */ o.jsx("div", {
        className: "slopit-flag-indicator",
        children: /* @__PURE__ */ o.jsx(gh, { severity: g.severity }),
      }),
      /* @__PURE__ */ o.jsxs("div", {
        className: "slopit-flag-content",
        children: [
          /* @__PURE__ */ o.jsx("div", { className: "slopit-flag-type", children: yh(g.type) }),
          /* @__PURE__ */ o.jsx("div", { className: "slopit-flag-message", children: g.message }),
          A &&
            /* @__PURE__ */ o.jsxs("div", {
              className: "slopit-flag-analyzer",
              children: ["Analyzer: ", g.analyzer],
            }),
          g.trialIndex !== void 0 &&
            /* @__PURE__ */ o.jsxs("div", {
              className: "slopit-flag-trial",
              children: ["Trial: ", g.trialIndex + 1],
            }),
        ],
      }),
      /* @__PURE__ */ o.jsx("div", {
        className: "slopit-flag-severity",
        children: /* @__PURE__ */ o.jsx("span", {
          className: `slopit-severity-badge slopit-severity-badge--${g.severity}`,
          children: g.severity,
        }),
      }),
    ],
  });
}
function yh(g) {
  return g.replace(/_/g, " ").replace(/\b\w/g, (A) => A.toUpperCase());
}
function gh({ severity: g }) {
  switch (g) {
    case "high":
      return /* @__PURE__ */ o.jsx("svg", {
        width: "16",
        height: "16",
        viewBox: "0 0 24 24",
        fill: "currentColor",
        children: /* @__PURE__ */ o.jsx("path", {
          d: "M12 2L2 22h20L12 2zm0 4l7.53 14H4.47L12 6zm-1 5v4h2v-4h-2zm0 6v2h2v-2h-2z",
        }),
      });
    case "medium":
      return /* @__PURE__ */ o.jsx("svg", {
        width: "16",
        height: "16",
        viewBox: "0 0 24 24",
        fill: "currentColor",
        children: /* @__PURE__ */ o.jsx("path", {
          d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 5h2v6h-2V7zm0 8h2v2h-2v-2z",
        }),
      });
    case "low":
      return /* @__PURE__ */ o.jsx("svg", {
        width: "16",
        height: "16",
        viewBox: "0 0 24 24",
        fill: "currentColor",
        children: /* @__PURE__ */ o.jsx("path", {
          d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 5h2v2h-2V7zm0 4h2v6h-2v-6z",
        }),
      });
  }
}
function ph({ trials: g, onTrialSelect: A }) {
  const [x, s] = P.useState(null),
    N = (j) => {
      s(x === j ? null : j), A == null || A(j);
    };
  return g.length === 0
    ? /* @__PURE__ */ o.jsx("div", {
        className: "slopit-empty-state",
        children: /* @__PURE__ */ o.jsx("p", { children: "No trials in this session" }),
      })
    : /* @__PURE__ */ o.jsx("div", {
        className: "slopit-trial-timeline",
        children: g.map((j, Q) =>
          /* @__PURE__ */ o.jsx(
            bh,
            {
              trial: j,
              index: Q,
              expanded: x === Q,
              onToggle: () => N(Q),
            },
            j.trialId,
          ),
        ),
      });
}
function bh({ trial: g, index: A, expanded: x, onToggle: s }) {
  var O, E, B;
  const N = g.behavioral,
    j = ((O = N == null ? void 0 : N.keystrokes) == null ? void 0 : O.length) ?? 0,
    Q = ((E = N == null ? void 0 : N.paste) == null ? void 0 : E.length) ?? 0,
    Z = ((B = N == null ? void 0 : N.focus) == null ? void 0 : B.length) ?? 0;
  return /* @__PURE__ */ o.jsxs("div", {
    className: `slopit-trial-item ${x ? "slopit-trial-item--expanded" : ""}`,
    children: [
      /* @__PURE__ */ o.jsxs("button", {
        type: "button",
        className: "slopit-trial-header",
        onClick: s,
        children: [
          /* @__PURE__ */ o.jsxs("span", {
            className: "slopit-trial-index",
            children: ["Trial ", A + 1],
          }),
          /* @__PURE__ */ o.jsxs("span", {
            className: "slopit-trial-summary",
            children: [j, " keystrokes, ", Q, " pastes, ", Z, " focus events"],
          }),
          /* @__PURE__ */ o.jsx("span", {
            className: "slopit-trial-toggle",
            children: x ? "−" : "+",
          }),
        ],
      }),
      x &&
        /* @__PURE__ */ o.jsxs("div", {
          className: "slopit-trial-details",
          children: [
            g.stimulus &&
              /* @__PURE__ */ o.jsxs("div", {
                className: "slopit-trial-section",
                children: [
                  /* @__PURE__ */ o.jsx("h4", { children: "Stimulus" }),
                  /* @__PURE__ */ o.jsx("p", { children: g.stimulus.content ?? g.stimulus.type }),
                ],
              }),
            g.response &&
              /* @__PURE__ */ o.jsxs("div", {
                className: "slopit-trial-section",
                children: [
                  /* @__PURE__ */ o.jsx("h4", { children: "Response" }),
                  /* @__PURE__ */ o.jsx("p", {
                    className: "slopit-response-text",
                    children: String(g.response.value),
                  }),
                  g.rt !== void 0 &&
                    /* @__PURE__ */ o.jsxs("p", {
                      className: "slopit-response-rt",
                      children: ["Response time: ", Math.round(g.rt), "ms"],
                    }),
                ],
              }),
            N &&
              /* @__PURE__ */ o.jsxs("div", {
                className: "slopit-trial-section",
                children: [
                  /* @__PURE__ */ o.jsx("h4", { children: "Behavioral Data" }),
                  /* @__PURE__ */ o.jsx(Sh, { behavioral: N }),
                ],
              }),
            (N == null ? void 0 : N.metrics) &&
              /* @__PURE__ */ o.jsxs("div", {
                className: "slopit-trial-section",
                children: [
                  /* @__PURE__ */ o.jsx("h4", { children: "Metrics" }),
                  /* @__PURE__ */ o.jsx(zh, { metrics: N.metrics }),
                ],
              }),
          ],
        }),
    ],
  });
}
function Sh({ behavioral: g }) {
  var x, s, N, j, Q;
  if (!g) return null;
  const A = [
    { label: "Keystrokes", value: ((x = g.keystrokes) == null ? void 0 : x.length) ?? 0 },
    { label: "Paste Events", value: ((s = g.paste) == null ? void 0 : s.length) ?? 0 },
    { label: "Focus Events", value: ((N = g.focus) == null ? void 0 : N.length) ?? 0 },
    { label: "Mouse Events", value: ((j = g.mouse) == null ? void 0 : j.length) ?? 0 },
    { label: "Scroll Events", value: ((Q = g.scroll) == null ? void 0 : Q.length) ?? 0 },
  ].filter((Z) => Z.value > 0);
  return /* @__PURE__ */ o.jsx("div", {
    className: "slopit-behavioral-stats",
    children: A.map((Z) =>
      /* @__PURE__ */ o.jsxs(
        "div",
        {
          className: "slopit-stat",
          children: [
            /* @__PURE__ */ o.jsx("span", { className: "slopit-stat-value", children: Z.value }),
            /* @__PURE__ */ o.jsx("span", { className: "slopit-stat-label", children: Z.label }),
          ],
        },
        Z.label,
      ),
    ),
  });
}
function zh({ metrics: g }) {
  if (!g) return null;
  const A = [];
  return (
    g.keystroke &&
      (A.push({
        label: "Mean IKI",
        value: `${Math.round(g.keystroke.meanIKI)}ms`,
      }),
      A.push({
        label: "IKI Std Dev",
        value: `${Math.round(g.keystroke.stdIKI)}ms`,
      })),
    g.timing &&
      (A.push({
        label: "Total Time",
        value: `${Math.round(g.timing.totalResponseTime / 1e3)}s`,
      }),
      g.timing.charactersPerMinute &&
        A.push({
          label: "Chars/min",
          value: g.timing.charactersPerMinute.toFixed(0),
        })),
    g.focus &&
      A.push({
        label: "Blur Count",
        value: String(g.focus.blurCount),
      }),
    /* @__PURE__ */ o.jsx("div", {
      className: "slopit-metrics-grid",
      children: A.map((x) =>
        /* @__PURE__ */ o.jsxs(
          "div",
          {
            className: "slopit-metric",
            children: [
              /* @__PURE__ */ o.jsx("span", {
                className: "slopit-metric-label",
                children: x.label,
              }),
              /* @__PURE__ */ o.jsx("span", {
                className: "slopit-metric-value",
                children: x.value,
              }),
            ],
          },
          x.label,
        ),
      ),
    })
  );
}
function Th({ apiClient: g, sessionId: A, onBack: x }) {
  const [s, N] = P.useState(null),
    [j, Q] = P.useState([]),
    [Z, O] = P.useState(null),
    [E, B] = P.useState(!0),
    [R, ll] = P.useState(null),
    [ul, cl] = P.useState("trials"),
    rl = P.useCallback(async () => {
      B(!0), ll(null);
      try {
        const [Y, Ql, fl] = await Promise.all([
          g.getSession(A),
          g.getSessionTrials(A),
          g.getSessionVerdict(A).catch(() => null),
        ]);
        N(Y), Q(Ql), O(fl);
      } catch (Y) {
        ll(Y instanceof Error ? Y.message : "Failed to load session");
      } finally {
        B(!1);
      }
    }, [g, A]);
  P.useEffect(() => {
    rl();
  }, [rl]);
  const Ul = (Y) => new Date(Y).toLocaleString();
  return E
    ? /* @__PURE__ */ o.jsx("div", {
        className: "slopit-loading",
        children: /* @__PURE__ */ o.jsx("div", { className: "slopit-spinner" }),
      })
    : R || !s
      ? /* @__PURE__ */ o.jsxs("div", {
          className: "slopit-error",
          children: [
            /* @__PURE__ */ o.jsxs("p", { children: ["Error: ", R ?? "Session not found"] }),
            /* @__PURE__ */ o.jsx("button", {
              type: "button",
              className: "slopit-button",
              onClick: rl,
              children: "Retry",
            }),
          ],
        })
      : /* @__PURE__ */ o.jsxs("div", {
          className: "slopit-session-detail",
          children: [
            /* @__PURE__ */ o.jsxs("div", {
              className: "slopit-session-header",
              children: [
                /* @__PURE__ */ o.jsxs("div", {
                  children: [
                    x &&
                      /* @__PURE__ */ o.jsx("button", {
                        type: "button",
                        className: "slopit-button slopit-button--secondary",
                        onClick: x,
                        style: { marginBottom: "var(--slopit-space-sm)" },
                        children: "Back to List",
                      }),
                    /* @__PURE__ */ o.jsxs("h2", {
                      className: "slopit-session-title",
                      children: ["Session ", A.slice(0, 8), "..."],
                    }),
                    /* @__PURE__ */ o.jsxs("div", {
                      className: "slopit-session-meta",
                      children: [
                        s.participantId &&
                          /* @__PURE__ */ o.jsxs("span", {
                            children: ["Participant: ", s.participantId],
                          }),
                        /* @__PURE__ */ o.jsxs("span", {
                          children: ["Started: ", Ul(String(s.timing.startTime))],
                        }),
                        s.timing.endTime &&
                          /* @__PURE__ */ o.jsxs("span", {
                            children: ["Ended: ", Ul(String(s.timing.endTime))],
                          }),
                        /* @__PURE__ */ o.jsxs("span", { children: ["Trials: ", s.trials.length] }),
                      ],
                    }),
                  ],
                }),
                Z &&
                  /* @__PURE__ */ o.jsx("div", {
                    className: "slopit-session-verdict",
                    children: /* @__PURE__ */ o.jsx(rf, {
                      verdict: Z.verdict,
                      confidence: Z.confidence,
                      showConfidence: !0,
                    }),
                  }),
              ],
            }),
            /* @__PURE__ */ o.jsxs("div", {
              className: "slopit-tabs",
              children: [
                /* @__PURE__ */ o.jsxs("button", {
                  type: "button",
                  className: `slopit-tab ${ul === "trials" ? "slopit-tab--active" : ""}`,
                  onClick: () => cl("trials"),
                  children: ["Trials (", j.length, ")"],
                }),
                /* @__PURE__ */ o.jsxs("button", {
                  type: "button",
                  className: `slopit-tab ${ul === "flags" ? "slopit-tab--active" : ""}`,
                  onClick: () => cl("flags"),
                  children: ["Flags (", (Z == null ? void 0 : Z.flags.length) ?? 0, ")"],
                }),
                /* @__PURE__ */ o.jsx("button", {
                  type: "button",
                  className: `slopit-tab ${ul === "raw" ? "slopit-tab--active" : ""}`,
                  onClick: () => cl("raw"),
                  children: "Raw Data",
                }),
              ],
            }),
            /* @__PURE__ */ o.jsxs("div", {
              className: "slopit-tab-content",
              children: [
                ul === "trials" && /* @__PURE__ */ o.jsx(ph, { trials: j }),
                ul === "flags" && Z && /* @__PURE__ */ o.jsx(hh, { flags: Z.flags }),
                ul === "raw" &&
                  /* @__PURE__ */ o.jsx("pre", {
                    className: "slopit-raw-data",
                    children: JSON.stringify(s, null, 2),
                  }),
              ],
            }),
          ],
        });
}
function Eh({ apiClient: g, onSessionSelect: A, filters: x, pageSize: s = 20 }) {
  const [N, j] = P.useState([]),
    [Q, Z] = P.useState(!0),
    [O, E] = P.useState(null),
    [B, R] = P.useState(1),
    [ll, ul] = P.useState(1),
    cl = P.useCallback(async () => {
      Z(!0), E(null);
      try {
        const Y = await g.listSessions(B, s, x);
        j(Y.items), ul(Math.ceil(Y.total / s));
      } catch (Y) {
        E(Y instanceof Error ? Y.message : "Failed to load sessions");
      } finally {
        Z(!1);
      }
    }, [g, B, s, x]);
  P.useEffect(() => {
    cl();
  }, [cl]);
  const rl = (Y) => {
      A == null || A(Y);
    },
    Ul = (Y) => new Date(Y).toLocaleString();
  return Q
    ? /* @__PURE__ */ o.jsx("div", {
        className: "slopit-loading",
        children: /* @__PURE__ */ o.jsx("div", { className: "slopit-spinner" }),
      })
    : O
      ? /* @__PURE__ */ o.jsxs("div", {
          className: "slopit-error",
          children: [
            /* @__PURE__ */ o.jsxs("p", { children: ["Error: ", O] }),
            /* @__PURE__ */ o.jsx("button", {
              type: "button",
              className: "slopit-button",
              onClick: cl,
              children: "Retry",
            }),
          ],
        })
      : /* @__PURE__ */ o.jsxs("div", {
          className: "slopit-session-list",
          children: [
            /* @__PURE__ */ o.jsxs("table", {
              className: "slopit-session-table",
              children: [
                /* @__PURE__ */ o.jsx("thead", {
                  children: /* @__PURE__ */ o.jsxs("tr", {
                    children: [
                      /* @__PURE__ */ o.jsx("th", { children: "Session ID" }),
                      /* @__PURE__ */ o.jsx("th", { children: "Participant" }),
                      /* @__PURE__ */ o.jsx("th", { children: "Start Time" }),
                      /* @__PURE__ */ o.jsx("th", { children: "Trials" }),
                      /* @__PURE__ */ o.jsx("th", { children: "Verdict" }),
                      /* @__PURE__ */ o.jsx("th", { children: "Flags" }),
                    ],
                  }),
                }),
                /* @__PURE__ */ o.jsx("tbody", {
                  children: N.map((Y) =>
                    /* @__PURE__ */ o.jsxs(
                      "tr",
                      {
                        onClick: () => rl(Y.sessionId),
                        children: [
                          /* @__PURE__ */ o.jsxs("td", {
                            className: "slopit-session-id",
                            children: [Y.sessionId.slice(0, 8), "..."],
                          }),
                          /* @__PURE__ */ o.jsx("td", { children: Y.participantId ?? "-" }),
                          /* @__PURE__ */ o.jsx("td", { children: Ul(Y.startTime) }),
                          /* @__PURE__ */ o.jsx("td", { children: Y.trialCount }),
                          /* @__PURE__ */ o.jsx("td", {
                            children: Y.verdict
                              ? /* @__PURE__ */ o.jsx(rf, {
                                  verdict: Y.verdict,
                                  confidence: Y.confidence,
                                  showConfidence: !0,
                                })
                              : /* @__PURE__ */ o.jsx("span", {
                                  className: "slopit-text-secondary",
                                  children: "Pending",
                                }),
                          }),
                          /* @__PURE__ */ o.jsx("td", { children: Y.flagCount }),
                        ],
                      },
                      Y.sessionId,
                    ),
                  ),
                }),
              ],
            }),
            N.length === 0 &&
              /* @__PURE__ */ o.jsx("div", {
                className: "slopit-empty-state",
                children: /* @__PURE__ */ o.jsx("p", { children: "No sessions found" }),
              }),
            /* @__PURE__ */ o.jsxs("div", {
              className: "slopit-pagination",
              children: [
                /* @__PURE__ */ o.jsx("button", {
                  type: "button",
                  className: "slopit-button slopit-button--secondary",
                  disabled: B <= 1,
                  onClick: () => R((Y) => Y - 1),
                  children: "Previous",
                }),
                /* @__PURE__ */ o.jsxs("span", {
                  className: "slopit-pagination-info",
                  children: ["Page ", B, " of ", ll],
                }),
                /* @__PURE__ */ o.jsx("button", {
                  type: "button",
                  className: "slopit-button slopit-button--secondary",
                  disabled: B >= ll,
                  onClick: () => R((Y) => Y + 1),
                  children: "Next",
                }),
              ],
            }),
          ],
        });
}
function Ah({ config: g }) {
  const { apiUrl: A, studyId: x, theme: s = "system", enableWebSocket: N = !0 } = g,
    j = P.useMemo(() => ih(A), [A]),
    [Q, Z] = P.useState("list"),
    [O, E] = P.useState(null),
    [B, R] = P.useState({}),
    [ll, ul] = P.useState(null),
    [cl, rl] = P.useState({}),
    [Ul, Y] = P.useState([]),
    Ql = A.replace(/^http/, "ws").replace(/\/api\/v1$/, "") + "/ws",
    { connectionState: fl } = ch({
      url: N ? Ql : "",
      onSessionNew: () => {
        bl();
      },
      onVerdictComputed: (sl) => {
        Y((Vl) => [...Vl, sl.confidence]);
      },
    }),
    bl = P.useCallback(async () => {
      try {
        const [sl, Vl] = await Promise.all([j.getAnalysisSummary(), j.getFlagDistribution()]);
        ul(sl), rl(Vl);
      } catch (sl) {
        console.error("Failed to load analytics:", sl);
      }
    }, [j]);
  P.useEffect(() => {
    bl();
  }, [bl]),
    P.useEffect(() => {
      const sl = document.documentElement;
      if (s === "system") {
        const Vl = window.matchMedia("(prefers-color-scheme: dark)").matches;
        sl.setAttribute("data-theme", Vl ? "dark" : "light");
      } else sl.setAttribute("data-theme", s);
    }, [s]);
  const wl = (sl) => {
      E(sl), Z("detail");
    },
    Zl = () => {
      E(null), Z("list");
    },
    w = (sl) => {
      R({ ...B, verdict: sl });
    };
  return /* @__PURE__ */ o.jsxs("div", {
    className: "slopit-dashboard",
    children: [
      /* @__PURE__ */ o.jsxs("header", {
        className: "slopit-dashboard-header",
        children: [
          /* @__PURE__ */ o.jsx("h1", {
            className: "slopit-dashboard-title",
            children: "Slopit Dashboard",
          }),
          x &&
            /* @__PURE__ */ o.jsxs("span", {
              className: "slopit-study-id",
              children: ["Study: ", x],
            }),
          N && /* @__PURE__ */ o.jsx(rh, { state: fl }),
        ],
      }),
      /* @__PURE__ */ o.jsxs("nav", {
        className: "slopit-dashboard-nav",
        children: [
          /* @__PURE__ */ o.jsx("button", {
            type: "button",
            className: `slopit-nav-item ${Q === "list" ? "slopit-nav-item--active" : ""}`,
            onClick: () => Z("list"),
            children: "Sessions",
          }),
          /* @__PURE__ */ o.jsx("button", {
            type: "button",
            className: `slopit-nav-item ${Q === "analytics" ? "slopit-nav-item--active" : ""}`,
            onClick: () => Z("analytics"),
            children: "Analytics",
          }),
        ],
      }),
      /* @__PURE__ */ o.jsxs("main", {
        className: "slopit-dashboard-main",
        children: [
          Q === "list" &&
            /* @__PURE__ */ o.jsxs("div", {
              className: "slopit-list-view",
              children: [
                /* @__PURE__ */ o.jsx("div", {
                  className: "slopit-filters",
                  children: /* @__PURE__ */ o.jsxs("label", {
                    children: [
                      "Filter by verdict:",
                      /* @__PURE__ */ o.jsxs("select", {
                        value: B.verdict ?? "",
                        onChange: (sl) => w(sl.target.value || void 0),
                        children: [
                          /* @__PURE__ */ o.jsx("option", { value: "", children: "All" }),
                          /* @__PURE__ */ o.jsx("option", { value: "clean", children: "Clean" }),
                          /* @__PURE__ */ o.jsx("option", {
                            value: "suspicious",
                            children: "Suspicious",
                          }),
                          /* @__PURE__ */ o.jsx("option", {
                            value: "flagged",
                            children: "Flagged",
                          }),
                        ],
                      }),
                    ],
                  }),
                }),
                /* @__PURE__ */ o.jsx(Eh, {
                  apiClient: j,
                  onSessionSelect: wl,
                  filters: B,
                }),
              ],
            }),
          Q === "detail" &&
            O &&
            /* @__PURE__ */ o.jsx(Th, {
              apiClient: j,
              sessionId: O,
              onBack: Zl,
            }),
          Q === "analytics" &&
            /* @__PURE__ */ o.jsxs("div", {
              className: "slopit-analytics-view",
              children: [
                ll && /* @__PURE__ */ o.jsx(sh, { summary: ll }),
                /* @__PURE__ */ o.jsxs("div", {
                  className: "slopit-charts-grid",
                  children: [
                    /* @__PURE__ */ o.jsxs("div", {
                      className: "slopit-card",
                      children: [
                        /* @__PURE__ */ o.jsx("div", {
                          className: "slopit-card-header",
                          children: "Flag Distribution",
                        }),
                        /* @__PURE__ */ o.jsx("div", {
                          className: "slopit-card-body",
                          children: /* @__PURE__ */ o.jsx(mh, { distribution: cl }),
                        }),
                      ],
                    }),
                    /* @__PURE__ */ o.jsxs("div", {
                      className: "slopit-card",
                      children: [
                        /* @__PURE__ */ o.jsx("div", {
                          className: "slopit-card-header",
                          children: "Confidence Scores",
                        }),
                        /* @__PURE__ */ o.jsx("div", {
                          className: "slopit-card-body",
                          children: /* @__PURE__ */ o.jsx(oh, { scores: Ul }),
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
        ],
      }),
    ],
  });
}
class _h extends HTMLElement {
  constructor() {
    super(...arguments), (this.root = null), (this.container = null);
  }
  static get observedAttributes() {
    return ["api-url", "study-id", "theme", "polling-interval", "enable-websocket"];
  }
  connectedCallback() {
    const A = this.attachShadow({ mode: "open" });
    (this.container = document.createElement("div")),
      (this.container.className = "slopit-dashboard-root"),
      A.appendChild(this.container);
    const x = document.createElement("style");
    (x.textContent = this.getStyles()),
      A.appendChild(x),
      (this.root = ah.createRoot(this.container)),
      this.render();
  }
  disconnectedCallback() {
    this.root && (this.root.unmount(), (this.root = null));
  }
  attributeChangedCallback() {
    this.render();
  }
  getConfig() {
    const A = this.getAttribute("api-url") ?? "http://localhost:8000/api/v1",
      x = this.getAttribute("study-id") ?? void 0,
      s = this.getAttribute("theme") ?? "system",
      N = this.getAttribute("polling-interval"),
      j = this.getAttribute("enable-websocket");
    return {
      apiUrl: A,
      studyId: x,
      theme: s,
      pollingInterval: N ? Number.parseInt(N, 10) : void 0,
      enableWebSocket: j !== "false",
    };
  }
  render() {
    if (!this.root) return;
    const A = this.getConfig();
    this.root.render(P.createElement(Ah, { config: A }));
  }
  getStyles() {
    return `
      :host {
        display: block;
        font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      }

      .slopit-dashboard-root {
        --slopit-bg: #ffffff;
        --slopit-bg-secondary: #f8f9fa;
        --slopit-bg-tertiary: #e9ecef;
        --slopit-text: #212529;
        --slopit-text-secondary: #6c757d;
        --slopit-border: #dee2e6;
        --slopit-clean: #28a745;
        --slopit-clean-bg: #d4edda;
        --slopit-suspicious: #ffc107;
        --slopit-suspicious-bg: #fff3cd;
        --slopit-flagged: #dc3545;
        --slopit-flagged-bg: #f8d7da;
        --slopit-primary: #0d6efd;
        --slopit-primary-hover: #0b5ed7;
        --slopit-space-xs: 0.25rem;
        --slopit-space-sm: 0.5rem;
        --slopit-space-md: 1rem;
        --slopit-space-lg: 1.5rem;
        --slopit-radius-sm: 0.25rem;
        --slopit-radius-md: 0.375rem;

        color: var(--slopit-text);
        background: var(--slopit-bg);
      }

      :host([theme="dark"]) .slopit-dashboard-root,
      .slopit-dashboard-root[data-theme="dark"] {
        --slopit-bg: #1a1a1a;
        --slopit-bg-secondary: #2d2d2d;
        --slopit-bg-tertiary: #404040;
        --slopit-text: #f8f9fa;
        --slopit-text-secondary: #adb5bd;
        --slopit-border: #495057;
        --slopit-clean-bg: #1e4620;
        --slopit-suspicious-bg: #4d3800;
        --slopit-flagged-bg: #4d1a1f;
      }

      .slopit-dashboard {
        min-height: 400px;
        padding: var(--slopit-space-md);
      }

      .slopit-dashboard-header {
        display: flex;
        align-items: center;
        gap: var(--slopit-space-md);
        padding-bottom: var(--slopit-space-md);
        border-bottom: 1px solid var(--slopit-border);
        margin-bottom: var(--slopit-space-md);
      }

      .slopit-dashboard-title {
        font-size: 1.5rem;
        font-weight: 600;
        margin: 0;
      }

      .slopit-dashboard-nav {
        display: flex;
        gap: var(--slopit-space-sm);
        margin-bottom: var(--slopit-space-md);
      }

      .slopit-nav-item {
        padding: var(--slopit-space-sm) var(--slopit-space-md);
        background: transparent;
        border: 1px solid var(--slopit-border);
        border-radius: var(--slopit-radius-md);
        cursor: pointer;
        color: var(--slopit-text);
      }

      .slopit-nav-item--active {
        background: var(--slopit-primary);
        border-color: var(--slopit-primary);
        color: white;
      }

      .slopit-verdict-badge {
        display: inline-flex;
        align-items: center;
        gap: var(--slopit-space-xs);
        padding: var(--slopit-space-xs) var(--slopit-space-sm);
        border-radius: var(--slopit-radius-sm);
        font-size: 0.875rem;
        font-weight: 500;
        text-transform: capitalize;
      }

      .slopit-verdict-badge--clean {
        background: var(--slopit-clean-bg);
        color: var(--slopit-clean);
      }

      .slopit-verdict-badge--suspicious {
        background: var(--slopit-suspicious-bg);
        color: var(--slopit-suspicious);
      }

      .slopit-verdict-badge--flagged {
        background: var(--slopit-flagged-bg);
        color: var(--slopit-flagged);
      }

      .slopit-session-table {
        width: 100%;
        border-collapse: collapse;
      }

      .slopit-session-table th,
      .slopit-session-table td {
        padding: var(--slopit-space-sm) var(--slopit-space-md);
        text-align: left;
        border-bottom: 1px solid var(--slopit-border);
      }

      .slopit-session-table th {
        background: var(--slopit-bg-secondary);
        font-weight: 600;
        font-size: 0.875rem;
        color: var(--slopit-text-secondary);
        text-transform: uppercase;
      }

      .slopit-session-table tr:hover {
        background: var(--slopit-bg-secondary);
        cursor: pointer;
      }

      .slopit-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        color: var(--slopit-text-secondary);
      }

      .slopit-spinner {
        width: 24px;
        height: 24px;
        border: 2px solid var(--slopit-border);
        border-top-color: var(--slopit-primary);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .slopit-button {
        display: inline-flex;
        align-items: center;
        padding: var(--slopit-space-sm) var(--slopit-space-md);
        background: var(--slopit-primary);
        color: white;
        border: none;
        border-radius: var(--slopit-radius-md);
        cursor: pointer;
      }

      .slopit-button:hover {
        background: var(--slopit-primary-hover);
      }

      .slopit-button--secondary {
        background: var(--slopit-bg-secondary);
        color: var(--slopit-text);
        border: 1px solid var(--slopit-border);
      }

      .slopit-connection-status {
        display: inline-flex;
        align-items: center;
        gap: var(--slopit-space-xs);
        font-size: 0.875rem;
        margin-left: auto;
      }

      .slopit-connection-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }

      .slopit-connection-indicator--connected { background: var(--slopit-clean); }
      .slopit-connection-indicator--disconnected { background: var(--slopit-text-secondary); }
      .slopit-connection-indicator--error { background: var(--slopit-flagged); }
      .slopit-connection-indicator--connecting { background: var(--slopit-suspicious); }

      .slopit-card {
        background: var(--slopit-bg);
        border: 1px solid var(--slopit-border);
        border-radius: 0.5rem;
        margin-bottom: var(--slopit-space-md);
      }

      .slopit-card-header {
        padding: var(--slopit-space-md);
        border-bottom: 1px solid var(--slopit-border);
        font-weight: 600;
      }

      .slopit-card-body {
        padding: var(--slopit-space-md);
      }

      .slopit-pagination {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--slopit-space-sm);
        padding: var(--slopit-space-md);
      }

      .slopit-filters {
        padding: var(--slopit-space-md);
        background: var(--slopit-bg-secondary);
        border-radius: var(--slopit-radius-md);
        margin-bottom: var(--slopit-space-md);
      }

      .slopit-filters select {
        padding: var(--slopit-space-xs) var(--slopit-space-sm);
        border: 1px solid var(--slopit-border);
        border-radius: var(--slopit-radius-sm);
        background: var(--slopit-bg);
        color: var(--slopit-text);
        margin-left: var(--slopit-space-sm);
      }
    `;
  }
}
typeof customElements < "u" &&
  !customElements.get("slopit-dashboard") &&
  customElements.define("slopit-dashboard", _h);
export { _h as SlopitDashboardElement };
//# sourceMappingURL=slopit-dashboard-wc.js.map
