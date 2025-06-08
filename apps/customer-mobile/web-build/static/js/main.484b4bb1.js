(() => {
  'use strict';
  var e = {
      7010: (e, t, n) => {
        var r = n(2721),
          o = n(6330),
          i = n(9399),
          a = n(1180),
          l = n(5785),
          s = n(1009),
          c = n(5597),
          d = n(7022),
          u = n(5833),
          f = n(1723),
          h = n(8530),
          g = n(5108),
          m = n(5922),
          x = n(458),
          y = n(3639),
          p = n(8718),
          j = (n(4260), n(2061)),
          F = n(1165),
          b = n(999),
          v = n(3528),
          C = n(575),
          w = (0, i.createContext)({
            signIn: (function () {
              var e = (0, o.default)(function* () {});
              return function () {
                return e.apply(this, arguments);
              };
            })(),
            signUp: (function () {
              var e = (0, o.default)(function* () {});
              return function () {
                return e.apply(this, arguments);
              };
            })(),
            signOut: (function () {
              var e = (0, o.default)(function* () {});
              return function () {
                return e.apply(this, arguments);
              };
            })(),
            session: null,
            user: null,
            isLoading: !0,
            error: null,
          });
        function B() {
          return (0, i.useContext)(w);
        }
        function S(e, t) {
          return T.apply(this, arguments);
        }
        function T() {
          return (T = (0, o.default)(function* (e, t) {
            if ('web' === b.default.OS)
              try {
                var n = globalThis.localStorage;
                n && (null === t ? n.removeItem(e) : n.setItem(e, t));
              } catch (r) {
                console.error('Local storage is unavailable:', r);
              }
            else null == t ? yield F.deleteItemAsync(e) : yield F.setItemAsync(e, t);
          })).apply(this, arguments);
        }
        function k(e) {
          return z.apply(this, arguments);
        }
        function z() {
          return (z = (0, o.default)(function* (e) {
            if ('web' !== b.default.OS) return yield F.getItemAsync(e);
            try {
              var t = globalThis.localStorage;
              if (t) return t.getItem(e);
            } catch (n) {
              console.error('Local storage is unavailable:', n);
            }
            return null;
          })).apply(this, arguments);
        }
        function I(e) {
          var t = (function () {
              var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [!0, null];
              return (0, i.useReducer)(function (e) {
                return [!1, arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : null];
              }, e);
            })(),
            n = (0, j.default)(t, 2),
            r = n[0],
            a = n[1];
          (0, i.useEffect)(
            function () {
              (0, o.default)(function* () {
                var t = yield k(e);
                a(t);
              })();
            },
            [e]
          );
          var l = (0, i.useCallback)(
            (function () {
              var t = (0, o.default)(function* (t) {
                a(t), yield S(e, t);
              });
              return function (e) {
                return t.apply(this, arguments);
              };
            })(),
            [e]
          );
          return [r, l];
        }
        function D(e) {
          var t = e.children,
            n = I('customer-auth-session'),
            r = (0, j.default)(n, 2),
            a = (0, j.default)(r[0], 2),
            l = a[0],
            s = a[1],
            c = r[1],
            d = i.useState(null),
            u = (0, j.default)(d, 2),
            f = u[0],
            h = u[1],
            g = i.useState(null),
            m = (0, j.default)(g, 2),
            x = m[0],
            y = m[1],
            p = i.useState(!1),
            F = (0, j.default)(p, 2),
            b = F[0],
            B = F[1];
          (0, i.useEffect)(
            function () {
              var e = (function () {
                var e = (0, o.default)(function* () {
                  try {
                    if (s) {
                      var e = yield k('customer-user-info');
                      e && h(JSON.parse(e));
                    } else {
                      var t = {
                        id: 'guest',
                        name: '\uac8c\uc2a4\ud2b8 \uc0ac\uc6a9\uc790',
                        email: 'guest@example.com',
                        phone: '',
                        memberSince: new Date().toISOString(),
                        totalServices: 0,
                        activeBookings: 0,
                      };
                      h(t);
                    }
                  } catch (x) {
                    console.error('Error loading user:', x), h(null);
                  } finally {
                    B(!0);
                  }
                });
                return function () {
                  return e.apply(this, arguments);
                };
              })();
              l || e();
            },
            [s, l]
          ),
            (0, i.useEffect)(
              function () {
                s ? v.apiClient.setAuthToken(s) : v.apiClient.clearAuthToken();
              },
              [s]
            );
          var T = (0, i.useCallback)(
              (function () {
                var e = (0, o.default)(function* (e, t) {
                  try {
                    y(null);
                    var n = yield v.apiClient.post('/auth/customer/login', {
                        email: e,
                        password: t,
                      }),
                      r = n.token,
                      o = n.user;
                    yield c(r), yield S('customer-user-info', JSON.stringify(o)), h(o);
                  } catch (s) {
                    var i,
                      a,
                      l = s;
                    throw (
                      (console.error('Sign in error:', l),
                      y(
                        (null == (i = l.response) || null == (a = i.data) ? void 0 : a.message) ||
                          '\ub85c\uadf8\uc778\uc5d0 \uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4.'
                      ),
                      l)
                    );
                  }
                });
                return function (t, n) {
                  return e.apply(this, arguments);
                };
              })(),
              [c]
            ),
            z = (0, i.useCallback)(
              (function () {
                var e = (0, o.default)(function* (e) {
                  try {
                    y(null);
                    var t = yield v.apiClient.post('/auth/customer/signup', e),
                      n = t.token,
                      r = t.user;
                    yield c(n), yield S('customer-user-info', JSON.stringify(r)), h(r);
                  } catch (l) {
                    var o,
                      i,
                      a = l;
                    throw (
                      (console.error('Sign up error:', a),
                      y(
                        (null == (o = a.response) || null == (i = o.data) ? void 0 : i.message) ||
                          '\ud68c\uc6d0\uac00\uc785\uc5d0 \uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4.'
                      ),
                      a)
                    );
                  }
                });
                return function (t) {
                  return e.apply(this, arguments);
                };
              })(),
              [c]
            ),
            D = (0, i.useCallback)(
              (0, o.default)(function* () {
                try {
                  if (s)
                    try {
                      yield v.apiClient.post('/auth/logout');
                    } catch (e) {
                      console.warn('Logout API failed:', e);
                    }
                  yield c(null), yield S('customer-user-info', null), h(null);
                } catch (e) {
                  console.error('Sign out error:', e),
                    yield c(null),
                    yield S('customer-user-info', null),
                    h(null);
                }
              }),
              [s, c]
            ),
            L = l || !b;
          return (0, C.jsx)(w.Provider, {
            value: {
              signIn: T,
              signUp: z,
              signOut: D,
              session: s,
              user: f,
              isLoading: L,
              error: x,
            },
            children: t,
          });
        }
        var L = n(5200),
          P = n(3717),
          E = n(9027),
          W = n(3547);
        P.default.get('window').width;
        function R() {
          var e = (0, W.useNavigation)();
          return (0, C.jsx)(E.SafeAreaView, {
            style: A.container,
            children: (0, C.jsxs)(u.default, {
              style: A.content,
              children: [
                (0, C.jsxs)(u.default, {
                  style: A.logoSection,
                  children: [
                    (0, C.jsx)(u.default, {
                      style: A.logoContainer,
                      children: (0, C.jsx)(d.default, {
                        name: 'truck',
                        size: 60,
                        color: '#6366F1',
                      }),
                    }),
                    (0, C.jsx)(f.default, { style: A.appName, children: 'CarGoro' }),
                    (0, C.jsx)(f.default, {
                      style: A.tagline,
                      children:
                        '\uc2a4\ub9c8\ud2b8\ud55c \ucc28\ub7c9 \uad00\ub9ac\uc758 \uc2dc\uc791',
                    }),
                  ],
                }),
                (0, C.jsxs)(u.default, {
                  style: A.featuresSection,
                  children: [
                    (0, C.jsxs)(u.default, {
                      style: A.featureItem,
                      children: [
                        (0, C.jsx)(u.default, {
                          style: A.featureIcon,
                          children: (0, C.jsx)(d.default, {
                            name: 'calendar',
                            size: 24,
                            color: '#6366F1',
                          }),
                        }),
                        (0, C.jsxs)(u.default, {
                          style: A.featureContent,
                          children: [
                            (0, C.jsx)(f.default, {
                              style: A.featureTitle,
                              children: '\uac04\ud3b8\ud55c \uc815\ube44 \uc608\uc57d',
                            }),
                            (0, C.jsx)(f.default, {
                              style: A.featureDescription,
                              children:
                                '\uc5b8\uc81c \uc5b4\ub514\uc11c\ub098 \uc27d\uace0 \ube60\ub974\uac8c \uc815\ube44\uc18c\ub97c \uc608\uc57d\ud558\uc138\uc694',
                            }),
                          ],
                        }),
                      ],
                    }),
                    (0, C.jsxs)(u.default, {
                      style: A.featureItem,
                      children: [
                        (0, C.jsx)(u.default, {
                          style: A.featureIcon,
                          children: (0, C.jsx)(d.default, {
                            name: 'map-pin',
                            size: 24,
                            color: '#10B981',
                          }),
                        }),
                        (0, C.jsxs)(u.default, {
                          style: A.featureContent,
                          children: [
                            (0, C.jsx)(f.default, {
                              style: A.featureTitle,
                              children: '\uc2e4\uc2dc\uac04 \uc704\uce58 \ucd94\uc801',
                            }),
                            (0, C.jsx)(f.default, {
                              style: A.featureDescription,
                              children:
                                '\ucc28\ub7c9\uc758 \uc815\ube44 \uc9c4\ud589 \uc0c1\ud669\uc744 \uc2e4\uc2dc\uac04\uc73c\ub85c \ud655\uc778\ud558\uc138\uc694',
                            }),
                          ],
                        }),
                      ],
                    }),
                    (0, C.jsxs)(u.default, {
                      style: A.featureItem,
                      children: [
                        (0, C.jsx)(u.default, {
                          style: A.featureIcon,
                          children: (0, C.jsx)(d.default, {
                            name: 'clock',
                            size: 24,
                            color: '#F59E0B',
                          }),
                        }),
                        (0, C.jsxs)(u.default, {
                          style: A.featureContent,
                          children: [
                            (0, C.jsx)(f.default, {
                              style: A.featureTitle,
                              children: '\uc815\ube44 \uc774\ub825 \uad00\ub9ac',
                            }),
                            (0, C.jsx)(f.default, {
                              style: A.featureDescription,
                              children:
                                '\ubaa8\ub4e0 \uc815\ube44 \uae30\ub85d\uc744 \ud55c\ub208\uc5d0 \ud655\uc778\ud558\uace0 \uad00\ub9ac\ud558\uc138\uc694',
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                (0, C.jsxs)(u.default, {
                  style: A.buttonSection,
                  children: [
                    (0, C.jsxs)(L.default, {
                      style: A.primaryButton,
                      onPress: function () {
                        return e.navigate('Signup');
                      },
                      children: [
                        (0, C.jsx)(f.default, {
                          style: A.primaryButtonText,
                          children: '\uc2dc\uc791\ud558\uae30',
                        }),
                        (0, C.jsx)(d.default, { name: 'arrow-right', size: 20, color: '#FFFFFF' }),
                      ],
                    }),
                    (0, C.jsx)(L.default, {
                      style: A.secondaryButton,
                      onPress: function () {
                        return e.navigate('Login');
                      },
                      children: (0, C.jsx)(f.default, {
                        style: A.secondaryButtonText,
                        children: '\uc774\ubbf8 \uacc4\uc815\uc774 \uc788\uc73c\uc2e0\uac00\uc694?',
                      }),
                    }),
                  ],
                }),
              ],
            }),
          });
        }
        var A = g.default.create({
            container: { flex: 1, backgroundColor: '#FFFFFF' },
            content: { flex: 1, paddingHorizontal: 24, justifyContent: 'space-between' },
            logoSection: { alignItems: 'center', marginTop: 60 },
            logoContainer: {
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: '#EEF2FF',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 20,
            },
            appName: { fontSize: 36, fontWeight: '800', color: '#1F2937', marginBottom: 8 },
            tagline: { fontSize: 16, color: '#6B7280', textAlign: 'center' },
            featuresSection: { marginTop: 40 },
            featureItem: { flexDirection: 'row', marginBottom: 24 },
            featureIcon: {
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: '#F3F4F6',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 16,
            },
            featureContent: { flex: 1 },
            featureTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
            featureDescription: { fontSize: 14, color: '#6B7280', lineHeight: 20 },
            buttonSection: { marginBottom: 40 },
            primaryButton: {
              backgroundColor: '#6366F1',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 16,
              borderRadius: 12,
              marginBottom: 16,
            },
            primaryButtonText: {
              fontSize: 16,
              fontWeight: '600',
              color: '#FFFFFF',
              marginRight: 8,
            },
            secondaryButton: { alignItems: 'center', paddingVertical: 12 },
            secondaryButtonText: { fontSize: 14, color: '#6366F1', fontWeight: '500' },
          }),
          V = n(3493),
          H = n(1807),
          N = n(3680),
          O = n(3066);
        function M() {
          var e = (0, W.useNavigation)(),
            t = B(),
            n = t.signIn,
            r = t.error,
            a = (0, i.useState)(''),
            l = (0, j.default)(a, 2),
            s = l[0],
            c = l[1],
            g = (0, i.useState)(''),
            m = (0, j.default)(g, 2),
            x = m[0],
            y = m[1],
            p = (0, i.useState)(!1),
            F = (0, j.default)(p, 2),
            v = F[0],
            w = F[1],
            S = (0, i.useState)(!1),
            T = (0, j.default)(S, 2),
            k = T[0],
            z = T[1],
            I = (0, i.useState)({}),
            D = (0, j.default)(I, 2),
            P = D[0],
            R = D[1],
            A = (function () {
              var e = (0, o.default)(function* () {
                if (
                  (function () {
                    var e = {};
                    return (
                      s
                        ? /\S+@\S+\.\S+/.test(s) ||
                          (e.email =
                            '\uc62c\ubc14\ub978 \uc774\uba54\uc77c \ud615\uc2dd\uc774 \uc544\ub2d9\ub2c8\ub2e4.')
                        : (e.email =
                            '\uc774\uba54\uc77c\uc744 \uc785\ub825\ud574\uc8fc\uc138\uc694.'),
                      x ||
                        (e.password =
                          '\ube44\ubc00\ubc88\ud638\ub97c \uc785\ub825\ud574\uc8fc\uc138\uc694.'),
                      R(e),
                      0 === Object.keys(e).length
                    );
                  })()
                ) {
                  z(!0);
                  try {
                    yield n(s.toLowerCase().trim(), x);
                  } catch (e) {
                    O.default.alert(
                      '\ub85c\uadf8\uc778 \uc2e4\ud328',
                      r ||
                        '\uc774\uba54\uc77c \ub610\ub294 \ube44\ubc00\ubc88\ud638\uac00 \uc62c\ubc14\ub974\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4.',
                      [{ text: '\ud655\uc778' }]
                    );
                  } finally {
                    z(!1);
                  }
                }
              });
              return function () {
                return e.apply(this, arguments);
              };
            })(),
            M = function (e) {
              O.default.alert(
                e + ' \ub85c\uadf8\uc778',
                e + ' \ub85c\uadf8\uc778 \uae30\ub2a5\uc740 \uc900\ube44 \uc911\uc785\ub2c8\ub2e4.'
              );
            };
          return (0, C.jsx)(E.SafeAreaView, {
            style: _.container,
            children: (0, C.jsx)(H.default, {
              behavior: 'ios' === b.default.OS ? 'padding' : 'height',
              style: _.keyboardView,
              children: (0, C.jsxs)(N.default, {
                contentContainerStyle: _.scrollContent,
                showsVerticalScrollIndicator: !1,
                keyboardShouldPersistTaps: 'handled',
                children: [
                  (0, C.jsx)(L.default, {
                    style: _.backButton,
                    onPress: function () {
                      return e.goBack();
                    },
                    children: (0, C.jsx)(d.default, {
                      name: 'arrow-left',
                      size: 24,
                      color: '#1F2937',
                    }),
                  }),
                  (0, C.jsxs)(u.default, {
                    style: _.titleSection,
                    children: [
                      (0, C.jsx)(f.default, {
                        style: _.title,
                        children: '\ub2e4\uc2dc \ub9cc\ub098\uc11c \ubc18\uac00\uc6cc\uc694!',
                      }),
                      (0, C.jsx)(f.default, {
                        style: _.subtitle,
                        children:
                          '\uacc4\uc815\uc5d0 \ub85c\uadf8\uc778\ud558\uc5ec \uc11c\ube44\uc2a4\ub97c \uc774\uc6a9\ud574\ubcf4\uc138\uc694',
                      }),
                    ],
                  }),
                  (0, C.jsxs)(u.default, {
                    style: _.formSection,
                    children: [
                      (0, C.jsxs)(u.default, {
                        style: _.inputContainer,
                        children: [
                          (0, C.jsx)(f.default, {
                            style: _.inputLabel,
                            children: '\uc774\uba54\uc77c',
                          }),
                          (0, C.jsxs)(u.default, {
                            style: [_.inputWrapper, P.email ? _.inputError : null],
                            children: [
                              (0, C.jsx)(d.default, {
                                name: 'mail',
                                size: 20,
                                color: '#6B7280',
                                style: _.inputIcon,
                              }),
                              (0, C.jsx)(V.default, {
                                style: _.input,
                                placeholder: 'example@email.com',
                                placeholderTextColor: '#9CA3AF',
                                value: s,
                                onChangeText: c,
                                keyboardType: 'email-address',
                                autoCapitalize: 'none',
                                autoCorrect: !1,
                                editable: !k,
                              }),
                            ],
                          }),
                          P.email &&
                            (0, C.jsx)(f.default, { style: _.errorText, children: P.email }),
                        ],
                      }),
                      (0, C.jsxs)(u.default, {
                        style: _.inputContainer,
                        children: [
                          (0, C.jsx)(f.default, {
                            style: _.inputLabel,
                            children: '\ube44\ubc00\ubc88\ud638',
                          }),
                          (0, C.jsxs)(u.default, {
                            style: [_.inputWrapper, P.password ? _.inputError : null],
                            children: [
                              (0, C.jsx)(d.default, {
                                name: 'lock',
                                size: 20,
                                color: '#6B7280',
                                style: _.inputIcon,
                              }),
                              (0, C.jsx)(V.default, {
                                style: _.input,
                                placeholder: '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022',
                                placeholderTextColor: '#9CA3AF',
                                value: x,
                                onChangeText: y,
                                secureTextEntry: !v,
                                editable: !k,
                              }),
                              (0, C.jsx)(L.default, {
                                onPress: function () {
                                  return w(!v);
                                },
                                style: _.eyeButton,
                                children: (0, C.jsx)(d.default, {
                                  name: v ? 'eye' : 'eye-off',
                                  size: 20,
                                  color: '#6B7280',
                                }),
                              }),
                            ],
                          }),
                          P.password &&
                            (0, C.jsx)(f.default, { style: _.errorText, children: P.password }),
                        ],
                      }),
                      (0, C.jsx)(L.default, {
                        style: _.forgotPasswordButton,
                        onPress: function () {
                          O.default.alert(
                            '\ube44\ubc00\ubc88\ud638 \ucc3e\uae30',
                            '\ub4f1\ub85d\ub41c \uc774\uba54\uc77c\ub85c \ube44\ubc00\ubc88\ud638 \uc7ac\uc124\uc815 \ub9c1\ud06c\uac00 \uc804\uc1a1\ub429\ub2c8\ub2e4.',
                            [
                              { text: '\ucde8\uc18c', style: 'cancel' },
                              {
                                text: '\uc804\uc1a1',
                                onPress: function () {
                                  O.default.alert(
                                    '\uc804\uc1a1 \uc644\ub8cc',
                                    '\ube44\ubc00\ubc88\ud638 \uc7ac\uc124\uc815 \ub9c1\ud06c\uac00 \uc774\uba54\uc77c\ub85c \uc804\uc1a1\ub418\uc5c8\uc2b5\ub2c8\ub2e4.'
                                  );
                                },
                              },
                            ]
                          );
                        },
                        disabled: k,
                        children: (0, C.jsx)(f.default, {
                          style: _.forgotPasswordText,
                          children:
                            '\ube44\ubc00\ubc88\ud638\ub97c \uc78a\uc73c\uc168\ub098\uc694?',
                        }),
                      }),
                      (0, C.jsx)(L.default, {
                        style: [_.loginButton, k && _.disabledButton],
                        onPress: A,
                        disabled: k,
                        children: k
                          ? (0, C.jsx)(h.default, { size: 'small', color: '#FFFFFF' })
                          : (0, C.jsx)(f.default, {
                              style: _.loginButtonText,
                              children: '\ub85c\uadf8\uc778',
                            }),
                      }),
                      (0, C.jsxs)(u.default, {
                        style: _.dividerContainer,
                        children: [
                          (0, C.jsx)(u.default, { style: _.divider }),
                          (0, C.jsx)(f.default, { style: _.dividerText, children: '\ub610\ub294' }),
                          (0, C.jsx)(u.default, { style: _.divider }),
                        ],
                      }),
                      (0, C.jsxs)(u.default, {
                        style: _.socialButtons,
                        children: [
                          (0, C.jsx)(L.default, {
                            style: _.socialButton,
                            onPress: function () {
                              return M('Google');
                            },
                            disabled: k,
                            children: (0, C.jsx)(d.default, {
                              name: 'mail',
                              size: 20,
                              color: '#EA4335',
                            }),
                          }),
                          (0, C.jsx)(L.default, {
                            style: _.socialButton,
                            onPress: function () {
                              return M('Apple');
                            },
                            disabled: k,
                            children: (0, C.jsx)(d.default, {
                              name: 'smartphone',
                              size: 20,
                              color: '#000000',
                            }),
                          }),
                          (0, C.jsx)(L.default, {
                            style: _.socialButton,
                            onPress: function () {
                              return M('Kakao');
                            },
                            disabled: k,
                            children: (0, C.jsx)(d.default, {
                              name: 'message-circle',
                              size: 20,
                              color: '#FEE500',
                            }),
                          }),
                        ],
                      }),
                      (0, C.jsxs)(u.default, {
                        style: _.signupContainer,
                        children: [
                          (0, C.jsx)(f.default, {
                            style: _.signupText,
                            children:
                              '\uc544\uc9c1 \uacc4\uc815\uc774 \uc5c6\uc73c\uc2e0\uac00\uc694?',
                          }),
                          (0, C.jsx)(L.default, {
                            onPress: function () {
                              return e.navigate('Signup');
                            },
                            disabled: k,
                            children: (0, C.jsx)(f.default, {
                              style: _.signupLink,
                              children: '\ud68c\uc6d0\uac00\uc785',
                            }),
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            }),
          });
        }
        var _ = g.default.create({
            container: { flex: 1, backgroundColor: '#FFFFFF' },
            keyboardView: { flex: 1 },
            scrollContent: { flexGrow: 1, paddingHorizontal: 24 },
            backButton: { marginTop: 16, marginBottom: 24 },
            titleSection: { marginBottom: 32 },
            title: { fontSize: 28, fontWeight: '700', color: '#1F2937', marginBottom: 8 },
            subtitle: { fontSize: 16, color: '#6B7280' },
            formSection: { flex: 1 },
            inputContainer: { marginBottom: 20 },
            inputLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
            inputWrapper: {
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#F9FAFB',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#E5E7EB',
              paddingHorizontal: 16,
              height: 56,
            },
            inputError: { borderColor: '#EF4444' },
            inputIcon: { marginRight: 12 },
            input: { flex: 1, fontSize: 16, color: '#1F2937' },
            eyeButton: { padding: 4 },
            errorText: { fontSize: 12, color: '#EF4444', marginTop: 4, marginLeft: 4 },
            forgotPasswordButton: { alignSelf: 'flex-end', marginBottom: 24 },
            forgotPasswordText: { fontSize: 14, color: '#6366F1', fontWeight: '500' },
            loginButton: {
              backgroundColor: '#6366F1',
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: 'center',
              marginBottom: 24,
            },
            loginButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
            disabledButton: { opacity: 0.6 },
            dividerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
            divider: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
            dividerText: { fontSize: 14, color: '#6B7280', marginHorizontal: 16 },
            socialButtons: { flexDirection: 'row', justifyContent: 'center', marginBottom: 32 },
            socialButton: {
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: '#F3F4F6',
              justifyContent: 'center',
              alignItems: 'center',
              marginHorizontal: 8,
            },
            signupContainer: {
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 24,
            },
            signupText: { fontSize: 14, color: '#6B7280' },
            signupLink: { fontSize: 14, color: '#6366F1', fontWeight: '600', marginLeft: 4 },
          }),
          q = n(4586);
        function G(e, t) {
          var n = Object.keys(e);
          if (Object.getOwnPropertySymbols) {
            var r = Object.getOwnPropertySymbols(e);
            t &&
              (r = r.filter(function (t) {
                return Object.getOwnPropertyDescriptor(e, t).enumerable;
              })),
              n.push.apply(n, r);
          }
          return n;
        }
        function U(e) {
          for (var t = 1; t < arguments.length; t++) {
            var n = null != arguments[t] ? arguments[t] : {};
            t % 2
              ? G(Object(n), !0).forEach(function (t) {
                  (0, q.default)(e, t, n[t]);
                })
              : Object.getOwnPropertyDescriptors
                ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
                : G(Object(n)).forEach(function (t) {
                    Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
                  });
          }
          return e;
        }
        function K() {
          var e = (0, W.useNavigation)(),
            t = B(),
            n = t.signUp,
            r = t.error,
            a = (0, i.useState)({
              name: '',
              email: '',
              phone: '',
              password: '',
              confirmPassword: '',
            }),
            l = (0, j.default)(a, 2),
            s = l[0],
            c = l[1],
            g = (0, i.useState)(!1),
            m = (0, j.default)(g, 2),
            x = m[0],
            y = m[1],
            p = (0, i.useState)(!1),
            F = (0, j.default)(p, 2),
            v = F[0],
            w = F[1],
            S = (0, i.useState)(!1),
            T = (0, j.default)(S, 2),
            k = T[0],
            z = T[1],
            I = (0, i.useState)({}),
            D = (0, j.default)(I, 2),
            P = D[0],
            R = D[1],
            A = (0, i.useState)(!1),
            M = (0, j.default)(A, 2),
            _ = M[0],
            q = M[1],
            G = (function () {
              var e = (0, o.default)(function* () {
                if (
                  (function () {
                    var e = {};
                    return (
                      s.name ||
                        (e.name = '\uc774\ub984\uc744 \uc785\ub825\ud574\uc8fc\uc138\uc694.'),
                      s.email
                        ? /\S+@\S+\.\S+/.test(s.email) ||
                          (e.email =
                            '\uc62c\ubc14\ub978 \uc774\uba54\uc77c \ud615\uc2dd\uc774 \uc544\ub2d9\ub2c8\ub2e4.')
                        : (e.email =
                            '\uc774\uba54\uc77c\uc744 \uc785\ub825\ud574\uc8fc\uc138\uc694.'),
                      s.phone
                        ? /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/.test(s.phone.replace(/-/g, '')) ||
                          (e.phone =
                            '\uc62c\ubc14\ub978 \uc804\ud654\ubc88\ud638 \ud615\uc2dd\uc774 \uc544\ub2d9\ub2c8\ub2e4.')
                        : (e.phone =
                            '\uc804\ud654\ubc88\ud638\ub97c \uc785\ub825\ud574\uc8fc\uc138\uc694.'),
                      s.password
                        ? s.password.length < 8 &&
                          (e.password =
                            '\ube44\ubc00\ubc88\ud638\ub294 8\uc790 \uc774\uc0c1\uc774\uc5b4\uc57c \ud569\ub2c8\ub2e4.')
                        : (e.password =
                            '\ube44\ubc00\ubc88\ud638\ub97c \uc785\ub825\ud574\uc8fc\uc138\uc694.'),
                      s.confirmPassword
                        ? s.password !== s.confirmPassword &&
                          (e.confirmPassword =
                            '\ube44\ubc00\ubc88\ud638\uac00 \uc77c\uce58\ud558\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4.')
                        : (e.confirmPassword =
                            '\ube44\ubc00\ubc88\ud638 \ud655\uc778\uc744 \uc785\ub825\ud574\uc8fc\uc138\uc694.'),
                      _ ||
                        (e.terms =
                          '\uc11c\ube44\uc2a4 \uc774\uc6a9\uc57d\uad00\uc5d0 \ub3d9\uc758\ud574\uc8fc\uc138\uc694.'),
                      R(e),
                      0 === Object.keys(e).length
                    );
                  })()
                ) {
                  z(!0);
                  try {
                    yield n({
                      name: s.name,
                      email: s.email.toLowerCase().trim(),
                      password: s.password,
                      phone: s.phone.replace(/-/g, ''),
                    });
                  } catch (e) {
                    O.default.alert(
                      '\ud68c\uc6d0\uac00\uc785 \uc2e4\ud328',
                      r ||
                        '\ud68c\uc6d0\uac00\uc785 \uc911 \uc624\ub958\uac00 \ubc1c\uc0dd\ud588\uc2b5\ub2c8\ub2e4.',
                      [{ text: '\ud655\uc778' }]
                    );
                  } finally {
                    z(!1);
                  }
                }
              });
              return function () {
                return e.apply(this, arguments);
              };
            })(),
            K = function (e) {
              var t = e.replace(/[^\d]/g, '');
              return t.length <= 3
                ? t
                : t.length <= 7
                  ? t.slice(0, 3) + '-' + t.slice(3)
                  : t.length <= 11
                    ? t.slice(0, 3) + '-' + t.slice(3, 7) + '-' + t.slice(7, 11)
                    : s.phone;
            };
          return (0, C.jsx)(E.SafeAreaView, {
            style: J.container,
            children: (0, C.jsx)(H.default, {
              behavior: 'ios' === b.default.OS ? 'padding' : 'height',
              style: J.keyboardView,
              children: (0, C.jsxs)(N.default, {
                contentContainerStyle: J.scrollContent,
                showsVerticalScrollIndicator: !1,
                keyboardShouldPersistTaps: 'handled',
                children: [
                  (0, C.jsx)(L.default, {
                    style: J.backButton,
                    onPress: function () {
                      return e.goBack();
                    },
                    children: (0, C.jsx)(d.default, {
                      name: 'arrow-left',
                      size: 24,
                      color: '#1F2937',
                    }),
                  }),
                  (0, C.jsxs)(u.default, {
                    style: J.titleSection,
                    children: [
                      (0, C.jsx)(f.default, {
                        style: J.title,
                        children: '\ud68c\uc6d0\uac00\uc785',
                      }),
                      (0, C.jsx)(f.default, {
                        style: J.subtitle,
                        children:
                          'CarGoro\uc640 \ud568\uaed8 \uc2a4\ub9c8\ud2b8\ud55c \ucc28\ub7c9 \uad00\ub9ac\ub97c \uc2dc\uc791\ud558\uc138\uc694',
                      }),
                    ],
                  }),
                  (0, C.jsxs)(u.default, {
                    style: J.formSection,
                    children: [
                      (0, C.jsxs)(u.default, {
                        style: J.inputContainer,
                        children: [
                          (0, C.jsx)(f.default, { style: J.inputLabel, children: '\uc774\ub984' }),
                          (0, C.jsxs)(u.default, {
                            style: [J.inputWrapper, P.name ? J.inputError : null],
                            children: [
                              (0, C.jsx)(d.default, {
                                name: 'user',
                                size: 20,
                                color: '#6B7280',
                                style: J.inputIcon,
                              }),
                              (0, C.jsx)(V.default, {
                                style: J.input,
                                placeholder: '\ud64d\uae38\ub3d9',
                                placeholderTextColor: '#9CA3AF',
                                value: s.name,
                                onChangeText: function (e) {
                                  return c(U(U({}, s), {}, { name: e }));
                                },
                                editable: !k,
                              }),
                            ],
                          }),
                          P.name && (0, C.jsx)(f.default, { style: J.errorText, children: P.name }),
                        ],
                      }),
                      (0, C.jsxs)(u.default, {
                        style: J.inputContainer,
                        children: [
                          (0, C.jsx)(f.default, {
                            style: J.inputLabel,
                            children: '\uc774\uba54\uc77c',
                          }),
                          (0, C.jsxs)(u.default, {
                            style: [J.inputWrapper, P.email ? J.inputError : null],
                            children: [
                              (0, C.jsx)(d.default, {
                                name: 'mail',
                                size: 20,
                                color: '#6B7280',
                                style: J.inputIcon,
                              }),
                              (0, C.jsx)(V.default, {
                                style: J.input,
                                placeholder: 'example@email.com',
                                placeholderTextColor: '#9CA3AF',
                                value: s.email,
                                onChangeText: function (e) {
                                  return c(U(U({}, s), {}, { email: e }));
                                },
                                keyboardType: 'email-address',
                                autoCapitalize: 'none',
                                autoCorrect: !1,
                                editable: !k,
                              }),
                            ],
                          }),
                          P.email &&
                            (0, C.jsx)(f.default, { style: J.errorText, children: P.email }),
                        ],
                      }),
                      (0, C.jsxs)(u.default, {
                        style: J.inputContainer,
                        children: [
                          (0, C.jsx)(f.default, {
                            style: J.inputLabel,
                            children: '\uc804\ud654\ubc88\ud638',
                          }),
                          (0, C.jsxs)(u.default, {
                            style: [J.inputWrapper, P.phone ? J.inputError : null],
                            children: [
                              (0, C.jsx)(d.default, {
                                name: 'phone',
                                size: 20,
                                color: '#6B7280',
                                style: J.inputIcon,
                              }),
                              (0, C.jsx)(V.default, {
                                style: J.input,
                                placeholder: '010-1234-5678',
                                placeholderTextColor: '#9CA3AF',
                                value: s.phone,
                                onChangeText: function (e) {
                                  return c(U(U({}, s), {}, { phone: K(e) }));
                                },
                                keyboardType: 'phone-pad',
                                editable: !k,
                              }),
                            ],
                          }),
                          P.phone &&
                            (0, C.jsx)(f.default, { style: J.errorText, children: P.phone }),
                        ],
                      }),
                      (0, C.jsxs)(u.default, {
                        style: J.inputContainer,
                        children: [
                          (0, C.jsx)(f.default, {
                            style: J.inputLabel,
                            children: '\ube44\ubc00\ubc88\ud638',
                          }),
                          (0, C.jsxs)(u.default, {
                            style: [J.inputWrapper, P.password ? J.inputError : null],
                            children: [
                              (0, C.jsx)(d.default, {
                                name: 'lock',
                                size: 20,
                                color: '#6B7280',
                                style: J.inputIcon,
                              }),
                              (0, C.jsx)(V.default, {
                                style: J.input,
                                placeholder: '8\uc790 \uc774\uc0c1 \uc785\ub825',
                                placeholderTextColor: '#9CA3AF',
                                value: s.password,
                                onChangeText: function (e) {
                                  return c(U(U({}, s), {}, { password: e }));
                                },
                                secureTextEntry: !x,
                                editable: !k,
                              }),
                              (0, C.jsx)(L.default, {
                                onPress: function () {
                                  return y(!x);
                                },
                                style: J.eyeButton,
                                children: (0, C.jsx)(d.default, {
                                  name: x ? 'eye' : 'eye-off',
                                  size: 20,
                                  color: '#6B7280',
                                }),
                              }),
                            ],
                          }),
                          P.password &&
                            (0, C.jsx)(f.default, { style: J.errorText, children: P.password }),
                        ],
                      }),
                      (0, C.jsxs)(u.default, {
                        style: J.inputContainer,
                        children: [
                          (0, C.jsx)(f.default, {
                            style: J.inputLabel,
                            children: '\ube44\ubc00\ubc88\ud638 \ud655\uc778',
                          }),
                          (0, C.jsxs)(u.default, {
                            style: [J.inputWrapper, P.confirmPassword ? J.inputError : null],
                            children: [
                              (0, C.jsx)(d.default, {
                                name: 'lock',
                                size: 20,
                                color: '#6B7280',
                                style: J.inputIcon,
                              }),
                              (0, C.jsx)(V.default, {
                                style: J.input,
                                placeholder: '\ube44\ubc00\ubc88\ud638 \uc7ac\uc785\ub825',
                                placeholderTextColor: '#9CA3AF',
                                value: s.confirmPassword,
                                onChangeText: function (e) {
                                  return c(U(U({}, s), {}, { confirmPassword: e }));
                                },
                                secureTextEntry: !v,
                                editable: !k,
                              }),
                              (0, C.jsx)(L.default, {
                                onPress: function () {
                                  return w(!v);
                                },
                                style: J.eyeButton,
                                children: (0, C.jsx)(d.default, {
                                  name: v ? 'eye' : 'eye-off',
                                  size: 20,
                                  color: '#6B7280',
                                }),
                              }),
                            ],
                          }),
                          P.confirmPassword &&
                            (0, C.jsx)(f.default, {
                              style: J.errorText,
                              children: P.confirmPassword,
                            }),
                        ],
                      }),
                      (0, C.jsxs)(L.default, {
                        style: J.termsContainer,
                        onPress: function () {
                          return q(!_);
                        },
                        disabled: k,
                        children: [
                          (0, C.jsx)(u.default, {
                            style: [J.checkbox, _ && J.checkboxChecked],
                            children:
                              _ &&
                              (0, C.jsx)(d.default, { name: 'check', size: 16, color: '#FFFFFF' }),
                          }),
                          (0, C.jsxs)(f.default, {
                            style: J.termsText,
                            children: [
                              (0, C.jsx)(f.default, {
                                style: J.termsLink,
                                onPress: function () {
                                  return O.default.alert(
                                    '\uc11c\ube44\uc2a4 \uc774\uc6a9\uc57d\uad00'
                                  );
                                },
                                children: '\uc11c\ube44\uc2a4 \uc774\uc6a9\uc57d\uad00',
                              }),
                              ' \ubc0f ',
                              (0, C.jsx)(f.default, {
                                style: J.termsLink,
                                onPress: function () {
                                  return O.default.alert(
                                    '\uac1c\uc778\uc815\ubcf4 \ucc98\ub9ac\ubc29\uce68'
                                  );
                                },
                                children: '\uac1c\uc778\uc815\ubcf4 \ucc98\ub9ac\ubc29\uce68',
                              }),
                              '\uc5d0 \ub3d9\uc758\ud569\ub2c8\ub2e4',
                            ],
                          }),
                        ],
                      }),
                      P.terms && (0, C.jsx)(f.default, { style: J.errorText, children: P.terms }),
                      (0, C.jsx)(L.default, {
                        style: [J.signupButton, k && J.disabledButton],
                        onPress: G,
                        disabled: k,
                        children: k
                          ? (0, C.jsx)(h.default, { size: 'small', color: '#FFFFFF' })
                          : (0, C.jsx)(f.default, {
                              style: J.signupButtonText,
                              children: '\ud68c\uc6d0\uac00\uc785',
                            }),
                      }),
                      (0, C.jsxs)(u.default, {
                        style: J.loginContainer,
                        children: [
                          (0, C.jsx)(f.default, {
                            style: J.loginText,
                            children:
                              '\uc774\ubbf8 \uacc4\uc815\uc774 \uc788\uc73c\uc2e0\uac00\uc694?',
                          }),
                          (0, C.jsx)(L.default, {
                            onPress: function () {
                              return e.navigate('Login');
                            },
                            disabled: k,
                            children: (0, C.jsx)(f.default, {
                              style: J.loginLink,
                              children: '\ub85c\uadf8\uc778',
                            }),
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            }),
          });
        }
        var J = g.default.create({
          container: { flex: 1, backgroundColor: '#FFFFFF' },
          keyboardView: { flex: 1 },
          scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
          backButton: { marginTop: 16, marginBottom: 24 },
          titleSection: { marginBottom: 32 },
          title: { fontSize: 28, fontWeight: '700', color: '#1F2937', marginBottom: 8 },
          subtitle: { fontSize: 16, color: '#6B7280', lineHeight: 24 },
          formSection: { flex: 1 },
          inputContainer: { marginBottom: 20 },
          inputLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
          inputWrapper: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#F9FAFB',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#E5E7EB',
            paddingHorizontal: 16,
            height: 56,
          },
          inputError: { borderColor: '#EF4444' },
          inputIcon: { marginRight: 12 },
          input: { flex: 1, fontSize: 16, color: '#1F2937' },
          eyeButton: { padding: 4 },
          errorText: { fontSize: 12, color: '#EF4444', marginTop: 4, marginLeft: 4 },
          termsContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 24,
            paddingHorizontal: 4,
          },
          checkbox: {
            width: 20,
            height: 20,
            borderRadius: 4,
            borderWidth: 1.5,
            borderColor: '#D1D5DB',
            marginRight: 12,
            alignItems: 'center',
            justifyContent: 'center',
          },
          checkboxChecked: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
          termsText: { flex: 1, fontSize: 14, color: '#4B5563', lineHeight: 20 },
          termsLink: { color: '#6366F1', textDecorationLine: 'underline' },
          signupButton: {
            backgroundColor: '#6366F1',
            borderRadius: 12,
            paddingVertical: 16,
            alignItems: 'center',
            marginBottom: 24,
          },
          signupButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
          disabledButton: { opacity: 0.6 },
          loginContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
          loginText: { fontSize: 14, color: '#6B7280' },
          loginLink: { fontSize: 14, color: '#6366F1', fontWeight: '600', marginLeft: 4 },
        });
        function Q() {
          return (0, C.jsx)(u.default, {
            style: X.container,
            children: (0, C.jsx)(f.default, {
              style: X.text,
              children: '\ucc28\ub7c9 \ubaa9\ub85d \ud654\uba74',
            }),
          });
        }
        var X = g.default.create({
          container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#F9FAFB',
          },
          text: { fontSize: 18, color: '#1F2937' },
        });
        function $() {
          return (0, C.jsx)(u.default, {
            style: Y.container,
            children: (0, C.jsx)(f.default, {
              style: Y.text,
              children: '\ud504\ub85c\ud544 \ud654\uba74',
            }),
          });
        }
        var Y = g.default.create({
          container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#F9FAFB',
          },
          text: { fontSize: 18, color: '#1F2937' },
        });
        function Z() {
          return (0, C.jsx)(u.default, {
            style: ee.container,
            children: (0, C.jsx)(f.default, {
              style: ee.text,
              children: '\ucc28\ub7c9 \uc0c1\uc138 \ud654\uba74',
            }),
          });
        }
        var ee = g.default.create({
          container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#F9FAFB',
          },
          text: { fontSize: 18, color: '#1F2937' },
        });
        function te() {
          return (0, C.jsx)(u.default, {
            style: ne.container,
            children: (0, C.jsx)(f.default, {
              style: ne.text,
              children: '\ucc28\ub7c9 \ub4f1\ub85d \ud654\uba74',
            }),
          });
        }
        var ne = g.default.create({
          container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#F9FAFB',
          },
          text: { fontSize: 18, color: '#1F2937' },
        });
        function re() {
          return (0, C.jsx)(u.default, {
            style: oe.container,
            children: (0, C.jsx)(f.default, {
              style: oe.text,
              children: '\uc815\ube44\uc18c \ubaa9\ub85d \ud654\uba74',
            }),
          });
        }
        var oe = g.default.create({
          container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#F9FAFB',
          },
          text: { fontSize: 18, color: '#1F2937' },
        });
        function ie() {
          return (0, C.jsx)(u.default, {
            style: ae.container,
            children: (0, C.jsx)(f.default, {
              style: ae.text,
              children: '\uc608\uc57d \uc0c1\uc138 \ud654\uba74',
            }),
          });
        }
        var ae = g.default.create({
          container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#F9FAFB',
          },
          text: { fontSize: 18, color: '#1F2937' },
        });
        function le() {
          return (0, C.jsx)(u.default, {
            style: se.container,
            children: (0, C.jsx)(f.default, {
              style: se.text,
              children: '\uc11c\ube44\uc2a4 \uc774\ub825 \ud654\uba74',
            }),
          });
        }
        var se = g.default.create({
          container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#F9FAFB',
          },
          text: { fontSize: 18, color: '#1F2937' },
        });
        function ce() {
          return (0, C.jsx)(u.default, {
            style: de.container,
            children: (0, C.jsx)(f.default, {
              style: de.text,
              children: '\uc54c\ub9bc \ud654\uba74',
            }),
          });
        }
        var de = g.default.create({
          container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#F9FAFB',
          },
          text: { fontSize: 18, color: '#1F2937' },
        });
        function ue() {
          return (0, C.jsx)(u.default, {
            style: fe.container,
            children: (0, C.jsx)(f.default, {
              style: fe.text,
              children: '\uc2e4\uc2dc\uac04 \ucd94\uc801 \ud654\uba74',
            }),
          });
        }
        var fe = g.default.create({
            container: {
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#F9FAFB',
            },
            text: { fontSize: 18, color: '#1F2937' },
          }),
          he = n(8575),
          ge = n(1309),
          me = n(9551),
          xe = n(5152),
          ye = n(414),
          pe =
            {
              NODE_ENV: 'production',
              PUBLIC_URL: '',
              APP_MANIFEST: {
                name: 'CarGoro',
                slug: 'cargoro-customer',
                version: '1.0.0',
                orientation: 'portrait',
                icon: './assets/icon.png',
                userInterfaceStyle: 'automatic',
                splash: {
                  image: './assets/splash.png',
                  resizeMode: 'contain',
                  backgroundColor: '#ffffff',
                },
                web: {},
                extra: { eas: { projectId: '9ed2f832-19bf-4ce1-8d25-de103bc003bf' } },
                runtimeVersion: '1.0.0',
                updates: { url: 'https://u.expo.dev/9ed2f832-19bf-4ce1-8d25-de103bc003bf' },
                sdkVersion: '48.0.0',
                platforms: ['ios', 'android', 'web'],
              },
              EXPO_DEBUG: !1,
              PLATFORM: 'web',
              WDS_SOCKET_PATH: '/_expo/ws',
            }.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
        function je(e) {
          return new Promise(function (t) {
            setTimeout(function () {
              t(e);
            }, 300);
          });
        }
        var Fe = (0, ye.default)(
          function e() {
            (0, xe.default)(this, e), (0, q.default)(this, 'API_BASE_URL', pe);
          },
          [
            {
              key: 'getCurrentLocation',
              value: (function () {
                var e = (0, o.default)(function* () {
                  return new Promise(function (e, t) {
                    navigator.geolocation.getCurrentPosition(
                      function (t) {
                        e({ latitude: t.coords.latitude, longitude: t.coords.longitude });
                      },
                      function (e) {
                        t(e);
                      },
                      { enableHighAccuracy: !0, timeout: 1e4, maximumAge: 6e4 }
                    );
                  });
                });
                return function () {
                  return e.apply(this, arguments);
                };
              })(),
            },
            {
              key: 'searchLocations',
              value: (function () {
                var e = (0, o.default)(function* (e, t) {
                  return je(this.getMockSearchResults(e));
                });
                return function (t, n) {
                  return e.apply(this, arguments);
                };
              })(),
            },
            {
              key: 'searchNearbyWorkshops',
              value: (function () {
                var e = (0, o.default)(function* (e) {
                  return je(this.getMockWorkshops(e));
                });
                return function (t) {
                  return e.apply(this, arguments);
                };
              })(),
            },
            {
              key: 'calculateRoute',
              value: (function () {
                var e = (0, o.default)(function* (e, t) {
                  return je(this.getMockRoute(e, t));
                });
                return function (t, n) {
                  return e.apply(this, arguments);
                };
              })(),
            },
            {
              key: 'getVehicleDiagnostics',
              value: (function () {
                var e = (0, o.default)(function* (e) {
                  return je(this.getMockDiagnosticData(e));
                });
                return function (t) {
                  return e.apply(this, arguments);
                };
              })(),
            },
            {
              key: 'getFavoriteLocations',
              value: (function () {
                var e = (0, o.default)(function* () {
                  return je(this.getMockFavoriteLocations());
                });
                return function () {
                  return e.apply(this, arguments);
                };
              })(),
            },
            {
              key: 'getMockFavoriteLocations',
              value: function () {
                return [
                  {
                    id: 'fav1',
                    name: '\uc9d1',
                    address: '\uc11c\uc6b8\uc2dc \uac15\ub0a8\uad6c \ud14c\ud5e4\ub780\ub85c 123',
                    latitude: 37.5026,
                    longitude: 127.0246,
                    category: 'general',
                  },
                  {
                    id: 'fav2',
                    name: '\ud68c\uc0ac',
                    address: '\uc11c\uc6b8\uc2dc \uac15\ub0a8\uad6c \uc5ed\uc0bc\ub85c 456',
                    latitude: 37.4969,
                    longitude: 127.0378,
                    category: 'general',
                  },
                  {
                    id: 'fav3',
                    name: '\ub2e8\uace8 \uc815\ube44\uc18c',
                    address: '\uc11c\uc6b8\uc2dc \uc11c\ucd08\uad6c \ubc18\ud3ec\ub300\ub85c 789',
                    latitude: 37.5043,
                    longitude: 127.0144,
                    category: 'workshop',
                    rating: 4.8,
                    phoneNumber: '02-1234-5678',
                  },
                ];
              },
            },
            {
              key: 'addFavoriteLocation',
              value: (function () {
                var e = (0, o.default)(function* (e) {
                  return je(void 0);
                });
                return function (t) {
                  return e.apply(this, arguments);
                };
              })(),
            },
            {
              key: 'getMockSearchResults',
              value: function (e) {
                return [
                  {
                    id: '1',
                    name: e + ' \uad00\ub828 \uc7a5\uc18c 1',
                    address: '\uc11c\uc6b8\uc2dc \uac15\ub0a8\uad6c \ud14c\ud5e4\ub780\ub85c 123',
                    latitude: 37.5665,
                    longitude: 126.978,
                    category: 'general',
                    rating: 4.5,
                  },
                  {
                    id: '2',
                    name: e + ' \uad00\ub828 \uc7a5\uc18c 2',
                    address: '\uc11c\uc6b8\uc2dc \uac15\ub0a8\uad6c \uc5ed\uc0bc\ub85c 456',
                    latitude: 37.5575,
                    longitude: 127.0334,
                    category: 'general',
                    rating: 4.2,
                  },
                ];
              },
            },
            {
              key: 'getMockWorkshops',
              value: function (e) {
                return [
                  {
                    id: 'ws1',
                    name: '\uc2a4\ub9c8\ud2b8\uce74 \uc815\ube44\uc18c',
                    address: '\uc11c\uc6b8\uc2dc \uac15\ub0a8\uad6c \ub17c\ud604\ub85c 789',
                    latitude: e.latitude + 0.01,
                    longitude: e.longitude + 0.01,
                    category: 'workshop',
                    rating: 4.8,
                    distance: 1200,
                    isOpen: !0,
                    phoneNumber: '02-1234-5678',
                  },
                  {
                    id: 'ws2',
                    name: '24\uc2dc\uac04 \uc790\ub3d9\ucc28 \ubcd1\uc6d0',
                    address: '\uc11c\uc6b8\uc2dc \uac15\ub0a8\uad6c \uac15\ub0a8\ub300\ub85c 321',
                    latitude: e.latitude - 0.008,
                    longitude: e.longitude + 0.015,
                    category: 'workshop',
                    rating: 4.6,
                    distance: 1800,
                    isOpen: !0,
                    phoneNumber: '02-2345-6789',
                  },
                ];
              },
            },
            {
              key: 'getMockRoute',
              value: function (e, t) {
                var n =
                  111e3 *
                  Math.sqrt(
                    Math.pow(t.latitude - e.latitude, 2) + Math.pow(t.longitude - e.longitude, 2)
                  );
                return {
                  id: 'route1',
                  origin: e,
                  destination: t,
                  distance: Math.round(n),
                  duration: Math.round(n / 30),
                  polyline: 'mock_polyline_data',
                  trafficStatus: 'normal',
                };
              },
            },
            {
              key: 'getMockDiagnosticData',
              value: function (e) {
                return {
                  vehicleId: e,
                  timestamp: new Date(),
                  engineStatus: 'good',
                  batteryLevel: 85,
                  fuelLevel: 65,
                  mileage: 12500,
                  oilPressure: 45,
                  coolantTemperature: 90,
                  tirePressure: { frontLeft: 32, frontRight: 31, rearLeft: 30, rearRight: 32 },
                  diagnosticCodes: [],
                  maintenanceRecommendations: [
                    {
                      id: 'rec1',
                      type: 'oil_change',
                      severity: 'medium',
                      description:
                        '\ub2e4\uc74c \uc815\uae30\uc810\uac80 \uc2dc \uc5d4\uc9c4\uc624\uc77c \uad50\uccb4\ub97c \uad8c\uc7a5\ud569\ub2c8\ub2e4.',
                      estimatedCost: 8e4,
                      mileageLimit: 1e4,
                    },
                  ],
                };
              },
            },
          ]
        );
        const be = new Fe();
        function ve() {
          var e = (0, W.useNavigation)(),
            t = (0, i.useState)(''),
            n = (0, j.default)(t, 2),
            r = n[0],
            a = n[1],
            l = (0, i.useState)(!1),
            s = (0, j.default)(l, 2),
            c = s[0],
            d = s[1],
            g = (0, i.useState)([]),
            m = (0, j.default)(g, 2),
            x = m[0],
            y = m[1],
            p = (0, i.useState)(null),
            F = (0, j.default)(p, 2),
            b = F[0],
            v = F[1],
            w = (0, i.useState)([]),
            B = (0, j.default)(w, 2),
            S = B[0],
            T = B[1],
            k = (0, i.useState)([]),
            z = (0, j.default)(k, 2),
            I = z[0],
            D = z[1],
            P = (0, i.useState)(null),
            E = (0, j.default)(P, 2),
            R = (E[0], E[1]),
            A = (0, i.useState)('search'),
            H = (0, j.default)(A, 2),
            N = H[0],
            M = H[1],
            _ = (0, i.useCallback)(
              (0, o.default)(function* () {
                try {
                  var e = yield be.getCurrentLocation();
                  v(e);
                  var t = yield be.searchNearbyWorkshops(e);
                  D(t);
                } catch (n) {
                  console.error(
                    '\ud604\uc7ac \uc704\uce58 \uac00\uc838\uc624\uae30 \uc2e4\ud328:',
                    n
                  ),
                    O.default.alert(
                      '\uc704\uce58 \uc624\ub958',
                      '\ud604\uc7ac \uc704\uce58\ub97c \uac00\uc838\uc62c \uc218 \uc5c6\uc2b5\ub2c8\ub2e4. \uc704\uce58 \uad8c\ud55c\uc744 \ud655\uc778\ud574\uc8fc\uc138\uc694.'
                    );
                }
              }),
              []
            ),
            q = (0, i.useCallback)(
              (0, o.default)(function* () {
                try {
                  var e = yield be.getFavoriteLocations();
                  T(e);
                } catch (t) {
                  console.error('\uc990\uaca8\ucc3e\uae30 \ub85c\ub4dc \uc2e4\ud328:', t);
                }
              }),
              []
            );
          (0, i.useEffect)(
            function () {
              _(), q();
            },
            [_, q]
          );
          var G = (function () {
              var e = (0, o.default)(function* () {
                if (r.trim()) {
                  d(!0);
                  try {
                    var e = yield be.searchLocations(r, b || void 0);
                    y(e), M('search');
                  } catch (t) {
                    console.error('\uac80\uc0c9 \uc2e4\ud328:', t),
                      O.default.alert(
                        '\uac80\uc0c9 \uc624\ub958',
                        '\uac80\uc0c9 \uc911 \uc624\ub958\uac00 \ubc1c\uc0dd\ud588\uc2b5\ub2c8\ub2e4.'
                      );
                  } finally {
                    d(!1);
                  }
                }
              });
              return function () {
                return e.apply(this, arguments);
              };
            })(),
            U = (function () {
              var t = (0, o.default)(function* (t) {
                R(t),
                  b
                    ? e.navigate('MapDetail', {
                        destination: { latitude: t.latitude, longitude: t.longitude, name: t.name },
                      })
                    : O.default.alert(
                        '\uc704\uce58 \uc624\ub958',
                        '\ud604\uc7ac \uc704\uce58\ub97c \ucc3e\uc744 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4.'
                      );
              });
              return function (e) {
                return t.apply(this, arguments);
              };
            })(),
            K = (function () {
              var e = (0, o.default)(function* (e) {
                try {
                  yield be.addFavoriteLocation(e),
                    yield q(),
                    O.default.alert(
                      '\ucd94\uac00 \uc644\ub8cc',
                      '\uc990\uaca8\ucc3e\uae30\uc5d0 \ucd94\uac00\ub418\uc5c8\uc2b5\ub2c8\ub2e4.'
                    );
                } catch (t) {
                  console.error('\uc990\uaca8\ucc3e\uae30 \ucd94\uac00 \uc2e4\ud328:', t),
                    O.default.alert(
                      '\uc624\ub958',
                      '\uc990\uaca8\ucc3e\uae30 \ucd94\uac00\uc5d0 \uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4.'
                    );
                }
              });
              return function (t) {
                return e.apply(this, arguments);
              };
            })();
          return (0, C.jsxs)(ge.default, {
            style: Ce.container,
            children: [
              (0, C.jsxs)(u.default, {
                style: Ce.header,
                children: [
                  (0, C.jsx)(f.default, {
                    style: Ce.title,
                    children: '\uc2a4\ub9c8\ud2b8 \ub124\ube44\uac8c\uc774\uc158',
                  }),
                  (0, C.jsxs)(L.default, {
                    onPress: function () {
                      e.navigate('EmergencyService');
                    },
                    style: Ce.emergencyButton,
                    children: [
                      (0, C.jsx)(me.default, { name: 'warning', size: 20, color: '#FFFFFF' }),
                      (0, C.jsx)(f.default, { style: Ce.emergencyText, children: '\uae34\uae09' }),
                    ],
                  }),
                ],
              }),
              (0, C.jsxs)(u.default, {
                style: Ce.searchContainer,
                children: [
                  (0, C.jsxs)(u.default, {
                    style: Ce.searchInputContainer,
                    children: [
                      (0, C.jsx)(me.default, {
                        name: 'search-outline',
                        size: 20,
                        color: '#9CA3AF',
                      }),
                      (0, C.jsx)(V.default, {
                        style: Ce.searchInput,
                        placeholder:
                          '\ubaa9\uc801\uc9c0\ub97c \uac80\uc0c9\ud574\ubcf4\uc138\uc694',
                        value: r,
                        onChangeText: a,
                        onSubmitEditing: G,
                        returnKeyType: 'search',
                      }),
                      c && (0, C.jsx)(h.default, { size: 'small', color: '#6366F1' }),
                    ],
                  }),
                  (0, C.jsx)(L.default, {
                    onPress: G,
                    style: Ce.searchButton,
                    children: (0, C.jsx)(f.default, {
                      style: Ce.searchButtonText,
                      children: '\uac80\uc0c9',
                    }),
                  }),
                ],
              }),
              (0, C.jsxs)(u.default, {
                style: Ce.quickActions,
                children: [
                  (0, C.jsxs)(L.default, {
                    onPress: _,
                    style: Ce.quickActionButton,
                    children: [
                      (0, C.jsx)(me.default, { name: 'location', size: 24, color: '#6366F1' }),
                      (0, C.jsx)(f.default, {
                        style: Ce.quickActionText,
                        children: '\ud604\uc7ac\uc704\uce58',
                      }),
                    ],
                  }),
                  (0, C.jsxs)(L.default, {
                    onPress: function () {
                      e.navigate('ServiceHub');
                    },
                    style: Ce.quickActionButton,
                    children: [
                      (0, C.jsx)(me.default, { name: 'construct', size: 24, color: '#6366F1' }),
                      (0, C.jsx)(f.default, {
                        style: Ce.quickActionText,
                        children: '\uc11c\ube44\uc2a4',
                      }),
                    ],
                  }),
                  (0, C.jsxs)(L.default, {
                    onPress: function () {
                      return M('workshops');
                    },
                    style: Ce.quickActionButton,
                    children: [
                      (0, C.jsx)(me.default, { name: 'car-sport', size: 24, color: '#6366F1' }),
                      (0, C.jsx)(f.default, {
                        style: Ce.quickActionText,
                        children: '\uc815\ube44\uc18c',
                      }),
                    ],
                  }),
                ],
              }),
              (0, C.jsxs)(u.default, {
                style: Ce.tabContainer,
                children: [
                  (0, C.jsx)(L.default, {
                    style: [Ce.tab, 'search' === N && Ce.activeTab],
                    onPress: function () {
                      return M('search');
                    },
                    children: (0, C.jsx)(f.default, {
                      style: [Ce.tabText, 'search' === N && Ce.activeTabText],
                      children: '\uac80\uc0c9\uacb0\uacfc',
                    }),
                  }),
                  (0, C.jsx)(L.default, {
                    style: [Ce.tab, 'favorites' === N && Ce.activeTab],
                    onPress: function () {
                      return M('favorites');
                    },
                    children: (0, C.jsx)(f.default, {
                      style: [Ce.tabText, 'favorites' === N && Ce.activeTabText],
                      children: '\uc990\uaca8\ucc3e\uae30',
                    }),
                  }),
                  (0, C.jsx)(L.default, {
                    style: [Ce.tab, 'workshops' === N && Ce.activeTab],
                    onPress: function () {
                      return M('workshops');
                    },
                    children: (0, C.jsx)(f.default, {
                      style: [Ce.tabText, 'workshops' === N && Ce.activeTabText],
                      children: '\uc8fc\ubcc0\uc815\ube44\uc18c',
                    }),
                  }),
                ],
              }),
              (0, C.jsx)(he.default, {
                data: (function () {
                  switch (N) {
                    case 'search':
                      return x;
                    case 'favorites':
                      return S;
                    case 'workshops':
                      return I;
                    default:
                      return [];
                  }
                })(),
                renderItem: function (e) {
                  var t = e.item;
                  return (0, C.jsx)(L.default, {
                    style: Ce.locationItem,
                    onPress: function () {
                      return U(t);
                    },
                    children: (0, C.jsxs)(u.default, {
                      style: Ce.locationInfo,
                      children: [
                        (0, C.jsxs)(u.default, {
                          style: Ce.locationHeader,
                          children: [
                            (0, C.jsx)(me.default, {
                              name:
                                'workshop' === t.category ? 'build-outline' : 'location-outline',
                              size: 20,
                              color: '#6366F1',
                            }),
                            (0, C.jsx)(f.default, { style: Ce.locationName, children: t.name }),
                            t.rating &&
                              (0, C.jsxs)(u.default, {
                                style: Ce.ratingContainer,
                                children: [
                                  (0, C.jsx)(me.default, {
                                    name: 'star',
                                    size: 14,
                                    color: '#F59E0B',
                                  }),
                                  (0, C.jsx)(f.default, { style: Ce.rating, children: t.rating }),
                                ],
                              }),
                          ],
                        }),
                        (0, C.jsx)(f.default, { style: Ce.locationAddress, children: t.address }),
                        t.distance &&
                          (0, C.jsxs)(f.default, {
                            style: Ce.distance,
                            children: [Math.round(t.distance), 'm'],
                          }),
                        'workshop' === t.category &&
                          (0, C.jsxs)(u.default, {
                            style: Ce.workshopActions,
                            children: [
                              (0, C.jsxs)(L.default, {
                                style: Ce.actionButton,
                                onPress: function () {
                                  return (
                                    t.phoneNumber &&
                                    ((e = t.phoneNumber),
                                    void O.default.alert(
                                      '\uc804\ud654 \uac78\uae30',
                                      e +
                                        '\ub85c \uc804\ud654\ub97c \uac78\uaca0\uc2b5\ub2c8\uae4c?',
                                      [
                                        { text: '\ucde8\uc18c', style: 'cancel' },
                                        {
                                          text: '\uc804\ud654\uac78\uae30',
                                          onPress: function () {
                                            return console.log('\uc804\ud654\uac78\uae30:', e);
                                          },
                                        },
                                      ]
                                    ))
                                  );
                                  var e;
                                },
                                children: [
                                  (0, C.jsx)(me.default, {
                                    name: 'call-outline',
                                    size: 16,
                                    color: '#10B981',
                                  }),
                                  (0, C.jsx)(f.default, {
                                    style: Ce.actionText,
                                    children: '\uc804\ud654',
                                  }),
                                ],
                              }),
                              (0, C.jsxs)(L.default, {
                                style: Ce.actionButton,
                                onPress: function () {
                                  return K(t);
                                },
                                children: [
                                  (0, C.jsx)(me.default, {
                                    name: 'heart-outline',
                                    size: 16,
                                    color: '#EF4444',
                                  }),
                                  (0, C.jsx)(f.default, {
                                    style: Ce.actionText,
                                    children: '\uc990\uaca8\ucc3e\uae30',
                                  }),
                                ],
                              }),
                            ],
                          }),
                      ],
                    }),
                  });
                },
                keyExtractor: function (e) {
                  return e.id;
                },
                style: Ce.resultsList,
                showsVerticalScrollIndicator: !1,
                ListEmptyComponent: function () {
                  return (0, C.jsxs)(u.default, {
                    style: Ce.emptyContainer,
                    children: [
                      (0, C.jsx)(me.default, {
                        name: 'search-outline',
                        size: 48,
                        color: '#9CA3AF',
                      }),
                      (0, C.jsx)(f.default, {
                        style: Ce.emptyText,
                        children:
                          'search' === N
                            ? '\uac80\uc0c9 \uacb0\uacfc\uac00 \uc5c6\uc2b5\ub2c8\ub2e4'
                            : 'favorites' === N
                              ? '\uc990\uaca8\ucc3e\uae30\uac00 \uc5c6\uc2b5\ub2c8\ub2e4'
                              : '\uc8fc\ubcc0 \uc815\ube44\uc18c\uac00 \uc5c6\uc2b5\ub2c8\ub2e4',
                      }),
                    ],
                  });
                },
              }),
            ],
          });
        }
        var Ce = g.default.create({
            container: { flex: 1, backgroundColor: '#FFFFFF' },
            header: {
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 20,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#E5E7EB',
            },
            title: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
            emergencyButton: {
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#EF4444',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
            },
            emergencyText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600', marginLeft: 4 },
            searchContainer: {
              flexDirection: 'row',
              paddingHorizontal: 20,
              paddingVertical: 16,
              gap: 12,
            },
            searchInputContainer: {
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#F3F4F6',
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
            },
            searchInput: { flex: 1, marginLeft: 8, fontSize: 16, color: '#1F2937' },
            searchButton: {
              backgroundColor: '#6366F1',
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 12,
              justifyContent: 'center',
            },
            searchButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
            quickActions: {
              flexDirection: 'row',
              justifyContent: 'space-around',
              paddingHorizontal: 20,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#E5E7EB',
            },
            quickActionButton: { alignItems: 'center' },
            quickActionText: { fontSize: 12, color: '#6366F1', marginTop: 4, fontWeight: '500' },
            tabContainer: { flexDirection: 'row', backgroundColor: '#F9FAFB' },
            tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
            activeTab: {
              borderBottomWidth: 2,
              borderBottomColor: '#6366F1',
              backgroundColor: '#FFFFFF',
            },
            tabText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
            activeTabText: { color: '#6366F1', fontWeight: '600' },
            resultsList: { flex: 1 },
            locationItem: {
              backgroundColor: '#FFFFFF',
              paddingHorizontal: 20,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#F3F4F6',
            },
            locationInfo: { flex: 1 },
            locationHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
            locationName: {
              fontSize: 16,
              fontWeight: '600',
              color: '#1F2937',
              marginLeft: 8,
              flex: 1,
            },
            ratingContainer: { flexDirection: 'row', alignItems: 'center' },
            rating: { fontSize: 12, color: '#F59E0B', marginLeft: 2, fontWeight: '500' },
            locationAddress: { fontSize: 14, color: '#6B7280', marginLeft: 28, marginBottom: 4 },
            distance: { fontSize: 12, color: '#10B981', marginLeft: 28, fontWeight: '500' },
            workshopActions: { flexDirection: 'row', marginTop: 8, marginLeft: 28, gap: 16 },
            actionButton: { flexDirection: 'row', alignItems: 'center' },
            actionText: { fontSize: 12, marginLeft: 4, fontWeight: '500' },
            emptyContainer: {
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              paddingVertical: 60,
            },
            emptyText: { fontSize: 16, color: '#9CA3AF', marginTop: 16 },
          }),
          we = n(3156);
        function Be() {
          return Se.apply(this, arguments);
        }
        function Se() {
          return (Se = (0, o.default)(function* () {
            try {
              return yield we.initializeOBDConnection('OBD-II'), !0;
            } catch (e) {
              throw (console.error('OBD \uc5f0\uacb0 \uc2e4\ud328:', e), e);
            }
          })).apply(this, arguments);
        }
        function Te() {
          return ke.apply(this, arguments);
        }
        function ke() {
          return (ke = (0, o.default)(function* () {
            try {
              return {
                rpm: 1200,
                speed: 0,
                engineTemp: 85,
                fuelLevel: 75,
                diagnosticTroubleCodes: [],
                batteryVoltage: 12.8,
                tirePressure: { frontLeft: 32, frontRight: 32, rearLeft: 30, rearRight: 30 },
              };
            } catch (e) {
              throw (
                (console.error('\uc9c4\ub2e8 \ub370\uc774\ud130 \uc870\ud68c \uc2e4\ud328:', e), e)
              );
            }
          })).apply(this, arguments);
        }
        function ze() {
          return Ie.apply(this, arguments);
        }
        function Ie() {
          return (Ie = (0, o.default)(function* () {
            try {
              var e = yield Te(),
                t = 'good';
              return (
                e.batteryVoltage &&
                  (e.batteryVoltage < 11.8
                    ? (t = 'critical')
                    : e.batteryVoltage < 12.4 && (t = 'warning')),
                {
                  isEngineRunning: e.rpm > 0,
                  isMoving: e.speed > 0,
                  isFuelLow: e.fuelLevel < 20,
                  hasDiagnosticCodes: e.diagnosticTroubleCodes.length > 0,
                  batteryHealth: t,
                }
              );
            } catch (n) {
              throw (console.error('\ucc28\ub7c9 \uc0c1\ud0dc \ubd84\uc11d \uc2e4\ud328:', n), n);
            }
          })).apply(this, arguments);
        }
        function De() {
          var e = (0, W.useNavigation)(),
            t = (0, i.useState)(null),
            n = (0, j.default)(t, 2),
            r = n[0],
            a = n[1];
          (0, i.useEffect)(function () {
            var e = (function () {
              var e = (0, o.default)(function* () {
                try {
                  if (yield Be()) {
                    yield ze();
                    var e = yield Te(),
                      t = {
                        vehicleId: 'vehicle_1',
                        timestamp: new Date(),
                        batteryLevel:
                          null != e && e.batteryVoltage
                            ? Math.round((e.batteryVoltage / 14.4) * 100)
                            : 85,
                        engineStatus: (null == e ? void 0 : e.engineTemp) < 90 ? 'good' : 'warning',
                        fuelLevel: (null == e ? void 0 : e.fuelLevel) || 65,
                        mileage: 45e3,
                        oilPressure: 40,
                        coolantTemperature: (null == e ? void 0 : e.engineTemp) || 85,
                        tirePressure: (null == e ? void 0 : e.tirePressure) || {
                          frontLeft: 32,
                          frontRight: 32,
                          rearLeft: 30,
                          rearRight: 30,
                        },
                        diagnosticCodes: (null == e ? void 0 : e.diagnosticTroubleCodes) || [],
                        maintenanceRecommendations: [],
                      };
                    a(t);
                  } else {
                    var n = yield be.getVehicleDiagnostics('vehicle_1');
                    a(n);
                  }
                } catch (o) {
                  console.error('\uc9c4\ub2e8 \ub370\uc774\ud130 \ub85c\ub4dc \uc2e4\ud328:', o);
                  try {
                    var r = yield be.getVehicleDiagnostics('vehicle_1');
                    a(r);
                  } catch (i) {
                    console.error(
                      '\uae30\ubcf8 \ub370\uc774\ud130 \ub85c\ub4dc\ub3c4 \uc2e4\ud328:',
                      i
                    );
                  }
                }
              });
              return function () {
                return e.apply(this, arguments);
              };
            })();
            e();
          }, []);
          return (0, C.jsx)(ge.default, {
            style: Le.container,
            children: (0, C.jsxs)(N.default, {
              showsVerticalScrollIndicator: !1,
              children: [
                (0, C.jsxs)(u.default, {
                  style: Le.header,
                  children: [
                    (0, C.jsx)(f.default, {
                      style: Le.title,
                      children: '\uc11c\ube44\uc2a4 \ud5c8\ube0c',
                    }),
                    (0, C.jsxs)(L.default, {
                      onPress: function () {
                        O.default.alert(
                          '\uae34\uae09 \ucd9c\ub3d9 \uc11c\ube44\uc2a4',
                          '24\uc2dc\uac04 \uae34\uae09 \ucd9c\ub3d9 \uc11c\ube44\uc2a4\ub97c \ud638\ucd9c\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?',
                          [
                            { text: '\ucde8\uc18c', style: 'cancel' },
                            {
                              text: '\ud638\ucd9c\ud558\uae30',
                              style: 'destructive',
                              onPress: function () {
                                return e.navigate('EmergencyService');
                              },
                            },
                          ]
                        );
                      },
                      style: Le.emergencyButton,
                      children: [
                        (0, C.jsx)(me.default, { name: 'call', size: 20, color: '#FFFFFF' }),
                        (0, C.jsx)(f.default, {
                          style: Le.emergencyText,
                          children: '\uae34\uae09\ud638\ucd9c',
                        }),
                      ],
                    }),
                  ],
                }),
                r &&
                  (0, C.jsxs)(u.default, {
                    style: Le.vehicleStatusCard,
                    children: [
                      (0, C.jsxs)(u.default, {
                        style: Le.statusHeader,
                        children: [
                          (0, C.jsx)(me.default, { name: 'car-sport', size: 24, color: '#6366F1' }),
                          (0, C.jsx)(f.default, {
                            style: Le.statusTitle,
                            children: '\ucc28\ub7c9 \uc0c1\ud0dc',
                          }),
                          (0, C.jsx)(u.default, {
                            style: [
                              Le.statusIndicator,
                              {
                                backgroundColor: (function (e) {
                                  switch (e) {
                                    case 'good':
                                      return '#10B981';
                                    case 'warning':
                                      return '#F59E0B';
                                    case 'critical':
                                      return '#EF4444';
                                    default:
                                      return '#6B7280';
                                  }
                                })(r.engineStatus),
                              },
                            ],
                            children: (0, C.jsx)(f.default, {
                              style: Le.statusText,
                              children: (function (e) {
                                switch (e) {
                                  case 'good':
                                    return '\uc591\ud638';
                                  case 'warning':
                                    return '\uc8fc\uc758';
                                  case 'critical':
                                    return '\uc704\ud5d8';
                                  default:
                                    return '\uc54c \uc218 \uc5c6\uc74c';
                                }
                              })(r.engineStatus),
                            }),
                          }),
                        ],
                      }),
                      (0, C.jsxs)(u.default, {
                        style: Le.statusGrid,
                        children: [
                          (0, C.jsxs)(u.default, {
                            style: Le.statusItem,
                            children: [
                              (0, C.jsx)(me.default, {
                                name: 'battery-half',
                                size: 20,
                                color: '#6B7280',
                              }),
                              (0, C.jsx)(f.default, {
                                style: Le.statusLabel,
                                children: '\ubc30\ud130\ub9ac',
                              }),
                              (0, C.jsxs)(f.default, {
                                style: Le.statusValue,
                                children: [r.batteryLevel, '%'],
                              }),
                            ],
                          }),
                          (0, C.jsxs)(u.default, {
                            style: Le.statusItem,
                            children: [
                              (0, C.jsx)(me.default, {
                                name: 'speedometer',
                                size: 20,
                                color: '#6B7280',
                              }),
                              (0, C.jsx)(f.default, {
                                style: Le.statusLabel,
                                children: '\uc5f0\ub8cc',
                              }),
                              (0, C.jsxs)(f.default, {
                                style: Le.statusValue,
                                children: [r.fuelLevel, '%'],
                              }),
                            ],
                          }),
                          (0, C.jsxs)(u.default, {
                            style: Le.statusItem,
                            children: [
                              (0, C.jsx)(me.default, {
                                name: 'thermometer',
                                size: 20,
                                color: '#6B7280',
                              }),
                              (0, C.jsx)(f.default, {
                                style: Le.statusLabel,
                                children: '\ub0c9\uac01\uc218',
                              }),
                              (0, C.jsxs)(f.default, {
                                style: Le.statusValue,
                                children: [r.coolantTemperature, '\xb0C'],
                              }),
                            ],
                          }),
                        ],
                      }),
                      r.maintenanceRecommendations.length > 0 &&
                        (0, C.jsxs)(u.default, {
                          style: Le.recommendationBanner,
                          children: [
                            (0, C.jsx)(me.default, {
                              name: 'information-circle',
                              size: 20,
                              color: '#F59E0B',
                            }),
                            (0, C.jsx)(f.default, {
                              style: Le.recommendationText,
                              children: r.maintenanceRecommendations[0].description,
                            }),
                          ],
                        }),
                    ],
                  }),
                (0, C.jsxs)(u.default, {
                  style: Le.servicesContainer,
                  children: [
                    (0, C.jsx)(f.default, {
                      style: Le.sectionTitle,
                      children: '\uc815\ube44 \uc11c\ube44\uc2a4',
                    }),
                    (0, C.jsx)(u.default, {
                      style: Le.servicesGrid,
                      children: [
                        {
                          id: 'maintenance_booking',
                          name: '\uc815\ube44 \uc608\uc57d',
                          icon: 'calendar-outline',
                          description: '\uc815\uae30\uc810\uac80 \ubc0f \uc218\ub9ac \uc608\uc57d',
                        },
                        {
                          id: 'workshop_search',
                          name: '\uc815\ube44\uc18c \ucc3e\uae30',
                          icon: 'location-outline',
                          description: '\uc8fc\ubcc0 \uc815\ube44\uc18c \uac80\uc0c9',
                        },
                        {
                          id: 'emergency_service',
                          name: '\uae34\uae09 \uc11c\ube44\uc2a4',
                          icon: 'warning-outline',
                          description: '24\uc2dc\uac04 \uae34\uae09\ucd9c\ub3d9',
                          isEmergency: !0,
                        },
                        {
                          id: 'smart_diagnosis',
                          name: '\uc2a4\ub9c8\ud2b8 \uc9c4\ub2e8',
                          icon: 'analytics-outline',
                          description: 'AI \uae30\ubc18 \ucc28\ub7c9 \uc9c4\ub2e8',
                        },
                        {
                          id: 'maintenance_history',
                          name: '\uc815\ube44 \uc774\ub825',
                          icon: 'document-text-outline',
                          description: '\uacfc\uac70 \uc815\ube44 \uae30\ub85d \uc870\ud68c',
                        },
                        {
                          id: 'parts_order',
                          name: '\ubd80\ud488 \uc8fc\ubb38',
                          icon: 'cube-outline',
                          description:
                            '\uc790\ub3d9\ucc28 \ubd80\ud488 \uc628\ub77c\uc778 \uc8fc\ubb38',
                        },
                      ].map(function (t) {
                        return (0, C.jsxs)(
                          L.default,
                          {
                            style: [Le.serviceCard, t.isEmergency && Le.emergencyServiceCard],
                            onPress: function () {
                              return (function (t) {
                                switch (t) {
                                  case 'maintenance_booking':
                                    e.navigate('MaintenanceBooking');
                                    break;
                                  case 'workshop_search':
                                    e.navigate('WorkshopSearch', {});
                                    break;
                                  case 'emergency_service':
                                    e.navigate('EmergencyService');
                                    break;
                                  case 'smart_diagnosis':
                                    e.navigate('SmartDiagnosis', { vehicleId: 'vehicle_1' });
                                    break;
                                  case 'maintenance_history':
                                    e.navigate('MaintenanceHistory');
                                    break;
                                  case 'parts_order':
                                    O.default.alert(
                                      '\uc900\ube44\uc911',
                                      '\ubd80\ud488 \uc8fc\ubb38 \uae30\ub2a5\uc740 \uc900\ube44 \uc911\uc785\ub2c8\ub2e4.'
                                    );
                                    break;
                                  default:
                                    O.default.alert(
                                      '\uc54c\ub9bc',
                                      '\ud574\ub2f9 \uc11c\ube44\uc2a4\ub294 \uc900\ube44 \uc911\uc785\ub2c8\ub2e4.'
                                    );
                                }
                              })(t.id);
                            },
                            children: [
                              (0, C.jsx)(u.default, {
                                style: [
                                  Le.serviceIconContainer,
                                  t.isEmergency && Le.emergencyIconContainer,
                                ],
                                children: (0, C.jsx)(me.default, {
                                  name: t.icon,
                                  size: 28,
                                  color: t.isEmergency ? '#FFFFFF' : '#6366F1',
                                }),
                              }),
                              (0, C.jsx)(f.default, {
                                style: [Le.serviceName, t.isEmergency && Le.emergencyServiceName],
                                children: t.name,
                              }),
                              (0, C.jsx)(f.default, {
                                style: [
                                  Le.serviceDescription,
                                  t.isEmergency && Le.emergencyServiceDescription,
                                ],
                                children: t.description,
                              }),
                              t.isEmergency &&
                                (0, C.jsx)(u.default, {
                                  style: Le.emergencyBadge,
                                  children: (0, C.jsx)(f.default, {
                                    style: Le.emergencyBadgeText,
                                    children: '24\uc2dc\uac04',
                                  }),
                                }),
                            ],
                          },
                          t.id
                        );
                      }),
                    }),
                  ],
                }),
                (0, C.jsxs)(u.default, {
                  style: Le.recentServicesContainer,
                  children: [
                    (0, C.jsx)(f.default, {
                      style: Le.sectionTitle,
                      children: '\ucd5c\uadfc \uc11c\ube44\uc2a4',
                    }),
                    (0, C.jsxs)(L.default, {
                      style: Le.historyCard,
                      onPress: function () {
                        return e.navigate('MaintenanceHistory');
                      },
                      children: [
                        (0, C.jsxs)(u.default, {
                          style: Le.historyHeader,
                          children: [
                            (0, C.jsx)(me.default, {
                              name: 'construct',
                              size: 20,
                              color: '#6366F1',
                            }),
                            (0, C.jsx)(f.default, {
                              style: Le.historyTitle,
                              children: '\uc815\uae30\uc810\uac80',
                            }),
                            (0, C.jsx)(f.default, {
                              style: Le.historyDate,
                              children: '2024.01.15',
                            }),
                          ],
                        }),
                        (0, C.jsx)(f.default, {
                          style: Le.historyDescription,
                          children:
                            '\uc5d4\uc9c4\uc624\uc77c \uad50\uccb4, \uc5d0\uc5b4\ud544\ud130 \uad50\uccb4, \uc804\uccb4 \uc810\uac80 \uc644\ub8cc',
                        }),
                        (0, C.jsxs)(u.default, {
                          style: Le.historyFooter,
                          children: [
                            (0, C.jsx)(f.default, {
                              style: Le.historyWorkshop,
                              children: '\uc2a4\ub9c8\ud2b8\uce74 \uc815\ube44\uc18c',
                            }),
                            (0, C.jsx)(f.default, {
                              style: Le.historyCost,
                              children: '\u20a9150,000',
                            }),
                          ],
                        }),
                      ],
                    }),
                    (0, C.jsxs)(L.default, {
                      style: Le.viewAllButton,
                      children: [
                        (0, C.jsx)(f.default, {
                          style: Le.viewAllText,
                          children: '\uc804\uccb4 \uc774\ub825 \ubcf4\uae30',
                        }),
                        (0, C.jsx)(me.default, {
                          name: 'chevron-forward',
                          size: 16,
                          color: '#6366F1',
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          });
        }
        var Le = g.default.create({
            container: { flex: 1, backgroundColor: '#F9FAFB' },
            header: {
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 20,
              paddingVertical: 16,
              backgroundColor: '#FFFFFF',
              borderBottomWidth: 1,
              borderBottomColor: '#E5E7EB',
            },
            title: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
            emergencyButton: {
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#EF4444',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
            },
            emergencyText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600', marginLeft: 6 },
            vehicleStatusCard: {
              backgroundColor: '#FFFFFF',
              margin: 20,
              padding: 20,
              borderRadius: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            },
            statusHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
            statusTitle: {
              fontSize: 18,
              fontWeight: '600',
              color: '#1F2937',
              marginLeft: 12,
              flex: 1,
            },
            statusIndicator: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
            statusText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
            statusGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
            statusItem: { alignItems: 'center', flex: 1 },
            statusLabel: { fontSize: 12, color: '#6B7280', marginTop: 4 },
            statusValue: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginTop: 2 },
            recommendationBanner: {
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#FEF3C7',
              padding: 12,
              borderRadius: 8,
            },
            recommendationText: { fontSize: 14, color: '#92400E', marginLeft: 8, flex: 1 },
            servicesContainer: { paddingHorizontal: 20, marginBottom: 24 },
            sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 16 },
            servicesGrid: {
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
            },
            serviceCard: {
              backgroundColor: '#FFFFFF',
              width: '48%',
              padding: 20,
              borderRadius: 16,
              marginBottom: 16,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            },
            emergencyServiceCard: { backgroundColor: '#EF4444', width: '100%' },
            serviceIconContainer: {
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: '#EEF2FF',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 12,
            },
            emergencyIconContainer: { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
            serviceName: {
              fontSize: 16,
              fontWeight: '600',
              color: '#1F2937',
              textAlign: 'center',
              marginBottom: 4,
            },
            emergencyServiceName: { color: '#FFFFFF' },
            serviceDescription: { fontSize: 12, color: '#6B7280', textAlign: 'center' },
            emergencyServiceDescription: { color: 'rgba(255, 255, 255, 0.8)' },
            emergencyBadge: {
              position: 'absolute',
              top: 12,
              right: 12,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 8,
            },
            emergencyBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '600' },
            recentServicesContainer: { paddingHorizontal: 20, marginBottom: 24 },
            historyCard: {
              backgroundColor: '#FFFFFF',
              padding: 16,
              borderRadius: 12,
              marginBottom: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            },
            historyHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
            historyTitle: {
              fontSize: 16,
              fontWeight: '600',
              color: '#1F2937',
              marginLeft: 8,
              flex: 1,
            },
            historyDate: { fontSize: 12, color: '#6B7280' },
            historyDescription: { fontSize: 14, color: '#6B7280', marginBottom: 8 },
            historyFooter: {
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            },
            historyWorkshop: { fontSize: 12, color: '#6B7280' },
            historyCost: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
            viewAllButton: {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 12,
            },
            viewAllText: { fontSize: 14, color: '#6366F1', fontWeight: '500', marginRight: 4 },
          }),
          Pe = n(547);
        function Ee() {
          var e = (0, W.useNavigation)(),
            t = (0, i.useState)(null),
            n = (0, j.default)(t, 2),
            r = n[0],
            a = n[1],
            l = (0, i.useState)(null),
            s = (0, j.default)(l, 2),
            c = s[0],
            d = s[1],
            h = (0, i.useState)(!1),
            g = (0, j.default)(h, 2),
            m = g[0],
            x = g[1];
          (0, i.useEffect)(function () {
            var e = (function () {
              var e = (0, o.default)(function* () {
                try {
                  var e = yield be.getCurrentLocation();
                  a(e);
                } catch (t) {
                  console.error(
                    '\ud604\uc7ac \uc704\uce58 \uac00\uc838\uc624\uae30 \uc2e4\ud328:',
                    t
                  ),
                    O.default.alert(
                      '\uc704\uce58 \uc624\ub958',
                      '\ud604\uc7ac \uc704\uce58\ub97c \uac00\uc838\uc62c \uc218 \uc5c6\uc2b5\ub2c8\ub2e4.'
                    );
                }
              });
              return function () {
                return e.apply(this, arguments);
              };
            })();
            e();
          }, []);
          var y = function (e) {
              switch (e) {
                case 'towing':
                  return 'car-outline';
                case 'battery_jump':
                  return 'flash-outline';
                case 'tire_change':
                  return 'ellipse-outline';
                case 'lockout':
                  return 'key-outline';
                case 'fuel_delivery':
                  return 'water-outline';
                default:
                  return 'build-outline';
              }
            },
            p = (function () {
              var e = (0, o.default)(function* (e) {
                r
                  ? O.default.alert(
                      '\uae34\uae09 \uc11c\ube44\uc2a4 \uc694\uccad',
                      e.description +
                        '\n\n\uc608\uc0c1 \uc18c\uc694\uc2dc\uac04: ' +
                        e.estimatedArrival +
                        '\ubd84\n\uc608\uc0c1 \ube44\uc6a9: \u20a9' +
                        e.cost.toLocaleString() +
                        '\n\n\uc11c\ube44\uc2a4\ub97c \uc694\uccad\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?',
                      [
                        { text: '\ucde8\uc18c', style: 'cancel' },
                        {
                          text: '\uc694\uccad\ud558\uae30',
                          style: 'destructive',
                          onPress: function () {
                            return F(e);
                          },
                        },
                      ]
                    )
                  : O.default.alert(
                      '\uc704\uce58 \uc624\ub958',
                      '\ud604\uc7ac \uc704\uce58\ub97c \ud655\uc778\ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4.'
                    );
              });
              return function (t) {
                return e.apply(this, arguments);
              };
            })(),
            F = (function () {
              var e = (0, o.default)(function* (e) {
                x(!0), d(e.id);
                try {
                  yield new Promise(function (e) {
                    return setTimeout(e, 2e3);
                  }),
                    O.default.alert(
                      '\uc694\uccad \uc644\ub8cc',
                      e.description +
                        ' \uc694\uccad\uc774 \uc644\ub8cc\ub418\uc5c8\uc2b5\ub2c8\ub2e4.\n\n\ub2f4\ub2f9\uc790: ' +
                        e.provider.name +
                        '\n\uc5f0\ub77d\ucc98: ' +
                        e.provider.phone +
                        '\n\uc608\uc0c1 \ub3c4\ucc29\uc2dc\uac04: ' +
                        e.estimatedArrival +
                        '\ubd84',
                      [
                        { text: '\ud655\uc778' },
                        {
                          text: '\uc804\ud654\uac78\uae30',
                          onPress: function () {
                            return b(e.provider.phone);
                          },
                        },
                      ]
                    );
                } catch (t) {
                  O.default.alert(
                    '\uc624\ub958',
                    '\uc11c\ube44\uc2a4 \uc694\uccad \uc911 \uc624\ub958\uac00 \ubc1c\uc0dd\ud588\uc2b5\ub2c8\ub2e4.'
                  );
                } finally {
                  x(!1), d(null);
                }
              });
              return function (t) {
                return e.apply(this, arguments);
              };
            })(),
            b = function (e) {
              var t = e.replace(/[^0-9]/g, '');
              Pe.default.openURL('tel:' + t);
            },
            v = function (e) {
              O.default.alert(
                '\uae34\uae09 \uc2e0\uace0',
                e + '\uc5d0 \uc804\ud654\ub97c \uac78\uaca0\uc2b5\ub2c8\uae4c?',
                [
                  { text: '\ucde8\uc18c', style: 'cancel' },
                  {
                    text: '\uc804\ud654\uac78\uae30',
                    style: 'destructive',
                    onPress: function () {
                      return Pe.default.openURL('tel:' + e);
                    },
                  },
                ]
              );
            };
          return (0, C.jsx)(ge.default, {
            style: We.container,
            children: (0, C.jsxs)(N.default, {
              showsVerticalScrollIndicator: !1,
              children: [
                (0, C.jsxs)(u.default, {
                  style: We.header,
                  children: [
                    (0, C.jsx)(L.default, {
                      onPress: function () {
                        return e.goBack();
                      },
                      children: (0, C.jsx)(me.default, {
                        name: 'arrow-back',
                        size: 24,
                        color: '#1F2937',
                      }),
                    }),
                    (0, C.jsx)(f.default, {
                      style: We.title,
                      children: '\uae34\uae09 \uc11c\ube44\uc2a4',
                    }),
                    (0, C.jsx)(u.default, { style: We.placeholder }),
                  ],
                }),
                (0, C.jsxs)(u.default, {
                  style: We.emergencyCallsContainer,
                  children: [
                    (0, C.jsx)(f.default, {
                      style: We.sectionTitle,
                      children: '\uae34\uae09 \uc2e0\uace0',
                    }),
                    (0, C.jsxs)(u.default, {
                      style: We.emergencyCallsRow,
                      children: [
                        (0, C.jsxs)(L.default, {
                          style: [We.emergencyCallButton, { backgroundColor: '#EF4444' }],
                          onPress: function () {
                            return v('112');
                          },
                          children: [
                            (0, C.jsx)(me.default, { name: 'shield', size: 24, color: '#FFFFFF' }),
                            (0, C.jsx)(f.default, { style: We.emergencyCallText, children: '112' }),
                            (0, C.jsx)(f.default, {
                              style: We.emergencyCallSubText,
                              children: '\uacbd\ucc30\uc11c',
                            }),
                          ],
                        }),
                        (0, C.jsxs)(L.default, {
                          style: [We.emergencyCallButton, { backgroundColor: '#F59E0B' }],
                          onPress: function () {
                            return v('119');
                          },
                          children: [
                            (0, C.jsx)(me.default, { name: 'flame', size: 24, color: '#FFFFFF' }),
                            (0, C.jsx)(f.default, { style: We.emergencyCallText, children: '119' }),
                            (0, C.jsx)(f.default, {
                              style: We.emergencyCallSubText,
                              children: '\uc18c\ubc29\uc11c',
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                (0, C.jsxs)(u.default, {
                  style: We.locationContainer,
                  children: [
                    (0, C.jsxs)(u.default, {
                      style: We.locationHeader,
                      children: [
                        (0, C.jsx)(me.default, { name: 'location', size: 20, color: '#6366F1' }),
                        (0, C.jsx)(f.default, {
                          style: We.locationTitle,
                          children: '\ud604\uc7ac \uc704\uce58',
                        }),
                      ],
                    }),
                    r
                      ? (0, C.jsxs)(f.default, {
                          style: We.locationText,
                          children: [
                            '\uc704\ub3c4: ',
                            r.latitude.toFixed(6),
                            ', \uacbd\ub3c4:',
                            ' ',
                            r.longitude.toFixed(6),
                          ],
                        })
                      : (0, C.jsx)(f.default, {
                          style: We.locationError,
                          children:
                            '\uc704\uce58 \uc815\ubcf4\ub97c \uac00\uc838\uc624\ub294 \uc911...',
                        }),
                  ],
                }),
                (0, C.jsxs)(u.default, {
                  style: We.servicesContainer,
                  children: [
                    (0, C.jsx)(f.default, {
                      style: We.sectionTitle,
                      children: '\uae34\uae09 \ucd9c\ub3d9 \uc11c\ube44\uc2a4',
                    }),
                    [
                      {
                        id: 'towing',
                        type: 'towing',
                        description: '\ucc28\ub7c9 \uacac\uc778 \uc11c\ube44\uc2a4',
                        estimatedArrival: 25,
                        cost: 8e4,
                        provider: {
                          name: '24\uc2dc\uac04 \uae34\uae09\uacac\uc778',
                          phone: '1588-1234',
                          rating: 4.8,
                        },
                      },
                      {
                        id: 'battery_jump',
                        type: 'battery_jump',
                        description:
                          '\ubc30\ud130\ub9ac \ubc29\uc804 \uc810\ud504 \uc11c\ube44\uc2a4',
                        estimatedArrival: 15,
                        cost: 3e4,
                        provider: {
                          name: '\uc2a4\ub9c8\ud2b8 \ubc30\ud130\ub9ac \uc11c\ube44\uc2a4',
                          phone: '1588-2345',
                          rating: 4.7,
                        },
                      },
                      {
                        id: 'tire_change',
                        type: 'tire_change',
                        description:
                          '\ud0c0\uc774\uc5b4 \uad50\uccb4/\uc218\ub9ac \uc11c\ube44\uc2a4',
                        estimatedArrival: 20,
                        cost: 5e4,
                        provider: {
                          name: '\uc774\ub3d9\ud0c0\uc774\uc5b4 \uc11c\ube44\uc2a4',
                          phone: '1588-3456',
                          rating: 4.6,
                        },
                      },
                      {
                        id: 'lockout',
                        type: 'lockout',
                        description:
                          '\ucc28\ub7c9 \uc5f4\uc1e0 \ubd84\uc2e4/\uc7a0\uae40 \ud574\uacb0',
                        estimatedArrival: 18,
                        cost: 6e4,
                        provider: {
                          name: '24\uc2dc\uac04 \uc5f4\uc1e0 \uc11c\ube44\uc2a4',
                          phone: '1588-4567',
                          rating: 4.9,
                        },
                      },
                      {
                        id: 'fuel_delivery',
                        type: 'fuel_delivery',
                        description: '\uc5f0\ub8cc \ubd80\uc871 \uc2dc \uc5f0\ub8cc \ubc30\ub2ec',
                        estimatedArrival: 22,
                        cost: 25e3,
                        provider: {
                          name: '\uc774\ub3d9\uc8fc\uc720 \uc11c\ube44\uc2a4',
                          phone: '1588-5678',
                          rating: 4.5,
                        },
                      },
                    ].map(function (e) {
                      return (0, C.jsxs)(
                        L.default,
                        {
                          style: [We.serviceCard, c === e.id && We.selectedServiceCard],
                          onPress: function () {
                            return p(e);
                          },
                          disabled: m,
                          children: [
                            (0, C.jsxs)(u.default, {
                              style: We.serviceHeader,
                              children: [
                                (0, C.jsx)(u.default, {
                                  style: We.serviceIconContainer,
                                  children: (0, C.jsx)(me.default, {
                                    name: y(e.type),
                                    size: 24,
                                    color: '#6366F1',
                                  }),
                                }),
                                (0, C.jsxs)(u.default, {
                                  style: We.serviceInfo,
                                  children: [
                                    (0, C.jsx)(f.default, {
                                      style: We.serviceName,
                                      children: e.description,
                                    }),
                                    (0, C.jsx)(f.default, {
                                      style: We.serviceProvider,
                                      children: e.provider.name,
                                    }),
                                  ],
                                }),
                                (0, C.jsx)(u.default, {
                                  style: We.serviceActions,
                                  children: (0, C.jsx)(L.default, {
                                    style: We.callButton,
                                    onPress: function () {
                                      return b(e.provider.phone);
                                    },
                                    children: (0, C.jsx)(me.default, {
                                      name: 'call',
                                      size: 16,
                                      color: '#10B981',
                                    }),
                                  }),
                                }),
                              ],
                            }),
                            (0, C.jsxs)(u.default, {
                              style: We.serviceDetails,
                              children: [
                                (0, C.jsxs)(u.default, {
                                  style: We.serviceDetailItem,
                                  children: [
                                    (0, C.jsx)(me.default, {
                                      name: 'time-outline',
                                      size: 16,
                                      color: '#6B7280',
                                    }),
                                    (0, C.jsxs)(f.default, {
                                      style: We.serviceDetailText,
                                      children: ['\uc57d ', e.estimatedArrival, '\ubd84'],
                                    }),
                                  ],
                                }),
                                (0, C.jsxs)(u.default, {
                                  style: We.serviceDetailItem,
                                  children: [
                                    (0, C.jsx)(me.default, {
                                      name: 'card-outline',
                                      size: 16,
                                      color: '#6B7280',
                                    }),
                                    (0, C.jsxs)(f.default, {
                                      style: We.serviceDetailText,
                                      children: ['\u20a9', e.cost.toLocaleString()],
                                    }),
                                  ],
                                }),
                                (0, C.jsxs)(u.default, {
                                  style: We.serviceDetailItem,
                                  children: [
                                    (0, C.jsx)(me.default, {
                                      name: 'star',
                                      size: 16,
                                      color: '#F59E0B',
                                    }),
                                    (0, C.jsx)(f.default, {
                                      style: We.serviceDetailText,
                                      children: e.provider.rating,
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            m &&
                              c === e.id &&
                              (0, C.jsx)(u.default, {
                                style: We.loadingContainer,
                                children: (0, C.jsx)(f.default, {
                                  style: We.loadingText,
                                  children: '\uc694\uccad \ucc98\ub9ac \uc911...',
                                }),
                              }),
                          ],
                        },
                        e.id
                      );
                    }),
                  ],
                }),
                (0, C.jsxs)(u.default, {
                  style: We.noticeContainer,
                  children: [
                    (0, C.jsxs)(u.default, {
                      style: We.noticeHeader,
                      children: [
                        (0, C.jsx)(me.default, {
                          name: 'information-circle',
                          size: 20,
                          color: '#F59E0B',
                        }),
                        (0, C.jsx)(f.default, {
                          style: We.noticeTitle,
                          children: '\uc8fc\uc758\uc0ac\ud56d',
                        }),
                      ],
                    }),
                    (0, C.jsxs)(f.default, {
                      style: We.noticeText,
                      children: [
                        '\u2022 \uae34\uae09 \uc11c\ube44\uc2a4\ub294 24\uc2dc\uac04 \uc6b4\uc601\ub429\ub2c8\ub2e4',
                        '\n',
                        '\u2022 \uc11c\ube44\uc2a4 \uc694\uccad \ud6c4 \ucde8\uc18c \uc2dc \ucde8\uc18c \uc218\uc218\ub8cc\uac00 \ubc1c\uc0dd\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4',
                        '\n',
                        '\u2022 \uc2e4\uc81c \ub3c4\ucc29 \uc2dc\uac04\uacfc \ube44\uc6a9\uc740 \uc0c1\ud669\uc5d0 \ub530\ub77c \ub2ec\ub77c\uc9c8 \uc218 \uc788\uc2b5\ub2c8\ub2e4',
                        '\n',
                        '\u2022 \uc0dd\uba85\uc774 \uc704\ud5d8\ud55c \uc751\uae09\uc0c1\ud669\uc5d0\uc11c\ub294 \uc989\uc2dc 119\uc5d0 \uc2e0\uace0\ud558\uc138\uc694',
                      ],
                    }),
                  ],
                }),
              ],
            }),
          });
        }
        var We = g.default.create({
          container: { flex: 1, backgroundColor: '#F9FAFB' },
          header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 16,
            backgroundColor: '#FFFFFF',
            borderBottomWidth: 1,
            borderBottomColor: '#E5E7EB',
          },
          title: { fontSize: 18, fontWeight: '600', color: '#1F2937' },
          placeholder: { width: 24 },
          emergencyCallsContainer: { padding: 20, backgroundColor: '#FFFFFF', marginBottom: 8 },
          sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 16 },
          emergencyCallsRow: { flexDirection: 'row', justifyContent: 'space-around' },
          emergencyCallButton: {
            alignItems: 'center',
            padding: 20,
            borderRadius: 16,
            minWidth: 100,
          },
          emergencyCallText: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold', marginTop: 8 },
          emergencyCallSubText: { color: '#FFFFFF', fontSize: 12, marginTop: 4 },
          locationContainer: { backgroundColor: '#FFFFFF', padding: 20, marginBottom: 8 },
          locationHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
          locationTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginLeft: 8 },
          locationText: { fontSize: 14, color: '#6B7280', fontFamily: 'monospace' },
          locationError: { fontSize: 14, color: '#EF4444' },
          servicesContainer: { padding: 20, backgroundColor: '#FFFFFF', marginBottom: 8 },
          serviceCard: {
            backgroundColor: '#F9FAFB',
            padding: 16,
            borderRadius: 12,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: '#E5E7EB',
          },
          selectedServiceCard: { borderColor: '#6366F1', backgroundColor: '#EEF2FF' },
          serviceHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
          serviceIconContainer: {
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: '#FFFFFF',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
          },
          serviceInfo: { flex: 1 },
          serviceName: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 2 },
          serviceProvider: { fontSize: 12, color: '#6B7280' },
          serviceActions: { flexDirection: 'row' },
          callButton: {
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: '#DCFCE7',
            justifyContent: 'center',
            alignItems: 'center',
          },
          serviceDetails: { flexDirection: 'row', justifyContent: 'space-between' },
          serviceDetailItem: { flexDirection: 'row', alignItems: 'center' },
          serviceDetailText: { fontSize: 12, color: '#6B7280', marginLeft: 4 },
          loadingContainer: { marginTop: 12, alignItems: 'center' },
          loadingText: { fontSize: 14, color: '#6366F1', fontWeight: '500' },
          noticeContainer: { backgroundColor: '#FFFFFF', padding: 20, marginBottom: 20 },
          noticeHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
          noticeTitle: { fontSize: 16, fontWeight: '600', color: '#F59E0B', marginLeft: 8 },
          noticeText: { fontSize: 14, color: '#6B7280', lineHeight: 20 },
        });
        function Re() {
          var e = (0, W.useNavigation)(),
            t = (0, W.useRoute)(),
            n = (0, i.useState)(null),
            r = (0, j.default)(n, 2),
            a = (r[0], r[1]),
            l = (0, i.useState)(null),
            s = (0, j.default)(l, 2),
            c = s[0],
            d = s[1],
            h = (0, i.useState)(!1),
            g = (0, j.default)(h, 2),
            m = g[0],
            x = g[1],
            y = (0, i.useState)(!1),
            p = (0, j.default)(y, 2),
            F = p[0],
            b = p[1],
            v = t.params.destination;
          (0, i.useEffect)(
            function () {
              var e = (function () {
                var e = (0, o.default)(function* () {
                  try {
                    var e = yield be.getCurrentLocation();
                    if ((a(e), v)) {
                      x(!0);
                      var t = {
                          id: 'current',
                          name: '\ud604\uc7ac \uc704\uce58',
                          address: '\ud604\uc7ac \uc704\uce58',
                          latitude: e.latitude,
                          longitude: e.longitude,
                        },
                        n = {
                          id: 'destination',
                          name: v.name,
                          address: v.name,
                          latitude: v.latitude,
                          longitude: v.longitude,
                        },
                        r = yield be.calculateRoute(t, n);
                      d(r);
                    }
                  } catch (o) {
                    console.error('\uc9c0\ub3c4 \ucd08\uae30\ud654 \uc2e4\ud328:', o),
                      O.default.alert(
                        '\uc624\ub958',
                        '\uc9c0\ub3c4\ub97c \ucd08\uae30\ud654\ud558\ub294 \uc911 \uc624\ub958\uac00 \ubc1c\uc0dd\ud588\uc2b5\ub2c8\ub2e4.'
                      );
                  } finally {
                    x(!1);
                  }
                });
                return function () {
                  return e.apply(this, arguments);
                };
              })();
              e();
            },
            [v]
          );
          var w = (function () {
            var e = (0, o.default)(function* () {
              if (v)
                try {
                  var e = {
                    id: 'fav_' + Date.now(),
                    name: v.name,
                    address: v.name,
                    latitude: v.latitude,
                    longitude: v.longitude,
                  };
                  yield be.addFavoriteLocation(e),
                    O.default.alert(
                      '\uc644\ub8cc',
                      '\uc990\uaca8\ucc3e\uae30\uc5d0 \ucd94\uac00\ub418\uc5c8\uc2b5\ub2c8\ub2e4.'
                    );
                } catch (t) {
                  O.default.alert(
                    '\uc624\ub958',
                    '\uc990\uaca8\ucc3e\uae30 \ucd94\uac00\uc5d0 \uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4.'
                  );
                }
            });
            return function () {
              return e.apply(this, arguments);
            };
          })();
          return (0, C.jsxs)(ge.default, {
            style: Ae.container,
            children: [
              (0, C.jsxs)(u.default, {
                style: Ae.header,
                children: [
                  (0, C.jsx)(L.default, {
                    onPress: function () {
                      return e.goBack();
                    },
                    children: (0, C.jsx)(me.default, {
                      name: 'arrow-back',
                      size: 24,
                      color: '#1F2937',
                    }),
                  }),
                  (0, C.jsx)(f.default, { style: Ae.title, children: '\uc9c0\ub3c4' }),
                  (0, C.jsx)(L.default, {
                    onPress: w,
                    children: (0, C.jsx)(me.default, {
                      name: 'heart-outline',
                      size: 24,
                      color: '#EF4444',
                    }),
                  }),
                ],
              }),
              (0, C.jsx)(u.default, {
                style: Ae.mapContainer,
                children: (0, C.jsxs)(u.default, {
                  style: Ae.mapPlaceholder,
                  children: [
                    (0, C.jsx)(me.default, { name: 'map', size: 80, color: '#9CA3AF' }),
                    (0, C.jsx)(f.default, {
                      style: Ae.mapPlaceholderText,
                      children: '\uc9c0\ub3c4 \uc601\uc5ed',
                    }),
                    v &&
                      (0, C.jsxs)(u.default, {
                        style: Ae.destinationInfo,
                        children: [
                          (0, C.jsx)(me.default, { name: 'location', size: 20, color: '#EF4444' }),
                          (0, C.jsx)(f.default, { style: Ae.destinationName, children: v.name }),
                        ],
                      }),
                  ],
                }),
              }),
              m &&
                (0, C.jsx)(u.default, {
                  style: Ae.routeInfoContainer,
                  children: (0, C.jsx)(f.default, {
                    style: Ae.calculatingText,
                    children: '\uacbd\ub85c \uacc4\uc0b0 \uc911...',
                  }),
                }),
              c &&
                !m &&
                (0, C.jsxs)(u.default, {
                  style: Ae.routeInfoContainer,
                  children: [
                    (0, C.jsxs)(u.default, {
                      style: Ae.routeHeader,
                      children: [
                        (0, C.jsxs)(u.default, {
                          style: Ae.routeDetails,
                          children: [
                            (0, C.jsxs)(f.default, {
                              style: Ae.routeDistance,
                              children: [(c.distance / 1e3).toFixed(1), 'km'],
                            }),
                            (0, C.jsxs)(f.default, {
                              style: Ae.routeDuration,
                              children: ['\uc57d ', Math.round(c.duration / 60), '\ubd84'],
                            }),
                          ],
                        }),
                        (0, C.jsx)(u.default, {
                          style: [
                            Ae.trafficStatus,
                            {
                              backgroundColor: (function (e) {
                                switch (e) {
                                  case 'smooth':
                                    return '#10B981';
                                  case 'normal':
                                    return '#F59E0B';
                                  case 'congested':
                                    return '#EF4444';
                                  case 'blocked':
                                    return '#7C3AED';
                                  default:
                                    return '#6B7280';
                                }
                              })(c.trafficStatus),
                            },
                          ],
                          children: (0, C.jsx)(f.default, {
                            style: Ae.trafficStatusText,
                            children: (function (e) {
                              switch (e) {
                                case 'smooth':
                                  return '\uc6d0\ud65c';
                                case 'normal':
                                  return '\ubcf4\ud1b5';
                                case 'congested':
                                  return '\uc815\uccb4';
                                case 'blocked':
                                  return '\ucc28\ub2e8';
                                default:
                                  return '\uc54c \uc218 \uc5c6\uc74c';
                              }
                            })(c.trafficStatus),
                          }),
                        }),
                      ],
                    }),
                    (0, C.jsxs)(u.default, {
                      style: Ae.routePath,
                      children: [
                        (0, C.jsxs)(u.default, {
                          style: Ae.pathItem,
                          children: [
                            (0, C.jsx)(me.default, {
                              name: 'radio-button-on',
                              size: 16,
                              color: '#10B981',
                            }),
                            (0, C.jsx)(f.default, {
                              style: Ae.pathText,
                              children: '\ucd9c\ubc1c\uc9c0: \ud604\uc7ac \uc704\uce58',
                            }),
                          ],
                        }),
                        (0, C.jsx)(u.default, { style: Ae.pathLine }),
                        (0, C.jsxs)(u.default, {
                          style: Ae.pathItem,
                          children: [
                            (0, C.jsx)(me.default, {
                              name: 'location',
                              size: 16,
                              color: '#EF4444',
                            }),
                            (0, C.jsxs)(f.default, {
                              style: Ae.pathText,
                              children: ['\ub3c4\ucc29\uc9c0: ', null == v ? void 0 : v.name],
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              F &&
                (0, C.jsxs)(u.default, {
                  style: Ae.navigationStatus,
                  children: [
                    (0, C.jsxs)(u.default, {
                      style: Ae.navigationHeader,
                      children: [
                        (0, C.jsx)(me.default, { name: 'navigate', size: 20, color: '#FFFFFF' }),
                        (0, C.jsx)(f.default, {
                          style: Ae.navigationText,
                          children: '\ub124\ube44\uac8c\uc774\uc158 \uc9c4\ud589 \uc911',
                        }),
                      ],
                    }),
                    (0, C.jsxs)(f.default, {
                      style: Ae.navigationSubText,
                      children: [
                        '\ubaa9\uc801\uc9c0\uae4c\uc9c0 ',
                        c && Math.round(c.duration / 60),
                        '\ubd84 \ub0a8\uc74c',
                      ],
                    }),
                  ],
                }),
              (0, C.jsxs)(u.default, {
                style: Ae.actionButtonsContainer,
                children: [
                  F
                    ? (0, C.jsxs)(L.default, {
                        style: Ae.stopNavigationButton,
                        onPress: function () {
                          O.default.alert(
                            '\ub124\ube44\uac8c\uc774\uc158 \uc911\uc9c0',
                            '\ub124\ube44\uac8c\uc774\uc158\uc744 \uc911\uc9c0\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?',
                            [
                              { text: '\uacc4\uc18d', style: 'cancel' },
                              {
                                text: '\uc911\uc9c0',
                                style: 'destructive',
                                onPress: function () {
                                  return b(!1);
                                },
                              },
                            ]
                          );
                        },
                        children: [
                          (0, C.jsx)(me.default, { name: 'stop', size: 20, color: '#FFFFFF' }),
                          (0, C.jsx)(f.default, {
                            style: Ae.stopNavigationText,
                            children: '\ub124\ube44\uac8c\uc774\uc158 \uc911\uc9c0',
                          }),
                        ],
                      })
                    : (0, C.jsxs)(L.default, {
                        style: Ae.startNavigationButton,
                        onPress: function () {
                          c
                            ? O.default.alert(
                                '\ub124\ube44\uac8c\uc774\uc158 \uc2dc\uc791',
                                (null == v ? void 0 : v.name) +
                                  '\uae4c\uc9c0 \uc548\ub0b4\ub97c \uc2dc\uc791\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?\n\n\uc608\uc0c1 \uac70\ub9ac: ' +
                                  (c.distance / 1e3).toFixed(1) +
                                  'km\n\uc608\uc0c1 \uc2dc\uac04: ' +
                                  Math.round(c.duration / 60) +
                                  '\ubd84',
                                [
                                  { text: '\ucde8\uc18c', style: 'cancel' },
                                  {
                                    text: '\uc2dc\uc791',
                                    onPress: function () {
                                      b(!0),
                                        O.default.alert(
                                          '\ub124\ube44\uac8c\uc774\uc158',
                                          '\ub124\ube44\uac8c\uc774\uc158\uc774 \uc2dc\uc791\ub418\uc5c8\uc2b5\ub2c8\ub2e4.'
                                        );
                                    },
                                  },
                                ]
                              )
                            : O.default.alert(
                                '\uc624\ub958',
                                '\uacbd\ub85c \uc815\ubcf4\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.'
                              );
                        },
                        disabled: !c,
                        children: [
                          (0, C.jsx)(me.default, { name: 'play', size: 20, color: '#FFFFFF' }),
                          (0, C.jsx)(f.default, {
                            style: Ae.startNavigationText,
                            children: '\ub124\ube44\uac8c\uc774\uc158 \uc2dc\uc791',
                          }),
                        ],
                      }),
                  (0, C.jsxs)(u.default, {
                    style: Ae.actionButtonsRow,
                    children: [
                      (0, C.jsxs)(L.default, {
                        style: Ae.actionButton,
                        children: [
                          (0, C.jsx)(me.default, { name: 'refresh', size: 20, color: '#6366F1' }),
                          (0, C.jsx)(f.default, {
                            style: Ae.actionButtonText,
                            children: '\uacbd\ub85c \uc7ac\uac80\uc0c9',
                          }),
                        ],
                      }),
                      (0, C.jsxs)(L.default, {
                        style: Ae.actionButton,
                        children: [
                          (0, C.jsx)(me.default, {
                            name: 'share-outline',
                            size: 20,
                            color: '#6366F1',
                          }),
                          (0, C.jsx)(f.default, {
                            style: Ae.actionButtonText,
                            children: '\uacf5\uc720',
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
        var Ae = g.default.create({
          container: { flex: 1, backgroundColor: '#FFFFFF' },
          header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: '#E5E7EB',
          },
          title: { fontSize: 18, fontWeight: '600', color: '#1F2937' },
          mapContainer: { flex: 1, backgroundColor: '#F3F4F6' },
          mapPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
          mapPlaceholderText: { fontSize: 16, color: '#9CA3AF', marginTop: 16 },
          destinationInfo: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 20,
            backgroundColor: '#FFFFFF',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
          },
          destinationName: { fontSize: 14, color: '#1F2937', marginLeft: 8, fontWeight: '500' },
          routeInfoContainer: {
            backgroundColor: '#FFFFFF',
            padding: 20,
            borderTopWidth: 1,
            borderTopColor: '#E5E7EB',
          },
          calculatingText: { fontSize: 16, color: '#6B7280', textAlign: 'center' },
          routeHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          },
          routeDetails: { flexDirection: 'row', alignItems: 'baseline' },
          routeDistance: { fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginRight: 12 },
          routeDuration: { fontSize: 16, color: '#6B7280' },
          trafficStatus: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
          trafficStatusText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
          routePath: { paddingLeft: 8 },
          pathItem: { flexDirection: 'row', alignItems: 'center' },
          pathText: { fontSize: 14, color: '#1F2937', marginLeft: 8 },
          pathLine: {
            width: 2,
            height: 16,
            backgroundColor: '#D1D5DB',
            marginLeft: 7,
            marginVertical: 4,
          },
          navigationStatus: {
            backgroundColor: '#6366F1',
            padding: 16,
            margin: 20,
            borderRadius: 12,
          },
          navigationHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
          navigationText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginLeft: 8 },
          navigationSubText: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 14 },
          actionButtonsContainer: {
            padding: 20,
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#E5E7EB',
          },
          startNavigationButton: {
            backgroundColor: '#10B981',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 16,
            borderRadius: 12,
            marginBottom: 12,
          },
          startNavigationText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginLeft: 8 },
          stopNavigationButton: {
            backgroundColor: '#EF4444',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 16,
            borderRadius: 12,
            marginBottom: 12,
          },
          stopNavigationText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginLeft: 8 },
          actionButtonsRow: { flexDirection: 'row', justifyContent: 'space-between' },
          actionButton: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 12,
            borderWidth: 1,
            borderColor: '#D1D5DB',
            borderRadius: 8,
            marginHorizontal: 4,
          },
          actionButtonText: { color: '#6366F1', fontSize: 14, fontWeight: '500', marginLeft: 6 },
        });
        function Ve() {
          var e = (0, W.useNavigation)(),
            t = (0, W.useRoute)(),
            n = (0, i.useState)(null),
            r = (0, j.default)(n, 2),
            a = r[0],
            l = r[1],
            s = (0, i.useState)(!0),
            c = (0, j.default)(s, 2),
            d = c[0],
            h = c[1],
            g = (0, i.useState)(!1),
            m = (0, j.default)(g, 2),
            x = m[0],
            y = m[1],
            p = t.params.vehicleId;
          (0, i.useEffect)(
            function () {
              F();
            },
            [p]
          );
          var F = (function () {
              var e = (0, o.default)(function* () {
                try {
                  h(!0);
                  var e = yield be.getVehicleDiagnostics(p);
                  l(e);
                } catch (t) {
                  console.error('\uc9c4\ub2e8 \ub370\uc774\ud130 \ub85c\ub4dc \uc2e4\ud328:', t),
                    O.default.alert(
                      '\uc624\ub958',
                      '\uc9c4\ub2e8 \ub370\uc774\ud130\ub97c \ubd88\ub7ec\uc624\ub294\ub370 \uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4.'
                    );
                } finally {
                  h(!1);
                }
              });
              return function () {
                return e.apply(this, arguments);
              };
            })(),
            b = (function () {
              var e = (0, o.default)(function* () {
                O.default.alert(
                  '\uc9c4\ub2e8 \uc2dc\uc791',
                  '\ucc28\ub7c9 \uc2a4\ub9c8\ud2b8 \uc9c4\ub2e8\uc744 \uc2dc\uc791\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?\n\uc9c4\ub2e8\uc5d0\ub294 \uc57d 2-3\ubd84\uc774 \uc18c\uc694\ub429\ub2c8\ub2e4.',
                  [
                    { text: '\ucde8\uc18c', style: 'cancel' },
                    {
                      text: '\uc2dc\uc791',
                      onPress: (function () {
                        var e = (0, o.default)(function* () {
                          y(!0);
                          try {
                            yield new Promise(function (e) {
                              return setTimeout(e, 3e3);
                            }),
                              yield F(),
                              O.default.alert(
                                '\uc644\ub8cc',
                                '\uc9c4\ub2e8\uc774 \uc644\ub8cc\ub418\uc5c8\uc2b5\ub2c8\ub2e4.'
                              );
                          } catch (e) {
                            O.default.alert(
                              '\uc624\ub958',
                              '\uc9c4\ub2e8 \uc911 \uc624\ub958\uac00 \ubc1c\uc0dd\ud588\uc2b5\ub2c8\ub2e4.'
                            );
                          } finally {
                            y(!1);
                          }
                        });
                        return function () {
                          return e.apply(this, arguments);
                        };
                      })(),
                    },
                  ]
                );
              });
              return function () {
                return e.apply(this, arguments);
              };
            })(),
            v = function (e) {
              switch (e) {
                case 'low':
                  return '#10B981';
                case 'medium':
                  return '#F59E0B';
                case 'high':
                  return '#EF4444';
                case 'urgent':
                  return '#7C3AED';
                default:
                  return '#6B7280';
              }
            },
            w = function (e) {
              switch (e) {
                case 'low':
                  return '\ub0ae\uc74c';
                case 'medium':
                  return '\ubcf4\ud1b5';
                case 'high':
                  return '\ub192\uc74c';
                case 'urgent':
                  return '\uae34\uae09';
                default:
                  return '\uc54c \uc218 \uc5c6\uc74c';
              }
            };
          return d
            ? (0, C.jsx)(ge.default, {
                style: He.container,
                children: (0, C.jsxs)(u.default, {
                  style: He.loadingContainer,
                  children: [
                    (0, C.jsx)(me.default, { name: 'analytics', size: 48, color: '#6366F1' }),
                    (0, C.jsx)(f.default, {
                      style: He.loadingText,
                      children:
                        '\uc9c4\ub2e8 \ub370\uc774\ud130\ub97c \ubd88\ub7ec\uc624\ub294 \uc911...',
                    }),
                  ],
                }),
              })
            : a
              ? (0, C.jsx)(ge.default, {
                  style: He.container,
                  children: (0, C.jsxs)(N.default, {
                    showsVerticalScrollIndicator: !1,
                    children: [
                      (0, C.jsxs)(u.default, {
                        style: He.header,
                        children: [
                          (0, C.jsx)(L.default, {
                            onPress: function () {
                              return e.goBack();
                            },
                            children: (0, C.jsx)(me.default, {
                              name: 'arrow-back',
                              size: 24,
                              color: '#1F2937',
                            }),
                          }),
                          (0, C.jsx)(f.default, {
                            style: He.title,
                            children: '\uc2a4\ub9c8\ud2b8 \uc9c4\ub2e8',
                          }),
                          (0, C.jsx)(L.default, {
                            onPress: b,
                            disabled: x,
                            children: (0, C.jsx)(me.default, {
                              name: 'refresh',
                              size: 24,
                              color: x ? '#9CA3AF' : '#6366F1',
                            }),
                          }),
                        ],
                      }),
                      x &&
                        (0, C.jsxs)(u.default, {
                          style: He.diagnosisProgress,
                          children: [
                            (0, C.jsx)(me.default, { name: 'sync', size: 20, color: '#6366F1' }),
                            (0, C.jsx)(f.default, {
                              style: He.diagnosisProgressText,
                              children: '\uc9c4\ub2e8 \uc9c4\ud589 \uc911...',
                            }),
                          ],
                        }),
                      (0, C.jsx)(u.default, {
                        style: He.statusSummaryCard,
                        children: (0, C.jsxs)(u.default, {
                          style: He.statusHeader,
                          children: [
                            (0, C.jsx)(me.default, {
                              name: 'car-sport',
                              size: 28,
                              color: '#6366F1',
                            }),
                            (0, C.jsxs)(u.default, {
                              style: He.statusInfo,
                              children: [
                                (0, C.jsx)(f.default, {
                                  style: He.statusTitle,
                                  children: '\uc804\uccb4 \uc0c1\ud0dc',
                                }),
                                (0, C.jsxs)(f.default, {
                                  style: He.statusTimestamp,
                                  children: [
                                    '\ub9c8\uc9c0\ub9c9 \uc9c4\ub2e8: ',
                                    new Date(a.timestamp).toLocaleString('ko-KR'),
                                  ],
                                }),
                              ],
                            }),
                            (0, C.jsx)(u.default, {
                              style: [
                                He.statusBadge,
                                {
                                  backgroundColor: (function (e) {
                                    switch (e) {
                                      case 'good':
                                        return '#10B981';
                                      case 'warning':
                                        return '#F59E0B';
                                      case 'critical':
                                        return '#EF4444';
                                      default:
                                        return '#6B7280';
                                    }
                                  })(a.engineStatus),
                                },
                              ],
                              children: (0, C.jsx)(f.default, {
                                style: He.statusBadgeText,
                                children: (function (e) {
                                  switch (e) {
                                    case 'good':
                                      return '\uc591\ud638';
                                    case 'warning':
                                      return '\uc8fc\uc758';
                                    case 'critical':
                                      return '\uc704\ud5d8';
                                    default:
                                      return '\uc54c \uc218 \uc5c6\uc74c';
                                  }
                                })(a.engineStatus),
                              }),
                            }),
                          ],
                        }),
                      }),
                      (0, C.jsxs)(u.default, {
                        style: He.metricsContainer,
                        children: [
                          (0, C.jsx)(f.default, {
                            style: He.sectionTitle,
                            children: '\uc8fc\uc694 \uc9c0\ud45c',
                          }),
                          (0, C.jsxs)(u.default, {
                            style: He.metricsGrid,
                            children: [
                              (0, C.jsxs)(u.default, {
                                style: He.metricCard,
                                children: [
                                  (0, C.jsx)(me.default, {
                                    name: 'battery-half',
                                    size: 24,
                                    color: '#6366F1',
                                  }),
                                  (0, C.jsx)(f.default, {
                                    style: He.metricLabel,
                                    children: '\ubc30\ud130\ub9ac',
                                  }),
                                  (0, C.jsxs)(f.default, {
                                    style: He.metricValue,
                                    children: [a.batteryLevel, '%'],
                                  }),
                                  (0, C.jsx)(u.default, {
                                    style: [
                                      He.metricBar,
                                      {
                                        backgroundColor:
                                          a.batteryLevel > 50 ? '#10B981' : '#EF4444',
                                      },
                                    ],
                                  }),
                                ],
                              }),
                              (0, C.jsxs)(u.default, {
                                style: He.metricCard,
                                children: [
                                  (0, C.jsx)(me.default, {
                                    name: 'speedometer',
                                    size: 24,
                                    color: '#6366F1',
                                  }),
                                  (0, C.jsx)(f.default, {
                                    style: He.metricLabel,
                                    children: '\uc5f0\ub8cc',
                                  }),
                                  (0, C.jsxs)(f.default, {
                                    style: He.metricValue,
                                    children: [a.fuelLevel, '%'],
                                  }),
                                  (0, C.jsx)(u.default, {
                                    style: [
                                      He.metricBar,
                                      { backgroundColor: a.fuelLevel > 25 ? '#10B981' : '#EF4444' },
                                    ],
                                  }),
                                ],
                              }),
                              (0, C.jsxs)(u.default, {
                                style: He.metricCard,
                                children: [
                                  (0, C.jsx)(me.default, {
                                    name: 'thermometer',
                                    size: 24,
                                    color: '#6366F1',
                                  }),
                                  (0, C.jsx)(f.default, {
                                    style: He.metricLabel,
                                    children: '\ub0c9\uac01\uc218 \uc628\ub3c4',
                                  }),
                                  (0, C.jsxs)(f.default, {
                                    style: He.metricValue,
                                    children: [a.coolantTemperature, '\xb0C'],
                                  }),
                                  (0, C.jsx)(u.default, {
                                    style: [
                                      He.metricBar,
                                      {
                                        backgroundColor:
                                          a.coolantTemperature < 100 ? '#10B981' : '#EF4444',
                                      },
                                    ],
                                  }),
                                ],
                              }),
                              (0, C.jsxs)(u.default, {
                                style: He.metricCard,
                                children: [
                                  (0, C.jsx)(me.default, {
                                    name: 'speedometer',
                                    size: 24,
                                    color: '#6366F1',
                                  }),
                                  (0, C.jsx)(f.default, {
                                    style: He.metricLabel,
                                    children: '\uc624\uc77c \uc555\ub825',
                                  }),
                                  (0, C.jsxs)(f.default, {
                                    style: He.metricValue,
                                    children: [a.oilPressure, ' PSI'],
                                  }),
                                  (0, C.jsx)(u.default, {
                                    style: [
                                      He.metricBar,
                                      {
                                        backgroundColor: a.oilPressure > 30 ? '#10B981' : '#EF4444',
                                      },
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                      (0, C.jsxs)(u.default, {
                        style: He.tireContainer,
                        children: [
                          (0, C.jsx)(f.default, {
                            style: He.sectionTitle,
                            children: '\ud0c0\uc774\uc5b4 \uc555\ub825',
                          }),
                          (0, C.jsxs)(u.default, {
                            style: He.tireGrid,
                            children: [
                              (0, C.jsxs)(u.default, {
                                style: He.tireItem,
                                children: [
                                  (0, C.jsx)(f.default, {
                                    style: He.tireLabel,
                                    children: '\uc55e \uc88c',
                                  }),
                                  (0, C.jsxs)(f.default, {
                                    style: He.tireValue,
                                    children: [a.tirePressure.frontLeft, ' PSI'],
                                  }),
                                ],
                              }),
                              (0, C.jsxs)(u.default, {
                                style: He.tireItem,
                                children: [
                                  (0, C.jsx)(f.default, {
                                    style: He.tireLabel,
                                    children: '\uc55e \uc6b0',
                                  }),
                                  (0, C.jsxs)(f.default, {
                                    style: He.tireValue,
                                    children: [a.tirePressure.frontRight, ' PSI'],
                                  }),
                                ],
                              }),
                              (0, C.jsxs)(u.default, {
                                style: He.tireItem,
                                children: [
                                  (0, C.jsx)(f.default, {
                                    style: He.tireLabel,
                                    children: '\ub4a4 \uc88c',
                                  }),
                                  (0, C.jsxs)(f.default, {
                                    style: He.tireValue,
                                    children: [a.tirePressure.rearLeft, ' PSI'],
                                  }),
                                ],
                              }),
                              (0, C.jsxs)(u.default, {
                                style: He.tireItem,
                                children: [
                                  (0, C.jsx)(f.default, {
                                    style: He.tireLabel,
                                    children: '\ub4a4 \uc6b0',
                                  }),
                                  (0, C.jsxs)(f.default, {
                                    style: He.tireValue,
                                    children: [a.tirePressure.rearRight, ' PSI'],
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                      a.diagnosticCodes.length > 0 &&
                        (0, C.jsxs)(u.default, {
                          style: He.diagnosticCodesContainer,
                          children: [
                            (0, C.jsx)(f.default, {
                              style: He.sectionTitle,
                              children: '\uc9c4\ub2e8 \ucf54\ub4dc',
                            }),
                            a.diagnosticCodes.map(function (e, t) {
                              return (0, C.jsxs)(
                                u.default,
                                {
                                  style: He.diagnosticCodeItem,
                                  children: [
                                    (0, C.jsx)(me.default, {
                                      name: 'warning',
                                      size: 16,
                                      color: '#F59E0B',
                                    }),
                                    (0, C.jsx)(f.default, {
                                      style: He.diagnosticCodeText,
                                      children: e,
                                    }),
                                  ],
                                },
                                t
                              );
                            }),
                          ],
                        }),
                      a.maintenanceRecommendations.length > 0 &&
                        (0, C.jsxs)(u.default, {
                          style: He.recommendationsContainer,
                          children: [
                            (0, C.jsx)(f.default, {
                              style: He.sectionTitle,
                              children: '\uc815\ube44 \uad8c\uc7a5\uc0ac\ud56d',
                            }),
                            a.maintenanceRecommendations.map(function (t) {
                              return (0, C.jsxs)(
                                u.default,
                                {
                                  style: He.recommendationCard,
                                  children: [
                                    (0, C.jsxs)(u.default, {
                                      style: He.recommendationHeader,
                                      children: [
                                        (0, C.jsx)(me.default, {
                                          name: 'construct',
                                          size: 20,
                                          color: '#6366F1',
                                        }),
                                        (0, C.jsxs)(u.default, {
                                          style: He.recommendationInfo,
                                          children: [
                                            (0, C.jsx)(f.default, {
                                              style: He.recommendationType,
                                              children: t.type.replace(/_/g, ' ').toUpperCase(),
                                            }),
                                            (0, C.jsx)(u.default, {
                                              style: [
                                                He.severityBadge,
                                                { backgroundColor: v(t.severity) },
                                              ],
                                              children: (0, C.jsx)(f.default, {
                                                style: He.severityText,
                                                children: w(t.severity),
                                              }),
                                            }),
                                          ],
                                        }),
                                      ],
                                    }),
                                    (0, C.jsx)(f.default, {
                                      style: He.recommendationDescription,
                                      children: t.description,
                                    }),
                                    (0, C.jsxs)(u.default, {
                                      style: He.recommendationFooter,
                                      children: [
                                        (0, C.jsxs)(f.default, {
                                          style: He.recommendationCost,
                                          children: [
                                            '\uc608\uc0c1 \ube44\uc6a9: \u20a9',
                                            t.estimatedCost.toLocaleString(),
                                          ],
                                        }),
                                        (0, C.jsx)(L.default, {
                                          style: He.bookingButton,
                                          onPress: function () {
                                            return (function (t) {
                                              e.navigate('MaintenanceBooking', {
                                                serviceType: t.type,
                                              });
                                            })(t);
                                          },
                                          children: (0, C.jsx)(f.default, {
                                            style: He.bookingButtonText,
                                            children: '\uc608\uc57d\ud558\uae30',
                                          }),
                                        }),
                                      ],
                                    }),
                                  ],
                                },
                                t.id
                              );
                            }),
                          ],
                        }),
                      (0, C.jsx)(u.default, {
                        style: He.actionButtonsContainer,
                        children: (0, C.jsxs)(L.default, {
                          style: He.newDiagnosisButton,
                          onPress: b,
                          disabled: x,
                          children: [
                            (0, C.jsx)(me.default, {
                              name: 'analytics',
                              size: 20,
                              color: '#FFFFFF',
                            }),
                            (0, C.jsx)(f.default, {
                              style: He.newDiagnosisButtonText,
                              children: x
                                ? '\uc9c4\ub2e8 \uc911...'
                                : '\uc0c8 \uc9c4\ub2e8 \uc2e4\ud589',
                            }),
                          ],
                        }),
                      }),
                    ],
                  }),
                })
              : (0, C.jsx)(ge.default, {
                  style: He.container,
                  children: (0, C.jsxs)(u.default, {
                    style: He.errorContainer,
                    children: [
                      (0, C.jsx)(me.default, {
                        name: 'warning-outline',
                        size: 48,
                        color: '#EF4444',
                      }),
                      (0, C.jsx)(f.default, {
                        style: He.errorText,
                        children:
                          '\uc9c4\ub2e8 \ub370\uc774\ud130\ub97c \ubd88\ub7ec\uc62c \uc218 \uc5c6\uc2b5\ub2c8\ub2e4.',
                      }),
                      (0, C.jsx)(L.default, {
                        style: He.retryButton,
                        onPress: F,
                        children: (0, C.jsx)(f.default, {
                          style: He.retryButtonText,
                          children: '\ub2e4\uc2dc \uc2dc\ub3c4',
                        }),
                      }),
                    ],
                  }),
                });
        }
        var He = g.default.create({
            container: { flex: 1, backgroundColor: '#F9FAFB' },
            header: {
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 20,
              paddingVertical: 16,
              backgroundColor: '#FFFFFF',
              borderBottomWidth: 1,
              borderBottomColor: '#E5E7EB',
            },
            title: { fontSize: 18, fontWeight: '600', color: '#1F2937' },
            loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
            loadingText: { fontSize: 16, color: '#6B7280', marginTop: 16 },
            errorContainer: {
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 40,
            },
            errorText: { fontSize: 16, color: '#EF4444', marginTop: 16, textAlign: 'center' },
            retryButton: {
              backgroundColor: '#6366F1',
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 8,
              marginTop: 16,
            },
            retryButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
            diagnosisProgress: {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#EEF2FF',
              paddingVertical: 12,
              marginHorizontal: 20,
              marginVertical: 16,
              borderRadius: 8,
            },
            diagnosisProgressText: {
              color: '#6366F1',
              fontSize: 14,
              fontWeight: '500',
              marginLeft: 8,
            },
            statusSummaryCard: {
              backgroundColor: '#FFFFFF',
              margin: 20,
              padding: 20,
              borderRadius: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            },
            statusHeader: { flexDirection: 'row', alignItems: 'center' },
            statusInfo: { flex: 1, marginLeft: 12 },
            statusTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937' },
            statusTimestamp: { fontSize: 12, color: '#6B7280', marginTop: 2 },
            statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
            statusBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
            metricsContainer: { paddingHorizontal: 20, marginBottom: 24 },
            sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 16 },
            metricsGrid: {
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
            },
            metricCard: {
              backgroundColor: '#FFFFFF',
              width: '48%',
              padding: 16,
              borderRadius: 12,
              marginBottom: 12,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            },
            metricLabel: { fontSize: 12, color: '#6B7280', marginTop: 8, textAlign: 'center' },
            metricValue: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginTop: 4 },
            metricBar: { width: '100%', height: 4, borderRadius: 2, marginTop: 8 },
            tireContainer: { paddingHorizontal: 20, marginBottom: 24 },
            tireGrid: {
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              padding: 16,
              flexDirection: 'row',
              flexWrap: 'wrap',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            },
            tireItem: { width: '50%', alignItems: 'center', paddingVertical: 12 },
            tireLabel: { fontSize: 12, color: '#6B7280' },
            tireValue: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginTop: 4 },
            diagnosticCodesContainer: { paddingHorizontal: 20, marginBottom: 24 },
            diagnosticCodeItem: {
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              padding: 12,
              borderRadius: 8,
              marginBottom: 8,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            },
            diagnosticCodeText: { fontSize: 14, color: '#1F2937', marginLeft: 8 },
            recommendationsContainer: { paddingHorizontal: 20, marginBottom: 24 },
            recommendationCard: {
              backgroundColor: '#FFFFFF',
              padding: 16,
              borderRadius: 12,
              marginBottom: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            },
            recommendationHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
            recommendationInfo: { flex: 1, marginLeft: 8 },
            recommendationType: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
            severityBadge: {
              alignSelf: 'flex-start',
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 8,
              marginTop: 4,
            },
            severityText: { color: '#FFFFFF', fontSize: 10, fontWeight: '600' },
            recommendationDescription: {
              fontSize: 14,
              color: '#6B7280',
              marginBottom: 12,
              lineHeight: 20,
            },
            recommendationFooter: {
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            },
            recommendationCost: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
            bookingButton: {
              backgroundColor: '#6366F1',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
            },
            bookingButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
            actionButtonsContainer: { paddingHorizontal: 20, marginBottom: 24 },
            newDiagnosisButton: {
              backgroundColor: '#6366F1',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 16,
              borderRadius: 12,
            },
            newDiagnosisButtonText: {
              color: '#FFFFFF',
              fontSize: 16,
              fontWeight: '600',
              marginLeft: 8,
            },
          }),
          Ne = n(4619),
          Oe = g.default.create({
            container: { flex: 1, backgroundColor: '#f8f9fa' },
            header: {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              paddingVertical: 15,
              backgroundColor: '#fff',
              borderBottomWidth: 1,
              borderBottomColor: '#e9ecef',
            },
            backButton: { padding: 8 },
            headerTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
            placeholder: { width: 40 },
            content: { flex: 1, padding: 20 },
            section: { marginBottom: 30 },
            sectionTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 15 },
            serviceCard: {
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderWidth: 2,
              borderColor: 'transparent',
            },
            selectedCard: { borderColor: '#4CAF50' },
            serviceHeader: { flexDirection: 'row', alignItems: 'center', flex: 1 },
            serviceIcon: {
              width: 48,
              height: 48,
              borderRadius: 24,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 12,
            },
            serviceInfo: { flex: 1 },
            serviceName: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4 },
            serviceDescription: { fontSize: 14, color: '#666', marginBottom: 8 },
            serviceDetails: { flexDirection: 'row', gap: 12 },
            serviceDuration: { fontSize: 12, color: '#888' },
            servicePrice: { fontSize: 12, color: '#888' },
            workshopCard: {
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderWidth: 2,
              borderColor: 'transparent',
            },
            disabledCard: { opacity: 0.5 },
            workshopInfo: { flex: 1 },
            workshopName: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 },
            disabledText: { color: '#999' },
            workshopDetails: { flexDirection: 'row', gap: 16, marginBottom: 8 },
            workshopDistance: { fontSize: 14, color: '#666' },
            workshopRating: { fontSize: 14, color: '#666' },
            workshopStatus: { fontSize: 12, color: '#4CAF50', fontWeight: '500' },
            unavailableStatus: { color: '#F44336' },
            dateContainer: { flexDirection: 'row', gap: 12 },
            dateCard: {
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
              minWidth: 80,
              borderWidth: 2,
              borderColor: 'transparent',
            },
            selectedDateCard: { borderColor: '#4CAF50', backgroundColor: '#4CAF50' },
            dateText: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4 },
            dayText: { fontSize: 12, color: '#666' },
            selectedDateText: { color: '#fff' },
            timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
            timeCard: {
              backgroundColor: '#fff',
              borderRadius: 8,
              padding: 12,
              minWidth: 70,
              alignItems: 'center',
              borderWidth: 2,
              borderColor: 'transparent',
            },
            selectedTimeCard: { borderColor: '#4CAF50', backgroundColor: '#4CAF50' },
            timeText: { fontSize: 14, fontWeight: '500', color: '#333' },
            selectedTimeText: { color: '#fff' },
            footer: {
              padding: 20,
              backgroundColor: '#fff',
              borderTopWidth: 1,
              borderTopColor: '#e9ecef',
            },
            bookingButton: {
              backgroundColor: '#4CAF50',
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
            },
            bookingButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
            memoContainer: {
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 12,
              borderWidth: 1,
              borderColor: '#e9ecef',
            },
            memoInput: { fontSize: 14, color: '#333', minHeight: 100, padding: 8 },
            noTimesMessage: {
              fontSize: 14,
              color: '#F44336',
              textAlign: 'center',
              marginTop: 15,
              fontWeight: '500',
            },
          });
        const Me = function () {
          var e = (0, W.useNavigation)(),
            t = ((0, W.useRoute)().params || {}).serviceType,
            n = (0, i.useState)(t ? [t] : []),
            r = (0, j.default)(n, 2),
            o = r[0],
            a = r[1],
            l = (0, i.useState)(null),
            s = (0, j.default)(l, 2),
            c = s[0],
            d = s[1],
            h = (0, i.useState)(null),
            g = (0, j.default)(h, 2),
            m = g[0],
            x = g[1],
            y = (0, i.useState)(null),
            p = (0, j.default)(y, 2),
            F = p[0],
            b = p[1],
            v = (0, i.useState)(''),
            w = (0, j.default)(v, 2),
            B = w[0],
            S = w[1],
            T = [
              {
                id: 'oil-change',
                name: '\uc5d4\uc9c4\uc624\uc77c \uad50\ud658',
                description:
                  '\uc5d4\uc9c4\uc624\uc77c \ubc0f \uc624\uc77c\ud544\ud130 \uad50\ud658',
                estimatedDuration: '30\ubd84',
                price: '60,000\uc6d0',
                icon: 'car-outline',
                category: 'routine',
              },
              {
                id: 'tire-replacement',
                name: '\ud0c0\uc774\uc5b4 \uad50\uccb4',
                description:
                  '\ud0c0\uc774\uc5b4 \uad50\uccb4 \ubc0f \ubc38\ub7f0\uc2a4 \uc870\uc815',
                estimatedDuration: '45\ubd84',
                price: '150,000\uc6d0',
                icon: 'ellipse-outline',
                category: 'repair',
              },
              {
                id: 'brake-inspection',
                name: '\ube0c\ub808\uc774\ud06c \uc810\uac80',
                description:
                  '\ube0c\ub808\uc774\ud06c \ud328\ub4dc \ubc0f \ub514\uc2a4\ud06c \uc810\uac80',
                estimatedDuration: '20\ubd84',
                price: '40,000\uc6d0',
                icon: 'stop-circle-outline',
                category: 'routine',
              },
              {
                id: 'battery-replacement',
                name: '\ubc30\ud130\ub9ac \uad50\uccb4',
                description:
                  '\ubc30\ud130\ub9ac \uad50\uccb4 \ubc0f \ucda9\uc804 \uc2dc\uc2a4\ud15c \uc810\uac80',
                estimatedDuration: '25\ubd84',
                price: '120,000\uc6d0',
                icon: 'battery-charging-outline',
                category: 'repair',
              },
              {
                id: 'other-inspection',
                name: '\uae30\ud0c0 \uc810\uac80',
                description:
                  '\uae30\ud0c0 \ucc28\ub7c9 \uc0c1\ud0dc \uc810\uac80 \ubc0f \uc9c4\ub2e8',
                estimatedDuration: '30-60\ubd84',
                price: '30,000\uc6d0~',
                icon: 'construct-outline',
                category: 'routine',
              },
              {
                id: 'emergency-repair',
                name: '\uae34\uae09 \uc218\ub9ac',
                description: '\uae34\uae09 \uc0c1\ud669 \ub300\uc751 \uc218\ub9ac',
                estimatedDuration: '1-2\uc2dc\uac04',
                price: '\uacac\uc801 \ud6c4 \uacb0\uc815',
                icon: 'warning-outline',
                category: 'emergency',
              },
            ],
            k = (function () {
              var e = [],
                t = new Date();
              console.log('\ud604\uc7ac \ub0a0\uc9dc: ' + t.toLocaleDateString('ko-KR')),
                console.log(
                  '\ud604\uc7ac \uc2dc\uac04: ' +
                    t.getHours() +
                    '\uc2dc ' +
                    t.getMinutes() +
                    '\ubd84'
                );
              var n = t.getHours() >= 16;
              console.log('\uc624\ud6c4 4\uc2dc \uc774\ud6c4?: ' + n);
              var r = 0;
              n
                ? ((r = 2),
                  console.log('\uc608\uc57d \uac00\ub2a5 \uc2dc\uc791\uc77c: \ubaa8\ub808'))
                : console.log('\uc608\uc57d \uac00\ub2a5 \uc2dc\uc791\uc77c: \uc624\ub298');
              for (var o = 0; o < 14; o++) {
                var i = new Date(t);
                i.setDate(t.getDate() + r + o);
                var a = i.toISOString().split('T')[0];
                e.push(a);
              }
              return e;
            })(),
            z = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'],
            I = function (e) {
              if (!e) return [];
              var t = new Date();
              if (e !== t.toISOString().split('T')[0]) return z;
              var n = t.getHours();
              return z.filter(function (e) {
                return parseInt(e.split(':')[0], 10) > n + 1;
              });
            },
            D = function (e) {
              switch (e) {
                case 'routine':
                  return '#4CAF50';
                case 'repair':
                  return '#FF9800';
                case 'emergency':
                  return '#F44336';
                default:
                  return '#2196F3';
              }
            };
          return (0, C.jsxs)(E.SafeAreaView, {
            style: Oe.container,
            children: [
              (0, C.jsxs)(u.default, {
                style: Oe.header,
                children: [
                  (0, C.jsx)(L.default, {
                    style: Oe.backButton,
                    onPress: function () {
                      return e.goBack();
                    },
                    children: (0, C.jsx)(me.default, {
                      name: 'arrow-back',
                      size: 24,
                      color: '#333',
                    }),
                  }),
                  (0, C.jsx)(f.default, {
                    style: Oe.headerTitle,
                    children: '\uc815\ube44 \uc608\uc57d',
                  }),
                  (0, C.jsx)(u.default, { style: Oe.placeholder }),
                ],
              }),
              (0, C.jsxs)(N.default, {
                style: Oe.content,
                showsVerticalScrollIndicator: !1,
                children: [
                  (0, C.jsxs)(u.default, {
                    style: Oe.section,
                    children: [
                      (0, C.jsx)(f.default, {
                        style: Oe.sectionTitle,
                        children: '\uc11c\ube44\uc2a4 \uc120\ud0dd',
                      }),
                      T.map(function (e) {
                        return (0, C.jsxs)(
                          L.default,
                          {
                            style: [Oe.serviceCard, o.includes(e.id) && Oe.selectedCard],
                            onPress: function () {
                              o.includes(e.id)
                                ? a(
                                    o.filter(function (t) {
                                      return t !== e.id;
                                    })
                                  )
                                : a([].concat((0, Ne.default)(o), [e.id]));
                            },
                            children: [
                              (0, C.jsxs)(u.default, {
                                style: Oe.serviceHeader,
                                children: [
                                  (0, C.jsx)(u.default, {
                                    style: [Oe.serviceIcon, { backgroundColor: D(e.category) }],
                                    children: (0, C.jsx)(me.default, {
                                      name: e.icon,
                                      size: 24,
                                      color: '#fff',
                                    }),
                                  }),
                                  (0, C.jsxs)(u.default, {
                                    style: Oe.serviceInfo,
                                    children: [
                                      (0, C.jsx)(f.default, {
                                        style: Oe.serviceName,
                                        children: e.name,
                                      }),
                                      (0, C.jsx)(f.default, {
                                        style: Oe.serviceDescription,
                                        children: e.description,
                                      }),
                                      (0, C.jsxs)(u.default, {
                                        style: Oe.serviceDetails,
                                        children: [
                                          (0, C.jsxs)(f.default, {
                                            style: Oe.serviceDuration,
                                            children: ['\u23f1 ', e.estimatedDuration],
                                          }),
                                          (0, C.jsxs)(f.default, {
                                            style: Oe.servicePrice,
                                            children: ['\ud83d\udcb0 ', e.price],
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                              o.includes(e.id) &&
                                (0, C.jsx)(me.default, {
                                  name: 'checkmark-circle',
                                  size: 24,
                                  color: '#4CAF50',
                                }),
                            ],
                          },
                          e.id
                        );
                      }),
                    ],
                  }),
                  o.length > 0 &&
                    (0, C.jsxs)(u.default, {
                      style: Oe.section,
                      children: [
                        (0, C.jsx)(f.default, {
                          style: Oe.sectionTitle,
                          children: '\uc815\ube44\uc18c \uc120\ud0dd',
                        }),
                        [
                          {
                            id: '1',
                            name: '\uce74\uace0\ub85c \uc815\ube44\uc13c\ud130 \uac15\ub0a8\uc810',
                            distance: '1.2km',
                            rating: 4.8,
                            available: !0,
                            services: [
                              'oil-change',
                              'tire-replacement',
                              'brake-inspection',
                              'other-inspection',
                            ],
                          },
                          {
                            id: '2',
                            name: '\uc2a4\ub9c8\ud2b8\uce74 \uc11c\ube44\uc2a4\uc13c\ud130',
                            distance: '2.1km',
                            rating: 4.6,
                            available: !0,
                            services: [
                              'battery-replacement',
                              'emergency-repair',
                              'other-inspection',
                            ],
                          },
                          {
                            id: '3',
                            name: '\ud504\ub9ac\ubbf8\uc5c4 \uc624\ud1a0\ucf00\uc5b4',
                            distance: '3.5km',
                            rating: 4.9,
                            available: !1,
                            services: [
                              'oil-change',
                              'tire-replacement',
                              'brake-inspection',
                              'battery-replacement',
                              'other-inspection',
                            ],
                          },
                        ].map(function (e) {
                          return (0, C.jsxs)(
                            L.default,
                            {
                              style: [
                                Oe.workshopCard,
                                c === e.id && Oe.selectedCard,
                                !e.available && Oe.disabledCard,
                              ],
                              onPress: function () {
                                return e.available && d(e.id);
                              },
                              disabled: !e.available,
                              children: [
                                (0, C.jsxs)(u.default, {
                                  style: Oe.workshopInfo,
                                  children: [
                                    (0, C.jsx)(f.default, {
                                      style: [Oe.workshopName, !e.available && Oe.disabledText],
                                      children: e.name,
                                    }),
                                    (0, C.jsxs)(u.default, {
                                      style: Oe.workshopDetails,
                                      children: [
                                        (0, C.jsxs)(f.default, {
                                          style: Oe.workshopDistance,
                                          children: ['\ud83d\udccd ', e.distance],
                                        }),
                                        (0, C.jsxs)(f.default, {
                                          style: Oe.workshopRating,
                                          children: ['\u2b50 ', e.rating],
                                        }),
                                      ],
                                    }),
                                    (0, C.jsx)(f.default, {
                                      style: [
                                        Oe.workshopStatus,
                                        !e.available && Oe.unavailableStatus,
                                      ],
                                      children: e.available
                                        ? '\uc608\uc57d \uac00\ub2a5'
                                        : '\uc608\uc57d \ubd88\uac00',
                                    }),
                                  ],
                                }),
                                c === e.id &&
                                  (0, C.jsx)(me.default, {
                                    name: 'checkmark-circle',
                                    size: 24,
                                    color: '#4CAF50',
                                  }),
                              ],
                            },
                            e.id
                          );
                        }),
                      ],
                    }),
                  c &&
                    (0, C.jsxs)(u.default, {
                      style: Oe.section,
                      children: [
                        (0, C.jsx)(f.default, {
                          style: Oe.sectionTitle,
                          children: '\ub0a0\uc9dc \uc120\ud0dd',
                        }),
                        (0, C.jsx)(N.default, {
                          horizontal: !0,
                          showsHorizontalScrollIndicator: !1,
                          children: (0, C.jsx)(u.default, {
                            style: Oe.dateContainer,
                            children: k.map(function (e) {
                              return (0, C.jsxs)(
                                L.default,
                                {
                                  style: [Oe.dateCard, m === e && Oe.selectedDateCard],
                                  onPress: function () {
                                    x(e), b(null);
                                  },
                                  children: [
                                    (0, C.jsx)(f.default, {
                                      style: [Oe.dateText, m === e && Oe.selectedDateText],
                                      children: new Date(e).toLocaleDateString('ko-KR', {
                                        month: 'short',
                                        day: 'numeric',
                                      }),
                                    }),
                                    (0, C.jsx)(f.default, {
                                      style: [Oe.dayText, m === e && Oe.selectedDateText],
                                      children: new Date(e).toLocaleDateString('ko-KR', {
                                        weekday: 'short',
                                      }),
                                    }),
                                  ],
                                },
                                e
                              );
                            }),
                          }),
                        }),
                      ],
                    }),
                  m &&
                    (0, C.jsxs)(u.default, {
                      style: Oe.section,
                      children: [
                        (0, C.jsx)(f.default, {
                          style: Oe.sectionTitle,
                          children: '\uc2dc\uac04 \uc120\ud0dd',
                        }),
                        (0, C.jsx)(u.default, {
                          style: Oe.timeGrid,
                          children: I(m).map(function (e) {
                            return (0, C.jsx)(
                              L.default,
                              {
                                style: [Oe.timeCard, F === e && Oe.selectedTimeCard],
                                onPress: function () {
                                  return b(e);
                                },
                                children: (0, C.jsx)(f.default, {
                                  style: [Oe.timeText, F === e && Oe.selectedTimeText],
                                  children: e,
                                }),
                              },
                              e
                            );
                          }),
                        }),
                        0 === I(m).length &&
                          (0, C.jsx)(f.default, {
                            style: Oe.noTimesMessage,
                            children:
                              '\uc120\ud0dd\ud558\uc2e0 \ub0a0\uc9dc\uc5d0 \uc774\uc6a9 \uac00\ub2a5\ud55c \uc2dc\uac04\uc774 \uc5c6\uc2b5\ub2c8\ub2e4. \ub2e4\ub978 \ub0a0\uc9dc\ub97c \uc120\ud0dd\ud574\uc8fc\uc138\uc694.',
                          }),
                      ],
                    }),
                  F &&
                    (0, C.jsxs)(u.default, {
                      style: Oe.section,
                      children: [
                        (0, C.jsx)(f.default, {
                          style: Oe.sectionTitle,
                          children: '\uc815\ube44\uc0ac\uc5d0\uac8c \ub0a8\uae38 \uba54\ubaa8',
                        }),
                        (0, C.jsx)(u.default, {
                          style: Oe.memoContainer,
                          children: (0, C.jsx)(V.default, {
                            style: Oe.memoInput,
                            placeholder:
                              '\ucc28\ub7c9 \uc0c1\ud0dc\ub098 \uc694\uccad\uc0ac\ud56d\uc744 \ub0a8\uaca8\uc8fc\uc138\uc694 (\uc120\ud0dd\uc0ac\ud56d)',
                            multiline: !0,
                            numberOfLines: 4,
                            textAlignVertical: 'top',
                            value: B,
                            onChangeText: S,
                          }),
                        }),
                      ],
                    }),
                ],
              }),
              o.length > 0 &&
                c &&
                m &&
                F &&
                (0, C.jsx)(u.default, {
                  style: Oe.footer,
                  children: (0, C.jsx)(L.default, {
                    style: Oe.bookingButton,
                    onPress: function () {
                      if (0 !== o.length && c && m && F) {
                        var t = T.filter(function (e) {
                            return o.includes(e.id);
                          })
                            .map(function (e) {
                              return e.name;
                            })
                            .join(', '),
                          n = B ? '\n\n\uba54\ubaa8: ' + B : '';
                        O.default.alert(
                          '\uc608\uc57d \ud655\uc778',
                          '\uc120\ud0dd\ud55c \uc11c\ube44\uc2a4: ' +
                            t +
                            '\n\ub0a0\uc9dc: ' +
                            m +
                            '\n\uc2dc\uac04: ' +
                            F +
                            n +
                            '\n\n\uc815\ube44 \uc608\uc57d\uc744 \uc644\ub8cc\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?',
                          [
                            { text: '\ucde8\uc18c', style: 'cancel' },
                            {
                              text: '\ud655\uc778',
                              onPress: function () {
                                O.default.alert(
                                  '\uc608\uc57d \uc644\ub8cc',
                                  '\uc815\ube44 \uc608\uc57d\uc774 \uc644\ub8cc\ub418\uc5c8\uc2b5\ub2c8\ub2e4.'
                                ),
                                  e.goBack();
                              },
                            },
                          ]
                        );
                      } else
                        O.default.alert(
                          '\uc608\uc57d \uc815\ubcf4 \ud655\uc778',
                          '\ubaa8\ub4e0 \uc815\ubcf4\ub97c \uc120\ud0dd\ud574\uc8fc\uc138\uc694.'
                        );
                    },
                    children: (0, C.jsx)(f.default, {
                      style: Oe.bookingButtonText,
                      children: '\uc608\uc57d\ud558\uae30',
                    }),
                  }),
                }),
            ],
          });
        };
        var _e = g.default.create({
          container: { flex: 1, backgroundColor: '#f8f9fa' },
          header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingVertical: 15,
            backgroundColor: '#fff',
            borderBottomWidth: 1,
            borderBottomColor: '#e9ecef',
          },
          backButton: { padding: 8 },
          headerTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
          mapButton: { padding: 8 },
          searchContainer: {
            backgroundColor: '#fff',
            paddingHorizontal: 20,
            paddingVertical: 15,
            borderBottomWidth: 1,
            borderBottomColor: '#e9ecef',
          },
          searchInputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#f8f9fa',
            borderRadius: 12,
            paddingHorizontal: 15,
            paddingVertical: 12,
          },
          searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#333' },
          filtersContainer: {
            backgroundColor: '#fff',
            paddingVertical: 15,
            borderBottomWidth: 1,
            borderBottomColor: '#e9ecef',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          },
          filterButtons: { flexDirection: 'row', gap: 10, paddingLeft: 20 },
          filterButton: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#f8f9fa',
            borderRadius: 20,
            paddingHorizontal: 12,
            paddingVertical: 8,
            gap: 6,
          },
          activeFilterButton: { backgroundColor: '#4CAF50' },
          filterButtonText: { fontSize: 14, color: '#666' },
          activeFilterButtonText: { color: '#fff' },
          sortContainer: { paddingRight: 20 },
          sortButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
          sortButtonText: { fontSize: 14, color: '#666' },
          resultsList: { flex: 1, padding: 20 },
          resultsHeader: { marginBottom: 15 },
          resultsCount: { fontSize: 16, fontWeight: '600', color: '#333' },
          workshopCard: {
            backgroundColor: '#fff',
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3.84,
            elevation: 5,
          },
          workshopHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 12,
          },
          workshopInfo: { flex: 1 },
          workshopName: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 4 },
          workshopAddress: { fontSize: 14, color: '#666', marginBottom: 8 },
          workshopMeta: { flexDirection: 'row', gap: 12 },
          distance: { fontSize: 14, color: '#666' },
          rating: { fontSize: 14, color: '#666' },
          workshopStatus: { alignItems: 'center', gap: 4 },
          statusIndicator: { width: 8, height: 8, borderRadius: 4 },
          statusText: { fontSize: 12, fontWeight: '500' },
          workshopDetails: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 12,
          },
          openHours: { fontSize: 14, color: '#666' },
          phone: { fontSize: 14, color: '#666' },
          servicesContainer: { marginBottom: 12 },
          servicesTitle: { fontSize: 14, fontWeight: '500', color: '#333', marginBottom: 8 },
          servicesList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
          serviceTag: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#f8f9fa',
            borderRadius: 16,
            paddingHorizontal: 10,
            paddingVertical: 4,
            gap: 4,
          },
          serviceTagText: { fontSize: 12, color: '#666' },
          specialtiesContainer: { marginBottom: 8 },
          specialtiesTitle: { fontSize: 14, fontWeight: '500', color: '#333', marginBottom: 8 },
          specialtiesList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
          specialtyTag: {
            backgroundColor: '#e3f2fd',
            color: '#1976d2',
            borderRadius: 12,
            paddingHorizontal: 8,
            paddingVertical: 4,
            fontSize: 12,
          },
          emptyState: { alignItems: 'center', paddingVertical: 60 },
          emptyStateText: {
            fontSize: 18,
            fontWeight: '600',
            color: '#666',
            marginTop: 16,
            marginBottom: 8,
          },
          emptyStateSubtext: { fontSize: 14, color: '#999', textAlign: 'center' },
        });
        const qe = function () {
          var e = (0, W.useNavigation)(),
            t = (0, W.useRoute)().params || {},
            n = (t.currentLocation, t.serviceType),
            r = (0, i.useState)(''),
            o = (0, j.default)(r, 2),
            a = o[0],
            l = o[1],
            s = (0, i.useState)(n || 'all'),
            c = (0, j.default)(s, 2),
            d = c[0],
            h = c[1],
            g = (0, i.useState)('distance'),
            m = (0, j.default)(g, 2),
            x = m[0],
            y = m[1],
            p = (0, i.useState)([]),
            F = (0, j.default)(p, 2),
            b = F[0],
            v = F[1],
            w = [
              {
                id: '1',
                name: '\uce74\uace0\ub85c \uc815\ube44\uc13c\ud130 \uac15\ub0a8\uc810',
                address: '\uc11c\uc6b8\uc2dc \uac15\ub0a8\uad6c \ud14c\ud5e4\ub780\ub85c 123',
                distance: '1.2km',
                rating: 4.8,
                reviewCount: 127,
                phoneNumber: '02-1234-5678',
                isOpen: !0,
                openHours: '09:00 - 18:00',
                services: [
                  {
                    id: 'oil-change',
                    name: '\uc5d4\uc9c4\uc624\uc77c \uad50\ud658',
                    price: '60,000\uc6d0',
                    icon: 'car-outline',
                  },
                  {
                    id: 'tire',
                    name: '\ud0c0\uc774\uc5b4 \uad50\uccb4',
                    price: '150,000\uc6d0',
                    icon: 'ellipse-outline',
                  },
                ],
                specialties: ['\uc218\uc785\ucc28 \uc804\ubb38', '\uce5c\ud658\uacbd \uc624\uc77c'],
                images: [],
                latitude: 37.5665,
                longitude: 126.978,
              },
              {
                id: '2',
                name: '\uc2a4\ub9c8\ud2b8\uce74 \uc11c\ube44\uc2a4\uc13c\ud130',
                address: '\uc11c\uc6b8\uc2dc \uac15\ub0a8\uad6c \uc0bc\uc131\ub85c 456',
                distance: '2.1km',
                rating: 4.6,
                reviewCount: 89,
                phoneNumber: '02-2345-6789',
                isOpen: !0,
                openHours: '08:30 - 19:00',
                services: [
                  {
                    id: 'battery',
                    name: '\ubc30\ud130\ub9ac \uad50\uccb4',
                    price: '120,000\uc6d0',
                    icon: 'battery-charging-outline',
                  },
                  {
                    id: 'emergency',
                    name: '\uc751\uae09 \uc218\ub9ac',
                    price: '\uacac\uc801 \ud6c4',
                    icon: 'warning-outline',
                  },
                ],
                specialties: ['24\uc2dc\uac04 \ucd9c\ub3d9', '\uc804\uae30\ucc28 \uc815\ube44'],
                images: [],
                latitude: 37.5172,
                longitude: 127.0473,
              },
              {
                id: '3',
                name: '\ud504\ub9ac\ubbf8\uc5c4 \uc624\ud1a0\ucf00\uc5b4',
                address: '\uc11c\uc6b8\uc2dc \uc11c\ucd08\uad6c \uac15\ub0a8\ub300\ub85c 789',
                distance: '3.5km',
                rating: 4.9,
                reviewCount: 203,
                phoneNumber: '02-3456-7890',
                isOpen: !1,
                openHours: '09:00 - 18:00 (\uc77c\uc694\uc77c \ud734\ubb34)',
                services: [
                  {
                    id: 'oil-change',
                    name: '\uc5d4\uc9c4\uc624\uc77c \uad50\ud658',
                    price: '55,000\uc6d0',
                    icon: 'car-outline',
                  },
                  {
                    id: 'brake',
                    name: '\ube0c\ub808\uc774\ud06c \uc815\ube44',
                    price: '80,000\uc6d0',
                    icon: 'stop-circle-outline',
                  },
                  {
                    id: 'tire',
                    name: '\ud0c0\uc774\uc5b4 \uad50\uccb4',
                    price: '140,000\uc6d0',
                    icon: 'ellipse-outline',
                  },
                ],
                specialties: ['\uace0\uae09\ucc28 \uc804\ubb38', '\uc815\ud488 \ubd80\ud488'],
                images: [],
                latitude: 37.4979,
                longitude: 127.0276,
              },
            ];
          (0, i.useEffect)(function () {
            v(w);
          }, []);
          var B = b.filter(function (e) {
              var t =
                  e.name.toLowerCase().includes(a.toLowerCase()) ||
                  e.address.toLowerCase().includes(a.toLowerCase()),
                n =
                  'all' === d ||
                  e.services.some(function (e) {
                    return e.id === d;
                  });
              return t && n;
            }),
            S = (0, Ne.default)(B).sort(function (e, t) {
              switch (x) {
                case 'distance':
                  return parseFloat(e.distance) - parseFloat(t.distance);
                case 'rating':
                  return t.rating - e.rating;
                case 'price':
                  return e.name.localeCompare(t.name);
                default:
                  return 0;
              }
            });
          return (0, C.jsxs)(E.SafeAreaView, {
            style: _e.container,
            children: [
              (0, C.jsxs)(u.default, {
                style: _e.header,
                children: [
                  (0, C.jsx)(L.default, {
                    style: _e.backButton,
                    onPress: function () {
                      return e.goBack();
                    },
                    children: (0, C.jsx)(me.default, {
                      name: 'arrow-back',
                      size: 24,
                      color: '#333',
                    }),
                  }),
                  (0, C.jsx)(f.default, {
                    style: _e.headerTitle,
                    children: '\uc815\ube44\uc18c \ucc3e\uae30',
                  }),
                  (0, C.jsx)(L.default, {
                    style: _e.mapButton,
                    children: (0, C.jsx)(me.default, {
                      name: 'map-outline',
                      size: 24,
                      color: '#333',
                    }),
                  }),
                ],
              }),
              (0, C.jsx)(u.default, {
                style: _e.searchContainer,
                children: (0, C.jsxs)(u.default, {
                  style: _e.searchInputContainer,
                  children: [
                    (0, C.jsx)(me.default, { name: 'search-outline', size: 20, color: '#666' }),
                    (0, C.jsx)(V.default, {
                      style: _e.searchInput,
                      placeholder:
                        '\uc815\ube44\uc18c \uc774\ub984 \ub610\ub294 \uc8fc\uc18c \uac80\uc0c9',
                      value: a,
                      onChangeText: l,
                    }),
                    a.length > 0 &&
                      (0, C.jsx)(L.default, {
                        onPress: function () {
                          return l('');
                        },
                        children: (0, C.jsx)(me.default, {
                          name: 'close-circle-outline',
                          size: 20,
                          color: '#666',
                        }),
                      }),
                  ],
                }),
              }),
              (0, C.jsxs)(u.default, {
                style: _e.filtersContainer,
                children: [
                  (0, C.jsx)(N.default, {
                    horizontal: !0,
                    showsHorizontalScrollIndicator: !1,
                    children: (0, C.jsx)(u.default, {
                      style: _e.filterButtons,
                      children: [
                        { id: 'all', name: '\uc804\uccb4', icon: 'grid-outline' },
                        { id: 'oil-change', name: '\uc624\uc77c\uad50\ud658', icon: 'car-outline' },
                        { id: 'tire', name: '\ud0c0\uc774\uc5b4', icon: 'ellipse-outline' },
                        {
                          id: 'brake',
                          name: '\ube0c\ub808\uc774\ud06c',
                          icon: 'stop-circle-outline',
                        },
                        {
                          id: 'battery',
                          name: '\ubc30\ud130\ub9ac',
                          icon: 'battery-charging-outline',
                        },
                        {
                          id: 'emergency',
                          name: '\uc751\uae09\uc218\ub9ac',
                          icon: 'warning-outline',
                        },
                      ].map(function (e) {
                        return (0, C.jsxs)(
                          L.default,
                          {
                            style: [_e.filterButton, d === e.id && _e.activeFilterButton],
                            onPress: function () {
                              return h(e.id);
                            },
                            children: [
                              (0, C.jsx)(me.default, {
                                name: e.icon,
                                size: 16,
                                color: d === e.id ? '#fff' : '#666',
                              }),
                              (0, C.jsx)(f.default, {
                                style: [
                                  _e.filterButtonText,
                                  d === e.id && _e.activeFilterButtonText,
                                ],
                                children: e.name,
                              }),
                            ],
                          },
                          e.id
                        );
                      }),
                    }),
                  }),
                  (0, C.jsx)(u.default, {
                    style: _e.sortContainer,
                    children: (0, C.jsxs)(L.default, {
                      style: _e.sortButton,
                      onPress: function () {
                        var e = ['distance', 'rating', 'price'],
                          t = (e.indexOf(x) + 1) % e.length;
                        y(e[t]);
                      },
                      children: [
                        (0, C.jsx)(me.default, {
                          name: 'swap-vertical-outline',
                          size: 16,
                          color: '#666',
                        }),
                        (0, C.jsx)(f.default, {
                          style: _e.sortButtonText,
                          children:
                            'distance' === x
                              ? '\uac70\ub9ac\uc21c'
                              : 'rating' === x
                                ? '\ud3c9\uc810\uc21c'
                                : '\uac00\uaca9\uc21c',
                        }),
                      ],
                    }),
                  }),
                ],
              }),
              (0, C.jsxs)(N.default, {
                style: _e.resultsList,
                showsVerticalScrollIndicator: !1,
                children: [
                  (0, C.jsx)(u.default, {
                    style: _e.resultsHeader,
                    children: (0, C.jsxs)(f.default, {
                      style: _e.resultsCount,
                      children: ['\ucd1d ', S.length, '\uac1c\uc758 \uc815\ube44\uc18c'],
                    }),
                  }),
                  0 === S.length
                    ? (0, C.jsxs)(u.default, {
                        style: _e.emptyState,
                        children: [
                          (0, C.jsx)(me.default, { name: 'car-outline', size: 48, color: '#ccc' }),
                          (0, C.jsx)(f.default, {
                            style: _e.emptyStateText,
                            children: '\uac80\uc0c9 \uacb0\uacfc\uac00 \uc5c6\uc2b5\ub2c8\ub2e4',
                          }),
                          (0, C.jsx)(f.default, {
                            style: _e.emptyStateSubtext,
                            children:
                              '\ub2e4\ub978 \uac80\uc0c9\uc5b4\ub098 \ud544\ud130\ub97c \uc2dc\ub3c4\ud574\ubcf4\uc138\uc694',
                          }),
                        ],
                      })
                    : S.map(function (t) {
                        return (0, C.jsxs)(
                          L.default,
                          {
                            style: _e.workshopCard,
                            onPress: function () {
                              return (function (t) {
                                O.default.alert(
                                  t.name,
                                  '\uc804\ud654: ' +
                                    t.phoneNumber +
                                    '\n\uc8fc\uc18c: ' +
                                    t.address +
                                    '\n\uc601\uc5c5\uc2dc\uac04: ' +
                                    t.openHours,
                                  [
                                    { text: '\ucde8\uc18c', style: 'cancel' },
                                    {
                                      text: '\uc804\ud654\uac78\uae30',
                                      onPress: function () {
                                        return O.default.alert(
                                          '\uc804\ud654',
                                          '\uc804\ud654 \uc571\uc744 \uc2e4\ud589\ud569\ub2c8\ub2e4.'
                                        );
                                      },
                                    },
                                    {
                                      text: '\uc608\uc57d\ud558\uae30',
                                      onPress: function () {
                                        return e.navigate('MaintenanceBooking', {});
                                      },
                                    },
                                    {
                                      text: '\uae38\ucc3e\uae30',
                                      onPress: function () {
                                        return e.navigate('MapDetail', {
                                          destination: {
                                            latitude: t.latitude,
                                            longitude: t.longitude,
                                            name: t.name,
                                          },
                                        });
                                      },
                                    },
                                  ]
                                );
                              })(t);
                            },
                            children: [
                              (0, C.jsxs)(u.default, {
                                style: _e.workshopHeader,
                                children: [
                                  (0, C.jsxs)(u.default, {
                                    style: _e.workshopInfo,
                                    children: [
                                      (0, C.jsx)(f.default, {
                                        style: _e.workshopName,
                                        children: t.name,
                                      }),
                                      (0, C.jsx)(f.default, {
                                        style: _e.workshopAddress,
                                        children: t.address,
                                      }),
                                      (0, C.jsxs)(u.default, {
                                        style: _e.workshopMeta,
                                        children: [
                                          (0, C.jsxs)(f.default, {
                                            style: _e.distance,
                                            children: ['\ud83d\udccd ', t.distance],
                                          }),
                                          (0, C.jsxs)(f.default, {
                                            style: _e.rating,
                                            children: [
                                              '\u2b50 ',
                                              t.rating,
                                              ' (',
                                              t.reviewCount,
                                              ')',
                                            ],
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                                  (0, C.jsxs)(u.default, {
                                    style: _e.workshopStatus,
                                    children: [
                                      (0, C.jsx)(u.default, {
                                        style: [
                                          _e.statusIndicator,
                                          { backgroundColor: t.isOpen ? '#4CAF50' : '#F44336' },
                                        ],
                                      }),
                                      (0, C.jsx)(f.default, {
                                        style: [
                                          _e.statusText,
                                          { color: t.isOpen ? '#4CAF50' : '#F44336' },
                                        ],
                                        children: t.isOpen
                                          ? '\uc601\uc5c5\uc911'
                                          : '\uc601\uc5c5\uc885\ub8cc',
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                              (0, C.jsxs)(u.default, {
                                style: _e.workshopDetails,
                                children: [
                                  (0, C.jsxs)(f.default, {
                                    style: _e.openHours,
                                    children: ['\ud83d\udd52 ', t.openHours],
                                  }),
                                  (0, C.jsxs)(f.default, {
                                    style: _e.phone,
                                    children: ['\ud83d\udcde ', t.phoneNumber],
                                  }),
                                ],
                              }),
                              (0, C.jsxs)(u.default, {
                                style: _e.servicesContainer,
                                children: [
                                  (0, C.jsx)(f.default, {
                                    style: _e.servicesTitle,
                                    children: '\uc81c\uacf5 \uc11c\ube44\uc2a4:',
                                  }),
                                  (0, C.jsx)(u.default, {
                                    style: _e.servicesList,
                                    children: t.services.map(function (e) {
                                      return (0, C.jsxs)(
                                        u.default,
                                        {
                                          style: _e.serviceTag,
                                          children: [
                                            (0, C.jsx)(me.default, {
                                              name: e.icon,
                                              size: 14,
                                              color: '#666',
                                            }),
                                            (0, C.jsx)(f.default, {
                                              style: _e.serviceTagText,
                                              children: e.name,
                                            }),
                                          ],
                                        },
                                        e.id
                                      );
                                    }),
                                  }),
                                ],
                              }),
                              t.specialties.length > 0 &&
                                (0, C.jsxs)(u.default, {
                                  style: _e.specialtiesContainer,
                                  children: [
                                    (0, C.jsx)(f.default, {
                                      style: _e.specialtiesTitle,
                                      children: '\uc804\ubb38 \ubd84\uc57c:',
                                    }),
                                    (0, C.jsx)(u.default, {
                                      style: _e.specialtiesList,
                                      children: t.specialties.map(function (e, t) {
                                        return (0, C.jsx)(
                                          f.default,
                                          { style: _e.specialtyTag, children: e },
                                          t
                                        );
                                      }),
                                    }),
                                  ],
                                }),
                            ],
                          },
                          t.id
                        );
                      }),
                ],
              }),
            ],
          });
        };
        var Ge = g.default.create({
          container: { flex: 1, backgroundColor: '#f8f9fa' },
          header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingVertical: 15,
            backgroundColor: '#fff',
            borderBottomWidth: 1,
            borderBottomColor: '#e9ecef',
          },
          backButton: { padding: 8 },
          headerTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
          exportButton: { padding: 8 },
          vehicleSelector: {
            backgroundColor: '#fff',
            paddingVertical: 15,
            borderBottomWidth: 1,
            borderBottomColor: '#e9ecef',
          },
          vehicleButtons: { flexDirection: 'row', gap: 10, paddingHorizontal: 20 },
          vehicleButton: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#f8f9fa',
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingVertical: 10,
            gap: 8,
          },
          activeVehicleButton: { backgroundColor: '#4CAF50' },
          vehicleButtonText: { fontSize: 14, fontWeight: '500', color: '#666' },
          activeVehicleButtonText: { color: '#fff' },
          vehicleSummary: {
            backgroundColor: '#fff',
            padding: 20,
            borderBottomWidth: 1,
            borderBottomColor: '#e9ecef',
          },
          summaryRow: { flexDirection: 'row', justifyContent: 'space-around' },
          summaryItem: { alignItems: 'center' },
          summaryLabel: { fontSize: 12, color: '#666', marginBottom: 4 },
          summaryValue: { fontSize: 16, fontWeight: '600', color: '#333' },
          filtersContainer: {
            backgroundColor: '#fff',
            paddingVertical: 15,
            borderBottomWidth: 1,
            borderBottomColor: '#e9ecef',
          },
          filterButtons: { flexDirection: 'row', gap: 10, paddingHorizontal: 20 },
          filterButton: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#f8f9fa',
            borderRadius: 20,
            paddingHorizontal: 12,
            paddingVertical: 8,
            gap: 6,
          },
          activeFilterButton: { backgroundColor: '#4CAF50' },
          filterButtonText: { fontSize: 14, color: '#666' },
          activeFilterButtonText: { color: '#fff' },
          recordsList: { flex: 1, padding: 20 },
          recordsContainer: { gap: 16 },
          recordCard: {
            backgroundColor: '#fff',
            borderRadius: 12,
            padding: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3.84,
            elevation: 5,
          },
          recordHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 12,
          },
          recordInfo: { flex: 1 },
          serviceName: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 4 },
          workshopName: { fontSize: 14, color: '#666' },
          recordStatus: { alignItems: 'flex-end', gap: 4 },
          statusBadge: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 },
          statusText: { fontSize: 12, fontWeight: '500', color: '#fff' },
          typeBadge: { borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
          typeText: { fontSize: 10, fontWeight: '500', color: '#fff' },
          recordDetails: { marginBottom: 12 },
          detailRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 4,
          },
          detailLabel: { fontSize: 14, color: '#666' },
          costText: { fontSize: 16, fontWeight: '600', color: '#4CAF50' },
          nextMaintenanceText: { fontSize: 12, color: '#FF9800' },
          description: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 12 },
          partsContainer: { backgroundColor: '#f8f9fa', borderRadius: 8, padding: 12 },
          partsTitle: { fontSize: 14, fontWeight: '500', color: '#333', marginBottom: 8 },
          partsList: { gap: 4 },
          partItem: { fontSize: 12, color: '#666' },
          morePartsText: { fontSize: 12, color: '#999', fontStyle: 'italic' },
          emptyState: { alignItems: 'center', paddingVertical: 60 },
          emptyStateText: {
            fontSize: 18,
            fontWeight: '600',
            color: '#666',
            marginTop: 16,
            marginBottom: 8,
          },
          emptyStateSubtext: { fontSize: 14, color: '#999', textAlign: 'center', marginBottom: 24 },
          bookingButton: {
            backgroundColor: '#4CAF50',
            borderRadius: 12,
            paddingHorizontal: 24,
            paddingVertical: 12,
          },
          bookingButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
        });
        const Ue = function () {
          var e = (0, W.useNavigation)(),
            t = ((0, W.useRoute)().params || {}).vehicleId,
            n = (0, i.useState)(t || '1'),
            r = (0, j.default)(n, 2),
            o = r[0],
            a = r[1],
            l = (0, i.useState)('all'),
            s = (0, j.default)(l, 2),
            c = s[0],
            d = s[1],
            h = (0, i.useState)([]),
            g = (0, j.default)(h, 2),
            m = g[0],
            x = g[1],
            y = (0, i.useState)([]),
            p = (0, j.default)(y, 2),
            F = p[0],
            b = p[1],
            v = [
              {
                id: '1',
                name: '\ub0b4 \uc18c\ub098\ud0c0',
                model: '\ud604\ub300 \uc18c\ub098\ud0c0',
                year: 2022,
                totalMileage: 45e3,
              },
              {
                id: '2',
                name: '\uc544\ub0b4 \uadf8\ub79c\uc800',
                model: '\ud604\ub300 \uadf8\ub79c\uc800',
                year: 2023,
                totalMileage: 22e3,
              },
            ],
            w = [
              {
                id: '1',
                date: '2024-11-15',
                serviceName: '\uc5d4\uc9c4\uc624\uc77c \uad50\ud658',
                workshopName: '\uce74\uace0\ub85c \uc815\ube44\uc13c\ud130 \uac15\ub0a8\uc810',
                cost: 65e3,
                mileage: 44500,
                status: 'completed',
                serviceType: 'routine',
                description:
                  '\uc5d4\uc9c4\uc624\uc77c \ubc0f \uc624\uc77c\ud544\ud130 \uad50\ud658, \uae30\ubcf8 \uc810\uac80',
                parts: [
                  {
                    name: '\uc5d4\uc9c4\uc624\uc77c',
                    partNumber: 'OIL-001',
                    quantity: 4,
                    unitPrice: 12e3,
                  },
                  {
                    name: '\uc624\uc77c\ud544\ud130',
                    partNumber: 'FILTER-001',
                    quantity: 1,
                    unitPrice: 8e3,
                  },
                ],
                nextMaintenanceDate: '2025-05-15',
                nextMaintenanceMileage: 54500,
                invoiceNumber: 'INV-2024-001',
                technician: '\uae40\uc815\ube44',
                duration: '30\ubd84',
                warranty: '6\uac1c\uc6d4 \ub610\ub294 10,000km',
              },
              {
                id: '2',
                date: '2024-09-20',
                serviceName: '\ud0c0\uc774\uc5b4 \uad50\uccb4',
                workshopName: '\uc2a4\ub9c8\ud2b8\uce74 \uc11c\ube44\uc2a4\uc13c\ud130',
                cost: 32e4,
                mileage: 42e3,
                status: 'completed',
                serviceType: 'repair',
                description:
                  '\uc804\uccb4 \ud0c0\uc774\uc5b4 4\uac1c \uad50\uccb4 \ubc0f \ud720 \ubc38\ub7f0\uc2a4 \uc870\uc815',
                parts: [
                  {
                    name: '\ud0c0\uc774\uc5b4',
                    partNumber: 'TIRE-225/60R16',
                    quantity: 4,
                    unitPrice: 75e3,
                  },
                ],
                invoiceNumber: 'INV-2024-002',
                technician: '\ubc15\ud0c0\uc774\uc5b4',
                duration: '1\uc2dc\uac04 30\ubd84',
                warranty: '2\ub144 \ub610\ub294 60,000km',
              },
              {
                id: '3',
                date: '2024-07-10',
                serviceName: '\uc815\uae30\uc810\uac80',
                workshopName: '\ud604\ub300 \uc11c\ube44\uc2a4\uc13c\ud130',
                cost: 12e4,
                mileage: 38e3,
                status: 'completed',
                serviceType: 'routine',
                description:
                  '6\uac1c\uc6d4 \uc815\uae30\uc810\uac80 \ubc0f \uc18c\ubaa8\ud488 \uad50\uccb4',
                parts: [
                  {
                    name: '\uc5d0\uc5b4\ud544\ud130',
                    partNumber: 'AIR-001',
                    quantity: 1,
                    unitPrice: 15e3,
                  },
                  {
                    name: '\uc640\uc774\ud37c \ube14\ub808\uc774\ub4dc',
                    partNumber: 'WIPER-001',
                    quantity: 2,
                    unitPrice: 25e3,
                  },
                ],
                nextMaintenanceDate: '2025-01-10',
                nextMaintenanceMileage: 48e3,
                invoiceNumber: 'INV-2024-003',
                technician: '\uc774\uc815\ube44',
                duration: '2\uc2dc\uac04',
                warranty: '1\ub144 \ub610\ub294 20,000km',
              },
              {
                id: '4',
                date: '2024-12-25',
                serviceName: '\ube0c\ub808\uc774\ud06c \ud328\ub4dc \uad50\uccb4',
                workshopName: '\ud504\ub9ac\ubbf8\uc5c4 \uc624\ud1a0\ucf00\uc5b4',
                cost: 18e4,
                mileage: 45200,
                status: 'scheduled',
                serviceType: 'repair',
                description:
                  '\uc55e\ub4a4 \ube0c\ub808\uc774\ud06c \ud328\ub4dc \uad50\uccb4 \uc608\uc815',
                parts: [
                  {
                    name: '\ube0c\ub808\uc774\ud06c \ud328\ub4dc(\uc804)',
                    partNumber: 'BRAKE-F001',
                    quantity: 1,
                    unitPrice: 8e4,
                  },
                  {
                    name: '\ube0c\ub808\uc774\ud06c \ud328\ub4dc(\ud6c4)',
                    partNumber: 'BRAKE-R001',
                    quantity: 1,
                    unitPrice: 6e4,
                  },
                ],
                invoiceNumber: 'SCH-2024-001',
                technician: '\ucd5c\ube0c\ub808\uc774\ud06c',
                duration: '1\uc2dc\uac04',
                warranty: '1\ub144 \ub610\ub294 30,000km',
              },
            ];
          (0, i.useEffect)(function () {
            b(v), x(w);
          }, []);
          var B = m.filter(function (e) {
              return (
                'all' === c ||
                (['completed', 'scheduled', 'cancelled'].includes(c)
                  ? e.status === c
                  : !['routine', 'repair', 'emergency'].includes(c) || e.serviceType === c)
              );
            }),
            S = function (e) {
              switch (e) {
                case 'completed':
                  return '#4CAF50';
                case 'scheduled':
                  return '#FF9800';
                case 'cancelled':
                  return '#F44336';
                default:
                  return '#666';
              }
            },
            T = function (e) {
              switch (e) {
                case 'completed':
                  return '\uc644\ub8cc';
                case 'scheduled':
                  return '\uc608\uc815';
                case 'cancelled':
                  return '\ucde8\uc18c';
                default:
                  return e;
              }
            },
            k = function (e) {
              switch (e) {
                case 'routine':
                  return '#2196F3';
                case 'repair':
                  return '#FF9800';
                case 'emergency':
                  return '#F44336';
                default:
                  return '#666';
              }
            },
            z = function (e) {
              return e.toLocaleString('ko-KR') + '\uc6d0';
            },
            I = F.find(function (e) {
              return e.id === o;
            }),
            D = B.filter(function (e) {
              return 'completed' === e.status;
            }),
            P = D.reduce(function (e, t) {
              return e + t.cost;
            }, 0);
          return (0, C.jsxs)(E.SafeAreaView, {
            style: Ge.container,
            children: [
              (0, C.jsxs)(u.default, {
                style: Ge.header,
                children: [
                  (0, C.jsx)(L.default, {
                    style: Ge.backButton,
                    onPress: function () {
                      return e.goBack();
                    },
                    children: (0, C.jsx)(me.default, {
                      name: 'arrow-back',
                      size: 24,
                      color: '#333',
                    }),
                  }),
                  (0, C.jsx)(f.default, {
                    style: Ge.headerTitle,
                    children: '\uc815\ube44 \uc774\ub825',
                  }),
                  (0, C.jsx)(L.default, {
                    style: Ge.exportButton,
                    children: (0, C.jsx)(me.default, {
                      name: 'download-outline',
                      size: 24,
                      color: '#333',
                    }),
                  }),
                ],
              }),
              (0, C.jsx)(u.default, {
                style: Ge.vehicleSelector,
                children: (0, C.jsx)(N.default, {
                  horizontal: !0,
                  showsHorizontalScrollIndicator: !1,
                  children: (0, C.jsx)(u.default, {
                    style: Ge.vehicleButtons,
                    children: F.map(function (e) {
                      return (0, C.jsxs)(
                        L.default,
                        {
                          style: [Ge.vehicleButton, o === e.id && Ge.activeVehicleButton],
                          onPress: function () {
                            return a(e.id);
                          },
                          children: [
                            (0, C.jsx)(me.default, {
                              name: 'car-outline',
                              size: 16,
                              color: o === e.id ? '#fff' : '#666',
                            }),
                            (0, C.jsx)(f.default, {
                              style: [
                                Ge.vehicleButtonText,
                                o === e.id && Ge.activeVehicleButtonText,
                              ],
                              children: e.name,
                            }),
                          ],
                        },
                        e.id
                      );
                    }),
                  }),
                }),
              }),
              I &&
                (0, C.jsx)(u.default, {
                  style: Ge.vehicleSummary,
                  children: (0, C.jsxs)(u.default, {
                    style: Ge.summaryRow,
                    children: [
                      (0, C.jsxs)(u.default, {
                        style: Ge.summaryItem,
                        children: [
                          (0, C.jsx)(f.default, {
                            style: Ge.summaryLabel,
                            children: '\ucd1d \uc8fc\ud589\uac70\ub9ac',
                          }),
                          (0, C.jsxs)(f.default, {
                            style: Ge.summaryValue,
                            children: [I.totalMileage.toLocaleString(), 'km'],
                          }),
                        ],
                      }),
                      (0, C.jsxs)(u.default, {
                        style: Ge.summaryItem,
                        children: [
                          (0, C.jsx)(f.default, {
                            style: Ge.summaryLabel,
                            children: '\ucd1d \uc815\ube44\ube44\uc6a9',
                          }),
                          (0, C.jsx)(f.default, { style: Ge.summaryValue, children: z(P) }),
                        ],
                      }),
                      (0, C.jsxs)(u.default, {
                        style: Ge.summaryItem,
                        children: [
                          (0, C.jsx)(f.default, {
                            style: Ge.summaryLabel,
                            children: '\uc815\ube44 \ud69f\uc218',
                          }),
                          (0, C.jsxs)(f.default, {
                            style: Ge.summaryValue,
                            children: [D.length, '\ud68c'],
                          }),
                        ],
                      }),
                    ],
                  }),
                }),
              (0, C.jsx)(u.default, {
                style: Ge.filtersContainer,
                children: (0, C.jsx)(N.default, {
                  horizontal: !0,
                  showsHorizontalScrollIndicator: !1,
                  children: (0, C.jsx)(u.default, {
                    style: Ge.filterButtons,
                    children: [
                      { id: 'all', name: '\uc804\uccb4', icon: 'list-outline' },
                      { id: 'completed', name: '\uc644\ub8cc', icon: 'checkmark-circle-outline' },
                      { id: 'scheduled', name: '\uc608\uc815', icon: 'time-outline' },
                      { id: 'routine', name: '\uc815\uae30', icon: 'refresh-outline' },
                      { id: 'repair', name: '\uc218\ub9ac', icon: 'construct-outline' },
                    ].map(function (e) {
                      return (0, C.jsxs)(
                        L.default,
                        {
                          style: [Ge.filterButton, c === e.id && Ge.activeFilterButton],
                          onPress: function () {
                            return d(e.id);
                          },
                          children: [
                            (0, C.jsx)(me.default, {
                              name: e.icon,
                              size: 16,
                              color: c === e.id ? '#fff' : '#666',
                            }),
                            (0, C.jsx)(f.default, {
                              style: [Ge.filterButtonText, c === e.id && Ge.activeFilterButtonText],
                              children: e.name,
                            }),
                          ],
                        },
                        e.id
                      );
                    }),
                  }),
                }),
              }),
              (0, C.jsx)(N.default, {
                style: Ge.recordsList,
                showsVerticalScrollIndicator: !1,
                children:
                  0 === B.length
                    ? (0, C.jsxs)(u.default, {
                        style: Ge.emptyState,
                        children: [
                          (0, C.jsx)(me.default, {
                            name: 'document-text-outline',
                            size: 48,
                            color: '#ccc',
                          }),
                          (0, C.jsx)(f.default, {
                            style: Ge.emptyStateText,
                            children: '\uc815\ube44 \uc774\ub825\uc774 \uc5c6\uc2b5\ub2c8\ub2e4',
                          }),
                          (0, C.jsx)(f.default, {
                            style: Ge.emptyStateSubtext,
                            children:
                              '\uccab \ubc88\uc9f8 \uc815\ube44\ub97c \uc608\uc57d\ud574\ubcf4\uc138\uc694',
                          }),
                          (0, C.jsx)(L.default, {
                            style: Ge.bookingButton,
                            onPress: function () {
                              return e.navigate('MaintenanceBooking', {});
                            },
                            children: (0, C.jsx)(f.default, {
                              style: Ge.bookingButtonText,
                              children: '\uc815\ube44 \uc608\uc57d\ud558\uae30',
                            }),
                          }),
                        ],
                      })
                    : (0, C.jsx)(u.default, {
                        style: Ge.recordsContainer,
                        children: B.map(function (t) {
                          return (0, C.jsxs)(
                            L.default,
                            {
                              style: Ge.recordCard,
                              onPress: function () {
                                return (function (t) {
                                  var n = t.parts.reduce(function (e, t) {
                                      return e + t.quantity * t.unitPrice;
                                    }, 0),
                                    r = t.cost - n;
                                  O.default.alert(
                                    t.serviceName,
                                    '\uc815\ube44\uc18c: ' +
                                      t.workshopName +
                                      '\n\ub0a0\uc9dc: ' +
                                      t.date +
                                      '\n\uc8fc\ud589\uac70\ub9ac: ' +
                                      t.mileage.toLocaleString() +
                                      'km\n\n\uc791\uc5c5 \ub0b4\uc6a9:\n' +
                                      t.description +
                                      '\n\n\ubd80\ud488\ube44: ' +
                                      z(n) +
                                      '\n\uacf5\uc784: ' +
                                      z(r) +
                                      '\n\ucd1d \ube44\uc6a9: ' +
                                      z(t.cost) +
                                      '\n\n\ub2f4\ub2f9\uc790: ' +
                                      t.technician +
                                      '\n\uc18c\uc694\uc2dc\uac04: ' +
                                      t.duration +
                                      '\n\ubcf4\uc99d\uae30\uac04: ' +
                                      t.warranty,
                                    [{ text: '\ub2eb\uae30', style: 'cancel' }].concat(
                                      (0, Ne.default)(
                                        'scheduled' === t.status
                                          ? [
                                              {
                                                text: '\uc608\uc57d \ubcc0\uacbd',
                                                onPress: function () {
                                                  return e.navigate('MaintenanceBooking', {});
                                                },
                                              },
                                              {
                                                text: '\uc608\uc57d \ucde8\uc18c',
                                                style: 'destructive',
                                                onPress: function () {
                                                  return O.default.alert(
                                                    '\uc608\uc57d \ucde8\uc18c',
                                                    '\uc608\uc57d\uc774 \ucde8\uc18c\ub418\uc5c8\uc2b5\ub2c8\ub2e4.'
                                                  );
                                                },
                                              },
                                            ]
                                          : []
                                      ),
                                      [
                                        {
                                          text: '\uc601\uc218\uc99d \ubcf4\uae30',
                                          onPress: function () {
                                            return O.default.alert(
                                              '\uc601\uc218\uc99d',
                                              '\uc601\uc218\uc99d \ubc88\ud638: ' + t.invoiceNumber
                                            );
                                          },
                                        },
                                      ]
                                    )
                                  );
                                })(t);
                              },
                              children: [
                                (0, C.jsxs)(u.default, {
                                  style: Ge.recordHeader,
                                  children: [
                                    (0, C.jsxs)(u.default, {
                                      style: Ge.recordInfo,
                                      children: [
                                        (0, C.jsx)(f.default, {
                                          style: Ge.serviceName,
                                          children: t.serviceName,
                                        }),
                                        (0, C.jsx)(f.default, {
                                          style: Ge.workshopName,
                                          children: t.workshopName,
                                        }),
                                      ],
                                    }),
                                    (0, C.jsxs)(u.default, {
                                      style: Ge.recordStatus,
                                      children: [
                                        (0, C.jsx)(u.default, {
                                          style: [Ge.statusBadge, { backgroundColor: S(t.status) }],
                                          children: (0, C.jsx)(f.default, {
                                            style: Ge.statusText,
                                            children: T(t.status),
                                          }),
                                        }),
                                        (0, C.jsx)(u.default, {
                                          style: [
                                            Ge.typeBadge,
                                            { backgroundColor: k(t.serviceType) },
                                          ],
                                          children: (0, C.jsx)(f.default, {
                                            style: Ge.typeText,
                                            children:
                                              'routine' === t.serviceType
                                                ? '\uc815\uae30'
                                                : 'repair' === t.serviceType
                                                  ? '\uc218\ub9ac'
                                                  : '\uc751\uae09',
                                          }),
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                                (0, C.jsxs)(u.default, {
                                  style: Ge.recordDetails,
                                  children: [
                                    (0, C.jsxs)(u.default, {
                                      style: Ge.detailRow,
                                      children: [
                                        (0, C.jsxs)(f.default, {
                                          style: Ge.detailLabel,
                                          children: ['\ud83d\udcc5 ', t.date],
                                        }),
                                        (0, C.jsxs)(f.default, {
                                          style: Ge.detailLabel,
                                          children: [
                                            '\ud83d\udee3 ',
                                            t.mileage.toLocaleString(),
                                            'km',
                                          ],
                                        }),
                                      ],
                                    }),
                                    (0, C.jsxs)(u.default, {
                                      style: Ge.detailRow,
                                      children: [
                                        (0, C.jsxs)(f.default, {
                                          style: Ge.costText,
                                          children: ['\ud83d\udcb0 ', z(t.cost)],
                                        }),
                                        t.nextMaintenanceDate &&
                                          (0, C.jsxs)(f.default, {
                                            style: Ge.nextMaintenanceText,
                                            children: [
                                              '\ub2e4\uc74c \uc815\ube44: ',
                                              t.nextMaintenanceDate,
                                            ],
                                          }),
                                      ],
                                    }),
                                  ],
                                }),
                                (0, C.jsx)(f.default, {
                                  style: Ge.description,
                                  numberOfLines: 2,
                                  children: t.description,
                                }),
                                t.parts.length > 0 &&
                                  (0, C.jsxs)(u.default, {
                                    style: Ge.partsContainer,
                                    children: [
                                      (0, C.jsx)(f.default, {
                                        style: Ge.partsTitle,
                                        children: '\uad50\uccb4 \ubd80\ud488:',
                                      }),
                                      (0, C.jsxs)(u.default, {
                                        style: Ge.partsList,
                                        children: [
                                          t.parts.slice(0, 2).map(function (e, t) {
                                            return (0, C.jsxs)(
                                              f.default,
                                              {
                                                style: Ge.partItem,
                                                children: ['\u2022 ', e.name, ' x', e.quantity],
                                              },
                                              t
                                            );
                                          }),
                                          t.parts.length > 2 &&
                                            (0, C.jsxs)(f.default, {
                                              style: Ge.morePartsText,
                                              children: [
                                                '\uc678 ',
                                                t.parts.length - 2,
                                                '\uac1c \ubd80\ud488',
                                              ],
                                            }),
                                        ],
                                      }),
                                    ],
                                  }),
                              ],
                            },
                            t.id
                          );
                        }),
                      }),
              }),
            ],
          });
        };
        var Ke = n(7060),
          Je = n(8857);
        function Qe() {
          var e = (0, W.useNavigation)(),
            t = (0, i.useState)(null),
            n = (0, j.default)(t, 2),
            r = n[0],
            a = n[1],
            l = (0, i.useState)(null),
            s = (0, j.default)(l, 2),
            c = (s[0], s[1]),
            d = (0, i.useState)([]),
            h = (0, j.default)(d, 2),
            g = h[0],
            m = h[1],
            x = (0, i.useState)(!1),
            y = (0, j.default)(x, 2),
            p = y[0],
            F = y[1],
            b = (0, i.useState)(!0),
            v = (0, j.default)(b, 2),
            w = v[0],
            B = v[1],
            S = (0, i.useState)(!1),
            T = (0, j.default)(S, 2),
            k = T[0],
            z = T[1],
            I = (0, i.useState)('\uc704\uce58 \uc815\ubcf4 \ub85c\ub529 \uc911...'),
            D = (0, j.default)(I, 2),
            P = D[0],
            E = D[1],
            R = (0, i.useState)(null),
            A = (0, j.default)(R, 2),
            V = (A[0], A[1], (0, i.useState)(!1)),
            H = (0, j.default)(V, 2);
          H[0], H[1];
          (0, i.useEffect)(function () {
            O();
          }, []),
            (0, i.useEffect)(
              function () {
                if (p)
                  return (function (e) {
                    var t = setInterval(
                      (0, o.default)(function* () {
                        try {
                          var t = yield Te();
                          e(t);
                        } catch (n) {
                          console.error(
                            '\uc2e4\uc2dc\uac04 \ub370\uc774\ud130 \uc2a4\ud2b8\ub9ac\ubc0d \uc624\ub958:',
                            n
                          );
                        }
                      }),
                      5e3
                    );
                    return function () {
                      return clearInterval(t);
                    };
                  })(function (e) {
                    a(e), G(e);
                  });
              },
              [p]
            );
          var O = (function () {
              var e = (0, o.default)(function* () {
                try {
                  B(!0);
                  var e,
                    t,
                    n = !1;
                  try {
                    n = yield Be();
                  } catch (i) {
                    console.log(
                      'OBD \uc5f0\uacb0 \uc2dc\ub3c4 \uc911 \uc624\ub958 \ubc1c\uc0dd, \uc2dc\ubbac\ub808\uc774\uc158 \ubaa8\ub4dc\ub85c \uc804\ud658:',
                      i
                    );
                  }
                  if ((F(n), n))
                    try {
                      var r = yield Promise.all([Te(), ze()]),
                        o = (0, j.default)(r, 2);
                      (e = o[0]), (t = o[1]);
                    } catch (l) {
                      console.log(
                        'OBD \ub370\uc774\ud130 \ub85c\ub4dc \uc2e4\ud328, \ubaa8\uc758 \ub370\uc774\ud130 \uc0ac\uc6a9:',
                        l
                      ),
                        (e = M()),
                        (t = _());
                    }
                  else (e = M()), (t = _());
                  a(e), c(t), G(e), q();
                } catch (s) {
                  console.error('\ucd08\uae30\ud654 \uc2e4\ud328:', s), a(M()), c(_()), G(M());
                } finally {
                  B(!1);
                }
              });
              return function () {
                return e.apply(this, arguments);
              };
            })(),
            M = function () {
              return {
                rpm: 1200,
                speed: 0,
                engineTemp: 85,
                fuelLevel: 75,
                batteryVoltage: 12.8,
                tirePressure: { frontLeft: 32, frontRight: 32, rearLeft: 31, rearRight: 31 },
                diagnosticTroubleCodes: [],
              };
            },
            _ = function () {
              return {
                isEngineRunning: !0,
                isMoving: !1,
                isFuelLow: !1,
                hasDiagnosticCodes: !1,
                batteryHealth: 'good',
              };
            },
            q = (function () {
              var e = (0, o.default)(function* () {
                try {
                  yield be.getCurrentLocation();
                  E('\uc11c\uc6b8\uc2dc \uac15\ub0a8\uad6c \ud14c\ud5e4\ub780\ub85c');
                } catch (e) {
                  E('\uc704\uce58 \uc815\ubcf4 \uc5c6\uc74c');
                }
              });
              return function () {
                return e.apply(this, arguments);
              };
            })(),
            G = function (e) {
              var t = (function (e) {
                  var t = [],
                    n = [],
                    r = [];
                  return (
                    e.engineTemp > 105 &&
                      t.push('\uc5d4\uc9c4 \uacfc\uc5f4 - \uc989\uc2dc \uc815\ube44 \ud544\uc694'),
                    e.fuelLevel < 10 &&
                      t.push('\uc5f0\ub8cc \ubd80\uc871 - \uc8fc\uc720 \ud544\uc694'),
                    e.diagnosticTroubleCodes.length > 0 &&
                      t.push(
                        '\uc9c4\ub2e8 \ucf54\ub4dc \uac10\uc9c0: ' +
                          e.diagnosticTroubleCodes.join(', ')
                      ),
                    e.fuelLevel < 25 &&
                      n.push('\uc5f0\ub8cc\ub7c9 \ubd80\uc871 - \uc8fc\uc720 \uad8c\uc7a5'),
                    e.engineTemp > 95 &&
                      n.push(
                        '\uc5d4\uc9c4 \uc628\ub3c4 \ub192\uc74c - \ub0c9\uac01\uc218 \uc810\uac80 \uad8c\uc7a5'
                      ),
                    r.push('\uc815\uae30 \uc810\uac80 - \uc5d4\uc9c4\uc624\uc77c \uad50\ud658'),
                    r.push(
                      '\uc815\uae30 \uc810\uac80 - \ud0c0\uc774\uc5b4 \ub85c\ud14c\uc774\uc158'
                    ),
                    { urgent: t, recommended: n, scheduled: r }
                  );
                })(e),
                n = [];
              t.urgent.forEach(function (e) {
                n.push({ type: 'urgent', message: e, icon: 'warning', color: '#EF4444' });
              }),
                t.recommended.forEach(function (e) {
                  n.push({
                    type: 'recommended',
                    message: e,
                    icon: 'information-circle',
                    color: '#F59E0B',
                  });
                }),
                t.scheduled.slice(0, 2).forEach(function (e) {
                  n.push({ type: 'scheduled', message: e, icon: 'time', color: '#6366F1' });
                }),
                m(n);
            },
            U = (0, i.useCallback)(
              (0, o.default)(function* () {
                z(!0), yield O(), z(!1);
              }),
              []
            ),
            K = function (t) {
              switch (t) {
                case 'emergency':
                  e.navigate('EmergencyService');
                  break;
                case 'workshop':
                  e.navigate('WorkshopSearch', {});
                  break;
                case 'diagnosis':
                  e.navigate('SmartDiagnosis', { vehicleId: 'vehicle_1' });
                  break;
                case 'navigation':
                  e.navigate('Navigation');
              }
            };
          return w
            ? (0, C.jsx)(ge.default, {
                style: Xe.container,
                children: (0, C.jsxs)(u.default, {
                  style: Xe.loadingContainer,
                  children: [
                    (0, C.jsx)(me.default, { name: 'car-sport', size: 48, color: '#6366F1' }),
                    (0, C.jsx)(f.default, {
                      style: Xe.loadingText,
                      children: '\ucc28\ub7c9 \uc2dc\uc2a4\ud15c \uc5f0\uacb0 \uc911...',
                    }),
                  ],
                }),
              })
            : (0, C.jsx)(ge.default, {
                style: Xe.container,
                children: (0, C.jsxs)(N.default, {
                  style: Xe.scrollView,
                  refreshControl: (0, C.jsx)(Ke.default, { refreshing: k, onRefresh: U }),
                  children: [
                    (0, C.jsxs)(u.default, {
                      style: Xe.header,
                      children: [
                        (0, C.jsxs)(u.default, {
                          style: Xe.locationContainer,
                          children: [
                            (0, C.jsx)(me.default, {
                              name: 'location',
                              size: 20,
                              color: '#6366F1',
                            }),
                            (0, C.jsx)(f.default, { style: Xe.locationText, children: P }),
                          ],
                        }),
                        (0, C.jsx)(L.default, {
                          style: Xe.settingsButton,
                          children: (0, C.jsx)(me.default, {
                            name: 'settings-outline',
                            size: 24,
                            color: '#6B7280',
                          }),
                        }),
                      ],
                    }),
                    (0, C.jsxs)(Je.LinearGradient, {
                      colors: ['#6366F1', '#8B5CF6'],
                      style: Xe.mainStatusCard,
                      children: [
                        (0, C.jsxs)(u.default, {
                          style: Xe.statusHeader,
                          children: [
                            (0, C.jsx)(f.default, {
                              style: Xe.statusTitle,
                              children: '\ucc28\ub7c9 \uc0c1\ud0dc',
                            }),
                            (0, C.jsx)(u.default, {
                              style: [
                                Xe.connectionStatus,
                                { backgroundColor: p ? '#10B981' : '#EF4444' },
                              ],
                              children: (0, C.jsx)(f.default, {
                                style: Xe.connectionText,
                                children: p ? 'CONNECTED' : 'DISCONNECTED',
                              }),
                            }),
                          ],
                        }),
                        (0, C.jsxs)(u.default, {
                          style: Xe.statusGrid,
                          children: [
                            (0, C.jsxs)(u.default, {
                              style: Xe.statusItem,
                              children: [
                                (0, C.jsx)(me.default, {
                                  name: 'speedometer',
                                  size: 24,
                                  color: '#FFFFFF',
                                }),
                                (0, C.jsx)(f.default, {
                                  style: Xe.statusLabel,
                                  children: '\uc18d\ub3c4',
                                }),
                                (0, C.jsxs)(f.default, {
                                  style: Xe.statusValue,
                                  children: [(null == r ? void 0 : r.speed) || 0, ' km/h'],
                                }),
                              ],
                            }),
                            (0, C.jsxs)(u.default, {
                              style: Xe.statusItem,
                              children: [
                                (0, C.jsx)(me.default, {
                                  name: 'thermometer',
                                  size: 24,
                                  color: '#FFFFFF',
                                }),
                                (0, C.jsx)(f.default, {
                                  style: Xe.statusLabel,
                                  children: '\uc5d4\uc9c4\uc628\ub3c4',
                                }),
                                (0, C.jsxs)(f.default, {
                                  style: [
                                    Xe.statusValue,
                                    {
                                      color: r
                                        ? r.engineTemp > 105
                                          ? '#EF4444'
                                          : r.engineTemp > 95
                                            ? '#F59E0B'
                                            : '#10B981'
                                        : '#6B7280',
                                    },
                                  ],
                                  children: [(null == r ? void 0 : r.engineTemp) || 0, '\xb0C'],
                                }),
                              ],
                            }),
                            (0, C.jsxs)(u.default, {
                              style: Xe.statusItem,
                              children: [
                                (0, C.jsx)(me.default, {
                                  name: 'car-sport',
                                  size: 24,
                                  color: '#FFFFFF',
                                }),
                                (0, C.jsx)(f.default, {
                                  style: Xe.statusLabel,
                                  children: '\uc5f0\ub8cc',
                                }),
                                (0, C.jsxs)(f.default, {
                                  style: [
                                    Xe.statusValue,
                                    {
                                      color: r
                                        ? r.fuelLevel < 20
                                          ? '#EF4444'
                                          : r.fuelLevel < 40
                                            ? '#F59E0B'
                                            : '#10B981'
                                        : '#6B7280',
                                    },
                                  ],
                                  children: [(null == r ? void 0 : r.fuelLevel) || 0, '%'],
                                }),
                              ],
                            }),
                            (0, C.jsxs)(u.default, {
                              style: Xe.statusItem,
                              children: [
                                (0, C.jsx)(me.default, {
                                  name: 'battery-charging',
                                  size: 24,
                                  color: '#FFFFFF',
                                }),
                                (0, C.jsx)(f.default, {
                                  style: Xe.statusLabel,
                                  children: '\ubc30\ud130\ub9ac',
                                }),
                                (0, C.jsxs)(f.default, {
                                  style: Xe.statusValue,
                                  children: [(null == r ? void 0 : r.batteryVoltage) || 12.6, 'V'],
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                    (0, C.jsxs)(u.default, {
                      style: Xe.quickActions,
                      children: [
                        (0, C.jsx)(f.default, {
                          style: Xe.sectionTitle,
                          children: '\ube60\ub978 \uc561\uc158',
                        }),
                        (0, C.jsxs)(u.default, {
                          style: Xe.actionGrid,
                          children: [
                            (0, C.jsxs)(L.default, {
                              style: [Xe.actionButton, { backgroundColor: '#EF4444' }],
                              onPress: function () {
                                return K('emergency');
                              },
                              children: [
                                (0, C.jsx)(me.default, {
                                  name: 'warning',
                                  size: 24,
                                  color: '#FFFFFF',
                                }),
                                (0, C.jsx)(f.default, {
                                  style: Xe.actionText,
                                  children: '\uae34\uae09\ucd9c\ub3d9',
                                }),
                              ],
                            }),
                            (0, C.jsxs)(L.default, {
                              style: [Xe.actionButton, { backgroundColor: '#10B981' }],
                              onPress: function () {
                                return K('workshop');
                              },
                              children: [
                                (0, C.jsx)(me.default, {
                                  name: 'location',
                                  size: 24,
                                  color: '#FFFFFF',
                                }),
                                (0, C.jsx)(f.default, {
                                  style: Xe.actionText,
                                  children: '\uc815\ube44\uc18c \ucc3e\uae30',
                                }),
                              ],
                            }),
                            (0, C.jsxs)(L.default, {
                              style: [Xe.actionButton, { backgroundColor: '#6366F1' }],
                              onPress: function () {
                                return K('diagnosis');
                              },
                              children: [
                                (0, C.jsx)(me.default, {
                                  name: 'analytics',
                                  size: 24,
                                  color: '#FFFFFF',
                                }),
                                (0, C.jsx)(f.default, {
                                  style: Xe.actionText,
                                  children: '\ucc28\ub7c9\uc9c4\ub2e8',
                                }),
                              ],
                            }),
                            (0, C.jsxs)(L.default, {
                              style: [Xe.actionButton, { backgroundColor: '#8B5CF6' }],
                              onPress: function () {
                                return K('navigation');
                              },
                              children: [
                                (0, C.jsx)(me.default, {
                                  name: 'navigate',
                                  size: 24,
                                  color: '#FFFFFF',
                                }),
                                (0, C.jsx)(f.default, {
                                  style: Xe.actionText,
                                  children: '\ub124\ube44\uac8c\uc774\uc158',
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                    g.length > 0 &&
                      (0, C.jsxs)(u.default, {
                        style: Xe.alertsSection,
                        children: [
                          (0, C.jsx)(f.default, {
                            style: Xe.sectionTitle,
                            children: '\uc815\ube44 \uc54c\ub9bc',
                          }),
                          g.map(function (e, t) {
                            return (0, C.jsxs)(
                              L.default,
                              {
                                style: Xe.alertCard,
                                children: [
                                  (0, C.jsx)(me.default, {
                                    name: e.icon,
                                    size: 20,
                                    color: e.color,
                                  }),
                                  (0, C.jsxs)(u.default, {
                                    style: Xe.alertContent,
                                    children: [
                                      (0, C.jsx)(f.default, {
                                        style: Xe.alertMessage,
                                        children: e.message,
                                      }),
                                      (0, C.jsx)(f.default, {
                                        style: [Xe.alertType, { color: e.color }],
                                        children:
                                          'urgent' === e.type
                                            ? '\uae34\uae09'
                                            : 'recommended' === e.type
                                              ? '\uad8c\uc7a5'
                                              : '\uc815\uae30\uc810\uac80',
                                      }),
                                    ],
                                  }),
                                  (0, C.jsx)(me.default, {
                                    name: 'chevron-forward',
                                    size: 16,
                                    color: '#9CA3AF',
                                  }),
                                ],
                              },
                              t
                            );
                          }),
                        ],
                      }),
                    (0, C.jsxs)(L.default, {
                      style: Xe.navigationPreview,
                      onPress: function () {
                        return e.navigate('Navigation');
                      },
                      children: [
                        (0, C.jsxs)(u.default, {
                          style: Xe.navHeader,
                          children: [
                            (0, C.jsx)(me.default, { name: 'map', size: 24, color: '#6366F1' }),
                            (0, C.jsx)(f.default, {
                              style: Xe.navTitle,
                              children: '\uc2a4\ub9c8\ud2b8 \ub124\ube44\uac8c\uc774\uc158',
                            }),
                            (0, C.jsx)(me.default, {
                              name: 'chevron-forward',
                              size: 20,
                              color: '#9CA3AF',
                            }),
                          ],
                        }),
                        (0, C.jsx)(f.default, {
                          style: Xe.navDescription,
                          children:
                            '\uc2e4\uc2dc\uac04 \uad50\ud1b5\uc815\ubcf4\uc640 \ucd5c\uc801 \uacbd\ub85c\ub97c \uc81c\uacf5\ud569\ub2c8\ub2e4',
                        }),
                      ],
                    }),
                  ],
                }),
              });
        }
        var Xe = g.default.create({
          container: { flex: 1, backgroundColor: '#F9FAFB' },
          scrollView: { flex: 1 },
          loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
          loadingText: { marginTop: 16, fontSize: 16, color: '#6B7280' },
          header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 16,
            backgroundColor: '#FFFFFF',
          },
          locationContainer: { flexDirection: 'row', alignItems: 'center' },
          locationText: { marginLeft: 8, fontSize: 16, fontWeight: '500', color: '#1F2937' },
          settingsButton: { padding: 8 },
          mainStatusCard: {
            margin: 20,
            padding: 24,
            borderRadius: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          },
          statusHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          },
          statusTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
          connectionStatus: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
          connectionText: { fontSize: 12, fontWeight: 'bold', color: '#FFFFFF' },
          statusGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
          statusItem: { width: '48%', alignItems: 'center', marginBottom: 16 },
          statusLabel: { fontSize: 12, color: '#E5E7EB', marginTop: 8 },
          statusValue: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', marginTop: 4 },
          quickActions: { paddingHorizontal: 20, marginBottom: 24 },
          sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 16 },
          actionGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
          actionButton: {
            width: '48%',
            aspectRatio: 1.5,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 12,
          },
          actionText: { marginTop: 8, fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
          alertsSection: { paddingHorizontal: 20, marginBottom: 24 },
          alertCard: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
            padding: 16,
            borderRadius: 12,
            marginBottom: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          },
          alertContent: { flex: 1, marginLeft: 12 },
          alertMessage: { fontSize: 14, color: '#1F2937', marginBottom: 4 },
          alertType: { fontSize: 12, fontWeight: '600' },
          navigationPreview: {
            marginHorizontal: 20,
            marginBottom: 24,
            backgroundColor: '#FFFFFF',
            padding: 20,
            borderRadius: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          },
          navHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
          navTitle: { flex: 1, marginLeft: 12, fontSize: 16, fontWeight: '600', color: '#1F2937' },
          navDescription: { fontSize: 14, color: '#6B7280' },
        });
        y.setNotificationHandler({
          handleNotification: (function () {
            var e = (0, o.default)(function* () {
              return { shouldShowAlert: !0, shouldPlaySound: !0, shouldSetBadge: !0 };
            });
            return function () {
              return e.apply(this, arguments);
            };
          })(),
        });
        var $e = new m.QueryClient({ defaultOptions: { queries: { retry: 2, staleTime: 3e5 } } }),
          Ye = (0, l.default)(),
          Ze = (0, l.default)(),
          et = (0, s.default)();
        function tt() {
          return (0, C.jsxs)(Ze.Navigator, {
            screenOptions: { headerShown: !1 },
            children: [
              (0, C.jsx)(Ze.Screen, { name: 'Welcome', component: R }),
              (0, C.jsx)(Ze.Screen, { name: 'Login', component: M }),
              (0, C.jsx)(Ze.Screen, { name: 'Signup', component: K }),
            ],
          });
        }
        function nt() {
          return (0, C.jsxs)(et.Navigator, {
            screenOptions: function (e) {
              var t = e.route;
              return {
                tabBarIcon: function (e) {
                  var n = e.color,
                    r = e.size,
                    o = 'home';
                  return (
                    '\ub124\ube44\uac8c\uc774\uc158' === t.name
                      ? (o = 'map')
                      : '\uc11c\ube44\uc2a4\ud5c8\ube0c' === t.name
                        ? (o = 'settings')
                        : '\ucc28\ub7c9\uad00\ub9ac' === t.name
                          ? (o = 'truck')
                          : '\ud504\ub85c\ud544' === t.name && (o = 'user'),
                    (0, C.jsx)(d.default, { name: o, size: r, color: n })
                  );
                },
                tabBarActiveTintColor: '#6366F1',
                tabBarInactiveTintColor: '#6B7280',
                headerStyle: {
                  backgroundColor: '#FFFFFF',
                  elevation: 0,
                  shadowOpacity: 0,
                  borderBottomWidth: 1,
                  borderBottomColor: '#E5E7EB',
                },
                headerTintColor: '#1F2937',
                headerTitleStyle: { fontWeight: 'bold' },
              };
            },
            children: [
              (0, C.jsx)(et.Screen, {
                name: '\ub124\ube44\uac8c\uc774\uc158',
                component: Qe,
                options: { headerTitle: '\uc2a4\ub9c8\ud2b8 \uce74 \ud50c\ub7ab\ud3fc' },
              }),
              (0, C.jsx)(et.Screen, {
                name: '\uc11c\ube44\uc2a4\ud5c8\ube0c',
                component: De,
                options: { headerTitle: '\uc11c\ube44\uc2a4 \ud5c8\ube0c' },
              }),
              (0, C.jsx)(et.Screen, {
                name: '\ucc28\ub7c9\uad00\ub9ac',
                component: Q,
                options: { headerTitle: '\ub0b4 \ucc28\ub7c9' },
              }),
              (0, C.jsx)(et.Screen, {
                name: '\ud504\ub85c\ud544',
                component: $,
                options: { headerTitle: '\ub0b4 \uc815\ubcf4' },
              }),
            ],
          });
        }
        function rt() {
          return (0, C.jsxs)(u.default, {
            style: it.loadingContainer,
            children: [
              (0, C.jsx)(h.default, { size: 'large', color: '#6366F1' }),
              (0, C.jsx)(f.default, { style: it.loadingText, children: '\ub85c\ub529 \uc911...' }),
            ],
          });
        }
        function ot() {
          var e = B().isLoading;
          return (
            (0, i.useEffect)(function () {
              var e = (function () {
                var e = (0, o.default)(function* () {
                  try {
                    var e = (yield p.getPermissionsAsync()).status;
                    if ('granted' !== e && 'denied' !== e)
                      'granted' !== (yield p.requestPermissionsAsync()).status &&
                        console.warn('Notification permissions not granted');
                    else
                      'denied' === e &&
                        console.warn('Notification permissions were previously denied');
                  } catch (t) {
                    console.error('Error requesting notification permissions:', t);
                  }
                });
                return function () {
                  return e.apply(this, arguments);
                };
              })();
              e();
            }, []),
            e
              ? (0, C.jsx)(rt, {})
              : (0, C.jsxs)(Ye.Navigator, {
                  screenOptions: { headerShown: !1, cardStyle: { backgroundColor: 'white' } },
                  children: [
                    (0, C.jsx)(Ye.Screen, { name: 'Main', component: nt }),
                    (0, C.jsx)(Ye.Screen, { name: 'Auth', component: tt }),
                    (0, C.jsx)(Ye.Screen, {
                      name: 'VehicleDetail',
                      component: Z,
                      options: {
                        headerShown: !0,
                        title: '\ucc28\ub7c9 \uc0c1\uc138',
                        headerBackTitle: '\ub4a4\ub85c',
                      },
                    }),
                    (0, C.jsx)(Ye.Screen, {
                      name: 'AddVehicle',
                      component: te,
                      options: {
                        headerShown: !0,
                        title: '\ucc28\ub7c9 \ub4f1\ub85d',
                        headerBackTitle: '\ub4a4\ub85c',
                      },
                    }),
                    (0, C.jsx)(Ye.Screen, {
                      name: 'WorkshopList',
                      component: re,
                      options: {
                        headerShown: !0,
                        title: '\uc815\ube44\uc18c \uc120\ud0dd',
                        headerBackTitle: '\ub4a4\ub85c',
                      },
                    }),
                    (0, C.jsx)(Ye.Screen, {
                      name: 'BookingDetail',
                      component: ie,
                      options: {
                        headerShown: !0,
                        title: '\uc608\uc57d \uc0c1\uc138',
                        headerBackTitle: '\ub4a4\ub85c',
                      },
                    }),
                    (0, C.jsx)(Ye.Screen, {
                      name: 'ServiceHistory',
                      component: le,
                      options: {
                        headerShown: !0,
                        title: '\uc815\ube44 \uc774\ub825',
                        headerBackTitle: '\ub4a4\ub85c',
                      },
                    }),
                    (0, C.jsx)(Ye.Screen, {
                      name: 'Notifications',
                      component: ce,
                      options: {
                        headerShown: !0,
                        title: '\uc54c\ub9bc',
                        headerBackTitle: '\ub4a4\ub85c',
                      },
                    }),
                    (0, C.jsx)(Ye.Screen, {
                      name: 'LiveTracking',
                      component: ue,
                      options: {
                        headerShown: !0,
                        title: '\uc2e4\uc2dc\uac04 \ucd94\uc801',
                        headerBackTitle: '\ub4a4\ub85c',
                      },
                    }),
                    (0, C.jsx)(Ye.Screen, {
                      name: 'Navigation',
                      component: ve,
                      options: {
                        headerShown: !0,
                        title: '\uc2a4\ub9c8\ud2b8 \ub124\ube44\uac8c\uc774\uc158',
                        headerBackTitle: '\ub4a4\ub85c',
                      },
                    }),
                    (0, C.jsx)(Ye.Screen, {
                      name: 'EmergencyService',
                      component: Ee,
                      options: {
                        headerShown: !0,
                        title: '\uae34\uae09 \uc11c\ube44\uc2a4',
                        headerBackTitle: '\ub4a4\ub85c',
                      },
                    }),
                    (0, C.jsx)(Ye.Screen, {
                      name: 'MapDetail',
                      component: Re,
                      options: {
                        headerShown: !0,
                        title: '\uc9c0\ub3c4 \uc0c1\uc138',
                        headerBackTitle: '\ub4a4\ub85c',
                      },
                    }),
                    (0, C.jsx)(Ye.Screen, {
                      name: 'SmartDiagnosis',
                      component: Ve,
                      options: {
                        headerShown: !0,
                        title: '\uc2a4\ub9c8\ud2b8 \uc9c4\ub2e8',
                        headerBackTitle: '\ub4a4\ub85c',
                      },
                    }),
                    (0, C.jsx)(Ye.Screen, {
                      name: 'MaintenanceBooking',
                      component: Me,
                      options: {
                        headerShown: !0,
                        title: '\uc815\ube44 \uc608\uc57d',
                        headerBackTitle: '\ub4a4\ub85c',
                      },
                    }),
                    (0, C.jsx)(Ye.Screen, {
                      name: 'WorkshopSearch',
                      component: qe,
                      options: {
                        headerShown: !0,
                        title: '\uc815\ube44\uc18c \uac80\uc0c9',
                        headerBackTitle: '\ub4a4\ub85c',
                      },
                    }),
                    (0, C.jsx)(Ye.Screen, {
                      name: 'MaintenanceHistory',
                      component: Ue,
                      options: {
                        headerShown: !0,
                        title: '\uc815\ube44 \uc774\ub825',
                        headerBackTitle: '\ub4a4\ub85c',
                      },
                    }),
                  ],
                })
          );
        }
        var it = g.default.create({
          loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#F9FAFB',
          },
          loadingText: { marginTop: 16, fontSize: 16, color: '#6B7280' },
        });
        (0, r.default)(function () {
          return (0, C.jsx)(x.QueryClientProvider, {
            client: $e,
            children: (0, C.jsx)(D, {
              children: (0, C.jsxs)(a.default, {
                children: [(0, C.jsx)(ot, {}), (0, C.jsx)(c.default, { style: 'auto' })],
              }),
            }),
          });
        });
      },
    },
    t = {};
  function n(r) {
    var o = t[r];
    if (void 0 !== o) return o.exports;
    var i = (t[r] = { id: r, loaded: !1, exports: {} });
    return e[r].call(i.exports, i, i.exports, n), (i.loaded = !0), i.exports;
  }
  (n.m = e),
    (() => {
      var e = [];
      n.O = (t, r, o, i) => {
        if (!r) {
          var a = 1 / 0;
          for (d = 0; d < e.length; d++) {
            for (var [r, o, i] = e[d], l = !0, s = 0; s < r.length; s++)
              (!1 & i || a >= i) && Object.keys(n.O).every(e => n.O[e](r[s]))
                ? r.splice(s--, 1)
                : ((l = !1), i < a && (a = i));
            if (l) {
              e.splice(d--, 1);
              var c = o();
              void 0 !== c && (t = c);
            }
          }
          return t;
        }
        i = i || 0;
        for (var d = e.length; d > 0 && e[d - 1][2] > i; d--) e[d] = e[d - 1];
        e[d] = [r, o, i];
      };
    })(),
    (n.n = e => {
      var t = e && e.__esModule ? () => e.default : () => e;
      return n.d(t, { a: t }), t;
    }),
    (n.d = (e, t) => {
      for (var r in t)
        n.o(t, r) && !n.o(e, r) && Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
    }),
    (n.g = (function () {
      if ('object' === typeof globalThis) return globalThis;
      try {
        return this || new Function('return this')();
      } catch (e) {
        if ('object' === typeof window) return window;
      }
    })()),
    (n.o = (e, t) => Object.prototype.hasOwnProperty.call(e, t)),
    (n.r = e => {
      'undefined' !== typeof Symbol &&
        Symbol.toStringTag &&
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' }),
        Object.defineProperty(e, '__esModule', { value: !0 });
    }),
    (n.nmd = e => ((e.paths = []), e.children || (e.children = []), e)),
    (n.p = '/'),
    (() => {
      var e = { 792: 0 };
      n.O.j = t => 0 === e[t];
      var t = (t, r) => {
          var o,
            i,
            [a, l, s] = r,
            c = 0;
          if (a.some(t => 0 !== e[t])) {
            for (o in l) n.o(l, o) && (n.m[o] = l[o]);
            if (s) var d = s(n);
          }
          for (t && t(r); c < a.length; c++) (i = a[c]), n.o(e, i) && e[i] && e[i][0](), (e[i] = 0);
          return n.O(d);
        },
        r = (self.webpackChunkweb = self.webpackChunkweb || []);
      r.forEach(t.bind(null, 0)), (r.push = t.bind(null, r.push.bind(r)));
    })();
  var r = n.O(void 0, [552], () => n(7010));
  r = n.O(r);
})();
//# sourceMappingURL=main.484b4bb1.js.map
