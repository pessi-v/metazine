/*!
 * ONNX Runtime Web v1.20.1
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
var Hd = Object.create;
var an = Object.defineProperty;
var qd = Object.getOwnPropertyDescriptor;
var jd = Object.getOwnPropertyNames;
var Xd = Object.getPrototypeOf,
  Kd = Object.prototype.hasOwnProperty;
var Co = ((i) =>
  typeof require < "u"
    ? require
    : typeof Proxy < "u"
    ? new Proxy(i, { get: (e, o) => (typeof require < "u" ? require : e)[o] })
    : i)(function (i) {
  if (typeof require < "u") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + i + '" is not supported');
});
var O = (i, e) => () => (i && (e = i((i = 0))), e);
var mt = (i, e) => () => (e || i((e = { exports: {} }).exports, e), e.exports),
  Or = (i, e) => {
    for (var o in e) an(i, o, { get: e[o], enumerable: !0 });
  },
  Qa = (i, e, o, t) => {
    if ((e && typeof e == "object") || typeof e == "function")
      for (let r of jd(e))
        !Kd.call(i, r) &&
          r !== o &&
          an(i, r, {
            get: () => e[r],
            enumerable: !(t = qd(e, r)) || t.enumerable,
          });
    return i;
  };
var rr = (i, e, o) => (
    (o = i != null ? Hd(Xd(i)) : {}),
    Qa(
      e || !i || !i.__esModule
        ? an(o, "default", { value: i, enumerable: !0 })
        : o,
      i
    )
  ),
  sn = (i) => Qa(an({}, "__esModule", { value: !0 }), i);
var un,
  ke,
  nr,
  Jd,
  ln,
  fn = O(() => {
    "use strict";
    (un = new Map()),
      (ke = []),
      (nr = (i, e, o) => {
        if (
          e &&
          typeof e.init == "function" &&
          typeof e.createInferenceSessionHandler == "function"
        ) {
          let t = un.get(i);
          if (t === void 0) un.set(i, { backend: e, priority: o });
          else {
            if (t.priority > o) return;
            if (t.priority === o && t.backend !== e)
              throw new Error(
                `cannot register backend "${i}" using priority ${o}`
              );
          }
          if (o >= 0) {
            let r = ke.indexOf(i);
            r !== -1 && ke.splice(r, 1);
            for (let n = 0; n < ke.length; n++)
              if (un.get(ke[n]).priority <= o) {
                ke.splice(n, 0, i);
                return;
              }
            ke.push(i);
          }
          return;
        }
        throw new TypeError("not a valid backend");
      }),
      (Jd = async (i) => {
        let e = un.get(i);
        if (!e) return "backend not found.";
        if (e.initialized) return e.backend;
        if (e.aborted) return e.error;
        {
          let o = !!e.initPromise;
          try {
            return (
              o || (e.initPromise = e.backend.init(i)),
              await e.initPromise,
              (e.initialized = !0),
              e.backend
            );
          } catch (t) {
            return o || ((e.error = `${t}`), (e.aborted = !0)), e.error;
          } finally {
            delete e.initPromise;
          }
        }
      }),
      (ln = async (i) => {
        let e = i.executionProviders || [],
          o = e.map((u) => (typeof u == "string" ? u : u.name)),
          t = o.length === 0 ? ke : o,
          r,
          n = [],
          s = new Set();
        for (let u of t) {
          let l = await Jd(u);
          typeof l == "string"
            ? n.push({ name: u, err: l })
            : (r || (r = l), r === l && s.add(u));
        }
        if (!r)
          throw new Error(
            `no available backend found. ERR: ${n
              .map((u) => `[${u.name}] ${u.err}`)
              .join(", ")}`
          );
        for (let { name: u, err: l } of n)
          o.includes(u) &&
            console.warn(
              `removing requested execution provider "${u}" from session options because it is not available: ${l}`
            );
        let a = e.filter((u) => s.has(typeof u == "string" ? u : u.name));
        return [
          r,
          new Proxy(i, {
            get: (u, l) => (l === "executionProviders" ? a : Reflect.get(u, l)),
          }),
        ];
      });
  });
var ts = O(() => {
  "use strict";
  fn();
});
var es,
  rs = O(() => {
    "use strict";
    es = "1.20.1";
  });
var ns,
  Gt,
  No = O(() => {
    "use strict";
    rs();
    (ns = "warning"),
      (Gt = {
        wasm: {},
        webgl: {},
        webgpu: {},
        versions: { common: es },
        set logLevel(i) {
          if (i !== void 0) {
            if (
              typeof i != "string" ||
              ["verbose", "info", "warning", "error", "fatal"].indexOf(i) === -1
            )
              throw new Error(`Unsupported logging level: ${i}`);
            ns = i;
          }
        },
        get logLevel() {
          return ns;
        },
      });
    Object.defineProperty(Gt, "logLevel", { enumerable: !0 });
  });
var z,
  os = O(() => {
    "use strict";
    No();
    z = Gt;
  });
var is,
  as,
  ss = O(() => {
    "use strict";
    (is = (i, e) => {
      let o =
        typeof document < "u"
          ? document.createElement("canvas")
          : new OffscreenCanvas(1, 1);
      (o.width = i.dims[3]), (o.height = i.dims[2]);
      let t = o.getContext("2d");
      if (t != null) {
        let r, n;
        e?.tensorLayout !== void 0 && e.tensorLayout === "NHWC"
          ? ((r = i.dims[2]), (n = i.dims[3]))
          : ((r = i.dims[3]), (n = i.dims[2]));
        let s = e?.format !== void 0 ? e.format : "RGB",
          a = e?.norm,
          u,
          l;
        a === void 0 || a.mean === void 0
          ? (u = [255, 255, 255, 255])
          : typeof a.mean == "number"
          ? (u = [a.mean, a.mean, a.mean, a.mean])
          : ((u = [a.mean[0], a.mean[1], a.mean[2], 0]),
            a.mean[3] !== void 0 && (u[3] = a.mean[3])),
          a === void 0 || a.bias === void 0
            ? (l = [0, 0, 0, 0])
            : typeof a.bias == "number"
            ? (l = [a.bias, a.bias, a.bias, a.bias])
            : ((l = [a.bias[0], a.bias[1], a.bias[2], 0]),
              a.bias[3] !== void 0 && (l[3] = a.bias[3]));
        let f = n * r,
          p = 0,
          d = f,
          y = f * 2,
          T = -1;
        s === "RGBA"
          ? ((p = 0), (d = f), (y = f * 2), (T = f * 3))
          : s === "RGB"
          ? ((p = 0), (d = f), (y = f * 2))
          : s === "RBG" && ((p = 0), (y = f), (d = f * 2));
        for (let v = 0; v < n; v++)
          for (let S = 0; S < r; S++) {
            let L = (i.data[p++] - l[0]) * u[0],
              P = (i.data[d++] - l[1]) * u[1],
              A = (i.data[y++] - l[2]) * u[2],
              M = T === -1 ? 255 : (i.data[T++] - l[3]) * u[3];
            (t.fillStyle = "rgba(" + L + "," + P + "," + A + "," + M + ")"),
              t.fillRect(S, v, 1, 1);
          }
        if ("toDataURL" in o) return o.toDataURL();
        throw new Error("toDataURL is not supported");
      } else throw new Error("Can not access image data");
    }),
      (as = (i, e) => {
        let o =
            typeof document < "u"
              ? document.createElement("canvas").getContext("2d")
              : new OffscreenCanvas(1, 1).getContext("2d"),
          t;
        if (o != null) {
          let r, n, s;
          e?.tensorLayout !== void 0 && e.tensorLayout === "NHWC"
            ? ((r = i.dims[2]), (n = i.dims[1]), (s = i.dims[3]))
            : ((r = i.dims[3]), (n = i.dims[2]), (s = i.dims[1]));
          let a = e !== void 0 && e.format !== void 0 ? e.format : "RGB",
            u = e?.norm,
            l,
            f;
          u === void 0 || u.mean === void 0
            ? (l = [255, 255, 255, 255])
            : typeof u.mean == "number"
            ? (l = [u.mean, u.mean, u.mean, u.mean])
            : ((l = [u.mean[0], u.mean[1], u.mean[2], 255]),
              u.mean[3] !== void 0 && (l[3] = u.mean[3])),
            u === void 0 || u.bias === void 0
              ? (f = [0, 0, 0, 0])
              : typeof u.bias == "number"
              ? (f = [u.bias, u.bias, u.bias, u.bias])
              : ((f = [u.bias[0], u.bias[1], u.bias[2], 0]),
                u.bias[3] !== void 0 && (f[3] = u.bias[3]));
          let p = n * r;
          if (
            e !== void 0 &&
            ((e.format !== void 0 && s === 4 && e.format !== "RGBA") ||
              (s === 3 && e.format !== "RGB" && e.format !== "BGR"))
          )
            throw new Error("Tensor format doesn't match input tensor dims");
          let d = 4,
            y = 0,
            T = 1,
            v = 2,
            S = 3,
            L = 0,
            P = p,
            A = p * 2,
            M = -1;
          a === "RGBA"
            ? ((L = 0), (P = p), (A = p * 2), (M = p * 3))
            : a === "RGB"
            ? ((L = 0), (P = p), (A = p * 2))
            : a === "RBG" && ((L = 0), (A = p), (P = p * 2)),
            (t = o.createImageData(r, n));
          for (let V = 0; V < n * r; y += d, T += d, v += d, S += d, V++)
            (t.data[y] = (i.data[L++] - f[0]) * l[0]),
              (t.data[T] = (i.data[P++] - f[1]) * l[1]),
              (t.data[v] = (i.data[A++] - f[2]) * l[2]),
              (t.data[S] = M === -1 ? 255 : (i.data[M++] - f[3]) * l[3]);
        } else throw new Error("Can not access image data");
        return t;
      });
  });
var Ro,
  us,
  ls,
  fs,
  cs,
  ps,
  ds = O(() => {
    "use strict";
    cn();
    (Ro = (i, e) => {
      if (i === void 0) throw new Error("Image buffer must be defined");
      if (e.height === void 0 || e.width === void 0)
        throw new Error("Image height and width must be defined");
      if (e.tensorLayout === "NHWC")
        throw new Error("NHWC Tensor layout is not supported yet");
      let { height: o, width: t } = e,
        r = e.norm ?? { mean: 255, bias: 0 },
        n,
        s;
      typeof r.mean == "number"
        ? (n = [r.mean, r.mean, r.mean, r.mean])
        : (n = [r.mean[0], r.mean[1], r.mean[2], r.mean[3] ?? 255]),
        typeof r.bias == "number"
          ? (s = [r.bias, r.bias, r.bias, r.bias])
          : (s = [r.bias[0], r.bias[1], r.bias[2], r.bias[3] ?? 0]);
      let a = e.format !== void 0 ? e.format : "RGBA",
        u =
          e.tensorFormat !== void 0 && e.tensorFormat !== void 0
            ? e.tensorFormat
            : "RGB",
        l = o * t,
        f = u === "RGBA" ? new Float32Array(l * 4) : new Float32Array(l * 3),
        p = 4,
        d = 0,
        y = 1,
        T = 2,
        v = 3,
        S = 0,
        L = l,
        P = l * 2,
        A = -1;
      a === "RGB" && ((p = 3), (d = 0), (y = 1), (T = 2), (v = -1)),
        u === "RGBA"
          ? (A = l * 3)
          : u === "RBG"
          ? ((S = 0), (P = l), (L = l * 2))
          : u === "BGR" && ((P = 0), (L = l), (S = l * 2));
      for (let V = 0; V < l; V++, d += p, T += p, y += p, v += p)
        (f[S++] = (i[d] + s[0]) / n[0]),
          (f[L++] = (i[y] + s[1]) / n[1]),
          (f[P++] = (i[T] + s[2]) / n[2]),
          A !== -1 && v !== -1 && (f[A++] = (i[v] + s[3]) / n[3]);
      return u === "RGBA"
        ? new St("float32", f, [1, 4, o, t])
        : new St("float32", f, [1, 3, o, t]);
    }),
      (us = async (i, e) => {
        let o = typeof HTMLImageElement < "u" && i instanceof HTMLImageElement,
          t = typeof ImageData < "u" && i instanceof ImageData,
          r = typeof ImageBitmap < "u" && i instanceof ImageBitmap,
          n = typeof i == "string",
          s,
          a = e ?? {},
          u = () => {
            if (typeof document < "u") return document.createElement("canvas");
            if (typeof OffscreenCanvas < "u") return new OffscreenCanvas(1, 1);
            throw new Error("Canvas is not supported");
          },
          l = (f) =>
            (typeof HTMLCanvasElement < "u" &&
              f instanceof HTMLCanvasElement) ||
            f instanceof OffscreenCanvas
              ? f.getContext("2d")
              : null;
        if (o) {
          let f = u();
          (f.width = i.width), (f.height = i.height);
          let p = l(f);
          if (p != null) {
            let d = i.height,
              y = i.width;
            if (
              (e !== void 0 &&
                e.resizedHeight !== void 0 &&
                e.resizedWidth !== void 0 &&
                ((d = e.resizedHeight), (y = e.resizedWidth)),
              e !== void 0)
            ) {
              if (((a = e), e.tensorFormat !== void 0))
                throw new Error(
                  "Image input config format must be RGBA for HTMLImageElement"
                );
              (a.tensorFormat = "RGBA"), (a.height = d), (a.width = y);
            } else (a.tensorFormat = "RGBA"), (a.height = d), (a.width = y);
            p.drawImage(i, 0, 0), (s = p.getImageData(0, 0, y, d).data);
          } else throw new Error("Can not access image data");
        } else if (t) {
          let f, p;
          if (
            (e !== void 0 &&
            e.resizedWidth !== void 0 &&
            e.resizedHeight !== void 0
              ? ((f = e.resizedHeight), (p = e.resizedWidth))
              : ((f = i.height), (p = i.width)),
            e !== void 0 && (a = e),
            (a.format = "RGBA"),
            (a.height = f),
            (a.width = p),
            e !== void 0)
          ) {
            let d = u();
            (d.width = p), (d.height = f);
            let y = l(d);
            if (y != null)
              y.putImageData(i, 0, 0), (s = y.getImageData(0, 0, p, f).data);
            else throw new Error("Can not access image data");
          } else s = i.data;
        } else if (r) {
          if (e === void 0)
            throw new Error(
              "Please provide image config with format for Imagebitmap"
            );
          let f = u();
          (f.width = i.width), (f.height = i.height);
          let p = l(f);
          if (p != null) {
            let d = i.height,
              y = i.width;
            return (
              p.drawImage(i, 0, 0, y, d),
              (s = p.getImageData(0, 0, y, d).data),
              (a.height = d),
              (a.width = y),
              Ro(s, a)
            );
          } else throw new Error("Can not access image data");
        } else {
          if (n)
            return new Promise((f, p) => {
              let d = u(),
                y = l(d);
              if (!i || !y) return p();
              let T = new Image();
              (T.crossOrigin = "Anonymous"),
                (T.src = i),
                (T.onload = () => {
                  (d.width = T.width),
                    (d.height = T.height),
                    y.drawImage(T, 0, 0, d.width, d.height);
                  let v = y.getImageData(0, 0, d.width, d.height);
                  (a.height = d.height), (a.width = d.width), f(Ro(v.data, a));
                });
            });
          throw new Error(
            "Input data provided is not supported - aborted tensor creation"
          );
        }
        if (s !== void 0) return Ro(s, a);
        throw new Error(
          "Input data provided is not supported - aborted tensor creation"
        );
      }),
      (ls = (i, e) => {
        let { width: o, height: t, download: r, dispose: n } = e,
          s = [1, t, o, 4];
        return new St({
          location: "texture",
          type: "float32",
          texture: i,
          dims: s,
          download: r,
          dispose: n,
        });
      }),
      (fs = (i, e) => {
        let { dataType: o, dims: t, download: r, dispose: n } = e;
        return new St({
          location: "gpu-buffer",
          type: o ?? "float32",
          gpuBuffer: i,
          dims: t,
          download: r,
          dispose: n,
        });
      }),
      (cs = (i, e) => {
        let { dataType: o, dims: t, download: r, dispose: n } = e;
        return new St({
          location: "ml-tensor",
          type: o ?? "float32",
          mlTensor: i,
          dims: t,
          download: r,
          dispose: n,
        });
      }),
      (ps = (i, e, o) =>
        new St({
          location: "cpu-pinned",
          type: i,
          data: e,
          dims: o ?? [e.length],
        }));
  });
var Be,
  Sr,
  hs,
  ms,
  bs = O(() => {
    "use strict";
    (Be = new Map([
      ["float32", Float32Array],
      ["uint8", Uint8Array],
      ["int8", Int8Array],
      ["uint16", Uint16Array],
      ["int16", Int16Array],
      ["int32", Int32Array],
      ["bool", Uint8Array],
      ["float64", Float64Array],
      ["uint32", Uint32Array],
      ["int4", Uint8Array],
      ["uint4", Uint8Array],
    ])),
      (Sr = new Map([
        [Float32Array, "float32"],
        [Uint8Array, "uint8"],
        [Int8Array, "int8"],
        [Uint16Array, "uint16"],
        [Int16Array, "int16"],
        [Int32Array, "int32"],
        [Float64Array, "float64"],
        [Uint32Array, "uint32"],
      ])),
      (hs = !1),
      (ms = () => {
        if (!hs) {
          hs = !0;
          let i = typeof BigInt64Array < "u" && BigInt64Array.from,
            e = typeof BigUint64Array < "u" && BigUint64Array.from,
            o = typeof Float16Array < "u" && Float16Array.from;
          i && (Be.set("int64", BigInt64Array), Sr.set(BigInt64Array, "int64")),
            e &&
              (Be.set("uint64", BigUint64Array),
              Sr.set(BigUint64Array, "uint64")),
            o
              ? (Be.set("float16", Float16Array),
                Sr.set(Float16Array, "float16"))
              : Be.set("float16", Uint16Array);
        }
      });
  });
var gs,
  ys,
  xs = O(() => {
    "use strict";
    cn();
    (gs = (i) => {
      let e = 1;
      for (let o = 0; o < i.length; o++) {
        let t = i[o];
        if (typeof t != "number" || !Number.isSafeInteger(t))
          throw new TypeError(`dims[${o}] must be an integer, got: ${t}`);
        if (t < 0)
          throw new RangeError(
            `dims[${o}] must be a non-negative integer, got: ${t}`
          );
        e *= t;
      }
      return e;
    }),
      (ys = (i, e) => {
        switch (i.location) {
          case "cpu":
            return new St(i.type, i.data, e);
          case "cpu-pinned":
            return new St({
              location: "cpu-pinned",
              data: i.data,
              type: i.type,
              dims: e,
            });
          case "texture":
            return new St({
              location: "texture",
              texture: i.texture,
              type: i.type,
              dims: e,
            });
          case "gpu-buffer":
            return new St({
              location: "gpu-buffer",
              gpuBuffer: i.gpuBuffer,
              type: i.type,
              dims: e,
            });
          case "ml-tensor":
            return new St({
              location: "ml-tensor",
              mlTensor: i.mlTensor,
              type: i.type,
              dims: e,
            });
          default:
            throw new Error(
              `tensorReshape: tensor location ${i.location} is not supported`
            );
        }
      });
  });
var St,
  cn = O(() => {
    "use strict";
    ss();
    ds();
    bs();
    xs();
    St = class {
      constructor(e, o, t) {
        ms();
        let r, n;
        if (typeof e == "object" && "location" in e)
          switch (
            ((this.dataLocation = e.location),
            (r = e.type),
            (n = e.dims),
            e.location)
          ) {
            case "cpu-pinned": {
              let a = Be.get(r);
              if (!a)
                throw new TypeError(
                  `unsupported type "${r}" to create tensor from pinned buffer`
                );
              if (!(e.data instanceof a))
                throw new TypeError(`buffer should be of type ${a.name}`);
              this.cpuData = e.data;
              break;
            }
            case "texture": {
              if (r !== "float32")
                throw new TypeError(
                  `unsupported type "${r}" to create tensor from texture`
                );
              (this.gpuTextureData = e.texture),
                (this.downloader = e.download),
                (this.disposer = e.dispose);
              break;
            }
            case "gpu-buffer": {
              if (
                r !== "float32" &&
                r !== "float16" &&
                r !== "int32" &&
                r !== "int64" &&
                r !== "uint32" &&
                r !== "uint8" &&
                r !== "bool" &&
                r !== "uint4" &&
                r !== "int4"
              )
                throw new TypeError(
                  `unsupported type "${r}" to create tensor from gpu buffer`
                );
              (this.gpuBufferData = e.gpuBuffer),
                (this.downloader = e.download),
                (this.disposer = e.dispose);
              break;
            }
            case "ml-tensor": {
              if (
                r !== "float32" &&
                r !== "float16" &&
                r !== "int32" &&
                r !== "int64" &&
                r !== "uint32" &&
                r !== "uint64" &&
                r !== "int8" &&
                r !== "uint8" &&
                r !== "bool"
              )
                throw new TypeError(
                  `unsupported type "${r}" to create tensor from MLTensor`
                );
              (this.mlTensorData = e.mlTensor),
                (this.downloader = e.download),
                (this.disposer = e.dispose);
              break;
            }
            default:
              throw new Error(
                `Tensor constructor: unsupported location '${this.dataLocation}'`
              );
          }
        else {
          let a, u;
          if (typeof e == "string")
            if (((r = e), (u = t), e === "string")) {
              if (!Array.isArray(o))
                throw new TypeError(
                  "A string tensor's data must be a string array."
                );
              a = o;
            } else {
              let l = Be.get(e);
              if (l === void 0)
                throw new TypeError(`Unsupported tensor type: ${e}.`);
              if (Array.isArray(o)) {
                if (
                  (e === "float16" && l === Uint16Array) ||
                  e === "uint4" ||
                  e === "int4"
                )
                  throw new TypeError(
                    `Creating a ${e} tensor from number array is not supported. Please use ${l.name} as data.`
                  );
                e === "uint64" || e === "int64"
                  ? (a = l.from(o, BigInt))
                  : (a = l.from(o));
              } else if (o instanceof l) a = o;
              else if (o instanceof Uint8ClampedArray)
                if (e === "uint8") a = Uint8Array.from(o);
                else
                  throw new TypeError(
                    "A Uint8ClampedArray tensor's data must be type of uint8"
                  );
              else
                throw new TypeError(
                  `A ${r} tensor's data must be type of ${l}`
                );
            }
          else if (((u = o), Array.isArray(e))) {
            if (e.length === 0)
              throw new TypeError(
                "Tensor type cannot be inferred from an empty array."
              );
            let l = typeof e[0];
            if (l === "string") (r = "string"), (a = e);
            else if (l === "boolean") (r = "bool"), (a = Uint8Array.from(e));
            else
              throw new TypeError(`Invalid element type of data array: ${l}.`);
          } else if (e instanceof Uint8ClampedArray)
            (r = "uint8"), (a = Uint8Array.from(e));
          else {
            let l = Sr.get(e.constructor);
            if (l === void 0)
              throw new TypeError(
                `Unsupported type for tensor data: ${e.constructor}.`
              );
            (r = l), (a = e);
          }
          if (u === void 0) u = [a.length];
          else if (!Array.isArray(u))
            throw new TypeError("A tensor's dims must be a number array");
          (n = u), (this.cpuData = a), (this.dataLocation = "cpu");
        }
        let s = gs(n);
        if (
          this.cpuData &&
          s !== this.cpuData.length &&
          !(
            (r === "uint4" || r === "int4") &&
            Math.ceil(s / 2) === this.cpuData.length
          )
        )
          throw new Error(
            `Tensor's size(${s}) does not match data length(${this.cpuData.length}).`
          );
        (this.type = r), (this.dims = n), (this.size = s);
      }
      static async fromImage(e, o) {
        return us(e, o);
      }
      static fromTexture(e, o) {
        return ls(e, o);
      }
      static fromGpuBuffer(e, o) {
        return fs(e, o);
      }
      static fromMLTensor(e, o) {
        return cs(e, o);
      }
      static fromPinnedBuffer(e, o, t) {
        return ps(e, o, t);
      }
      toDataURL(e) {
        return is(this, e);
      }
      toImageData(e) {
        return as(this, e);
      }
      get data() {
        if ((this.ensureValid(), !this.cpuData))
          throw new Error(
            "The data is not on CPU. Use `getData()` to download GPU data to CPU, or use `texture` or `gpuBuffer` property to access the GPU data directly."
          );
        return this.cpuData;
      }
      get location() {
        return this.dataLocation;
      }
      get texture() {
        if ((this.ensureValid(), !this.gpuTextureData))
          throw new Error("The data is not stored as a WebGL texture.");
        return this.gpuTextureData;
      }
      get gpuBuffer() {
        if ((this.ensureValid(), !this.gpuBufferData))
          throw new Error("The data is not stored as a WebGPU buffer.");
        return this.gpuBufferData;
      }
      get mlTensor() {
        if ((this.ensureValid(), !this.mlTensorData))
          throw new Error("The data is not stored as a WebNN MLTensor.");
        return this.mlTensorData;
      }
      async getData(e) {
        switch ((this.ensureValid(), this.dataLocation)) {
          case "cpu":
          case "cpu-pinned":
            return this.data;
          case "texture":
          case "gpu-buffer":
          case "ml-tensor": {
            if (!this.downloader)
              throw new Error(
                "The current tensor is not created with a specified data downloader."
              );
            if (this.isDownloading)
              throw new Error("The current tensor is being downloaded.");
            try {
              this.isDownloading = !0;
              let o = await this.downloader();
              return (
                (this.downloader = void 0),
                (this.dataLocation = "cpu"),
                (this.cpuData = o),
                e &&
                  this.disposer &&
                  (this.disposer(), (this.disposer = void 0)),
                o
              );
            } finally {
              this.isDownloading = !1;
            }
          }
          default:
            throw new Error(
              `cannot get data from location: ${this.dataLocation}`
            );
        }
      }
      dispose() {
        if (this.isDownloading)
          throw new Error("The current tensor is being downloaded.");
        this.disposer && (this.disposer(), (this.disposer = void 0)),
          (this.cpuData = void 0),
          (this.gpuTextureData = void 0),
          (this.gpuBufferData = void 0),
          (this.mlTensorData = void 0),
          (this.downloader = void 0),
          (this.isDownloading = void 0),
          (this.dataLocation = "none");
      }
      ensureValid() {
        if (this.dataLocation === "none")
          throw new Error("The tensor is disposed.");
      }
      reshape(e) {
        if ((this.ensureValid(), this.downloader || this.disposer))
          throw new Error("Cannot reshape a tensor that owns GPU resource.");
        return ys(this, e);
      }
    };
  });
var yt,
  pn = O(() => {
    "use strict";
    cn();
    yt = St;
  });
var Ts,
  ws,
  Fe,
  Ce,
  Go = O(() => {
    "use strict";
    No();
    (Ts = (i, e) => {
      (typeof Gt.trace > "u" ? !Gt.wasm.trace : !Gt.trace) ||
        console.timeStamp(`${i}::ORT::${e}`);
    }),
      (ws = (i, e) => {
        let o = new Error().stack?.split(/\r\n|\r|\n/g) || [],
          t = !1;
        for (let r = 0; r < o.length; r++) {
          if (t && !o[r].includes("TRACE_FUNC")) {
            let n = `FUNC_${i}::${o[r].trim().split(" ")[1]}`;
            e && (n += `::${e}`), Ts("CPU", n);
            return;
          }
          o[r].includes("TRACE_FUNC") && (t = !0);
        }
      }),
      (Fe = (i) => {
        (typeof Gt.trace > "u" ? !Gt.wasm.trace : !Gt.trace) || ws("BEGIN", i);
      }),
      (Ce = (i) => {
        (typeof Gt.trace > "u" ? !Gt.wasm.trace : !Gt.trace) || ws("END", i);
      });
  });
var dn,
  vs = O(() => {
    "use strict";
    fn();
    pn();
    Go();
    dn = class i {
      constructor(e) {
        this.handler = e;
      }
      async run(e, o, t) {
        Fe();
        let r = {},
          n = {};
        if (
          typeof e != "object" ||
          e === null ||
          e instanceof yt ||
          Array.isArray(e)
        )
          throw new TypeError(
            "'feeds' must be an object that use input names as keys and OnnxValue as corresponding values."
          );
        let s = !0;
        if (typeof o == "object") {
          if (o === null)
            throw new TypeError("Unexpected argument[1]: cannot be null.");
          if (o instanceof yt)
            throw new TypeError("'fetches' cannot be a Tensor");
          if (Array.isArray(o)) {
            if (o.length === 0)
              throw new TypeError("'fetches' cannot be an empty array.");
            s = !1;
            for (let l of o) {
              if (typeof l != "string")
                throw new TypeError(
                  "'fetches' must be a string array or an object."
                );
              if (this.outputNames.indexOf(l) === -1)
                throw new RangeError(
                  `'fetches' contains invalid output name: ${l}.`
                );
              r[l] = null;
            }
            if (typeof t == "object" && t !== null) n = t;
            else if (typeof t < "u")
              throw new TypeError("'options' must be an object.");
          } else {
            let l = !1,
              f = Object.getOwnPropertyNames(o);
            for (let p of this.outputNames)
              if (f.indexOf(p) !== -1) {
                let d = o[p];
                (d === null || d instanceof yt) &&
                  ((l = !0), (s = !1), (r[p] = d));
              }
            if (l) {
              if (typeof t == "object" && t !== null) n = t;
              else if (typeof t < "u")
                throw new TypeError("'options' must be an object.");
            } else n = o;
          }
        } else if (typeof o < "u")
          throw new TypeError(
            "Unexpected argument[1]: must be 'fetches' or 'options'."
          );
        for (let l of this.inputNames)
          if (typeof e[l] > "u")
            throw new Error(`input '${l}' is missing in 'feeds'.`);
        if (s) for (let l of this.outputNames) r[l] = null;
        let a = await this.handler.run(e, r, n),
          u = {};
        for (let l in a)
          if (Object.hasOwnProperty.call(a, l)) {
            let f = a[l];
            f instanceof yt
              ? (u[l] = f)
              : (u[l] = new yt(f.type, f.data, f.dims));
          }
        return Ce(), u;
      }
      async release() {
        return this.handler.dispose();
      }
      static async create(e, o, t, r) {
        Fe();
        let n,
          s = {};
        if (typeof e == "string") {
          if (((n = e), typeof o == "object" && o !== null)) s = o;
          else if (typeof o < "u")
            throw new TypeError("'options' must be an object.");
        } else if (e instanceof Uint8Array) {
          if (((n = e), typeof o == "object" && o !== null)) s = o;
          else if (typeof o < "u")
            throw new TypeError("'options' must be an object.");
        } else if (
          e instanceof ArrayBuffer ||
          (typeof SharedArrayBuffer < "u" && e instanceof SharedArrayBuffer)
        ) {
          let f = e,
            p = 0,
            d = e.byteLength;
          if (typeof o == "object" && o !== null) s = o;
          else if (typeof o == "number") {
            if (((p = o), !Number.isSafeInteger(p)))
              throw new RangeError("'byteOffset' must be an integer.");
            if (p < 0 || p >= f.byteLength)
              throw new RangeError(
                `'byteOffset' is out of range [0, ${f.byteLength}).`
              );
            if (((d = e.byteLength - p), typeof t == "number")) {
              if (((d = t), !Number.isSafeInteger(d)))
                throw new RangeError("'byteLength' must be an integer.");
              if (d <= 0 || p + d > f.byteLength)
                throw new RangeError(
                  `'byteLength' is out of range (0, ${f.byteLength - p}].`
                );
              if (typeof r == "object" && r !== null) s = r;
              else if (typeof r < "u")
                throw new TypeError("'options' must be an object.");
            } else if (typeof t < "u")
              throw new TypeError("'byteLength' must be a number.");
          } else if (typeof o < "u")
            throw new TypeError("'options' must be an object.");
          n = new Uint8Array(f, p, d);
        } else
          throw new TypeError(
            "Unexpected argument[0]: must be 'path' or 'buffer'."
          );
        let [a, u] = await ln(s),
          l = await a.createInferenceSessionHandler(n, u);
        return Ce(), new i(l);
      }
      startProfiling() {
        this.handler.startProfiling();
      }
      endProfiling() {
        this.handler.endProfiling();
      }
      get inputNames() {
        return this.handler.inputNames;
      }
      get outputNames() {
        return this.handler.outputNames;
      }
    };
  });
var Yd,
  Is = O(() => {
    "use strict";
    vs();
    Yd = dn;
  });
var _s = O(() => {
  "use strict";
});
var Os = O(() => {
  "use strict";
});
var Ss = O(() => {
  "use strict";
});
var As = O(() => {
  "use strict";
});
var Zd,
  hn,
  Ps = O(() => {
    "use strict";
    fn();
    pn();
    (Zd =
      "Training backend could not be resolved. Make sure you're using the correct configuration & WebAssembly files."),
      (hn = class i {
        constructor(e, o, t) {
          (this.handler = e),
            (this.hasOptimizerModel = o),
            (this.hasEvalModel = t);
        }
        get trainingInputNames() {
          return this.handler.inputNames;
        }
        get trainingOutputNames() {
          return this.handler.outputNames;
        }
        get evalInputNames() {
          if (this.hasEvalModel) return this.handler.evalInputNames;
          throw new Error("This training session has no evalModel loaded.");
        }
        get evalOutputNames() {
          if (this.hasEvalModel) return this.handler.evalOutputNames;
          throw new Error("This training session has no evalModel loaded.");
        }
        static async create(e, o) {
          let t = e.evalModel || "",
            r = e.optimizerModel || "",
            n = o || {},
            [s, a] = await ln(n);
          if (s.createTrainingSessionHandler) {
            let u = await s.createTrainingSessionHandler(
              e.checkpointState,
              e.trainModel,
              t,
              r,
              a
            );
            return new i(u, !!e.optimizerModel, !!e.evalModel);
          } else throw new Error(Zd);
        }
        typeNarrowingForRunStep(e, o, t, r, n) {
          let s = {},
            a = {};
          if (
            typeof t != "object" ||
            t === null ||
            t instanceof yt ||
            Array.isArray(t)
          )
            throw new TypeError(
              "'feeds' must be an object that use input names as keys and OnnxValue as corresponding values."
            );
          let u = !0;
          if (typeof r == "object") {
            if (r === null)
              throw new TypeError("Unexpected argument[1]: cannot be null.");
            if (r instanceof yt)
              throw new TypeError("'fetches' cannot be a Tensor");
            if (Array.isArray(r)) {
              if (r.length === 0)
                throw new TypeError("'fetches' cannot be an empty array.");
              u = !1;
              for (let l of r) {
                if (typeof l != "string")
                  throw new TypeError(
                    "'fetches' must be a string array or an object."
                  );
                if (o.indexOf(l) === -1)
                  throw new RangeError(
                    `'fetches' contains invalid output name: ${l}.`
                  );
                s[l] = null;
              }
              if (typeof n == "object" && n !== null) a = n;
              else if (typeof n < "u")
                throw new TypeError("'options' must be an object.");
            } else {
              let l = !1,
                f = Object.getOwnPropertyNames(r);
              for (let p of o)
                if (f.indexOf(p) !== -1) {
                  let d = r[p];
                  (d === null || d instanceof yt) &&
                    ((l = !0), (u = !1), (s[p] = d));
                }
              if (l) {
                if (typeof n == "object" && n !== null) a = n;
                else if (typeof n < "u")
                  throw new TypeError("'options' must be an object.");
              } else a = r;
            }
          } else if (typeof r < "u")
            throw new TypeError(
              "Unexpected argument[1]: must be 'fetches' or 'options'."
            );
          for (let l of e)
            if (typeof t[l] > "u")
              throw new Error(`input '${l}' is missing in 'feeds'.`);
          if (u) for (let l of o) s[l] = null;
          return [s, a];
        }
        convertHandlerReturnTypeToMapOfTensors(e) {
          let o = {};
          for (let t in e)
            if (Object.hasOwnProperty.call(e, t)) {
              let r = e[t];
              r instanceof yt
                ? (o[t] = r)
                : (o[t] = new yt(r.type, r.data, r.dims));
            }
          return o;
        }
        async lazyResetGrad() {
          await this.handler.lazyResetGrad();
        }
        async runTrainStep(e, o, t) {
          let [r, n] = this.typeNarrowingForRunStep(
              this.trainingInputNames,
              this.trainingOutputNames,
              e,
              o,
              t
            ),
            s = await this.handler.runTrainStep(e, r, n);
          return this.convertHandlerReturnTypeToMapOfTensors(s);
        }
        async runOptimizerStep(e) {
          if (this.hasOptimizerModel)
            await this.handler.runOptimizerStep(e || {});
          else
            throw new Error(
              "This TrainingSession has no OptimizerModel loaded."
            );
        }
        async runEvalStep(e, o, t) {
          if (this.hasEvalModel) {
            let [r, n] = this.typeNarrowingForRunStep(
                this.evalInputNames,
                this.evalOutputNames,
                e,
                o,
                t
              ),
              s = await this.handler.runEvalStep(e, r, n);
            return this.convertHandlerReturnTypeToMapOfTensors(s);
          } else
            throw new Error("This TrainingSession has no EvalModel loaded.");
        }
        async getParametersSize(e = !0) {
          return this.handler.getParametersSize(e);
        }
        async loadParametersBuffer(e, o = !0) {
          let t = await this.getParametersSize(o);
          if (e.length !== 4 * t)
            throw new Error(
              "Size of the buffer passed into loadParametersBuffer must match the number of parameters in the model. Please use getParametersSize method to check."
            );
          return this.handler.loadParametersBuffer(e, o);
        }
        async getContiguousParameters(e = !0) {
          return this.handler.getContiguousParameters(e);
        }
        async release() {
          return this.handler.dispose();
        }
      });
  });
var Qd,
  Es = O(() => {
    "use strict";
    Ps();
    Qd = hn;
  });
var Mo = {};
Or(Mo, {
  InferenceSession: () => Yd,
  TRACE: () => Ts,
  TRACE_FUNC_BEGIN: () => Fe,
  TRACE_FUNC_END: () => Ce,
  Tensor: () => yt,
  TrainingSession: () => Qd,
  env: () => z,
  registerBackend: () => nr,
});
var Yt = O(() => {
  "use strict";
  ts();
  os();
  Is();
  pn();
  _s();
  Os();
  Go();
  Ss();
  As();
  Es();
});
function _e(i, e, o, t) {
  if (e === void 0) return eh(i);
  if (o === void 0) mn(i, e, 1);
  else if (typeof o == "number" && t === void 0) mn(i, e, o);
  else if (typeof o == "string" && t === void 0) mn(i, o, 1, e);
  else if (typeof o == "string" && typeof t == "number") mn(i, o, t, e);
  else throw new TypeError("input is valid");
}
function eh(i) {
  return {
    verbose: _e.verbose.bind(null, i),
    info: _e.info.bind(null, i),
    warning: _e.warning.bind(null, i),
    error: _e.error.bind(null, i),
    fatal: _e.fatal.bind(null, i),
  };
}
function mn(i, e, o, t) {
  let r = Ar[t || ""] || Ar[""];
  Ls[i] < Ls[r.minimalSeverity] ||
    (r.logDateTime && (e = `${new Date().toISOString()}|${e}`),
    r.logSourceLocation,
    th[r.provider].log(i, e, t));
}
var Uo,
  Vo,
  Ls,
  th,
  $s,
  Ar,
  tt,
  gn,
  yn,
  xn,
  bn,
  Ut = O(() => {
    "use strict";
    (Uo = class {
      log(e, o, t) {}
    }),
      (Vo = class {
        log(e, o, t) {
          console.log(
            `${this.color(e)} ${t ? "\x1B[35m" + t + "\x1B[0m " : ""}${o}`
          );
        }
        color(e) {
          switch (e) {
            case "verbose":
              return "\x1B[34;40mv\x1B[0m";
            case "info":
              return "\x1B[32mi\x1B[0m";
            case "warning":
              return "\x1B[30;43mw\x1B[0m";
            case "error":
              return "\x1B[31;40me\x1B[0m";
            case "fatal":
              return "\x1B[101mf\x1B[0m";
            default:
              throw new Error(`unsupported severity: ${e}`);
          }
        }
      }),
      (Ls = { verbose: 1e3, info: 2e3, warning: 4e3, error: 5e3, fatal: 6e3 }),
      (th = { none: new Uo(), console: new Vo() }),
      ($s = {
        provider: "console",
        minimalSeverity: "warning",
        logDateTime: !0,
        logSourceLocation: !1,
      }),
      (Ar = { "": $s });
    ((u) => {
      function i(l, f) {
        u("verbose", l, f);
      }
      u.verbose = i;
      function e(l, f) {
        u("info", l, f);
      }
      u.info = e;
      function o(l, f) {
        u("warning", l, f);
      }
      u.warning = o;
      function t(l, f) {
        u("error", l, f);
      }
      u.error = t;
      function r(l, f) {
        u("fatal", l, f);
      }
      u.fatal = r;
      function n(l) {
        (Ar = {}), s("", l || {});
      }
      u.reset = n;
      function s(l, f) {
        if (l === "*") n(f);
        else {
          let p = Ar[l] || $s;
          Ar[l] = {
            provider: f.provider || p.provider,
            minimalSeverity: f.minimalSeverity || p.minimalSeverity,
            logDateTime:
              f.logDateTime === void 0 ? p.logDateTime : f.logDateTime,
            logSourceLocation:
              f.logSourceLocation === void 0
                ? p.logSourceLocation
                : f.logSourceLocation,
          };
        }
      }
      u.set = s;
      function a(l) {
        let f = {};
        l.logLevel && (f.minimalSeverity = l.logLevel), s("", f);
      }
      u.setWithEnv = a;
    })((_e ||= {}));
    (tt = _e),
      (gn = class {
        constructor(e, o, t, r, n, s) {
          this.category = e;
          this.name = o;
          this.startTime = t;
          this.endCallback = r;
          this.timer = n;
          this.ctx = s;
        }
        async end() {
          return this.endCallback(this);
        }
        async checkTimer() {
          if (this.ctx === void 0 || this.timer === void 0)
            throw new Error("No webgl timer found");
          return (
            this.ctx.endTimer(), this.ctx.waitForQueryAndGetTime(this.timer)
          );
        }
      }),
      (yn = class {
        constructor(e, o, t, r) {
          this.category = e;
          this.name = o;
          this.startTime = t;
          this.endTime = r;
        }
      }),
      (xn = class {
        constructor(e, o, t) {
          this._started = !1;
          this._flushPointer = 0;
          (this._started = !1),
            (this._maxNumberEvents = e === void 0 ? 1e4 : e),
            (this._flushBatchSize = o === void 0 ? 10 : o),
            (this._flushIntervalInMilliseconds = t === void 0 ? 5e3 : t);
        }
        static create(e) {
          return e === void 0
            ? new this()
            : new this(
                e.maxNumberEvents,
                e.flushBatchSize,
                e.flushIntervalInMilliseconds
              );
        }
        start() {
          (this._started = !0),
            (this._timingEvents = []),
            (this._flushTime = bn()),
            (this._flushPointer = 0);
        }
        stop() {
          for (
            this._started = !1;
            this._flushPointer < this._timingEvents.length;
            this._flushPointer++
          )
            this.logOneEvent(this._timingEvents[this._flushPointer]);
        }
        event(e, o, t, r) {
          let n = this._started ? this.begin(e, o, r) : void 0,
            s = !1,
            a = t();
          if (a && typeof a.then == "function")
            return (
              (s = !0),
              new Promise((u, l) => {
                a.then(
                  async (f) => {
                    n && (await n.end()), u(f);
                  },
                  async (f) => {
                    n && (await n.end()), l(f);
                  }
                );
              })
            );
          if (!s && n) {
            let u = n.end();
            if (u && typeof u.then == "function")
              return new Promise((l, f) => {
                u.then(
                  () => {
                    l(a);
                  },
                  (p) => {
                    f(p);
                  }
                );
              });
          }
          return a;
        }
        begin(e, o, t) {
          if (!this._started) throw new Error("profiler is not started yet");
          if (t === void 0) {
            let r = bn();
            return this.flush(r), new gn(e, o, r, (n) => this.endSync(n));
          } else {
            let r = t.beginTimer();
            return new gn(e, o, 0, async (n) => this.end(n), r, t);
          }
        }
        async end(e) {
          let o = await e.checkTimer();
          this._timingEvents.length < this._maxNumberEvents &&
            (this._timingEvents.push(
              new yn(e.category, e.name, e.startTime, o)
            ),
            this.flush(o));
        }
        endSync(e) {
          let o = bn();
          this._timingEvents.length < this._maxNumberEvents &&
            (this._timingEvents.push(
              new yn(e.category, e.name, e.startTime, o)
            ),
            this.flush(o));
        }
        logOneEvent(e) {
          tt.verbose(
            `Profiler.${e.category}`,
            `${(e.endTime - e.startTime).toFixed(2)}ms on event '${
              e.name
            }' at ${e.endTime.toFixed(2)}`
          );
        }
        flush(e) {
          if (
            this._timingEvents.length - this._flushPointer >=
              this._flushBatchSize ||
            e - this._flushTime >= this._flushIntervalInMilliseconds
          ) {
            for (
              let o = this._flushPointer;
              this._flushPointer < o + this._flushBatchSize &&
              this._flushPointer < this._timingEvents.length;
              this._flushPointer++
            )
              this.logOneEvent(this._timingEvents[this._flushPointer]);
            this._flushTime = bn();
          }
        }
        get started() {
          return this._started;
        }
      }),
      (bn =
        typeof performance < "u" && performance.now
          ? () => performance.now()
          : Date.now);
  });
function ks(i, e, o) {
  for (let t of o) {
    let r = t[0],
      n = t[1],
      s = t[2],
      a = t[3],
      u = t[4];
    if (i.opType === r) {
      for (let l of e)
        if (
          (l.domain === n || (l.domain === "ai.onnx" && n === "")) &&
          rh(l.version, s)
        )
          return { opImpl: a, opInit: u };
    }
  }
  throw new TypeError(
    `cannot resolve operator '${i.opType}' with opsets: ${e
      .map((t) => `${t.domain || "ai.onnx"} v${t.version}`)
      .join(", ")}`
  );
}
function rh(i, e) {
  if (e.endsWith("+")) {
    let o = Number.parseInt(e.substring(0, e.length - 1), 10);
    return !isNaN(o) && o <= i;
  } else if (e.split("-").length === 2) {
    let o = e.split("-"),
      t = Number.parseInt(o[0], 10),
      r = Number.parseInt(o[1], 10);
    return !isNaN(t) && !isNaN(r) && t <= i && i <= r;
  } else return Number.parseInt(e, 10) === i;
}
var Bs = O(() => {
  "use strict";
});
var Fs = mt((zo) => {
  "use strict";
  zo.__esModule = !0;
  var nh = (function () {
    function i(e) {
      if (!e) throw new TypeError("Invalid argument; `value` has no value.");
      (this.value = i.EMPTY), e && i.isGuid(e) && (this.value = e);
    }
    return (
      (i.isGuid = function (e) {
        var o = e.toString();
        return e && (e instanceof i || i.validator.test(o));
      }),
      (i.create = function () {
        return new i(
          [i.gen(2), i.gen(1), i.gen(1), i.gen(1), i.gen(3)].join("-")
        );
      }),
      (i.createEmpty = function () {
        return new i("emptyguid");
      }),
      (i.parse = function (e) {
        return new i(e);
      }),
      (i.raw = function () {
        return [i.gen(2), i.gen(1), i.gen(1), i.gen(1), i.gen(3)].join("-");
      }),
      (i.gen = function (e) {
        for (var o = "", t = 0; t < e; t++)
          o += (((1 + Math.random()) * 65536) | 0).toString(16).substring(1);
        return o;
      }),
      (i.prototype.equals = function (e) {
        return i.isGuid(e) && this.value === e.toString();
      }),
      (i.prototype.isEmpty = function () {
        return this.value === i.EMPTY;
      }),
      (i.prototype.toString = function () {
        return this.value;
      }),
      (i.prototype.toJSON = function () {
        return { value: this.value };
      }),
      (i.validator = new RegExp(
        "^[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$",
        "i"
      )),
      (i.EMPTY = "00000000-0000-0000-0000-000000000000"),
      i
    );
  })();
  zo.Guid = nh;
});
function rt(i, e, o) {
  (this.low = i | 0), (this.high = e | 0), (this.unsigned = !!o);
}
function Et(i) {
  return (i && i.__isLong__) === !0;
}
function Cs(i) {
  var e = Math.clz32(i & -i);
  return i ? 31 - e : e;
}
function Ne(i, e) {
  var o, t, r;
  return e
    ? ((i >>>= 0),
      (r = 0 <= i && i < 256) && ((t = Rs[i]), t)
        ? t
        : ((o = J(i, 0, !0)), r && (Rs[i] = o), o))
    : ((i |= 0),
      (r = -128 <= i && i < 128) && ((t = Ns[i]), t)
        ? t
        : ((o = J(i, i < 0 ? -1 : 0, !1)), r && (Ns[i] = o), o));
}
function zt(i, e) {
  if (isNaN(i)) return e ? ye : Zt;
  if (e) {
    if (i < 0) return ye;
    if (i >= Vs) return Hs;
  } else {
    if (i <= -Ms) return Ct;
    if (i + 1 >= Ms) return Ws;
  }
  return i < 0 ? zt(-i, e).neg() : J(i % ir | 0, (i / ir) | 0, e);
}
function J(i, e, o) {
  return new rt(i, e, o);
}
function Ho(i, e, o) {
  if (i.length === 0) throw Error("empty string");
  if (
    (typeof e == "number" ? ((o = e), (e = !1)) : (e = !!e),
    i === "NaN" || i === "Infinity" || i === "+Infinity" || i === "-Infinity")
  )
    return e ? ye : Zt;
  if (((o = o || 10), o < 2 || 36 < o)) throw RangeError("radix");
  var t;
  if ((t = i.indexOf("-")) > 0) throw Error("interior hyphen");
  if (t === 0) return Ho(i.substring(1), e, o).neg();
  for (var r = zt(Tn(o, 8)), n = Zt, s = 0; s < i.length; s += 8) {
    var a = Math.min(8, i.length - s),
      u = parseInt(i.substring(s, s + a), o);
    if (a < 8) {
      var l = zt(Tn(o, a));
      n = n.mul(l).add(zt(u));
    } else (n = n.mul(r)), (n = n.add(zt(u)));
  }
  return (n.unsigned = e), n;
}
function Qt(i, e) {
  return typeof i == "number"
    ? zt(i, e)
    : typeof i == "string"
    ? Ho(i, e)
    : J(i.low, i.high, typeof e == "boolean" ? e : i.unsigned);
}
var Vt,
  Ns,
  Rs,
  Tn,
  Gs,
  oh,
  ir,
  Vs,
  Ms,
  Us,
  Zt,
  ye,
  or,
  zs,
  Wo,
  Ws,
  Hs,
  Ct,
  D,
  xe,
  qo = O(() => {
    Vt = null;
    try {
      Vt = new WebAssembly.Instance(
        new WebAssembly.Module(
          new Uint8Array([
            0, 97, 115, 109, 1, 0, 0, 0, 1, 13, 2, 96, 0, 1, 127, 96, 4, 127,
            127, 127, 127, 1, 127, 3, 7, 6, 0, 1, 1, 1, 1, 1, 6, 6, 1, 127, 1,
            65, 0, 11, 7, 50, 6, 3, 109, 117, 108, 0, 1, 5, 100, 105, 118, 95,
            115, 0, 2, 5, 100, 105, 118, 95, 117, 0, 3, 5, 114, 101, 109, 95,
            115, 0, 4, 5, 114, 101, 109, 95, 117, 0, 5, 8, 103, 101, 116, 95,
            104, 105, 103, 104, 0, 0, 10, 191, 1, 6, 4, 0, 35, 0, 11, 36, 1, 1,
            126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3,
            173, 66, 32, 134, 132, 126, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4,
            167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132,
            32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 127, 34, 4, 66, 32, 135,
            167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173,
            66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 128, 34,
            4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0,
            173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32,
            134, 132, 129, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36,
            1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32,
            3, 173, 66, 32, 134, 132, 130, 34, 4, 66, 32, 135, 167, 36, 0, 32,
            4, 167, 11,
          ])
        ),
        {}
      ).exports;
    } catch {}
    rt.prototype.__isLong__;
    Object.defineProperty(rt.prototype, "__isLong__", { value: !0 });
    rt.isLong = Et;
    (Ns = {}), (Rs = {});
    rt.fromInt = Ne;
    rt.fromNumber = zt;
    rt.fromBits = J;
    Tn = Math.pow;
    rt.fromString = Ho;
    rt.fromValue = Qt;
    (Gs = 65536),
      (oh = 1 << 24),
      (ir = Gs * Gs),
      (Vs = ir * ir),
      (Ms = Vs / 2),
      (Us = Ne(oh)),
      (Zt = Ne(0));
    rt.ZERO = Zt;
    ye = Ne(0, !0);
    rt.UZERO = ye;
    or = Ne(1);
    rt.ONE = or;
    zs = Ne(1, !0);
    rt.UONE = zs;
    Wo = Ne(-1);
    rt.NEG_ONE = Wo;
    Ws = J(-1, 2147483647, !1);
    rt.MAX_VALUE = Ws;
    Hs = J(-1, -1, !0);
    rt.MAX_UNSIGNED_VALUE = Hs;
    Ct = J(0, -2147483648, !1);
    rt.MIN_VALUE = Ct;
    D = rt.prototype;
    D.toInt = function () {
      return this.unsigned ? this.low >>> 0 : this.low;
    };
    D.toNumber = function () {
      return this.unsigned
        ? (this.high >>> 0) * ir + (this.low >>> 0)
        : this.high * ir + (this.low >>> 0);
    };
    D.toString = function (e) {
      if (((e = e || 10), e < 2 || 36 < e)) throw RangeError("radix");
      if (this.isZero()) return "0";
      if (this.isNegative())
        if (this.eq(Ct)) {
          var o = zt(e),
            t = this.div(o),
            r = t.mul(o).sub(this);
          return t.toString(e) + r.toInt().toString(e);
        } else return "-" + this.neg().toString(e);
      for (var n = zt(Tn(e, 6), this.unsigned), s = this, a = ""; ; ) {
        var u = s.div(n),
          l = s.sub(u.mul(n)).toInt() >>> 0,
          f = l.toString(e);
        if (((s = u), s.isZero())) return f + a;
        for (; f.length < 6; ) f = "0" + f;
        a = "" + f + a;
      }
    };
    D.getHighBits = function () {
      return this.high;
    };
    D.getHighBitsUnsigned = function () {
      return this.high >>> 0;
    };
    D.getLowBits = function () {
      return this.low;
    };
    D.getLowBitsUnsigned = function () {
      return this.low >>> 0;
    };
    D.getNumBitsAbs = function () {
      if (this.isNegative())
        return this.eq(Ct) ? 64 : this.neg().getNumBitsAbs();
      for (
        var e = this.high != 0 ? this.high : this.low, o = 31;
        o > 0 && !(e & (1 << o));
        o--
      );
      return this.high != 0 ? o + 33 : o + 1;
    };
    D.isZero = function () {
      return this.high === 0 && this.low === 0;
    };
    D.eqz = D.isZero;
    D.isNegative = function () {
      return !this.unsigned && this.high < 0;
    };
    D.isPositive = function () {
      return this.unsigned || this.high >= 0;
    };
    D.isOdd = function () {
      return (this.low & 1) === 1;
    };
    D.isEven = function () {
      return (this.low & 1) === 0;
    };
    D.equals = function (e) {
      return (
        Et(e) || (e = Qt(e)),
        this.unsigned !== e.unsigned &&
        this.high >>> 31 === 1 &&
        e.high >>> 31 === 1
          ? !1
          : this.high === e.high && this.low === e.low
      );
    };
    D.eq = D.equals;
    D.notEquals = function (e) {
      return !this.eq(e);
    };
    D.neq = D.notEquals;
    D.ne = D.notEquals;
    D.lessThan = function (e) {
      return this.comp(e) < 0;
    };
    D.lt = D.lessThan;
    D.lessThanOrEqual = function (e) {
      return this.comp(e) <= 0;
    };
    D.lte = D.lessThanOrEqual;
    D.le = D.lessThanOrEqual;
    D.greaterThan = function (e) {
      return this.comp(e) > 0;
    };
    D.gt = D.greaterThan;
    D.greaterThanOrEqual = function (e) {
      return this.comp(e) >= 0;
    };
    D.gte = D.greaterThanOrEqual;
    D.ge = D.greaterThanOrEqual;
    D.compare = function (e) {
      if ((Et(e) || (e = Qt(e)), this.eq(e))) return 0;
      var o = this.isNegative(),
        t = e.isNegative();
      return o && !t
        ? -1
        : !o && t
        ? 1
        : this.unsigned
        ? e.high >>> 0 > this.high >>> 0 ||
          (e.high === this.high && e.low >>> 0 > this.low >>> 0)
          ? -1
          : 1
        : this.sub(e).isNegative()
        ? -1
        : 1;
    };
    D.comp = D.compare;
    D.negate = function () {
      return !this.unsigned && this.eq(Ct) ? Ct : this.not().add(or);
    };
    D.neg = D.negate;
    D.add = function (e) {
      Et(e) || (e = Qt(e));
      var o = this.high >>> 16,
        t = this.high & 65535,
        r = this.low >>> 16,
        n = this.low & 65535,
        s = e.high >>> 16,
        a = e.high & 65535,
        u = e.low >>> 16,
        l = e.low & 65535,
        f = 0,
        p = 0,
        d = 0,
        y = 0;
      return (
        (y += n + l),
        (d += y >>> 16),
        (y &= 65535),
        (d += r + u),
        (p += d >>> 16),
        (d &= 65535),
        (p += t + a),
        (f += p >>> 16),
        (p &= 65535),
        (f += o + s),
        (f &= 65535),
        J((d << 16) | y, (f << 16) | p, this.unsigned)
      );
    };
    D.subtract = function (e) {
      return Et(e) || (e = Qt(e)), this.add(e.neg());
    };
    D.sub = D.subtract;
    D.multiply = function (e) {
      if (this.isZero()) return this;
      if ((Et(e) || (e = Qt(e)), Vt)) {
        var o = Vt.mul(this.low, this.high, e.low, e.high);
        return J(o, Vt.get_high(), this.unsigned);
      }
      if (e.isZero()) return this.unsigned ? ye : Zt;
      if (this.eq(Ct)) return e.isOdd() ? Ct : Zt;
      if (e.eq(Ct)) return this.isOdd() ? Ct : Zt;
      if (this.isNegative())
        return e.isNegative()
          ? this.neg().mul(e.neg())
          : this.neg().mul(e).neg();
      if (e.isNegative()) return this.mul(e.neg()).neg();
      if (this.lt(Us) && e.lt(Us))
        return zt(this.toNumber() * e.toNumber(), this.unsigned);
      var t = this.high >>> 16,
        r = this.high & 65535,
        n = this.low >>> 16,
        s = this.low & 65535,
        a = e.high >>> 16,
        u = e.high & 65535,
        l = e.low >>> 16,
        f = e.low & 65535,
        p = 0,
        d = 0,
        y = 0,
        T = 0;
      return (
        (T += s * f),
        (y += T >>> 16),
        (T &= 65535),
        (y += n * f),
        (d += y >>> 16),
        (y &= 65535),
        (y += s * l),
        (d += y >>> 16),
        (y &= 65535),
        (d += r * f),
        (p += d >>> 16),
        (d &= 65535),
        (d += n * l),
        (p += d >>> 16),
        (d &= 65535),
        (d += s * u),
        (p += d >>> 16),
        (d &= 65535),
        (p += t * f + r * l + n * u + s * a),
        (p &= 65535),
        J((y << 16) | T, (p << 16) | d, this.unsigned)
      );
    };
    D.mul = D.multiply;
    D.divide = function (e) {
      if ((Et(e) || (e = Qt(e)), e.isZero())) throw Error("division by zero");
      if (Vt) {
        if (
          !this.unsigned &&
          this.high === -2147483648 &&
          e.low === -1 &&
          e.high === -1
        )
          return this;
        var o = (this.unsigned ? Vt.div_u : Vt.div_s)(
          this.low,
          this.high,
          e.low,
          e.high
        );
        return J(o, Vt.get_high(), this.unsigned);
      }
      if (this.isZero()) return this.unsigned ? ye : Zt;
      var t, r, n;
      if (this.unsigned) {
        if ((e.unsigned || (e = e.toUnsigned()), e.gt(this))) return ye;
        if (e.gt(this.shru(1))) return zs;
        n = ye;
      } else {
        if (this.eq(Ct)) {
          if (e.eq(or) || e.eq(Wo)) return Ct;
          if (e.eq(Ct)) return or;
          var s = this.shr(1);
          return (
            (t = s.div(e).shl(1)),
            t.eq(Zt)
              ? e.isNegative()
                ? or
                : Wo
              : ((r = this.sub(e.mul(t))), (n = t.add(r.div(e))), n)
          );
        } else if (e.eq(Ct)) return this.unsigned ? ye : Zt;
        if (this.isNegative())
          return e.isNegative()
            ? this.neg().div(e.neg())
            : this.neg().div(e).neg();
        if (e.isNegative()) return this.div(e.neg()).neg();
        n = Zt;
      }
      for (r = this; r.gte(e); ) {
        t = Math.max(1, Math.floor(r.toNumber() / e.toNumber()));
        for (
          var a = Math.ceil(Math.log(t) / Math.LN2),
            u = a <= 48 ? 1 : Tn(2, a - 48),
            l = zt(t),
            f = l.mul(e);
          f.isNegative() || f.gt(r);

        )
          (t -= u), (l = zt(t, this.unsigned)), (f = l.mul(e));
        l.isZero() && (l = or), (n = n.add(l)), (r = r.sub(f));
      }
      return n;
    };
    D.div = D.divide;
    D.modulo = function (e) {
      if ((Et(e) || (e = Qt(e)), Vt)) {
        var o = (this.unsigned ? Vt.rem_u : Vt.rem_s)(
          this.low,
          this.high,
          e.low,
          e.high
        );
        return J(o, Vt.get_high(), this.unsigned);
      }
      return this.sub(this.div(e).mul(e));
    };
    D.mod = D.modulo;
    D.rem = D.modulo;
    D.not = function () {
      return J(~this.low, ~this.high, this.unsigned);
    };
    D.countLeadingZeros = function () {
      return this.high ? Math.clz32(this.high) : Math.clz32(this.low) + 32;
    };
    D.clz = D.countLeadingZeros;
    D.countTrailingZeros = function () {
      return this.low ? Cs(this.low) : Cs(this.high) + 32;
    };
    D.ctz = D.countTrailingZeros;
    D.and = function (e) {
      return (
        Et(e) || (e = Qt(e)),
        J(this.low & e.low, this.high & e.high, this.unsigned)
      );
    };
    D.or = function (e) {
      return (
        Et(e) || (e = Qt(e)),
        J(this.low | e.low, this.high | e.high, this.unsigned)
      );
    };
    D.xor = function (e) {
      return (
        Et(e) || (e = Qt(e)),
        J(this.low ^ e.low, this.high ^ e.high, this.unsigned)
      );
    };
    D.shiftLeft = function (e) {
      return (
        Et(e) && (e = e.toInt()),
        (e &= 63) === 0
          ? this
          : e < 32
          ? J(
              this.low << e,
              (this.high << e) | (this.low >>> (32 - e)),
              this.unsigned
            )
          : J(0, this.low << (e - 32), this.unsigned)
      );
    };
    D.shl = D.shiftLeft;
    D.shiftRight = function (e) {
      return (
        Et(e) && (e = e.toInt()),
        (e &= 63) === 0
          ? this
          : e < 32
          ? J(
              (this.low >>> e) | (this.high << (32 - e)),
              this.high >> e,
              this.unsigned
            )
          : J(this.high >> (e - 32), this.high >= 0 ? 0 : -1, this.unsigned)
      );
    };
    D.shr = D.shiftRight;
    D.shiftRightUnsigned = function (e) {
      return (
        Et(e) && (e = e.toInt()),
        (e &= 63) === 0
          ? this
          : e < 32
          ? J(
              (this.low >>> e) | (this.high << (32 - e)),
              this.high >>> e,
              this.unsigned
            )
          : e === 32
          ? J(this.high, 0, this.unsigned)
          : J(this.high >>> (e - 32), 0, this.unsigned)
      );
    };
    D.shru = D.shiftRightUnsigned;
    D.shr_u = D.shiftRightUnsigned;
    D.rotateLeft = function (e) {
      var o;
      return (
        Et(e) && (e = e.toInt()),
        (e &= 63) === 0
          ? this
          : e === 32
          ? J(this.high, this.low, this.unsigned)
          : e < 32
          ? ((o = 32 - e),
            J(
              (this.low << e) | (this.high >>> o),
              (this.high << e) | (this.low >>> o),
              this.unsigned
            ))
          : ((e -= 32),
            (o = 32 - e),
            J(
              (this.high << e) | (this.low >>> o),
              (this.low << e) | (this.high >>> o),
              this.unsigned
            ))
      );
    };
    D.rotl = D.rotateLeft;
    D.rotateRight = function (e) {
      var o;
      return (
        Et(e) && (e = e.toInt()),
        (e &= 63) === 0
          ? this
          : e === 32
          ? J(this.high, this.low, this.unsigned)
          : e < 32
          ? ((o = 32 - e),
            J(
              (this.high << o) | (this.low >>> e),
              (this.low << o) | (this.high >>> e),
              this.unsigned
            ))
          : ((e -= 32),
            (o = 32 - e),
            J(
              (this.low << o) | (this.high >>> e),
              (this.high << o) | (this.low >>> e),
              this.unsigned
            ))
      );
    };
    D.rotr = D.rotateRight;
    D.toSigned = function () {
      return this.unsigned ? J(this.low, this.high, !1) : this;
    };
    D.toUnsigned = function () {
      return this.unsigned ? this : J(this.low, this.high, !0);
    };
    D.toBytes = function (e) {
      return e ? this.toBytesLE() : this.toBytesBE();
    };
    D.toBytesLE = function () {
      var e = this.high,
        o = this.low;
      return [
        o & 255,
        (o >>> 8) & 255,
        (o >>> 16) & 255,
        o >>> 24,
        e & 255,
        (e >>> 8) & 255,
        (e >>> 16) & 255,
        e >>> 24,
      ];
    };
    D.toBytesBE = function () {
      var e = this.high,
        o = this.low;
      return [
        e >>> 24,
        (e >>> 16) & 255,
        (e >>> 8) & 255,
        e & 255,
        o >>> 24,
        (o >>> 16) & 255,
        (o >>> 8) & 255,
        o & 255,
      ];
    };
    rt.fromBytes = function (e, o, t) {
      return t ? rt.fromBytesLE(e, o) : rt.fromBytesBE(e, o);
    };
    rt.fromBytesLE = function (e, o) {
      return new rt(
        e[0] | (e[1] << 8) | (e[2] << 16) | (e[3] << 24),
        e[4] | (e[5] << 8) | (e[6] << 16) | (e[7] << 24),
        o
      );
    };
    rt.fromBytesBE = function (e, o) {
      return new rt(
        (e[4] << 24) | (e[5] << 16) | (e[6] << 8) | e[7],
        (e[0] << 24) | (e[1] << 16) | (e[2] << 8) | e[3],
        o
      );
    };
    xe = rt;
  });
var w,
  wn = O(() => {
    w = {};
    w.Offset;
    w.Table;
    w.SIZEOF_SHORT = 2;
    w.SIZEOF_INT = 4;
    w.FILE_IDENTIFIER_LENGTH = 4;
    w.SIZE_PREFIX_LENGTH = 4;
    w.Encoding = { UTF8_BYTES: 1, UTF16_STRING: 2 };
    w.int32 = new Int32Array(2);
    w.float32 = new Float32Array(w.int32.buffer);
    w.float64 = new Float64Array(w.int32.buffer);
    w.isLittleEndian = new Uint16Array(new Uint8Array([1, 0]).buffer)[0] === 1;
    w.Long = function (i, e) {
      (this.low = i | 0), (this.high = e | 0);
    };
    w.Long.create = function (i, e) {
      return i == 0 && e == 0 ? w.Long.ZERO : new w.Long(i, e);
    };
    w.Long.prototype.toFloat64 = function () {
      return (this.low >>> 0) + this.high * 4294967296;
    };
    w.Long.prototype.equals = function (i) {
      return this.low == i.low && this.high == i.high;
    };
    w.Long.ZERO = new w.Long(0, 0);
    w.Builder = function (i) {
      if (i) var e = i;
      else var e = 1024;
      (this.bb = w.ByteBuffer.allocate(e)),
        (this.space = e),
        (this.minalign = 1),
        (this.vtable = null),
        (this.vtable_in_use = 0),
        (this.isNested = !1),
        (this.object_start = 0),
        (this.vtables = []),
        (this.vector_num_elems = 0),
        (this.force_defaults = !1);
    };
    w.Builder.prototype.clear = function () {
      this.bb.clear(),
        (this.space = this.bb.capacity()),
        (this.minalign = 1),
        (this.vtable = null),
        (this.vtable_in_use = 0),
        (this.isNested = !1),
        (this.object_start = 0),
        (this.vtables = []),
        (this.vector_num_elems = 0),
        (this.force_defaults = !1);
    };
    w.Builder.prototype.forceDefaults = function (i) {
      this.force_defaults = i;
    };
    w.Builder.prototype.dataBuffer = function () {
      return this.bb;
    };
    w.Builder.prototype.asUint8Array = function () {
      return this.bb
        .bytes()
        .subarray(this.bb.position(), this.bb.position() + this.offset());
    };
    w.Builder.prototype.prep = function (i, e) {
      i > this.minalign && (this.minalign = i);
      for (
        var o = (~(this.bb.capacity() - this.space + e) + 1) & (i - 1);
        this.space < o + i + e;

      ) {
        var t = this.bb.capacity();
        (this.bb = w.Builder.growByteBuffer(this.bb)),
          (this.space += this.bb.capacity() - t);
      }
      this.pad(o);
    };
    w.Builder.prototype.pad = function (i) {
      for (var e = 0; e < i; e++) this.bb.writeInt8(--this.space, 0);
    };
    w.Builder.prototype.writeInt8 = function (i) {
      this.bb.writeInt8((this.space -= 1), i);
    };
    w.Builder.prototype.writeInt16 = function (i) {
      this.bb.writeInt16((this.space -= 2), i);
    };
    w.Builder.prototype.writeInt32 = function (i) {
      this.bb.writeInt32((this.space -= 4), i);
    };
    w.Builder.prototype.writeInt64 = function (i) {
      this.bb.writeInt64((this.space -= 8), i);
    };
    w.Builder.prototype.writeFloat32 = function (i) {
      this.bb.writeFloat32((this.space -= 4), i);
    };
    w.Builder.prototype.writeFloat64 = function (i) {
      this.bb.writeFloat64((this.space -= 8), i);
    };
    w.Builder.prototype.addInt8 = function (i) {
      this.prep(1, 0), this.writeInt8(i);
    };
    w.Builder.prototype.addInt16 = function (i) {
      this.prep(2, 0), this.writeInt16(i);
    };
    w.Builder.prototype.addInt32 = function (i) {
      this.prep(4, 0), this.writeInt32(i);
    };
    w.Builder.prototype.addInt64 = function (i) {
      this.prep(8, 0), this.writeInt64(i);
    };
    w.Builder.prototype.addFloat32 = function (i) {
      this.prep(4, 0), this.writeFloat32(i);
    };
    w.Builder.prototype.addFloat64 = function (i) {
      this.prep(8, 0), this.writeFloat64(i);
    };
    w.Builder.prototype.addFieldInt8 = function (i, e, o) {
      (this.force_defaults || e != o) && (this.addInt8(e), this.slot(i));
    };
    w.Builder.prototype.addFieldInt16 = function (i, e, o) {
      (this.force_defaults || e != o) && (this.addInt16(e), this.slot(i));
    };
    w.Builder.prototype.addFieldInt32 = function (i, e, o) {
      (this.force_defaults || e != o) && (this.addInt32(e), this.slot(i));
    };
    w.Builder.prototype.addFieldInt64 = function (i, e, o) {
      (this.force_defaults || !e.equals(o)) && (this.addInt64(e), this.slot(i));
    };
    w.Builder.prototype.addFieldFloat32 = function (i, e, o) {
      (this.force_defaults || e != o) && (this.addFloat32(e), this.slot(i));
    };
    w.Builder.prototype.addFieldFloat64 = function (i, e, o) {
      (this.force_defaults || e != o) && (this.addFloat64(e), this.slot(i));
    };
    w.Builder.prototype.addFieldOffset = function (i, e, o) {
      (this.force_defaults || e != o) && (this.addOffset(e), this.slot(i));
    };
    w.Builder.prototype.addFieldStruct = function (i, e, o) {
      e != o && (this.nested(e), this.slot(i));
    };
    w.Builder.prototype.nested = function (i) {
      if (i != this.offset())
        throw new Error("FlatBuffers: struct must be serialized inline.");
    };
    w.Builder.prototype.notNested = function () {
      if (this.isNested)
        throw new Error(
          "FlatBuffers: object serialization must not be nested."
        );
    };
    w.Builder.prototype.slot = function (i) {
      this.vtable[i] = this.offset();
    };
    w.Builder.prototype.offset = function () {
      return this.bb.capacity() - this.space;
    };
    w.Builder.growByteBuffer = function (i) {
      var e = i.capacity();
      if (e & 3221225472)
        throw new Error("FlatBuffers: cannot grow buffer beyond 2 gigabytes.");
      var o = e << 1,
        t = w.ByteBuffer.allocate(o);
      return t.setPosition(o - e), t.bytes().set(i.bytes(), o - e), t;
    };
    w.Builder.prototype.addOffset = function (i) {
      this.prep(w.SIZEOF_INT, 0),
        this.writeInt32(this.offset() - i + w.SIZEOF_INT);
    };
    w.Builder.prototype.startObject = function (i) {
      this.notNested(),
        this.vtable == null && (this.vtable = []),
        (this.vtable_in_use = i);
      for (var e = 0; e < i; e++) this.vtable[e] = 0;
      (this.isNested = !0), (this.object_start = this.offset());
    };
    w.Builder.prototype.endObject = function () {
      if (this.vtable == null || !this.isNested)
        throw new Error("FlatBuffers: endObject called without startObject");
      this.addInt32(0);
      for (
        var i = this.offset(), e = this.vtable_in_use - 1;
        e >= 0 && this.vtable[e] == 0;
        e--
      );
      for (var o = e + 1; e >= 0; e--)
        this.addInt16(this.vtable[e] != 0 ? i - this.vtable[e] : 0);
      var t = 2;
      this.addInt16(i - this.object_start);
      var r = (o + t) * w.SIZEOF_SHORT;
      this.addInt16(r);
      var n = 0,
        s = this.space;
      t: for (e = 0; e < this.vtables.length; e++) {
        var a = this.bb.capacity() - this.vtables[e];
        if (r == this.bb.readInt16(a)) {
          for (var u = w.SIZEOF_SHORT; u < r; u += w.SIZEOF_SHORT)
            if (this.bb.readInt16(s + u) != this.bb.readInt16(a + u))
              continue t;
          n = this.vtables[e];
          break;
        }
      }
      return (
        n
          ? ((this.space = this.bb.capacity() - i),
            this.bb.writeInt32(this.space, n - i))
          : (this.vtables.push(this.offset()),
            this.bb.writeInt32(this.bb.capacity() - i, this.offset() - i)),
        (this.isNested = !1),
        i
      );
    };
    w.Builder.prototype.finish = function (i, e, o) {
      var t = o ? w.SIZE_PREFIX_LENGTH : 0;
      if (e) {
        var r = e;
        if (
          (this.prep(
            this.minalign,
            w.SIZEOF_INT + w.FILE_IDENTIFIER_LENGTH + t
          ),
          r.length != w.FILE_IDENTIFIER_LENGTH)
        )
          throw new Error(
            "FlatBuffers: file identifier must be length " +
              w.FILE_IDENTIFIER_LENGTH
          );
        for (var n = w.FILE_IDENTIFIER_LENGTH - 1; n >= 0; n--)
          this.writeInt8(r.charCodeAt(n));
      }
      this.prep(this.minalign, w.SIZEOF_INT + t),
        this.addOffset(i),
        t && this.addInt32(this.bb.capacity() - this.space),
        this.bb.setPosition(this.space);
    };
    w.Builder.prototype.finishSizePrefixed = function (i, e) {
      this.finish(i, e, !0);
    };
    w.Builder.prototype.requiredField = function (i, e) {
      var o = this.bb.capacity() - i,
        t = o - this.bb.readInt32(o),
        r = this.bb.readInt16(t + e) != 0;
      if (!r) throw new Error("FlatBuffers: field " + e + " must be set");
    };
    w.Builder.prototype.startVector = function (i, e, o) {
      this.notNested(),
        (this.vector_num_elems = e),
        this.prep(w.SIZEOF_INT, i * e),
        this.prep(o, i * e);
    };
    w.Builder.prototype.endVector = function () {
      return this.writeInt32(this.vector_num_elems), this.offset();
    };
    w.Builder.prototype.createString = function (i) {
      if (i instanceof Uint8Array) var e = i;
      else
        for (var e = [], o = 0; o < i.length; ) {
          var t,
            r = i.charCodeAt(o++);
          if (r < 55296 || r >= 56320) t = r;
          else {
            var n = i.charCodeAt(o++);
            t = (r << 10) + n + (65536 - 56623104 - 56320);
          }
          t < 128
            ? e.push(t)
            : (t < 2048
                ? e.push(((t >> 6) & 31) | 192)
                : (t < 65536
                    ? e.push(((t >> 12) & 15) | 224)
                    : e.push(((t >> 18) & 7) | 240, ((t >> 12) & 63) | 128),
                  e.push(((t >> 6) & 63) | 128)),
              e.push((t & 63) | 128));
        }
      this.addInt8(0),
        this.startVector(1, e.length, 1),
        this.bb.setPosition((this.space -= e.length));
      for (var o = 0, s = this.space, a = this.bb.bytes(); o < e.length; o++)
        a[s++] = e[o];
      return this.endVector();
    };
    w.Builder.prototype.createLong = function (i, e) {
      return w.Long.create(i, e);
    };
    w.ByteBuffer = function (i) {
      (this.bytes_ = i), (this.position_ = 0);
    };
    w.ByteBuffer.allocate = function (i) {
      return new w.ByteBuffer(new Uint8Array(i));
    };
    w.ByteBuffer.prototype.clear = function () {
      this.position_ = 0;
    };
    w.ByteBuffer.prototype.bytes = function () {
      return this.bytes_;
    };
    w.ByteBuffer.prototype.position = function () {
      return this.position_;
    };
    w.ByteBuffer.prototype.setPosition = function (i) {
      this.position_ = i;
    };
    w.ByteBuffer.prototype.capacity = function () {
      return this.bytes_.length;
    };
    w.ByteBuffer.prototype.readInt8 = function (i) {
      return (this.readUint8(i) << 24) >> 24;
    };
    w.ByteBuffer.prototype.readUint8 = function (i) {
      return this.bytes_[i];
    };
    w.ByteBuffer.prototype.readInt16 = function (i) {
      return (this.readUint16(i) << 16) >> 16;
    };
    w.ByteBuffer.prototype.readUint16 = function (i) {
      return this.bytes_[i] | (this.bytes_[i + 1] << 8);
    };
    w.ByteBuffer.prototype.readInt32 = function (i) {
      return (
        this.bytes_[i] |
        (this.bytes_[i + 1] << 8) |
        (this.bytes_[i + 2] << 16) |
        (this.bytes_[i + 3] << 24)
      );
    };
    w.ByteBuffer.prototype.readUint32 = function (i) {
      return this.readInt32(i) >>> 0;
    };
    w.ByteBuffer.prototype.readInt64 = function (i) {
      return new w.Long(this.readInt32(i), this.readInt32(i + 4));
    };
    w.ByteBuffer.prototype.readUint64 = function (i) {
      return new w.Long(this.readUint32(i), this.readUint32(i + 4));
    };
    w.ByteBuffer.prototype.readFloat32 = function (i) {
      return (w.int32[0] = this.readInt32(i)), w.float32[0];
    };
    w.ByteBuffer.prototype.readFloat64 = function (i) {
      return (
        (w.int32[w.isLittleEndian ? 0 : 1] = this.readInt32(i)),
        (w.int32[w.isLittleEndian ? 1 : 0] = this.readInt32(i + 4)),
        w.float64[0]
      );
    };
    w.ByteBuffer.prototype.writeInt8 = function (i, e) {
      this.bytes_[i] = e;
    };
    w.ByteBuffer.prototype.writeUint8 = function (i, e) {
      this.bytes_[i] = e;
    };
    w.ByteBuffer.prototype.writeInt16 = function (i, e) {
      (this.bytes_[i] = e), (this.bytes_[i + 1] = e >> 8);
    };
    w.ByteBuffer.prototype.writeUint16 = function (i, e) {
      (this.bytes_[i] = e), (this.bytes_[i + 1] = e >> 8);
    };
    w.ByteBuffer.prototype.writeInt32 = function (i, e) {
      (this.bytes_[i] = e),
        (this.bytes_[i + 1] = e >> 8),
        (this.bytes_[i + 2] = e >> 16),
        (this.bytes_[i + 3] = e >> 24);
    };
    w.ByteBuffer.prototype.writeUint32 = function (i, e) {
      (this.bytes_[i] = e),
        (this.bytes_[i + 1] = e >> 8),
        (this.bytes_[i + 2] = e >> 16),
        (this.bytes_[i + 3] = e >> 24);
    };
    w.ByteBuffer.prototype.writeInt64 = function (i, e) {
      this.writeInt32(i, e.low), this.writeInt32(i + 4, e.high);
    };
    w.ByteBuffer.prototype.writeUint64 = function (i, e) {
      this.writeUint32(i, e.low), this.writeUint32(i + 4, e.high);
    };
    w.ByteBuffer.prototype.writeFloat32 = function (i, e) {
      (w.float32[0] = e), this.writeInt32(i, w.int32[0]);
    };
    w.ByteBuffer.prototype.writeFloat64 = function (i, e) {
      (w.float64[0] = e),
        this.writeInt32(i, w.int32[w.isLittleEndian ? 0 : 1]),
        this.writeInt32(i + 4, w.int32[w.isLittleEndian ? 1 : 0]);
    };
    w.ByteBuffer.prototype.getBufferIdentifier = function () {
      if (
        this.bytes_.length <
        this.position_ + w.SIZEOF_INT + w.FILE_IDENTIFIER_LENGTH
      )
        throw new Error(
          "FlatBuffers: ByteBuffer is too short to contain an identifier."
        );
      for (var i = "", e = 0; e < w.FILE_IDENTIFIER_LENGTH; e++)
        i += String.fromCharCode(
          this.readInt8(this.position_ + w.SIZEOF_INT + e)
        );
      return i;
    };
    w.ByteBuffer.prototype.__offset = function (i, e) {
      var o = i - this.readInt32(i);
      return e < this.readInt16(o) ? this.readInt16(o + e) : 0;
    };
    w.ByteBuffer.prototype.__union = function (i, e) {
      return (i.bb_pos = e + this.readInt32(e)), (i.bb = this), i;
    };
    w.ByteBuffer.prototype.__string = function (i, e) {
      i += this.readInt32(i);
      var o = this.readInt32(i),
        t = "",
        r = 0;
      if (((i += w.SIZEOF_INT), e === w.Encoding.UTF8_BYTES))
        return this.bytes_.subarray(i, i + o);
      for (; r < o; ) {
        var n,
          s = this.readUint8(i + r++);
        if (s < 192) n = s;
        else {
          var a = this.readUint8(i + r++);
          if (s < 224) n = ((s & 31) << 6) | (a & 63);
          else {
            var u = this.readUint8(i + r++);
            if (s < 240) n = ((s & 15) << 12) | ((a & 63) << 6) | (u & 63);
            else {
              var l = this.readUint8(i + r++);
              n =
                ((s & 7) << 18) | ((a & 63) << 12) | ((u & 63) << 6) | (l & 63);
            }
          }
        }
        n < 65536
          ? (t += String.fromCharCode(n))
          : ((n -= 65536),
            (t += String.fromCharCode(
              (n >> 10) + 55296,
              (n & (1024 - 1)) + 56320
            )));
      }
      return t;
    };
    w.ByteBuffer.prototype.__indirect = function (i) {
      return i + this.readInt32(i);
    };
    w.ByteBuffer.prototype.__vector = function (i) {
      return i + this.readInt32(i) + w.SIZEOF_INT;
    };
    w.ByteBuffer.prototype.__vector_len = function (i) {
      return this.readInt32(i + this.readInt32(i));
    };
    w.ByteBuffer.prototype.__has_identifier = function (i) {
      if (i.length != w.FILE_IDENTIFIER_LENGTH)
        throw new Error(
          "FlatBuffers: file identifier must be length " +
            w.FILE_IDENTIFIER_LENGTH
        );
      for (var e = 0; e < w.FILE_IDENTIFIER_LENGTH; e++)
        if (i.charCodeAt(e) != this.readInt8(this.position_ + w.SIZEOF_INT + e))
          return !1;
      return !0;
    };
    w.ByteBuffer.prototype.createLong = function (i, e) {
      return w.Long.create(i, e);
    };
  });
var F,
  Pr = O(() => {
    "use strict";
    wn();
    ((e) => {
      let i;
      ((t) => {
        let o;
        ((n) => {
          let r;
          ((A) => (
            (A[(A.UNDEFINED = 0)] = "UNDEFINED"),
            (A[(A.FLOAT = 1)] = "FLOAT"),
            (A[(A.INT = 2)] = "INT"),
            (A[(A.STRING = 3)] = "STRING"),
            (A[(A.TENSOR = 4)] = "TENSOR"),
            (A[(A.GRAPH = 5)] = "GRAPH"),
            (A[(A.FLOATS = 6)] = "FLOATS"),
            (A[(A.INTS = 7)] = "INTS"),
            (A[(A.STRINGS = 8)] = "STRINGS"),
            (A[(A.TENSORS = 9)] = "TENSORS"),
            (A[(A.GRAPHS = 10)] = "GRAPHS"),
            (A[(A.SPARSE_TENSOR = 11)] = "SPARSE_TENSOR"),
            (A[(A.SPARSE_TENSORS = 12)] = "SPARSE_TENSORS")
          ))((r = n.AttributeType ||= {}));
        })((o = t.fbs ||= {}));
      })((i = e.experimental ||= {}));
    })((F ||= {}));
    ((e) => {
      let i;
      ((t) => {
        let o;
        ((n) => {
          let r;
          ((l) => (
            (l[(l.UNKNOWN = 0)] = "UNKNOWN"),
            (l[(l.VALUE = 1)] = "VALUE"),
            (l[(l.PARAM = 2)] = "PARAM")
          ))((r = n.DimensionValueType ||= {}));
        })((o = t.fbs ||= {}));
      })((i = e.experimental ||= {}));
    })((F ||= {}));
    ((e) => {
      let i;
      ((t) => {
        let o;
        ((n) => {
          let r;
          ((C) => (
            (C[(C.UNDEFINED = 0)] = "UNDEFINED"),
            (C[(C.FLOAT = 1)] = "FLOAT"),
            (C[(C.UINT8 = 2)] = "UINT8"),
            (C[(C.INT8 = 3)] = "INT8"),
            (C[(C.UINT16 = 4)] = "UINT16"),
            (C[(C.INT16 = 5)] = "INT16"),
            (C[(C.INT32 = 6)] = "INT32"),
            (C[(C.INT64 = 7)] = "INT64"),
            (C[(C.STRING = 8)] = "STRING"),
            (C[(C.BOOL = 9)] = "BOOL"),
            (C[(C.FLOAT16 = 10)] = "FLOAT16"),
            (C[(C.DOUBLE = 11)] = "DOUBLE"),
            (C[(C.UINT32 = 12)] = "UINT32"),
            (C[(C.UINT64 = 13)] = "UINT64"),
            (C[(C.COMPLEX64 = 14)] = "COMPLEX64"),
            (C[(C.COMPLEX128 = 15)] = "COMPLEX128"),
            (C[(C.BFLOAT16 = 16)] = "BFLOAT16"),
            (C[(C.FLOAT8E4M3FN = 17)] = "FLOAT8E4M3FN"),
            (C[(C.FLOAT8E4M3FNUZ = 18)] = "FLOAT8E4M3FNUZ"),
            (C[(C.FLOAT8E5M2 = 19)] = "FLOAT8E5M2"),
            (C[(C.FLOAT8E5M2FNUZ = 20)] = "FLOAT8E5M2FNUZ")
          ))((r = n.TensorDataType ||= {}));
        })((o = t.fbs ||= {}));
      })((i = e.experimental ||= {}));
    })((F ||= {}));
    ((e) => {
      let i;
      ((t) => {
        let o;
        ((n) => {
          let r;
          ((u) => (
            (u[(u.Primitive = 0)] = "Primitive"), (u[(u.Fused = 1)] = "Fused")
          ))((r = n.NodeType ||= {}));
        })((o = t.fbs ||= {}));
      })((i = e.experimental ||= {}));
    })((F ||= {}));
    ((e) => {
      let i;
      ((t) => {
        let o;
        ((n) => {
          let r;
          ((f) => (
            (f[(f.NONE = 0)] = "NONE"),
            (f[(f.tensor_type = 1)] = "tensor_type"),
            (f[(f.sequence_type = 2)] = "sequence_type"),
            (f[(f.map_type = 3)] = "map_type")
          ))((r = n.TypeInfoValue ||= {}));
        })((o = t.fbs ||= {}));
      })((i = e.experimental ||= {}));
    })((F ||= {}));
    ((e) => {
      let i;
      ((t) => {
        let o;
        ((n) => {
          class r {
            constructor() {
              this.bb = null;
              this.bb_pos = 0;
            }
            __init(a, u) {
              return (this.bb_pos = a), (this.bb = u), this;
            }
            static getRootAsShape(a, u) {
              return (u || new r()).__init(
                a.readInt32(a.position()) + a.position(),
                a
              );
            }
            static getSizePrefixedRootAsShape(a, u) {
              return (
                a.setPosition(a.position() + w.SIZE_PREFIX_LENGTH),
                (u || new r()).__init(
                  a.readInt32(a.position()) + a.position(),
                  a
                )
              );
            }
            dim(a, u) {
              let l = this.bb.__offset(this.bb_pos, 4);
              return l
                ? (u || new e.experimental.fbs.Dimension()).__init(
                    this.bb.__indirect(
                      this.bb.__vector(this.bb_pos + l) + a * 4
                    ),
                    this.bb
                  )
                : null;
            }
            dimLength() {
              let a = this.bb.__offset(this.bb_pos, 4);
              return a ? this.bb.__vector_len(this.bb_pos + a) : 0;
            }
            static startShape(a) {
              a.startObject(1);
            }
            static addDim(a, u) {
              a.addFieldOffset(0, u, 0);
            }
            static createDimVector(a, u) {
              a.startVector(4, u.length, 4);
              for (let l = u.length - 1; l >= 0; l--) a.addOffset(u[l]);
              return a.endVector();
            }
            static startDimVector(a, u) {
              a.startVector(4, u, 4);
            }
            static endShape(a) {
              return a.endObject();
            }
            static createShape(a, u) {
              return r.startShape(a), r.addDim(a, u), r.endShape(a);
            }
          }
          n.Shape = r;
        })((o = t.fbs ||= {}));
      })((i = e.experimental ||= {}));
    })((F ||= {}));
    ((e) => {
      let i;
      ((t) => {
        let o;
        ((n) => {
          class r {
            constructor() {
              this.bb = null;
              this.bb_pos = 0;
            }
            __init(a, u) {
              return (this.bb_pos = a), (this.bb = u), this;
            }
            static getRootAsDimension(a, u) {
              return (u || new r()).__init(
                a.readInt32(a.position()) + a.position(),
                a
              );
            }
            static getSizePrefixedRootAsDimension(a, u) {
              return (
                a.setPosition(a.position() + w.SIZE_PREFIX_LENGTH),
                (u || new r()).__init(
                  a.readInt32(a.position()) + a.position(),
                  a
                )
              );
            }
            value(a) {
              let u = this.bb.__offset(this.bb_pos, 4);
              return u
                ? (a || new e.experimental.fbs.DimensionValue()).__init(
                    this.bb.__indirect(this.bb_pos + u),
                    this.bb
                  )
                : null;
            }
            denotation(a) {
              let u = this.bb.__offset(this.bb_pos, 6);
              return u ? this.bb.__string(this.bb_pos + u, a) : null;
            }
            static startDimension(a) {
              a.startObject(2);
            }
            static addValue(a, u) {
              a.addFieldOffset(0, u, 0);
            }
            static addDenotation(a, u) {
              a.addFieldOffset(1, u, 0);
            }
            static endDimension(a) {
              return a.endObject();
            }
            static createDimension(a, u, l) {
              return (
                r.startDimension(a),
                r.addValue(a, u),
                r.addDenotation(a, l),
                r.endDimension(a)
              );
            }
          }
          n.Dimension = r;
        })((o = t.fbs ||= {}));
      })((i = e.experimental ||= {}));
    })((F ||= {}));
    ((e) => {
      let i;
      ((t) => {
        let o;
        ((n) => {
          class r {
            constructor() {
              this.bb = null;
              this.bb_pos = 0;
            }
            __init(a, u) {
              return (this.bb_pos = a), (this.bb = u), this;
            }
            static getRootAsDimensionValue(a, u) {
              return (u || new r()).__init(
                a.readInt32(a.position()) + a.position(),
                a
              );
            }
            static getSizePrefixedRootAsDimensionValue(a, u) {
              return (
                a.setPosition(a.position() + w.SIZE_PREFIX_LENGTH),
                (u || new r()).__init(
                  a.readInt32(a.position()) + a.position(),
                  a
                )
              );
            }
            dimType() {
              let a = this.bb.__offset(this.bb_pos, 4);
              return a ? this.bb.readInt8(this.bb_pos + a) : 0;
            }
            dimValue() {
              let a = this.bb.__offset(this.bb_pos, 6);
              return a
                ? this.bb.readInt64(this.bb_pos + a)
                : this.bb.createLong(0, 0);
            }
            dimParam(a) {
              let u = this.bb.__offset(this.bb_pos, 8);
              return u ? this.bb.__string(this.bb_pos + u, a) : null;
            }
            static startDimensionValue(a) {
              a.startObject(3);
            }
            static addDimType(a, u) {
              a.addFieldInt8(0, u, 0);
            }
            static addDimValue(a, u) {
              a.addFieldInt64(1, u, a.createLong(0, 0));
            }
            static addDimParam(a, u) {
              a.addFieldOffset(2, u, 0);
            }
            static endDimensionValue(a) {
              return a.endObject();
            }
            static createDimensionValue(a, u, l, f) {
              return (
                r.startDimensionValue(a),
                r.addDimType(a, u),
                r.addDimValue(a, l),
                r.addDimParam(a, f),
                r.endDimensionValue(a)
              );
            }
          }
          n.DimensionValue = r;
        })((o = t.fbs ||= {}));
      })((i = e.experimental ||= {}));
    })((F ||= {}));
    ((e) => {
      let i;
      ((t) => {
        let o;
        ((n) => {
          class r {
            constructor() {
              this.bb = null;
              this.bb_pos = 0;
            }
            __init(a, u) {
              return (this.bb_pos = a), (this.bb = u), this;
            }
            static getRootAsTensorTypeAndShape(a, u) {
              return (u || new r()).__init(
                a.readInt32(a.position()) + a.position(),
                a
              );
            }
            static getSizePrefixedRootAsTensorTypeAndShape(a, u) {
              return (
                a.setPosition(a.position() + w.SIZE_PREFIX_LENGTH),
                (u || new r()).__init(
                  a.readInt32(a.position()) + a.position(),
                  a
                )
              );
            }
            elemType() {
              let a = this.bb.__offset(this.bb_pos, 4);
              return a ? this.bb.readInt32(this.bb_pos + a) : 0;
            }
            shape(a) {
              let u = this.bb.__offset(this.bb_pos, 6);
              return u
                ? (a || new e.experimental.fbs.Shape()).__init(
                    this.bb.__indirect(this.bb_pos + u),
                    this.bb
                  )
                : null;
            }
            static startTensorTypeAndShape(a) {
              a.startObject(2);
            }
            static addElemType(a, u) {
              a.addFieldInt32(0, u, 0);
            }
            static addShape(a, u) {
              a.addFieldOffset(1, u, 0);
            }
            static endTensorTypeAndShape(a) {
              return a.endObject();
            }
            static createTensorTypeAndShape(a, u, l) {
              return (
                r.startTensorTypeAndShape(a),
                r.addElemType(a, u),
                r.addShape(a, l),
                r.endTensorTypeAndShape(a)
              );
            }
          }
          n.TensorTypeAndShape = r;
        })((o = t.fbs ||= {}));
      })((i = e.experimental ||= {}));
    })((F ||= {}));
    ((e) => {
      let i;
      ((t) => {
        let o;
        ((n) => {
          class r {
            constructor() {
              this.bb = null;
              this.bb_pos = 0;
            }
            __init(a, u) {
              return (this.bb_pos = a), (this.bb = u), this;
            }
            static getRootAsMapType(a, u) {
              return (u || new r()).__init(
                a.readInt32(a.position()) + a.position(),
                a
              );
            }
            static getSizePrefixedRootAsMapType(a, u) {
              return (
                a.setPosition(a.position() + w.SIZE_PREFIX_LENGTH),
                (u || new r()).__init(
                  a.readInt32(a.position()) + a.position(),
                  a
                )
              );
            }
            keyType() {
              let a = this.bb.__offset(this.bb_pos, 4);
              return a ? this.bb.readInt32(this.bb_pos + a) : 0;
            }
            valueType(a) {
              let u = this.bb.__offset(this.bb_pos, 6);
              return u
                ? (a || new e.experimental.fbs.TypeInfo()).__init(
                    this.bb.__indirect(this.bb_pos + u),
                    this.bb
                  )
                : null;
            }
            static startMapType(a) {
              a.startObject(2);
            }
            static addKeyType(a, u) {
              a.addFieldInt32(0, u, 0);
            }
            static addValueType(a, u) {
              a.addFieldOffset(1, u, 0);
            }
            static endMapType(a) {
              return a.endObject();
            }
            static createMapType(a, u, l) {
              return (
                r.startMapType(a),
                r.addKeyType(a, u),
                r.addValueType(a, l),
                r.endMapType(a)
              );
            }
          }
          n.MapType = r;
        })((o = t.fbs ||= {}));
      })((i = e.experimental ||= {}));
    })((F ||= {}));
    ((e) => {
      let i;
      ((t) => {
        let o;
        ((n) => {
          class r {
            constructor() {
              this.bb = null;
              this.bb_pos = 0;
            }
            __init(a, u) {
              return (this.bb_pos = a), (this.bb = u), this;
            }
            static getRootAsSequenceType(a, u) {
              return (u || new r()).__init(
                a.readInt32(a.position()) + a.position(),
                a
              );
            }
            static getSizePrefixedRootAsSequenceType(a, u) {
              return (
                a.setPosition(a.position() + w.SIZE_PREFIX_LENGTH),
                (u || new r()).__init(
                  a.readInt32(a.position()) + a.position(),
                  a
                )
              );
            }
            elemType(a) {
              let u = this.bb.__offset(this.bb_pos, 4);
              return u
                ? (a || new e.experimental.fbs.TypeInfo()).__init(
                    this.bb.__indirect(this.bb_pos + u),
                    this.bb
                  )
                : null;
            }
            static startSequenceType(a) {
              a.startObject(1);
            }
            static addElemType(a, u) {
              a.addFieldOffset(0, u, 0);
            }
            static endSequenceType(a) {
              return a.endObject();
            }
            static createSequenceType(a, u) {
              return (
                r.startSequenceType(a),
                r.addElemType(a, u),
                r.endSequenceType(a)
              );
            }
          }
          n.SequenceType = r;
        })((o = t.fbs ||= {}));
      })((i = e.experimental ||= {}));
    })((F ||= {}));
    ((e) => {
      let i;
      ((t) => {
        let o;
        ((n) => {
          class r {
            constructor() {
              this.bb = null;
              this.bb_pos = 0;
            }
            __init(a, u) {
              return (this.bb_pos = a), (this.bb = u), this;
            }
            nodeIndex() {
              return this.bb.readUint32(this.bb_pos);
            }
            srcArgIndex() {
              return this.bb.readInt32(this.bb_pos + 4);
            }
            dstArgIndex() {
              return this.bb.readInt32(this.bb_pos + 8);
            }
            static createEdgeEnd(a, u, l, f) {
              return (
                a.prep(4, 12),
                a.writeInt32(f),
                a.writeInt32(l),
                a.writeInt32(u),
                a.offset()
              );
            }
          }
          n.EdgeEnd = r;
        })((o = t.fbs ||= {}));
      })((i = e.experimental ||= {}));
    })((F ||= {}));
    ((e) => {
      let i;
      ((t) => {
        let o;
        ((n) => {
          class r {
            constructor() {
              this.bb = null;
              this.bb_pos = 0;
            }
            __init(a, u) {
              return (this.bb_pos = a), (this.bb = u), this;
            }
            static getRootAsNodeEdge(a, u) {
              return (u || new r()).__init(
                a.readInt32(a.position()) + a.position(),
                a
              );
            }
            static getSizePrefixedRootAsNodeEdge(a, u) {
              return (
                a.setPosition(a.position() + w.SIZE_PREFIX_LENGTH),
                (u || new r()).__init(
                  a.readInt32(a.position()) + a.position(),
                  a
                )
              );
            }
            nodeIndex() {
              let a = this.bb.__offset(this.bb_pos, 4);
              return a ? this.bb.readUint32(this.bb_pos + a) : 0;
            }
            inputEdges(a, u) {
              let l = this.bb.__offset(this.bb_pos, 6);
              return l
                ? (u || new e.experimental.fbs.EdgeEnd()).__init(
                    this.bb.__vector(this.bb_pos + l) + a * 12,
                    this.bb
                  )
                : null;
            }
            inputEdgesLength() {
              let a = this.bb.__offset(this.bb_pos, 6);
              return a ? this.bb.__vector_len(this.bb_pos + a) : 0;
            }
            outputEdges(a, u) {
              let l = this.bb.__offset(this.bb_pos, 8);
              return l
                ? (u || new e.experimental.fbs.EdgeEnd()).__init(
                    this.bb.__vector(this.bb_pos + l) + a * 12,
                    this.bb
                  )
                : null;
            }
            outputEdgesLength() {
              let a = this.bb.__offset(this.bb_pos, 8);
              return a ? this.bb.__vector_len(this.bb_pos + a) : 0;
            }
            static startNodeEdge(a) {
              a.startObject(3);
            }
            static addNodeIndex(a, u) {
              a.addFieldInt32(0, u, 0);
            }
            static addInputEdges(a, u) {
              a.addFieldOffset(1, u, 0);
            }
            static startInputEdgesVector(a, u) {
              a.startVector(12, u, 4);
            }
            static addOutputEdges(a, u) {
              a.addFieldOffset(2, u, 0);
            }
            static startOutputEdgesVector(a, u) {
              a.startVector(12, u, 4);
            }
            static endNodeEdge(a) {
              return a.endObject();
            }
            static createNodeEdge(a, u, l, f) {
              return (
                r.startNodeEdge(a),
                r.addNodeIndex(a, u),
                r.addInputEdges(a, l),
                r.addOutputEdges(a, f),
                r.endNodeEdge(a)
              );
            }
          }
          n.NodeEdge = r;
        })((o = t.fbs ||= {}));
      })((i = e.experimental ||= {}));
    })((F ||= {}));
    ((e) => {
      let i;
      ((t) => {
        let o;
        ((n) => {
          class r {
            constructor() {
              this.bb = null;
              this.bb_pos = 0;
            }
            __init(a, u) {
              return (this.bb_pos = a), (this.bb = u), this;
            }
            static getRootAsNode(a, u) {
              return (u || new r()).__init(
                a.readInt32(a.position()) + a.position(),
                a
              );
            }
            static getSizePrefixedRootAsNode(a, u) {
              return (
                a.setPosition(a.position() + w.SIZE_PREFIX_LENGTH),
                (u || new r()).__init(
                  a.readInt32(a.position()) + a.position(),
                  a
                )
              );
            }
            name(a) {
              let u = this.bb.__offset(this.bb_pos, 4);
              return u ? this.bb.__string(this.bb_pos + u, a) : null;
            }
            docString(a) {
              let u = this.bb.__offset(this.bb_pos, 6);
              return u ? this.bb.__string(this.bb_pos + u, a) : null;
            }
            domain(a) {
              let u = this.bb.__offset(this.bb_pos, 8);
              return u ? this.bb.__string(this.bb_pos + u, a) : null;
            }
            sinceVersion() {
              let a = this.bb.__offset(this.bb_pos, 10);
              return a ? this.bb.readInt32(this.bb_pos + a) : 0;
            }
            index() {
              let a = this.bb.__offset(this.bb_pos, 12);
              return a ? this.bb.readUint32(this.bb_pos + a) : 0;
            }
            opType(a) {
              let u = this.bb.__offset(this.bb_pos, 14);
              return u ? this.bb.__string(this.bb_pos + u, a) : null;
            }
            type() {
              let a = this.bb.__offset(this.bb_pos, 16);
              return a ? this.bb.readInt32(this.bb_pos + a) : 0;
            }
            executionProviderType(a) {
              let u = this.bb.__offset(this.bb_pos, 18);
              return u ? this.bb.__string(this.bb_pos + u, a) : null;
            }
            inputs(a, u) {
              let l = this.bb.__offset(this.bb_pos, 20);
              return l
                ? this.bb.__string(this.bb.__vector(this.bb_pos + l) + a * 4, u)
                : null;
            }
            inputsLength() {
              let a = this.bb.__offset(this.bb_pos, 20);
              return a ? this.bb.__vector_len(this.bb_pos + a) : 0;
            }
            outputs(a, u) {
              let l = this.bb.__offset(this.bb_pos, 22);
              return l
                ? this.bb.__string(this.bb.__vector(this.bb_pos + l) + a * 4, u)
                : null;
            }
            outputsLength() {
              let a = this.bb.__offset(this.bb_pos, 22);
              return a ? this.bb.__vector_len(this.bb_pos + a) : 0;
            }
            attributes(a, u) {
              let l = this.bb.__offset(this.bb_pos, 24);
              return l
                ? (u || new e.experimental.fbs.Attribute()).__init(
                    this.bb.__indirect(
                      this.bb.__vector(this.bb_pos + l) + a * 4
                    ),
                    this.bb
                  )
                : null;
            }
            attributesLength() {
              let a = this.bb.__offset(this.bb_pos, 24);
              return a ? this.bb.__vector_len(this.bb_pos + a) : 0;
            }
            inputArgCounts(a) {
              let u = this.bb.__offset(this.bb_pos, 26);
              return u
                ? this.bb.readInt32(this.bb.__vector(this.bb_pos + u) + a * 4)
                : 0;
            }
            inputArgCountsLength() {
              let a = this.bb.__offset(this.bb_pos, 26);
              return a ? this.bb.__vector_len(this.bb_pos + a) : 0;
            }
            inputArgCountsArray() {
              let a = this.bb.__offset(this.bb_pos, 26);
              return a
                ? new Int32Array(
                    this.bb.bytes().buffer,
                    this.bb.bytes().byteOffset +
                      this.bb.__vector(this.bb_pos + a),
                    this.bb.__vector_len(this.bb_pos + a)
                  )
                : null;
            }
            implicitInputs(a, u) {
              let l = this.bb.__offset(this.bb_pos, 28);
              return l
                ? this.bb.__string(this.bb.__vector(this.bb_pos + l) + a * 4, u)
                : null;
            }
            implicitInputsLength() {
              let a = this.bb.__offset(this.bb_pos, 28);
              return a ? this.bb.__vector_len(this.bb_pos + a) : 0;
            }
            static startNode(a) {
              a.startObject(13);
            }
            static addName(a, u) {
              a.addFieldOffset(0, u, 0);
            }
            static addDocString(a, u) {
              a.addFieldOffset(1, u, 0);
            }
            static addDomain(a, u) {
              a.addFieldOffset(2, u, 0);
            }
            static addSinceVersion(a, u) {
              a.addFieldInt32(3, u, 0);
            }
            static addIndex(a, u) {
              a.addFieldInt32(4, u, 0);
            }
            static addOpType(a, u) {
              a.addFieldOffset(5, u, 0);
            }
            static addType(a, u) {
              a.addFieldInt32(6, u, 0);
            }
            static addExecutionProviderType(a, u) {
              a.addFieldOffset(7, u, 0);
            }
            static addInputs(a, u) {
              a.addFieldOffset(8, u, 0);
            }
            static createInputsVector(a, u) {
              a.startVector(4, u.length, 4);
              for (let l = u.length - 1; l >= 0; l--) a.addOffset(u[l]);
              return a.endVector();
            }
            static startInputsVector(a, u) {
              a.startVector(4, u, 4);
            }
            static addOutputs(a, u) {
              a.addFieldOffset(9, u, 0);
            }
            static createOutputsVector(a, u) {
              a.startVector(4, u.length, 4);
              for (let l = u.length - 1; l >= 0; l--) a.addOffset(u[l]);
              return a.endVector();
            }
            static startOutputsVector(a, u) {
              a.startVector(4, u, 4);
            }
            static addAttributes(a, u) {
              a.addFieldOffset(10, u, 0);
            }
            static createAttributesVector(a, u) {
              a.startVector(4, u.length, 4);
              for (let l = u.length - 1; l >= 0; l--) a.addOffset(u[l]);
              return a.endVector();
            }
            static startAttributesVector(a, u) {
              a.startVector(4, u, 4);
            }
            static addInputArgCounts(a, u) {
              a.addFieldOffset(11, u, 0);
            }
            static createInputArgCountsVector(a, u) {
              a.startVector(4, u.length, 4);
              for (let l = u.length - 1; l >= 0; l--) a.addInt32(u[l]);
              return a.endVector();
            }
            static startInputArgCountsVector(a, u) {
              a.startVector(4, u, 4);
            }
            static addImplicitInputs(a, u) {
              a.addFieldOffset(12, u, 0);
            }
            static createImplicitInputsVector(a, u) {
              a.startVector(4, u.length, 4);
              for (let l = u.length - 1; l >= 0; l--) a.addOffset(u[l]);
              return a.endVector();
            }
            static startImplicitInputsVector(a, u) {
              a.startVector(4, u, 4);
            }
            static endNode(a) {
              return a.endObject();
            }
            static createNode(a, u, l, f, p, d, y, T, v, S, L, P, A, M) {
              return (
                r.startNode(a),
                r.addName(a, u),
                r.addDocString(a, l),
                r.addDomain(a, f),
                r.addSinceVersion(a, p),
                r.addIndex(a, d),
                r.addOpType(a, y),
                r.addType(a, T),
                r.addExecutionProviderType(a, v),
                r.addInputs(a, S),
                r.addOutputs(a, L),
                r.addAttributes(a, P),
                r.addInputArgCounts(a, A),
                r.addImplicitInputs(a, M),
                r.endNode(a)
              );
            }
          }
          n.Node = r;
        })((o = t.fbs ||= {}));
      })((i = e.experimental ||= {}));
    })((F ||= {}));
    ((e) => {
      let i;
      ((t) => {
        let o;
        ((n) => {
          class r {
            constructor() {
              this.bb = null;
              this.bb_pos = 0;
            }
            __init(a, u) {
              return (this.bb_pos = a), (this.bb = u), this;
            }
            static getRootAsValueInfo(a, u) {
              return (u || new r()).__init(
                a.readInt32(a.position()) + a.position(),
                a
              );
            }
            static getSizePrefixedRootAsValueInfo(a, u) {
              return (
                a.setPosition(a.position() + w.SIZE_PREFIX_LENGTH),
                (u || new r()).__init(
                  a.readInt32(a.position()) + a.position(),
                  a
                )
              );
            }
            name(a) {
              let u = this.bb.__offset(this.bb_pos, 4);
              return u ? this.bb.__string(this.bb_pos + u, a) : null;
            }
            docString(a) {
              let u = this.bb.__offset(this.bb_pos, 6);
              return u ? this.bb.__string(this.bb_pos + u, a) : null;
            }
            type(a) {
              let u = this.bb.__offset(this.bb_pos, 8);
              return u
                ? (a || new e.experimental.fbs.TypeInfo()).__init(
                    this.bb.__indirect(this.bb_pos + u),
                    this.bb
                  )
                : null;
            }
            static startValueInfo(a) {
              a.startObject(3);
            }
            static addName(a, u) {
              a.addFieldOffset(0, u, 0);
            }
            static addDocString(a, u) {
              a.addFieldOffset(1, u, 0);
            }
            static addType(a, u) {
              a.addFieldOffset(2, u, 0);
            }
            static endValueInfo(a) {
              return a.endObject();
            }
            static createValueInfo(a, u, l, f) {
              return (
                r.startValueInfo(a),
                r.addName(a, u),
                r.addDocString(a, l),
                r.addType(a, f),
                r.endValueInfo(a)
              );
            }
          }
          n.ValueInfo = r;
        })((o = t.fbs ||= {}));
      })((i = e.experimental ||= {}));
    })((F ||= {}));
    ((e) => {
      let i;
      ((t) => {
        let o;
        ((n) => {
          class r {
            constructor() {
              this.bb = null;
              this.bb_pos = 0;
            }
            __init(a, u) {
              return (this.bb_pos = a), (this.bb = u), this;
            }
            static getRootAsTypeInfo(a, u) {
              return (u || new r()).__init(
                a.readInt32(a.position()) + a.position(),
                a
              );
            }
            static getSizePrefixedRootAsTypeInfo(a, u) {
              return (
                a.setPosition(a.position() + w.SIZE_PREFIX_LENGTH),
                (u || new r()).__init(
                  a.readInt32(a.position()) + a.position(),
                  a
                )
              );
            }
            denotation(a) {
              let u = this.bb.__offset(this.bb_pos, 4);
              return u ? this.bb.__string(this.bb_pos + u, a) : null;
            }
            valueType() {
              let a = this.bb.__offset(this.bb_pos, 6);
              return a ? this.bb.readUint8(this.bb_pos + a) : 0;
            }
            value(a) {
              let u = this.bb.__offset(this.bb_pos, 8);
              return u ? this.bb.__union(a, this.bb_pos + u) : null;
            }
            static startTypeInfo(a) {
              a.startObject(3);
            }
            static addDenotation(a, u) {
              a.addFieldOffset(0, u, 0);
            }
            static addValueType(a, u) {
              a.addFieldInt8(1, u, 0);
            }
            static addValue(a, u) {
              a.addFieldOffset(2, u, 0);
            }
            static endTypeInfo(a) {
              return a.endObject();
            }
            static createTypeInfo(a, u, l, f) {
              return (
                r.startTypeInfo(a),
                r.addDenotation(a, u),
                r.addValueType(a, l),
                r.addValue(a, f),
                r.endTypeInfo(a)
              );
            }
          }
          n.TypeInfo = r;
        })((o = t.fbs ||= {}));
      })((i = e.experimental ||= {}));
    })((F ||= {}));
    ((e) => {
      let i;
      ((t) => {
        let o;
        ((n) => {
          class r {
            constructor() {
              this.bb = null;
              this.bb_pos = 0;
            }
            __init(a, u) {
              return (this.bb_pos = a), (this.bb = u), this;
            }
            static getRootAsOperatorSetId(a, u) {
              return (u || new r()).__init(
                a.readInt32(a.position()) + a.position(),
                a
              );
            }
            static getSizePrefixedRootAsOperatorSetId(a, u) {
              return (
                a.setPosition(a.position() + w.SIZE_PREFIX_LENGTH),
                (u || new r()).__init(
                  a.readInt32(a.position()) + a.position(),
                  a
                )
              );
            }
            domain(a) {
              let u = this.bb.__offset(this.bb_pos, 4);
              return u ? this.bb.__string(this.bb_pos + u, a) : null;
            }
            version() {
              let a = this.bb.__offset(this.bb_pos, 6);
              return a
                ? this.bb.readInt64(this.bb_pos + a)
                : this.bb.createLong(0, 0);
            }
            static startOperatorSetId(a) {
              a.startObject(2);
            }
            static addDomain(a, u) {
              a.addFieldOffset(0, u, 0);
            }
            static addVersion(a, u) {
              a.addFieldInt64(1, u, a.createLong(0, 0));
            }
            static endOperatorSetId(a) {
              return a.endObject();
            }
            static createOperatorSetId(a, u, l) {
              return (
                r.startOperatorSetId(a),
                r.addDomain(a, u),
                r.addVersion(a, l),
                r.endOperatorSetId(a)
              );
            }
          }
          n.OperatorSetId = r;
        })((o = t.fbs ||= {}));
      })((i = e.experimental ||= {}));
    })((F ||= {}));
    ((e) => {
      let i;
      ((t) => {
        let o;
        ((n) => {
          class r {
            constructor() {
              this.bb = null;
              this.bb_pos = 0;
            }
            __init(a, u) {
              return (this.bb_pos = a), (this.bb = u), this;
            }
            static getRootAsTensor(a, u) {
              return (u || new r()).__init(
                a.readInt32(a.position()) + a.position(),
                a
              );
            }
            static getSizePrefixedRootAsTensor(a, u) {
              return (
                a.setPosition(a.position() + w.SIZE_PREFIX_LENGTH),
                (u || new r()).__init(
                  a.readInt32(a.position()) + a.position(),
                  a
                )
              );
            }
            name(a) {
              let u = this.bb.__offset(this.bb_pos, 4);
              return u ? this.bb.__string(this.bb_pos + u, a) : null;
            }
            docString(a) {
              let u = this.bb.__offset(this.bb_pos, 6);
              return u ? this.bb.__string(this.bb_pos + u, a) : null;
            }
            dims(a) {
              let u = this.bb.__offset(this.bb_pos, 8);
              return u
                ? this.bb.readInt64(this.bb.__vector(this.bb_pos + u) + a * 8)
                : this.bb.createLong(0, 0);
            }
            dimsLength() {
              let a = this.bb.__offset(this.bb_pos, 8);
              return a ? this.bb.__vector_len(this.bb_pos + a) : 0;
            }
            dataType() {
              let a = this.bb.__offset(this.bb_pos, 10);
              return a ? this.bb.readInt32(this.bb_pos + a) : 0;
            }
            rawData(a) {
              let u = this.bb.__offset(this.bb_pos, 12);
              return u
                ? this.bb.readUint8(this.bb.__vector(this.bb_pos + u) + a)
                : 0;
            }
            rawDataLength() {
              let a = this.bb.__offset(this.bb_pos, 12);
              return a ? this.bb.__vector_len(this.bb_pos + a) : 0;
            }
            rawDataArray() {
              let a = this.bb.__offset(this.bb_pos, 12);
              return a
                ? new Uint8Array(
                    this.bb.bytes().buffer,
                    this.bb.bytes().byteOffset +
                      this.bb.__vector(this.bb_pos + a),
                    this.bb.__vector_len(this.bb_pos + a)
                  )
                : null;
            }
            stringData(a, u) {
              let l = this.bb.__offset(this.bb_pos, 14);
              return l
                ? this.bb.__string(this.bb.__vector(this.bb_pos + l) + a * 4, u)
                : null;
            }
            stringDataLength() {
              let a = this.bb.__offset(this.bb_pos, 14);
              return a ? this.bb.__vector_len(this.bb_pos + a) : 0;
            }
            static startTensor(a) {
              a.startObject(6);
            }
            static addName(a, u) {
              a.addFieldOffset(0, u, 0);
            }
            static addDocString(a, u) {
              a.addFieldOffset(1, u, 0);
            }
            static addDims(a, u) {
              a.addFieldOffset(2, u, 0);
            }
            static createDimsVector(a, u) {
              a.startVector(8, u.length, 8);
              for (let l = u.length - 1; l >= 0; l--) a.addInt64(u[l]);
              return a.endVector();
            }
            static startDimsVector(a, u) {
              a.startVector(8, u, 8);
            }
            static addDataType(a, u) {
              a.addFieldInt32(3, u, 0);
            }
            static addRawData(a, u) {
              a.addFieldOffset(4, u, 0);
            }
            static createRawDataVector(a, u) {
              a.startVector(1, u.length, 1);
              for (let l = u.length - 1; l >= 0; l--) a.addInt8(u[l]);
              return a.endVector();
            }
            static startRawDataVector(a, u) {
              a.startVector(1, u, 1);
            }
            static addStringData(a, u) {
              a.addFieldOffset(5, u, 0);
            }
            static createStringDataVector(a, u) {
              a.startVector(4, u.length, 4);
              for (let l = u.length - 1; l >= 0; l--) a.addOffset(u[l]);
              return a.endVector();
            }
            static startStringDataVector(a, u) {
              a.startVector(4, u, 4);
            }
            static endTensor(a) {
              return a.endObject();
            }
            static createTensor(a, u, l, f, p, d, y) {
              return (
                r.startTensor(a),
                r.addName(a, u),
                r.addDocString(a, l),
                r.addDims(a, f),
                r.addDataType(a, p),
                r.addRawData(a, d),
                r.addStringData(a, y),
                r.endTensor(a)
              );
            }
          }
          n.Tensor = r;
        })((o = t.fbs ||= {}));
      })((i = e.experimental ||= {}));
    })((F ||= {}));
    ((e) => {
      let i;
      ((t) => {
        let o;
        ((n) => {
          class r {
            constructor() {
              this.bb = null;
              this.bb_pos = 0;
            }
            __init(a, u) {
              return (this.bb_pos = a), (this.bb = u), this;
            }
            static getRootAsSparseTensor(a, u) {
              return (u || new r()).__init(
                a.readInt32(a.position()) + a.position(),
                a
              );
            }
            static getSizePrefixedRootAsSparseTensor(a, u) {
              return (
                a.setPosition(a.position() + w.SIZE_PREFIX_LENGTH),
                (u || new r()).__init(
                  a.readInt32(a.position()) + a.position(),
                  a
                )
              );
            }
            values(a) {
              let u = this.bb.__offset(this.bb_pos, 4);
              return u
                ? (a || new e.experimental.fbs.Tensor()).__init(
                    this.bb.__indirect(this.bb_pos + u),
                    this.bb
                  )
                : null;
            }
            indices(a) {
              let u = this.bb.__offset(this.bb_pos, 6);
              return u
                ? (a || new e.experimental.fbs.Tensor()).__init(
                    this.bb.__indirect(this.bb_pos + u),
                    this.bb
                  )
                : null;
            }
            dims(a) {
              let u = this.bb.__offset(this.bb_pos, 8);
              return u
                ? this.bb.readInt64(this.bb.__vector(this.bb_pos + u) + a * 8)
                : this.bb.createLong(0, 0);
            }
            dimsLength() {
              let a = this.bb.__offset(this.bb_pos, 8);
              return a ? this.bb.__vector_len(this.bb_pos + a) : 0;
            }
            static startSparseTensor(a) {
              a.startObject(3);
            }
            static addValues(a, u) {
              a.addFieldOffset(0, u, 0);
            }
            static addIndices(a, u) {
              a.addFieldOffset(1, u, 0);
            }
            static addDims(a, u) {
              a.addFieldOffset(2, u, 0);
            }
            static createDimsVector(a, u) {
              a.startVector(8, u.length, 8);
              for (let l = u.length - 1; l >= 0; l--) a.addInt64(u[l]);
              return a.endVector();
            }
            static startDimsVector(a, u) {
              a.startVector(8, u, 8);
            }
            static endSparseTensor(a) {
              return a.endObject();
            }
            static createSparseTensor(a, u, l, f) {
              return (
                r.startSparseTensor(a),
                r.addValues(a, u),
                r.addIndices(a, l),
                r.addDims(a, f),
                r.endSparseTensor(a)
              );
            }
          }
          n.SparseTensor = r;
        })((o = t.fbs ||= {}));
      })((i = e.experimental ||= {}));
    })((F ||= {}));
    ((e) => {
      let i;
      ((t) => {
        let o;
        ((n) => {
          class r {
            constructor() {
              this.bb = null;
              this.bb_pos = 0;
            }
            __init(a, u) {
              return (this.bb_pos = a), (this.bb = u), this;
            }
            static getRootAsAttribute(a, u) {
              return (u || new r()).__init(
                a.readInt32(a.position()) + a.position(),
                a
              );
            }
            static getSizePrefixedRootAsAttribute(a, u) {
              return (
                a.setPosition(a.position() + w.SIZE_PREFIX_LENGTH),
                (u || new r()).__init(
                  a.readInt32(a.position()) + a.position(),
                  a
                )
              );
            }
            name(a) {
              let u = this.bb.__offset(this.bb_pos, 4);
              return u ? this.bb.__string(this.bb_pos + u, a) : null;
            }
            docString(a) {
              let u = this.bb.__offset(this.bb_pos, 6);
              return u ? this.bb.__string(this.bb_pos + u, a) : null;
            }
            type() {
              let a = this.bb.__offset(this.bb_pos, 8);
              return a ? this.bb.readInt32(this.bb_pos + a) : 0;
            }
            f() {
              let a = this.bb.__offset(this.bb_pos, 10);
              return a ? this.bb.readFloat32(this.bb_pos + a) : 0;
            }
            i() {
              let a = this.bb.__offset(this.bb_pos, 12);
              return a
                ? this.bb.readInt64(this.bb_pos + a)
                : this.bb.createLong(0, 0);
            }
            s(a) {
              let u = this.bb.__offset(this.bb_pos, 14);
              return u ? this.bb.__string(this.bb_pos + u, a) : null;
            }
            t(a) {
              let u = this.bb.__offset(this.bb_pos, 16);
              return u
                ? (a || new e.experimental.fbs.Tensor()).__init(
                    this.bb.__indirect(this.bb_pos + u),
                    this.bb
                  )
                : null;
            }
            g(a) {
              let u = this.bb.__offset(this.bb_pos, 18);
              return u
                ? (a || new e.experimental.fbs.Graph()).__init(
                    this.bb.__indirect(this.bb_pos + u),
                    this.bb
                  )
                : null;
            }
            floats(a) {
              let u = this.bb.__offset(this.bb_pos, 20);
              return u
                ? this.bb.readFloat32(this.bb.__vector(this.bb_pos + u) + a * 4)
                : 0;
            }
            floatsLength() {
              let a = this.bb.__offset(this.bb_pos, 20);
              return a ? this.bb.__vector_len(this.bb_pos + a) : 0;
            }
            floatsArray() {
              let a = this.bb.__offset(this.bb_pos, 20);
              return a
                ? new Float32Array(
                    this.bb.bytes().buffer,
                    this.bb.bytes().byteOffset +
                      this.bb.__vector(this.bb_pos + a),
                    this.bb.__vector_len(this.bb_pos + a)
                  )
                : null;
            }
            ints(a) {
              let u = this.bb.__offset(this.bb_pos, 22);
              return u
                ? this.bb.readInt64(this.bb.__vector(this.bb_pos + u) + a * 8)
                : this.bb.createLong(0, 0);
            }
            intsLength() {
              let a = this.bb.__offset(this.bb_pos, 22);
              return a ? this.bb.__vector_len(this.bb_pos + a) : 0;
            }
            strings(a, u) {
              let l = this.bb.__offset(this.bb_pos, 24);
              return l
                ? this.bb.__string(this.bb.__vector(this.bb_pos + l) + a * 4, u)
                : null;
            }
            stringsLength() {
              let a = this.bb.__offset(this.bb_pos, 24);
              return a ? this.bb.__vector_len(this.bb_pos + a) : 0;
            }
            tensors(a, u) {
              let l = this.bb.__offset(this.bb_pos, 26);
              return l
                ? (u || new e.experimental.fbs.Tensor()).__init(
                    this.bb.__indirect(
                      this.bb.__vector(this.bb_pos + l) + a * 4
                    ),
                    this.bb
                  )
                : null;
            }
            tensorsLength() {
              let a = this.bb.__offset(this.bb_pos, 26);
              return a ? this.bb.__vector_len(this.bb_pos + a) : 0;
            }
            graphs(a, u) {
              let l = this.bb.__offset(this.bb_pos, 28);
              return l
                ? (u || new e.experimental.fbs.Graph()).__init(
                    this.bb.__indirect(
                      this.bb.__vector(this.bb_pos + l) + a * 4
                    ),
                    this.bb
                  )
                : null;
            }
            graphsLength() {
              let a = this.bb.__offset(this.bb_pos, 28);
              return a ? this.bb.__vector_len(this.bb_pos + a) : 0;
            }
            static startAttribute(a) {
              a.startObject(13);
            }
            static addName(a, u) {
              a.addFieldOffset(0, u, 0);
            }
            static addDocString(a, u) {
              a.addFieldOffset(1, u, 0);
            }
            static addType(a, u) {
              a.addFieldInt32(2, u, 0);
            }
            static addF(a, u) {
              a.addFieldFloat32(3, u, 0);
            }
            static addI(a, u) {
              a.addFieldInt64(4, u, a.createLong(0, 0));
            }
            static addS(a, u) {
              a.addFieldOffset(5, u, 0);
            }
            static addT(a, u) {
              a.addFieldOffset(6, u, 0);
            }
            static addG(a, u) {
              a.addFieldOffset(7, u, 0);
            }
            static addFloats(a, u) {
              a.addFieldOffset(8, u, 0);
            }
            static createFloatsVector(a, u) {
              a.startVector(4, u.length, 4);
              for (let l = u.length - 1; l >= 0; l--) a.addFloat32(u[l]);
              return a.endVector();
            }
            static startFloatsVector(a, u) {
              a.startVector(4, u, 4);
            }
            static addInts(a, u) {
              a.addFieldOffset(9, u, 0);
            }
            static createIntsVector(a, u) {
              a.startVector(8, u.length, 8);
              for (let l = u.length - 1; l >= 0; l--) a.addInt64(u[l]);
              return a.endVector();
            }
            static startIntsVector(a, u) {
              a.startVector(8, u, 8);
            }
            static addStrings(a, u) {
              a.addFieldOffset(10, u, 0);
            }
            static createStringsVector(a, u) {
              a.startVector(4, u.length, 4);
              for (let l = u.length - 1; l >= 0; l--) a.addOffset(u[l]);
              return a.endVector();
            }
            static startStringsVector(a, u) {
              a.startVector(4, u, 4);
            }
            static addTensors(a, u) {
              a.addFieldOffset(11, u, 0);
            }
            static createTensorsVector(a, u) {
              a.startVector(4, u.length, 4);
              for (let l = u.length - 1; l >= 0; l--) a.addOffset(u[l]);
              return a.endVector();
            }
            static startTensorsVector(a, u) {
              a.startVector(4, u, 4);
            }
            static addGraphs(a, u) {
              a.addFieldOffset(12, u, 0);
            }
            static createGraphsVector(a, u) {
              a.startVector(4, u.length, 4);
              for (let l = u.length - 1; l >= 0; l--) a.addOffset(u[l]);
              return a.endVector();
            }
            static startGraphsVector(a, u) {
              a.startVector(4, u, 4);
            }
            static endAttribute(a) {
              return a.endObject();
            }
            static createAttribute(a, u, l, f, p, d, y, T, v, S, L, P, A, M) {
              return (
                r.startAttribute(a),
                r.addName(a, u),
                r.addDocString(a, l),
                r.addType(a, f),
                r.addF(a, p),
                r.addI(a, d),
                r.addS(a, y),
                r.addT(a, T),
                r.addG(a, v),
                r.addFloats(a, S),
                r.addInts(a, L),
                r.addStrings(a, P),
                r.addTensors(a, A),
                r.addGraphs(a, M),
                r.endAttribute(a)
              );
            }
          }
          n.Attribute = r;
        })((o = t.fbs ||= {}));
      })((i = e.experimental ||= {}));
    })((F ||= {}));
    ((e) => {
      let i;
      ((t) => {
        let o;
        ((n) => {
          class r {
            constructor() {
              this.bb = null;
              this.bb_pos = 0;
            }
            __init(a, u) {
              return (this.bb_pos = a), (this.bb = u), this;
            }
            static getRootAsGraph(a, u) {
              return (u || new r()).__init(
                a.readInt32(a.position()) + a.position(),
                a
              );
            }
            static getSizePrefixedRootAsGraph(a, u) {
              return (
                a.setPosition(a.position() + w.SIZE_PREFIX_LENGTH),
                (u || new r()).__init(
                  a.readInt32(a.position()) + a.position(),
                  a
                )
              );
            }
            initializers(a, u) {
              let l = this.bb.__offset(this.bb_pos, 4);
              return l
                ? (u || new e.experimental.fbs.Tensor()).__init(
                    this.bb.__indirect(
                      this.bb.__vector(this.bb_pos + l) + a * 4
                    ),
                    this.bb
                  )
                : null;
            }
            initializersLength() {
              let a = this.bb.__offset(this.bb_pos, 4);
              return a ? this.bb.__vector_len(this.bb_pos + a) : 0;
            }
            nodeArgs(a, u) {
              let l = this.bb.__offset(this.bb_pos, 6);
              return l
                ? (u || new e.experimental.fbs.ValueInfo()).__init(
                    this.bb.__indirect(
                      this.bb.__vector(this.bb_pos + l) + a * 4
                    ),
                    this.bb
                  )
                : null;
            }
            nodeArgsLength() {
              let a = this.bb.__offset(this.bb_pos, 6);
              return a ? this.bb.__vector_len(this.bb_pos + a) : 0;
            }
            nodes(a, u) {
              let l = this.bb.__offset(this.bb_pos, 8);
              return l
                ? (u || new e.experimental.fbs.Node()).__init(
                    this.bb.__indirect(
                      this.bb.__vector(this.bb_pos + l) + a * 4
                    ),
                    this.bb
                  )
                : null;
            }
            nodesLength() {
              let a = this.bb.__offset(this.bb_pos, 8);
              return a ? this.bb.__vector_len(this.bb_pos + a) : 0;
            }
            maxNodeIndex() {
              let a = this.bb.__offset(this.bb_pos, 10);
              return a ? this.bb.readUint32(this.bb_pos + a) : 0;
            }
            nodeEdges(a, u) {
              let l = this.bb.__offset(this.bb_pos, 12);
              return l
                ? (u || new e.experimental.fbs.NodeEdge()).__init(
                    this.bb.__indirect(
                      this.bb.__vector(this.bb_pos + l) + a * 4
                    ),
                    this.bb
                  )
                : null;
            }
            nodeEdgesLength() {
              let a = this.bb.__offset(this.bb_pos, 12);
              return a ? this.bb.__vector_len(this.bb_pos + a) : 0;
            }
            inputs(a, u) {
              let l = this.bb.__offset(this.bb_pos, 14);
              return l
                ? this.bb.__string(this.bb.__vector(this.bb_pos + l) + a * 4, u)
                : null;
            }
            inputsLength() {
              let a = this.bb.__offset(this.bb_pos, 14);
              return a ? this.bb.__vector_len(this.bb_pos + a) : 0;
            }
            outputs(a, u) {
              let l = this.bb.__offset(this.bb_pos, 16);
              return l
                ? this.bb.__string(this.bb.__vector(this.bb_pos + l) + a * 4, u)
                : null;
            }
            outputsLength() {
              let a = this.bb.__offset(this.bb_pos, 16);
              return a ? this.bb.__vector_len(this.bb_pos + a) : 0;
            }
            sparseInitializers(a, u) {
              let l = this.bb.__offset(this.bb_pos, 18);
              return l
                ? (u || new e.experimental.fbs.SparseTensor()).__init(
                    this.bb.__indirect(
                      this.bb.__vector(this.bb_pos + l) + a * 4
                    ),
                    this.bb
                  )
                : null;
            }
            sparseInitializersLength() {
              let a = this.bb.__offset(this.bb_pos, 18);
              return a ? this.bb.__vector_len(this.bb_pos + a) : 0;
            }
            static startGraph(a) {
              a.startObject(8);
            }
            static addInitializers(a, u) {
              a.addFieldOffset(0, u, 0);
            }
            static createInitializersVector(a, u) {
              a.startVector(4, u.length, 4);
              for (let l = u.length - 1; l >= 0; l--) a.addOffset(u[l]);
              return a.endVector();
            }
            static startInitializersVector(a, u) {
              a.startVector(4, u, 4);
            }
            static addNodeArgs(a, u) {
              a.addFieldOffset(1, u, 0);
            }
            static createNodeArgsVector(a, u) {
              a.startVector(4, u.length, 4);
              for (let l = u.length - 1; l >= 0; l--) a.addOffset(u[l]);
              return a.endVector();
            }
            static startNodeArgsVector(a, u) {
              a.startVector(4, u, 4);
            }
            static addNodes(a, u) {
              a.addFieldOffset(2, u, 0);
            }
            static createNodesVector(a, u) {
              a.startVector(4, u.length, 4);
              for (let l = u.length - 1; l >= 0; l--) a.addOffset(u[l]);
              return a.endVector();
            }
            static startNodesVector(a, u) {
              a.startVector(4, u, 4);
            }
            static addMaxNodeIndex(a, u) {
              a.addFieldInt32(3, u, 0);
            }
            static addNodeEdges(a, u) {
              a.addFieldOffset(4, u, 0);
            }
            static createNodeEdgesVector(a, u) {
              a.startVector(4, u.length, 4);
              for (let l = u.length - 1; l >= 0; l--) a.addOffset(u[l]);
              return a.endVector();
            }
            static startNodeEdgesVector(a, u) {
              a.startVector(4, u, 4);
            }
            static addInputs(a, u) {
              a.addFieldOffset(5, u, 0);
            }
            static createInputsVector(a, u) {
              a.startVector(4, u.length, 4);
              for (let l = u.length - 1; l >= 0; l--) a.addOffset(u[l]);
              return a.endVector();
            }
            static startInputsVector(a, u) {
              a.startVector(4, u, 4);
            }
            static addOutputs(a, u) {
              a.addFieldOffset(6, u, 0);
            }
            static createOutputsVector(a, u) {
              a.startVector(4, u.length, 4);
              for (let l = u.length - 1; l >= 0; l--) a.addOffset(u[l]);
              return a.endVector();
            }
            static startOutputsVector(a, u) {
              a.startVector(4, u, 4);
            }
            static addSparseInitializers(a, u) {
              a.addFieldOffset(7, u, 0);
            }
            static createSparseInitializersVector(a, u) {
              a.startVector(4, u.length, 4);
              for (let l = u.length - 1; l >= 0; l--) a.addOffset(u[l]);
              return a.endVector();
            }
            static startSparseInitializersVector(a, u) {
              a.startVector(4, u, 4);
            }
            static endGraph(a) {
              return a.endObject();
            }
            static createGraph(a, u, l, f, p, d, y, T, v) {
              return (
                r.startGraph(a),
                r.addInitializers(a, u),
                r.addNodeArgs(a, l),
                r.addNodes(a, f),
                r.addMaxNodeIndex(a, p),
                r.addNodeEdges(a, d),
                r.addInputs(a, y),
                r.addOutputs(a, T),
                r.addSparseInitializers(a, v),
                r.endGraph(a)
              );
            }
          }
          n.Graph = r;
        })((o = t.fbs ||= {}));
      })((i = e.experimental ||= {}));
    })((F ||= {}));
    ((e) => {
      let i;
      ((t) => {
        let o;
        ((n) => {
          class r {
            constructor() {
              this.bb = null;
              this.bb_pos = 0;
            }
            __init(a, u) {
              return (this.bb_pos = a), (this.bb = u), this;
            }
            static getRootAsModel(a, u) {
              return (u || new r()).__init(
                a.readInt32(a.position()) + a.position(),
                a
              );
            }
            static getSizePrefixedRootAsModel(a, u) {
              return (
                a.setPosition(a.position() + w.SIZE_PREFIX_LENGTH),
                (u || new r()).__init(
                  a.readInt32(a.position()) + a.position(),
                  a
                )
              );
            }
            irVersion() {
              let a = this.bb.__offset(this.bb_pos, 4);
              return a
                ? this.bb.readInt64(this.bb_pos + a)
                : this.bb.createLong(0, 0);
            }
            opsetImport(a, u) {
              let l = this.bb.__offset(this.bb_pos, 6);
              return l
                ? (u || new e.experimental.fbs.OperatorSetId()).__init(
                    this.bb.__indirect(
                      this.bb.__vector(this.bb_pos + l) + a * 4
                    ),
                    this.bb
                  )
                : null;
            }
            opsetImportLength() {
              let a = this.bb.__offset(this.bb_pos, 6);
              return a ? this.bb.__vector_len(this.bb_pos + a) : 0;
            }
            producerName(a) {
              let u = this.bb.__offset(this.bb_pos, 8);
              return u ? this.bb.__string(this.bb_pos + u, a) : null;
            }
            producerVersion(a) {
              let u = this.bb.__offset(this.bb_pos, 10);
              return u ? this.bb.__string(this.bb_pos + u, a) : null;
            }
            domain(a) {
              let u = this.bb.__offset(this.bb_pos, 12);
              return u ? this.bb.__string(this.bb_pos + u, a) : null;
            }
            modelVersion() {
              let a = this.bb.__offset(this.bb_pos, 14);
              return a
                ? this.bb.readInt64(this.bb_pos + a)
                : this.bb.createLong(0, 0);
            }
            docString(a) {
              let u = this.bb.__offset(this.bb_pos, 16);
              return u ? this.bb.__string(this.bb_pos + u, a) : null;
            }
            graph(a) {
              let u = this.bb.__offset(this.bb_pos, 18);
              return u
                ? (a || new e.experimental.fbs.Graph()).__init(
                    this.bb.__indirect(this.bb_pos + u),
                    this.bb
                  )
                : null;
            }
            graphDocString(a) {
              let u = this.bb.__offset(this.bb_pos, 20);
              return u ? this.bb.__string(this.bb_pos + u, a) : null;
            }
            static startModel(a) {
              a.startObject(9);
            }
            static addIrVersion(a, u) {
              a.addFieldInt64(0, u, a.createLong(0, 0));
            }
            static addOpsetImport(a, u) {
              a.addFieldOffset(1, u, 0);
            }
            static createOpsetImportVector(a, u) {
              a.startVector(4, u.length, 4);
              for (let l = u.length - 1; l >= 0; l--) a.addOffset(u[l]);
              return a.endVector();
            }
            static startOpsetImportVector(a, u) {
              a.startVector(4, u, 4);
            }
            static addProducerName(a, u) {
              a.addFieldOffset(2, u, 0);
            }
            static addProducerVersion(a, u) {
              a.addFieldOffset(3, u, 0);
            }
            static addDomain(a, u) {
              a.addFieldOffset(4, u, 0);
            }
            static addModelVersion(a, u) {
              a.addFieldInt64(5, u, a.createLong(0, 0));
            }
            static addDocString(a, u) {
              a.addFieldOffset(6, u, 0);
            }
            static addGraph(a, u) {
              a.addFieldOffset(7, u, 0);
            }
            static addGraphDocString(a, u) {
              a.addFieldOffset(8, u, 0);
            }
            static endModel(a) {
              return a.endObject();
            }
            static createModel(a, u, l, f, p, d, y, T, v, S) {
              return (
                r.startModel(a),
                r.addIrVersion(a, u),
                r.addOpsetImport(a, l),
                r.addProducerName(a, f),
                r.addProducerVersion(a, p),
                r.addDomain(a, d),
                r.addModelVersion(a, y),
                r.addDocString(a, T),
                r.addGraph(a, v),
                r.addGraphDocString(a, S),
                r.endModel(a)
              );
            }
          }
          n.Model = r;
        })((o = t.fbs ||= {}));
      })((i = e.experimental ||= {}));
    })((F ||= {}));
    ((e) => {
      let i;
      ((t) => {
        let o;
        ((n) => {
          class r {
            constructor() {
              this.bb = null;
              this.bb_pos = 0;
            }
            __init(a, u) {
              return (this.bb_pos = a), (this.bb = u), this;
            }
            static getRootAsKernelCreateInfos(a, u) {
              return (u || new r()).__init(
                a.readInt32(a.position()) + a.position(),
                a
              );
            }
            static getSizePrefixedRootAsKernelCreateInfos(a, u) {
              return (
                a.setPosition(a.position() + w.SIZE_PREFIX_LENGTH),
                (u || new r()).__init(
                  a.readInt32(a.position()) + a.position(),
                  a
                )
              );
            }
            nodeIndices(a) {
              let u = this.bb.__offset(this.bb_pos, 4);
              return u
                ? this.bb.readUint32(this.bb.__vector(this.bb_pos + u) + a * 4)
                : 0;
            }
            nodeIndicesLength() {
              let a = this.bb.__offset(this.bb_pos, 4);
              return a ? this.bb.__vector_len(this.bb_pos + a) : 0;
            }
            nodeIndicesArray() {
              let a = this.bb.__offset(this.bb_pos, 4);
              return a
                ? new Uint32Array(
                    this.bb.bytes().buffer,
                    this.bb.bytes().byteOffset +
                      this.bb.__vector(this.bb_pos + a),
                    this.bb.__vector_len(this.bb_pos + a)
                  )
                : null;
            }
            kernelDefHashes(a) {
              let u = this.bb.__offset(this.bb_pos, 6);
              return u
                ? this.bb.readUint64(this.bb.__vector(this.bb_pos + u) + a * 8)
                : this.bb.createLong(0, 0);
            }
            kernelDefHashesLength() {
              let a = this.bb.__offset(this.bb_pos, 6);
              return a ? this.bb.__vector_len(this.bb_pos + a) : 0;
            }
            static startKernelCreateInfos(a) {
              a.startObject(2);
            }
            static addNodeIndices(a, u) {
              a.addFieldOffset(0, u, 0);
            }
            static createNodeIndicesVector(a, u) {
              a.startVector(4, u.length, 4);
              for (let l = u.length - 1; l >= 0; l--) a.addInt32(u[l]);
              return a.endVector();
            }
            static startNodeIndicesVector(a, u) {
              a.startVector(4, u, 4);
            }
            static addKernelDefHashes(a, u) {
              a.addFieldOffset(1, u, 0);
            }
            static createKernelDefHashesVector(a, u) {
              a.startVector(8, u.length, 8);
              for (let l = u.length - 1; l >= 0; l--) a.addInt64(u[l]);
              return a.endVector();
            }
            static startKernelDefHashesVector(a, u) {
              a.startVector(8, u, 8);
            }
            static endKernelCreateInfos(a) {
              return a.endObject();
            }
            static createKernelCreateInfos(a, u, l) {
              return (
                r.startKernelCreateInfos(a),
                r.addNodeIndices(a, u),
                r.addKernelDefHashes(a, l),
                r.endKernelCreateInfos(a)
              );
            }
          }
          n.KernelCreateInfos = r;
        })((o = t.fbs ||= {}));
      })((i = e.experimental ||= {}));
    })((F ||= {}));
    ((e) => {
      let i;
      ((t) => {
        let o;
        ((n) => {
          class r {
            constructor() {
              this.bb = null;
              this.bb_pos = 0;
            }
            __init(a, u) {
              return (this.bb_pos = a), (this.bb = u), this;
            }
            static getRootAsSubGraphSessionState(a, u) {
              return (u || new r()).__init(
                a.readInt32(a.position()) + a.position(),
                a
              );
            }
            static getSizePrefixedRootAsSubGraphSessionState(a, u) {
              return (
                a.setPosition(a.position() + w.SIZE_PREFIX_LENGTH),
                (u || new r()).__init(
                  a.readInt32(a.position()) + a.position(),
                  a
                )
              );
            }
            graphId(a) {
              let u = this.bb.__offset(this.bb_pos, 4);
              return u ? this.bb.__string(this.bb_pos + u, a) : null;
            }
            sessionState(a) {
              let u = this.bb.__offset(this.bb_pos, 6);
              return u
                ? (a || new e.experimental.fbs.SessionState()).__init(
                    this.bb.__indirect(this.bb_pos + u),
                    this.bb
                  )
                : null;
            }
            static startSubGraphSessionState(a) {
              a.startObject(2);
            }
            static addGraphId(a, u) {
              a.addFieldOffset(0, u, 0);
            }
            static addSessionState(a, u) {
              a.addFieldOffset(1, u, 0);
            }
            static endSubGraphSessionState(a) {
              let u = a.endObject();
              return a.requiredField(u, 4), u;
            }
            static createSubGraphSessionState(a, u, l) {
              return (
                r.startSubGraphSessionState(a),
                r.addGraphId(a, u),
                r.addSessionState(a, l),
                r.endSubGraphSessionState(a)
              );
            }
          }
          n.SubGraphSessionState = r;
        })((o = t.fbs ||= {}));
      })((i = e.experimental ||= {}));
    })((F ||= {}));
    ((e) => {
      let i;
      ((t) => {
        let o;
        ((n) => {
          class r {
            constructor() {
              this.bb = null;
              this.bb_pos = 0;
            }
            __init(a, u) {
              return (this.bb_pos = a), (this.bb = u), this;
            }
            static getRootAsSessionState(a, u) {
              return (u || new r()).__init(
                a.readInt32(a.position()) + a.position(),
                a
              );
            }
            static getSizePrefixedRootAsSessionState(a, u) {
              return (
                a.setPosition(a.position() + w.SIZE_PREFIX_LENGTH),
                (u || new r()).__init(
                  a.readInt32(a.position()) + a.position(),
                  a
                )
              );
            }
            kernels(a) {
              let u = this.bb.__offset(this.bb_pos, 4);
              return u
                ? (a || new e.experimental.fbs.KernelCreateInfos()).__init(
                    this.bb.__indirect(this.bb_pos + u),
                    this.bb
                  )
                : null;
            }
            subGraphSessionStates(a, u) {
              let l = this.bb.__offset(this.bb_pos, 6);
              return l
                ? (u || new e.experimental.fbs.SubGraphSessionState()).__init(
                    this.bb.__indirect(
                      this.bb.__vector(this.bb_pos + l) + a * 4
                    ),
                    this.bb
                  )
                : null;
            }
            subGraphSessionStatesLength() {
              let a = this.bb.__offset(this.bb_pos, 6);
              return a ? this.bb.__vector_len(this.bb_pos + a) : 0;
            }
            static startSessionState(a) {
              a.startObject(2);
            }
            static addKernels(a, u) {
              a.addFieldOffset(0, u, 0);
            }
            static addSubGraphSessionStates(a, u) {
              a.addFieldOffset(1, u, 0);
            }
            static createSubGraphSessionStatesVector(a, u) {
              a.startVector(4, u.length, 4);
              for (let l = u.length - 1; l >= 0; l--) a.addOffset(u[l]);
              return a.endVector();
            }
            static startSubGraphSessionStatesVector(a, u) {
              a.startVector(4, u, 4);
            }
            static endSessionState(a) {
              return a.endObject();
            }
            static createSessionState(a, u, l) {
              return (
                r.startSessionState(a),
                r.addKernels(a, u),
                r.addSubGraphSessionStates(a, l),
                r.endSessionState(a)
              );
            }
          }
          n.SessionState = r;
        })((o = t.fbs ||= {}));
      })((i = e.experimental ||= {}));
    })((F ||= {}));
    ((e) => {
      let i;
      ((t) => {
        let o;
        ((n) => {
          class r {
            constructor() {
              this.bb = null;
              this.bb_pos = 0;
            }
            __init(a, u) {
              return (this.bb_pos = a), (this.bb = u), this;
            }
            static getRootAsInferenceSession(a, u) {
              return (u || new r()).__init(
                a.readInt32(a.position()) + a.position(),
                a
              );
            }
            static getSizePrefixedRootAsInferenceSession(a, u) {
              return (
                a.setPosition(a.position() + w.SIZE_PREFIX_LENGTH),
                (u || new r()).__init(
                  a.readInt32(a.position()) + a.position(),
                  a
                )
              );
            }
            static bufferHasIdentifier(a) {
              return a.__has_identifier("ORTM");
            }
            ortVersion(a) {
              let u = this.bb.__offset(this.bb_pos, 4);
              return u ? this.bb.__string(this.bb_pos + u, a) : null;
            }
            model(a) {
              let u = this.bb.__offset(this.bb_pos, 6);
              return u
                ? (a || new e.experimental.fbs.Model()).__init(
                    this.bb.__indirect(this.bb_pos + u),
                    this.bb
                  )
                : null;
            }
            sessionState(a) {
              let u = this.bb.__offset(this.bb_pos, 8);
              return u
                ? (a || new e.experimental.fbs.SessionState()).__init(
                    this.bb.__indirect(this.bb_pos + u),
                    this.bb
                  )
                : null;
            }
            static startInferenceSession(a) {
              a.startObject(3);
            }
            static addOrtVersion(a, u) {
              a.addFieldOffset(0, u, 0);
            }
            static addModel(a, u) {
              a.addFieldOffset(1, u, 0);
            }
            static addSessionState(a, u) {
              a.addFieldOffset(2, u, 0);
            }
            static endInferenceSession(a) {
              return a.endObject();
            }
            static finishInferenceSessionBuffer(a, u) {
              a.finish(u, "ORTM");
            }
            static finishSizePrefixedInferenceSessionBuffer(a, u) {
              a.finish(u, "ORTM", !0);
            }
            static createInferenceSession(a, u, l, f) {
              return (
                r.startInferenceSession(a),
                r.addOrtVersion(a, u),
                r.addModel(a, l),
                r.addSessionState(a, f),
                r.endInferenceSession(a)
              );
            }
          }
          n.InferenceSession = r;
        })((o = t.fbs ||= {}));
      })((i = e.experimental ||= {}));
    })((F ||= {}));
  });
var js = mt((Vy, qs) => {
  "use strict";
  qs.exports = ih;
  function ih(i, e) {
    for (
      var o = new Array(arguments.length - 1), t = 0, r = 2, n = !0;
      r < arguments.length;

    )
      o[t++] = arguments[r++];
    return new Promise(function (a, u) {
      o[t] = function (f) {
        if (n)
          if (((n = !1), f)) u(f);
          else {
            for (var p = new Array(arguments.length - 1), d = 0; d < p.length; )
              p[d++] = arguments[d];
            a.apply(null, p);
          }
      };
      try {
        i.apply(e || null, o);
      } catch (l) {
        n && ((n = !1), u(l));
      }
    });
  }
});
var Ys = mt((Js) => {
  "use strict";
  var vn = Js;
  vn.length = function (e) {
    var o = e.length;
    if (!o) return 0;
    for (var t = 0; --o % 4 > 1 && e.charAt(o) === "="; ) ++t;
    return Math.ceil(e.length * 3) / 4 - t;
  };
  var ar = new Array(64),
    Ks = new Array(123);
  for (te = 0; te < 64; )
    Ks[
      (ar[te] =
        te < 26
          ? te + 65
          : te < 52
          ? te + 71
          : te < 62
          ? te - 4
          : (te - 59) | 43)
    ] = te++;
  var te;
  vn.encode = function (e, o, t) {
    for (var r = null, n = [], s = 0, a = 0, u; o < t; ) {
      var l = e[o++];
      switch (a) {
        case 0:
          (n[s++] = ar[l >> 2]), (u = (l & 3) << 4), (a = 1);
          break;
        case 1:
          (n[s++] = ar[u | (l >> 4)]), (u = (l & 15) << 2), (a = 2);
          break;
        case 2:
          (n[s++] = ar[u | (l >> 6)]), (n[s++] = ar[l & 63]), (a = 0);
          break;
      }
      s > 8191 &&
        ((r || (r = [])).push(String.fromCharCode.apply(String, n)), (s = 0));
    }
    return (
      a && ((n[s++] = ar[u]), (n[s++] = 61), a === 1 && (n[s++] = 61)),
      r
        ? (s && r.push(String.fromCharCode.apply(String, n.slice(0, s))),
          r.join(""))
        : String.fromCharCode.apply(String, n.slice(0, s))
    );
  };
  var Xs = "invalid encoding";
  vn.decode = function (e, o, t) {
    for (var r = t, n = 0, s, a = 0; a < e.length; ) {
      var u = e.charCodeAt(a++);
      if (u === 61 && n > 1) break;
      if ((u = Ks[u]) === void 0) throw Error(Xs);
      switch (n) {
        case 0:
          (s = u), (n = 1);
          break;
        case 1:
          (o[t++] = (s << 2) | ((u & 48) >> 4)), (s = u), (n = 2);
          break;
        case 2:
          (o[t++] = ((s & 15) << 4) | ((u & 60) >> 2)), (s = u), (n = 3);
          break;
        case 3:
          (o[t++] = ((s & 3) << 6) | u), (n = 0);
          break;
      }
    }
    if (n === 1) throw Error(Xs);
    return t - r;
  };
  vn.test = function (e) {
    return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
      e
    );
  };
});
var Qs = mt((Wy, Zs) => {
  "use strict";
  Zs.exports = In;
  function In() {
    this._listeners = {};
  }
  In.prototype.on = function (e, o, t) {
    return (
      (this._listeners[e] || (this._listeners[e] = [])).push({
        fn: o,
        ctx: t || this,
      }),
      this
    );
  };
  In.prototype.off = function (e, o) {
    if (e === void 0) this._listeners = {};
    else if (o === void 0) this._listeners[e] = [];
    else
      for (var t = this._listeners[e], r = 0; r < t.length; )
        t[r].fn === o ? t.splice(r, 1) : ++r;
    return this;
  };
  In.prototype.emit = function (e) {
    var o = this._listeners[e];
    if (o) {
      for (var t = [], r = 1; r < arguments.length; ) t.push(arguments[r++]);
      for (r = 0; r < o.length; ) o[r].fn.apply(o[r++].ctx, t);
    }
    return this;
  };
});
var au = mt((Hy, iu) => {
  "use strict";
  iu.exports = tu(tu);
  function tu(i) {
    return (
      typeof Float32Array < "u"
        ? (function () {
            var e = new Float32Array([-0]),
              o = new Uint8Array(e.buffer),
              t = o[3] === 128;
            function r(u, l, f) {
              (e[0] = u),
                (l[f] = o[0]),
                (l[f + 1] = o[1]),
                (l[f + 2] = o[2]),
                (l[f + 3] = o[3]);
            }
            function n(u, l, f) {
              (e[0] = u),
                (l[f] = o[3]),
                (l[f + 1] = o[2]),
                (l[f + 2] = o[1]),
                (l[f + 3] = o[0]);
            }
            (i.writeFloatLE = t ? r : n), (i.writeFloatBE = t ? n : r);
            function s(u, l) {
              return (
                (o[0] = u[l]),
                (o[1] = u[l + 1]),
                (o[2] = u[l + 2]),
                (o[3] = u[l + 3]),
                e[0]
              );
            }
            function a(u, l) {
              return (
                (o[3] = u[l]),
                (o[2] = u[l + 1]),
                (o[1] = u[l + 2]),
                (o[0] = u[l + 3]),
                e[0]
              );
            }
            (i.readFloatLE = t ? s : a), (i.readFloatBE = t ? a : s);
          })()
        : (function () {
            function e(t, r, n, s) {
              var a = r < 0 ? 1 : 0;
              if ((a && (r = -r), r === 0)) t(1 / r > 0 ? 0 : 2147483648, n, s);
              else if (isNaN(r)) t(2143289344, n, s);
              else if (r > 34028234663852886e22)
                t(((a << 31) | 2139095040) >>> 0, n, s);
              else if (r < 11754943508222875e-54)
                t(
                  ((a << 31) | Math.round(r / 1401298464324817e-60)) >>> 0,
                  n,
                  s
                );
              else {
                var u = Math.floor(Math.log(r) / Math.LN2),
                  l = Math.round(r * Math.pow(2, -u) * 8388608) & 8388607;
                t(((a << 31) | ((u + 127) << 23) | l) >>> 0, n, s);
              }
            }
            (i.writeFloatLE = e.bind(null, eu)),
              (i.writeFloatBE = e.bind(null, ru));
            function o(t, r, n) {
              var s = t(r, n),
                a = (s >> 31) * 2 + 1,
                u = (s >>> 23) & 255,
                l = s & 8388607;
              return u === 255
                ? l
                  ? NaN
                  : a * (1 / 0)
                : u === 0
                ? a * 1401298464324817e-60 * l
                : a * Math.pow(2, u - 150) * (l + 8388608);
            }
            (i.readFloatLE = o.bind(null, nu)),
              (i.readFloatBE = o.bind(null, ou));
          })(),
      typeof Float64Array < "u"
        ? (function () {
            var e = new Float64Array([-0]),
              o = new Uint8Array(e.buffer),
              t = o[7] === 128;
            function r(u, l, f) {
              (e[0] = u),
                (l[f] = o[0]),
                (l[f + 1] = o[1]),
                (l[f + 2] = o[2]),
                (l[f + 3] = o[3]),
                (l[f + 4] = o[4]),
                (l[f + 5] = o[5]),
                (l[f + 6] = o[6]),
                (l[f + 7] = o[7]);
            }
            function n(u, l, f) {
              (e[0] = u),
                (l[f] = o[7]),
                (l[f + 1] = o[6]),
                (l[f + 2] = o[5]),
                (l[f + 3] = o[4]),
                (l[f + 4] = o[3]),
                (l[f + 5] = o[2]),
                (l[f + 6] = o[1]),
                (l[f + 7] = o[0]);
            }
            (i.writeDoubleLE = t ? r : n), (i.writeDoubleBE = t ? n : r);
            function s(u, l) {
              return (
                (o[0] = u[l]),
                (o[1] = u[l + 1]),
                (o[2] = u[l + 2]),
                (o[3] = u[l + 3]),
                (o[4] = u[l + 4]),
                (o[5] = u[l + 5]),
                (o[6] = u[l + 6]),
                (o[7] = u[l + 7]),
                e[0]
              );
            }
            function a(u, l) {
              return (
                (o[7] = u[l]),
                (o[6] = u[l + 1]),
                (o[5] = u[l + 2]),
                (o[4] = u[l + 3]),
                (o[3] = u[l + 4]),
                (o[2] = u[l + 5]),
                (o[1] = u[l + 6]),
                (o[0] = u[l + 7]),
                e[0]
              );
            }
            (i.readDoubleLE = t ? s : a), (i.readDoubleBE = t ? a : s);
          })()
        : (function () {
            function e(t, r, n, s, a, u) {
              var l = s < 0 ? 1 : 0;
              if ((l && (s = -s), s === 0))
                t(0, a, u + r), t(1 / s > 0 ? 0 : 2147483648, a, u + n);
              else if (isNaN(s)) t(0, a, u + r), t(2146959360, a, u + n);
              else if (s > 17976931348623157e292)
                t(0, a, u + r), t(((l << 31) | 2146435072) >>> 0, a, u + n);
              else {
                var f;
                if (s < 22250738585072014e-324)
                  (f = s / 5e-324),
                    t(f >>> 0, a, u + r),
                    t(((l << 31) | (f / 4294967296)) >>> 0, a, u + n);
                else {
                  var p = Math.floor(Math.log(s) / Math.LN2);
                  p === 1024 && (p = 1023),
                    (f = s * Math.pow(2, -p)),
                    t((f * 4503599627370496) >>> 0, a, u + r),
                    t(
                      ((l << 31) |
                        ((p + 1023) << 20) |
                        ((f * 1048576) & 1048575)) >>>
                        0,
                      a,
                      u + n
                    );
                }
              }
            }
            (i.writeDoubleLE = e.bind(null, eu, 0, 4)),
              (i.writeDoubleBE = e.bind(null, ru, 4, 0));
            function o(t, r, n, s, a) {
              var u = t(s, a + r),
                l = t(s, a + n),
                f = (l >> 31) * 2 + 1,
                p = (l >>> 20) & 2047,
                d = 4294967296 * (l & 1048575) + u;
              return p === 2047
                ? d
                  ? NaN
                  : f * (1 / 0)
                : p === 0
                ? f * 5e-324 * d
                : f * Math.pow(2, p - 1075) * (d + 4503599627370496);
            }
            (i.readDoubleLE = o.bind(null, nu, 0, 4)),
              (i.readDoubleBE = o.bind(null, ou, 4, 0));
          })(),
      i
    );
  }
  function eu(i, e, o) {
    (e[o] = i & 255),
      (e[o + 1] = (i >>> 8) & 255),
      (e[o + 2] = (i >>> 16) & 255),
      (e[o + 3] = i >>> 24);
  }
  function ru(i, e, o) {
    (e[o] = i >>> 24),
      (e[o + 1] = (i >>> 16) & 255),
      (e[o + 2] = (i >>> 8) & 255),
      (e[o + 3] = i & 255);
  }
  function nu(i, e) {
    return (i[e] | (i[e + 1] << 8) | (i[e + 2] << 16) | (i[e + 3] << 24)) >>> 0;
  }
  function ou(i, e) {
    return ((i[e] << 24) | (i[e + 1] << 16) | (i[e + 2] << 8) | i[e + 3]) >>> 0;
  }
});
var su = mt((exports, module) => {
  "use strict";
  module.exports = inquire;
  function inquire(moduleName) {
    try {
      var mod = eval("quire".replace(/^/, "re"))(moduleName);
      if (mod && (mod.length || Object.keys(mod).length)) return mod;
    } catch (i) {}
    return null;
  }
});
var lu = mt((uu) => {
  "use strict";
  var jo = uu;
  jo.length = function (e) {
    for (var o = 0, t = 0, r = 0; r < e.length; ++r)
      (t = e.charCodeAt(r)),
        t < 128
          ? (o += 1)
          : t < 2048
          ? (o += 2)
          : (t & 64512) === 55296 && (e.charCodeAt(r + 1) & 64512) === 56320
          ? (++r, (o += 4))
          : (o += 3);
    return o;
  };
  jo.read = function (e, o, t) {
    var r = t - o;
    if (r < 1) return "";
    for (var n = null, s = [], a = 0, u; o < t; )
      (u = e[o++]),
        u < 128
          ? (s[a++] = u)
          : u > 191 && u < 224
          ? (s[a++] = ((u & 31) << 6) | (e[o++] & 63))
          : u > 239 && u < 365
          ? ((u =
              (((u & 7) << 18) |
                ((e[o++] & 63) << 12) |
                ((e[o++] & 63) << 6) |
                (e[o++] & 63)) -
              65536),
            (s[a++] = 55296 + (u >> 10)),
            (s[a++] = 56320 + (u & 1023)))
          : (s[a++] = ((u & 15) << 12) | ((e[o++] & 63) << 6) | (e[o++] & 63)),
        a > 8191 &&
          ((n || (n = [])).push(String.fromCharCode.apply(String, s)), (a = 0));
    return n
      ? (a && n.push(String.fromCharCode.apply(String, s.slice(0, a))),
        n.join(""))
      : String.fromCharCode.apply(String, s.slice(0, a));
  };
  jo.write = function (e, o, t) {
    for (var r = t, n, s, a = 0; a < e.length; ++a)
      (n = e.charCodeAt(a)),
        n < 128
          ? (o[t++] = n)
          : n < 2048
          ? ((o[t++] = (n >> 6) | 192), (o[t++] = (n & 63) | 128))
          : (n & 64512) === 55296 &&
            ((s = e.charCodeAt(a + 1)) & 64512) === 56320
          ? ((n = 65536 + ((n & 1023) << 10) + (s & 1023)),
            ++a,
            (o[t++] = (n >> 18) | 240),
            (o[t++] = ((n >> 12) & 63) | 128),
            (o[t++] = ((n >> 6) & 63) | 128),
            (o[t++] = (n & 63) | 128))
          : ((o[t++] = (n >> 12) | 224),
            (o[t++] = ((n >> 6) & 63) | 128),
            (o[t++] = (n & 63) | 128));
    return t - r;
  };
});
var cu = mt((jy, fu) => {
  "use strict";
  fu.exports = ah;
  function ah(i, e, o) {
    var t = o || 8192,
      r = t >>> 1,
      n = null,
      s = t;
    return function (u) {
      if (u < 1 || u > r) return i(u);
      s + u > t && ((n = i(t)), (s = 0));
      var l = e.call(n, s, (s += u));
      return s & 7 && (s = (s | 7) + 1), l;
    };
  }
});
var du = mt((Xy, pu) => {
  "use strict";
  pu.exports = vt;
  var Er = Se();
  function vt(i, e) {
    (this.lo = i >>> 0), (this.hi = e >>> 0);
  }
  var Re = (vt.zero = new vt(0, 0));
  Re.toNumber = function () {
    return 0;
  };
  Re.zzEncode = Re.zzDecode = function () {
    return this;
  };
  Re.length = function () {
    return 1;
  };
  var sh = (vt.zeroHash = "\0\0\0\0\0\0\0\0");
  vt.fromNumber = function (e) {
    if (e === 0) return Re;
    var o = e < 0;
    o && (e = -e);
    var t = e >>> 0,
      r = ((e - t) / 4294967296) >>> 0;
    return (
      o &&
        ((r = ~r >>> 0),
        (t = ~t >>> 0),
        ++t > 4294967295 && ((t = 0), ++r > 4294967295 && (r = 0))),
      new vt(t, r)
    );
  };
  vt.from = function (e) {
    if (typeof e == "number") return vt.fromNumber(e);
    if (Er.isString(e))
      if (Er.Long) e = Er.Long.fromString(e);
      else return vt.fromNumber(parseInt(e, 10));
    return e.low || e.high ? new vt(e.low >>> 0, e.high >>> 0) : Re;
  };
  vt.prototype.toNumber = function (e) {
    if (!e && this.hi >>> 31) {
      var o = (~this.lo + 1) >>> 0,
        t = ~this.hi >>> 0;
      return o || (t = (t + 1) >>> 0), -(o + t * 4294967296);
    }
    return this.lo + this.hi * 4294967296;
  };
  vt.prototype.toLong = function (e) {
    return Er.Long
      ? new Er.Long(this.lo | 0, this.hi | 0, !!e)
      : { low: this.lo | 0, high: this.hi | 0, unsigned: !!e };
  };
  var Oe = String.prototype.charCodeAt;
  vt.fromHash = function (e) {
    return e === sh
      ? Re
      : new vt(
          (Oe.call(e, 0) |
            (Oe.call(e, 1) << 8) |
            (Oe.call(e, 2) << 16) |
            (Oe.call(e, 3) << 24)) >>>
            0,
          (Oe.call(e, 4) |
            (Oe.call(e, 5) << 8) |
            (Oe.call(e, 6) << 16) |
            (Oe.call(e, 7) << 24)) >>>
            0
        );
  };
  vt.prototype.toHash = function () {
    return String.fromCharCode(
      this.lo & 255,
      (this.lo >>> 8) & 255,
      (this.lo >>> 16) & 255,
      this.lo >>> 24,
      this.hi & 255,
      (this.hi >>> 8) & 255,
      (this.hi >>> 16) & 255,
      this.hi >>> 24
    );
  };
  vt.prototype.zzEncode = function () {
    var e = this.hi >> 31;
    return (
      (this.hi = (((this.hi << 1) | (this.lo >>> 31)) ^ e) >>> 0),
      (this.lo = ((this.lo << 1) ^ e) >>> 0),
      this
    );
  };
  vt.prototype.zzDecode = function () {
    var e = -(this.lo & 1);
    return (
      (this.lo = (((this.lo >>> 1) | (this.hi << 31)) ^ e) >>> 0),
      (this.hi = ((this.hi >>> 1) ^ e) >>> 0),
      this
    );
  };
  vt.prototype.length = function () {
    var e = this.lo,
      o = ((this.lo >>> 28) | (this.hi << 4)) >>> 0,
      t = this.hi >>> 24;
    return t === 0
      ? o === 0
        ? e < 16384
          ? e < 128
            ? 1
            : 2
          : e < 2097152
          ? 3
          : 4
        : o < 16384
        ? o < 128
          ? 5
          : 6
        : o < 2097152
        ? 7
        : 8
      : t < 128
      ? 9
      : 10;
  };
});
var Se = mt((Xo) => {
  "use strict";
  var N = Xo;
  N.asPromise = js();
  N.base64 = Ys();
  N.EventEmitter = Qs();
  N.float = au();
  N.inquire = su();
  N.utf8 = lu();
  N.pool = cu();
  N.LongBits = du();
  N.isNode = !!(
    typeof global < "u" &&
    global &&
    global.process &&
    global.process.versions &&
    global.process.versions.node
  );
  N.global =
    (N.isNode && global) ||
    (typeof window < "u" && window) ||
    (typeof self < "u" && self) ||
    Xo;
  N.emptyArray = Object.freeze ? Object.freeze([]) : [];
  N.emptyObject = Object.freeze ? Object.freeze({}) : {};
  N.isInteger =
    Number.isInteger ||
    function (e) {
      return typeof e == "number" && isFinite(e) && Math.floor(e) === e;
    };
  N.isString = function (e) {
    return typeof e == "string" || e instanceof String;
  };
  N.isObject = function (e) {
    return e && typeof e == "object";
  };
  N.isset = N.isSet = function (e, o) {
    var t = e[o];
    return t != null && e.hasOwnProperty(o)
      ? typeof t != "object" ||
          (Array.isArray(t) ? t.length : Object.keys(t).length) > 0
      : !1;
  };
  N.Buffer = (function () {
    try {
      var i = N.inquire("buffer").Buffer;
      return i.prototype.utf8Write ? i : null;
    } catch {
      return null;
    }
  })();
  N._Buffer_from = null;
  N._Buffer_allocUnsafe = null;
  N.newBuffer = function (e) {
    return typeof e == "number"
      ? N.Buffer
        ? N._Buffer_allocUnsafe(e)
        : new N.Array(e)
      : N.Buffer
      ? N._Buffer_from(e)
      : typeof Uint8Array > "u"
      ? e
      : new Uint8Array(e);
  };
  N.Array = typeof Uint8Array < "u" ? Uint8Array : Array;
  N.Long =
    (N.global.dcodeIO && N.global.dcodeIO.Long) ||
    N.global.Long ||
    N.inquire("long");
  N.key2Re = /^true|false|0|1$/;
  N.key32Re = /^-?(?:0|[1-9][0-9]*)$/;
  N.key64Re = /^(?:[\\x00-\\xff]{8}|-?(?:0|[1-9][0-9]*))$/;
  N.longToHash = function (e) {
    return e ? N.LongBits.from(e).toHash() : N.LongBits.zeroHash;
  };
  N.longFromHash = function (e, o) {
    var t = N.LongBits.fromHash(e);
    return N.Long ? N.Long.fromBits(t.lo, t.hi, o) : t.toNumber(!!o);
  };
  function hu(i, e, o) {
    for (var t = Object.keys(e), r = 0; r < t.length; ++r)
      (i[t[r]] === void 0 || !o) && (i[t[r]] = e[t[r]]);
    return i;
  }
  N.merge = hu;
  N.lcFirst = function (e) {
    return e.charAt(0).toLowerCase() + e.substring(1);
  };
  function mu(i) {
    function e(o, t) {
      if (!(this instanceof e)) return new e(o, t);
      Object.defineProperty(this, "message", {
        get: function () {
          return o;
        },
      }),
        Error.captureStackTrace
          ? Error.captureStackTrace(this, e)
          : Object.defineProperty(this, "stack", {
              value: new Error().stack || "",
            }),
        t && hu(this, t);
    }
    return (
      (e.prototype = Object.create(Error.prototype, {
        constructor: {
          value: e,
          writable: !0,
          enumerable: !1,
          configurable: !0,
        },
        name: {
          get: function () {
            return i;
          },
          set: void 0,
          enumerable: !1,
          configurable: !0,
        },
        toString: {
          value: function () {
            return this.name + ": " + this.message;
          },
          writable: !0,
          enumerable: !1,
          configurable: !0,
        },
      })),
      e
    );
  }
  N.newError = mu;
  N.ProtocolError = mu("ProtocolError");
  N.oneOfGetter = function (e) {
    for (var o = {}, t = 0; t < e.length; ++t) o[e[t]] = 1;
    return function () {
      for (var r = Object.keys(this), n = r.length - 1; n > -1; --n)
        if (o[r[n]] === 1 && this[r[n]] !== void 0 && this[r[n]] !== null)
          return r[n];
    };
  };
  N.oneOfSetter = function (e) {
    return function (o) {
      for (var t = 0; t < e.length; ++t) e[t] !== o && delete this[e[t]];
    };
  };
  N.toJSONOptions = { longs: String, enums: String, bytes: String, json: !0 };
  N._configure = function () {
    var i = N.Buffer;
    if (!i) {
      N._Buffer_from = N._Buffer_allocUnsafe = null;
      return;
    }
    (N._Buffer_from =
      (i.from !== Uint8Array.from && i.from) ||
      function (o, t) {
        return new i(o, t);
      }),
      (N._Buffer_allocUnsafe =
        i.allocUnsafe ||
        function (o) {
          return new i(o);
        });
  };
});
var ei = mt((Jy, xu) => {
  "use strict";
  xu.exports = X;
  var Wt = Se(),
    Ko,
    _n = Wt.LongBits,
    bu = Wt.base64,
    gu = Wt.utf8;
  function Dr(i, e, o) {
    (this.fn = i), (this.len = e), (this.next = void 0), (this.val = o);
  }
  function Yo() {}
  function uh(i) {
    (this.head = i.head),
      (this.tail = i.tail),
      (this.len = i.len),
      (this.next = i.states);
  }
  function X() {
    (this.len = 0),
      (this.head = new Dr(Yo, 0, 0)),
      (this.tail = this.head),
      (this.states = null);
  }
  var yu = function () {
    return Wt.Buffer
      ? function () {
          return (X.create = function () {
            return new Ko();
          })();
        }
      : function () {
          return new X();
        };
  };
  X.create = yu();
  X.alloc = function (e) {
    return new Wt.Array(e);
  };
  Wt.Array !== Array &&
    (X.alloc = Wt.pool(X.alloc, Wt.Array.prototype.subarray));
  X.prototype._push = function (e, o, t) {
    return (
      (this.tail = this.tail.next = new Dr(e, o, t)), (this.len += o), this
    );
  };
  function Zo(i, e, o) {
    e[o] = i & 255;
  }
  function lh(i, e, o) {
    for (; i > 127; ) (e[o++] = (i & 127) | 128), (i >>>= 7);
    e[o] = i;
  }
  function Qo(i, e) {
    (this.len = i), (this.next = void 0), (this.val = e);
  }
  Qo.prototype = Object.create(Dr.prototype);
  Qo.prototype.fn = lh;
  X.prototype.uint32 = function (e) {
    return (
      (this.len += (this.tail = this.tail.next =
        new Qo(
          (e = e >>> 0) < 128
            ? 1
            : e < 16384
            ? 2
            : e < 2097152
            ? 3
            : e < 268435456
            ? 4
            : 5,
          e
        )).len),
      this
    );
  };
  X.prototype.int32 = function (e) {
    return e < 0 ? this._push(ti, 10, _n.fromNumber(e)) : this.uint32(e);
  };
  X.prototype.sint32 = function (e) {
    return this.uint32(((e << 1) ^ (e >> 31)) >>> 0);
  };
  function ti(i, e, o) {
    for (; i.hi; )
      (e[o++] = (i.lo & 127) | 128),
        (i.lo = ((i.lo >>> 7) | (i.hi << 25)) >>> 0),
        (i.hi >>>= 7);
    for (; i.lo > 127; ) (e[o++] = (i.lo & 127) | 128), (i.lo = i.lo >>> 7);
    e[o++] = i.lo;
  }
  X.prototype.uint64 = function (e) {
    var o = _n.from(e);
    return this._push(ti, o.length(), o);
  };
  X.prototype.int64 = X.prototype.uint64;
  X.prototype.sint64 = function (e) {
    var o = _n.from(e).zzEncode();
    return this._push(ti, o.length(), o);
  };
  X.prototype.bool = function (e) {
    return this._push(Zo, 1, e ? 1 : 0);
  };
  function Jo(i, e, o) {
    (e[o] = i & 255),
      (e[o + 1] = (i >>> 8) & 255),
      (e[o + 2] = (i >>> 16) & 255),
      (e[o + 3] = i >>> 24);
  }
  X.prototype.fixed32 = function (e) {
    return this._push(Jo, 4, e >>> 0);
  };
  X.prototype.sfixed32 = X.prototype.fixed32;
  X.prototype.fixed64 = function (e) {
    var o = _n.from(e);
    return this._push(Jo, 4, o.lo)._push(Jo, 4, o.hi);
  };
  X.prototype.sfixed64 = X.prototype.fixed64;
  X.prototype.float = function (e) {
    return this._push(Wt.float.writeFloatLE, 4, e);
  };
  X.prototype.double = function (e) {
    return this._push(Wt.float.writeDoubleLE, 8, e);
  };
  var fh = Wt.Array.prototype.set
    ? function (e, o, t) {
        o.set(e, t);
      }
    : function (e, o, t) {
        for (var r = 0; r < e.length; ++r) o[t + r] = e[r];
      };
  X.prototype.bytes = function (e) {
    var o = e.length >>> 0;
    if (!o) return this._push(Zo, 1, 0);
    if (Wt.isString(e)) {
      var t = X.alloc((o = bu.length(e)));
      bu.decode(e, t, 0), (e = t);
    }
    return this.uint32(o)._push(fh, o, e);
  };
  X.prototype.string = function (e) {
    var o = gu.length(e);
    return o ? this.uint32(o)._push(gu.write, o, e) : this._push(Zo, 1, 0);
  };
  X.prototype.fork = function () {
    return (
      (this.states = new uh(this)),
      (this.head = this.tail = new Dr(Yo, 0, 0)),
      (this.len = 0),
      this
    );
  };
  X.prototype.reset = function () {
    return (
      this.states
        ? ((this.head = this.states.head),
          (this.tail = this.states.tail),
          (this.len = this.states.len),
          (this.states = this.states.next))
        : ((this.head = this.tail = new Dr(Yo, 0, 0)), (this.len = 0)),
      this
    );
  };
  X.prototype.ldelim = function () {
    var e = this.head,
      o = this.tail,
      t = this.len;
    return (
      this.reset().uint32(t),
      t && ((this.tail.next = e.next), (this.tail = o), (this.len += t)),
      this
    );
  };
  X.prototype.finish = function () {
    for (
      var e = this.head.next, o = this.constructor.alloc(this.len), t = 0;
      e;

    )
      e.fn(e.val, o, t), (t += e.len), (e = e.next);
    return o;
  };
  X._configure = function (i) {
    (Ko = i), (X.create = yu()), Ko._configure();
  };
});
var vu = mt((Yy, wu) => {
  "use strict";
  wu.exports = ce;
  var Tu = ei();
  (ce.prototype = Object.create(Tu.prototype)).constructor = ce;
  var Ae = Se();
  function ce() {
    Tu.call(this);
  }
  ce._configure = function () {
    (ce.alloc = Ae._Buffer_allocUnsafe),
      (ce.writeBytesBuffer =
        Ae.Buffer &&
        Ae.Buffer.prototype instanceof Uint8Array &&
        Ae.Buffer.prototype.set.name === "set"
          ? function (e, o, t) {
              o.set(e, t);
            }
          : function (e, o, t) {
              if (e.copy) e.copy(o, t, 0, e.length);
              else for (var r = 0; r < e.length; ) o[t++] = e[r++];
            });
  };
  ce.prototype.bytes = function (e) {
    Ae.isString(e) && (e = Ae._Buffer_from(e, "base64"));
    var o = e.length >>> 0;
    return this.uint32(o), o && this._push(ce.writeBytesBuffer, o, e), this;
  };
  function ch(i, e, o) {
    i.length < 40
      ? Ae.utf8.write(i, e, o)
      : e.utf8Write
      ? e.utf8Write(i, o)
      : e.write(i, o);
  }
  ce.prototype.string = function (e) {
    var o = Ae.Buffer.byteLength(e);
    return this.uint32(o), o && this._push(ch, o, e), this;
  };
  ce._configure();
});
var oi = mt((Zy, Au) => {
  "use strict";
  Au.exports = ct;
  var ee = Se(),
    ni,
    Ou = ee.LongBits,
    ph = ee.utf8;
  function re(i, e) {
    return RangeError(
      "index out of range: " + i.pos + " + " + (e || 1) + " > " + i.len
    );
  }
  function ct(i) {
    (this.buf = i), (this.pos = 0), (this.len = i.length);
  }
  var Iu =
      typeof Uint8Array < "u"
        ? function (e) {
            if (e instanceof Uint8Array || Array.isArray(e)) return new ct(e);
            throw Error("illegal buffer");
          }
        : function (e) {
            if (Array.isArray(e)) return new ct(e);
            throw Error("illegal buffer");
          },
    Su = function () {
      return ee.Buffer
        ? function (o) {
            return (ct.create = function (r) {
              return ee.Buffer.isBuffer(r) ? new ni(r) : Iu(r);
            })(o);
          }
        : Iu;
    };
  ct.create = Su();
  ct.prototype._slice = ee.Array.prototype.subarray || ee.Array.prototype.slice;
  ct.prototype.uint32 = (function () {
    var e = 4294967295;
    return function () {
      if (
        ((e = (this.buf[this.pos] & 127) >>> 0),
        this.buf[this.pos++] < 128 ||
          ((e = (e | ((this.buf[this.pos] & 127) << 7)) >>> 0),
          this.buf[this.pos++] < 128) ||
          ((e = (e | ((this.buf[this.pos] & 127) << 14)) >>> 0),
          this.buf[this.pos++] < 128) ||
          ((e = (e | ((this.buf[this.pos] & 127) << 21)) >>> 0),
          this.buf[this.pos++] < 128) ||
          ((e = (e | ((this.buf[this.pos] & 15) << 28)) >>> 0),
          this.buf[this.pos++] < 128))
      )
        return e;
      if ((this.pos += 5) > this.len)
        throw ((this.pos = this.len), re(this, 10));
      return e;
    };
  })();
  ct.prototype.int32 = function () {
    return this.uint32() | 0;
  };
  ct.prototype.sint32 = function () {
    var e = this.uint32();
    return ((e >>> 1) ^ -(e & 1)) | 0;
  };
  function ri() {
    var i = new Ou(0, 0),
      e = 0;
    if (this.len - this.pos > 4) {
      for (; e < 4; ++e)
        if (
          ((i.lo = (i.lo | ((this.buf[this.pos] & 127) << (e * 7))) >>> 0),
          this.buf[this.pos++] < 128)
        )
          return i;
      if (
        ((i.lo = (i.lo | ((this.buf[this.pos] & 127) << 28)) >>> 0),
        (i.hi = (i.hi | ((this.buf[this.pos] & 127) >> 4)) >>> 0),
        this.buf[this.pos++] < 128)
      )
        return i;
      e = 0;
    } else {
      for (; e < 3; ++e) {
        if (this.pos >= this.len) throw re(this);
        if (
          ((i.lo = (i.lo | ((this.buf[this.pos] & 127) << (e * 7))) >>> 0),
          this.buf[this.pos++] < 128)
        )
          return i;
      }
      return (
        (i.lo = (i.lo | ((this.buf[this.pos++] & 127) << (e * 7))) >>> 0), i
      );
    }
    if (this.len - this.pos > 4) {
      for (; e < 5; ++e)
        if (
          ((i.hi = (i.hi | ((this.buf[this.pos] & 127) << (e * 7 + 3))) >>> 0),
          this.buf[this.pos++] < 128)
        )
          return i;
    } else
      for (; e < 5; ++e) {
        if (this.pos >= this.len) throw re(this);
        if (
          ((i.hi = (i.hi | ((this.buf[this.pos] & 127) << (e * 7 + 3))) >>> 0),
          this.buf[this.pos++] < 128)
        )
          return i;
      }
    throw Error("invalid varint encoding");
  }
  ct.prototype.bool = function () {
    return this.uint32() !== 0;
  };
  function On(i, e) {
    return (
      (i[e - 4] | (i[e - 3] << 8) | (i[e - 2] << 16) | (i[e - 1] << 24)) >>> 0
    );
  }
  ct.prototype.fixed32 = function () {
    if (this.pos + 4 > this.len) throw re(this, 4);
    return On(this.buf, (this.pos += 4));
  };
  ct.prototype.sfixed32 = function () {
    if (this.pos + 4 > this.len) throw re(this, 4);
    return On(this.buf, (this.pos += 4)) | 0;
  };
  function _u() {
    if (this.pos + 8 > this.len) throw re(this, 8);
    return new Ou(On(this.buf, (this.pos += 4)), On(this.buf, (this.pos += 4)));
  }
  ct.prototype.float = function () {
    if (this.pos + 4 > this.len) throw re(this, 4);
    var e = ee.float.readFloatLE(this.buf, this.pos);
    return (this.pos += 4), e;
  };
  ct.prototype.double = function () {
    if (this.pos + 8 > this.len) throw re(this, 4);
    var e = ee.float.readDoubleLE(this.buf, this.pos);
    return (this.pos += 8), e;
  };
  ct.prototype.bytes = function () {
    var e = this.uint32(),
      o = this.pos,
      t = this.pos + e;
    if (t > this.len) throw re(this, e);
    if (((this.pos += e), Array.isArray(this.buf))) return this.buf.slice(o, t);
    if (o === t) {
      var r = ee.Buffer;
      return r ? r.alloc(0) : new this.buf.constructor(0);
    }
    return this._slice.call(this.buf, o, t);
  };
  ct.prototype.string = function () {
    var e = this.bytes();
    return ph.read(e, 0, e.length);
  };
  ct.prototype.skip = function (e) {
    if (typeof e == "number") {
      if (this.pos + e > this.len) throw re(this, e);
      this.pos += e;
    } else
      do if (this.pos >= this.len) throw re(this);
      while (this.buf[this.pos++] & 128);
    return this;
  };
  ct.prototype.skipType = function (i) {
    switch (i) {
      case 0:
        this.skip();
        break;
      case 1:
        this.skip(8);
        break;
      case 2:
        this.skip(this.uint32());
        break;
      case 3:
        for (; (i = this.uint32() & 7) !== 4; ) this.skipType(i);
        break;
      case 5:
        this.skip(4);
        break;
      default:
        throw Error("invalid wire type " + i + " at offset " + this.pos);
    }
    return this;
  };
  ct._configure = function (i) {
    (ni = i), (ct.create = Su()), ni._configure();
    var e = ee.Long ? "toLong" : "toNumber";
    ee.merge(ct.prototype, {
      int64: function () {
        return ri.call(this)[e](!1);
      },
      uint64: function () {
        return ri.call(this)[e](!0);
      },
      sint64: function () {
        return ri.call(this).zzDecode()[e](!1);
      },
      fixed64: function () {
        return _u.call(this)[e](!0);
      },
      sfixed64: function () {
        return _u.call(this)[e](!1);
      },
    });
  };
});
var Lu = mt((Qy, Du) => {
  "use strict";
  Du.exports = Ge;
  var Eu = oi();
  (Ge.prototype = Object.create(Eu.prototype)).constructor = Ge;
  var Pu = Se();
  function Ge(i) {
    Eu.call(this, i);
  }
  Ge._configure = function () {
    Pu.Buffer && (Ge.prototype._slice = Pu.Buffer.prototype.slice);
  };
  Ge.prototype.string = function () {
    var e = this.uint32();
    return this.buf.utf8Slice
      ? this.buf.utf8Slice(
          this.pos,
          (this.pos = Math.min(this.pos + e, this.len))
        )
      : this.buf.toString(
          "utf-8",
          this.pos,
          (this.pos = Math.min(this.pos + e, this.len))
        );
  };
  Ge._configure();
});
var ku = mt((tx, $u) => {
  "use strict";
  $u.exports = Lr;
  var ii = Se();
  (Lr.prototype = Object.create(ii.EventEmitter.prototype)).constructor = Lr;
  function Lr(i, e, o) {
    if (typeof i != "function") throw TypeError("rpcImpl must be a function");
    ii.EventEmitter.call(this),
      (this.rpcImpl = i),
      (this.requestDelimited = !!e),
      (this.responseDelimited = !!o);
  }
  Lr.prototype.rpcCall = function i(e, o, t, r, n) {
    if (!r) throw TypeError("request must be specified");
    var s = this;
    if (!n) return ii.asPromise(i, s, e, o, t, r);
    if (!s.rpcImpl) {
      setTimeout(function () {
        n(Error("already ended"));
      }, 0);
      return;
    }
    try {
      return s.rpcImpl(
        e,
        o[s.requestDelimited ? "encodeDelimited" : "encode"](r).finish(),
        function (u, l) {
          if (u) return s.emit("error", u, e), n(u);
          if (l === null) {
            s.end(!0);
            return;
          }
          if (!(l instanceof t))
            try {
              l = t[s.responseDelimited ? "decodeDelimited" : "decode"](l);
            } catch (f) {
              return s.emit("error", f, e), n(f);
            }
          return s.emit("data", l, e), n(null, l);
        }
      );
    } catch (a) {
      s.emit("error", a, e),
        setTimeout(function () {
          n(a);
        }, 0);
      return;
    }
  };
  Lr.prototype.end = function (e) {
    return (
      this.rpcImpl &&
        (e || this.rpcImpl(null, null, null),
        (this.rpcImpl = null),
        this.emit("end").off()),
      this
    );
  };
});
var Fu = mt((Bu) => {
  "use strict";
  var dh = Bu;
  dh.Service = ku();
});
var Nu = mt((rx, Cu) => {
  "use strict";
  Cu.exports = {};
});
var Mu = mt((Gu) => {
  "use strict";
  var Nt = Gu;
  Nt.build = "minimal";
  Nt.Writer = ei();
  Nt.BufferWriter = vu();
  Nt.Reader = oi();
  Nt.BufferReader = Lu();
  Nt.util = Se();
  Nt.rpc = Fu();
  Nt.roots = Nu();
  Nt.configure = Ru;
  function Ru() {
    Nt.util._configure(),
      Nt.Writer._configure(Nt.BufferWriter),
      Nt.Reader._configure(Nt.BufferReader);
  }
  Ru();
});
var Vu = mt((ox, Uu) => {
  "use strict";
  Uu.exports = Mu();
});
var sr = mt((ix, zu) => {
  "use strict";
  var nt = Vu(),
    $ = nt.Reader,
    pt = nt.Writer,
    b = nt.util,
    h = nt.roots.default || (nt.roots.default = {});
  h.onnx = (function () {
    var i = {};
    return (
      (i.Version = (function () {
        var e = {},
          o = Object.create(e);
        return (
          (o[(e[0] = "_START_VERSION")] = 0),
          (o[(e[1] = "IR_VERSION_2017_10_10")] = 1),
          (o[(e[2] = "IR_VERSION_2017_10_30")] = 2),
          (o[(e[3] = "IR_VERSION_2017_11_3")] = 3),
          (o[(e[4] = "IR_VERSION_2019_1_22")] = 4),
          (o[(e[5] = "IR_VERSION_2019_3_18")] = 5),
          (o[(e[6] = "IR_VERSION_2019_9_19")] = 6),
          (o[(e[7] = "IR_VERSION_2020_5_8")] = 7),
          (o[(e[8] = "IR_VERSION_2021_7_30")] = 8),
          (o[(e[9] = "IR_VERSION")] = 9),
          o
        );
      })()),
      (i.AttributeProto = (function () {
        function e(o) {
          if (
            ((this.floats = []),
            (this.ints = []),
            (this.strings = []),
            (this.tensors = []),
            (this.graphs = []),
            (this.sparseTensors = []),
            (this.typeProtos = []),
            o)
          )
            for (var t = Object.keys(o), r = 0; r < t.length; ++r)
              o[t[r]] != null && (this[t[r]] = o[t[r]]);
        }
        return (
          (e.prototype.name = ""),
          (e.prototype.refAttrName = ""),
          (e.prototype.docString = ""),
          (e.prototype.type = 0),
          (e.prototype.f = 0),
          (e.prototype.i = b.Long ? b.Long.fromBits(0, 0, !1) : 0),
          (e.prototype.s = b.newBuffer([])),
          (e.prototype.t = null),
          (e.prototype.g = null),
          (e.prototype.sparseTensor = null),
          (e.prototype.tp = null),
          (e.prototype.floats = b.emptyArray),
          (e.prototype.ints = b.emptyArray),
          (e.prototype.strings = b.emptyArray),
          (e.prototype.tensors = b.emptyArray),
          (e.prototype.graphs = b.emptyArray),
          (e.prototype.sparseTensors = b.emptyArray),
          (e.prototype.typeProtos = b.emptyArray),
          (e.create = function (t) {
            return new e(t);
          }),
          (e.encode = function (t, r) {
            if (
              (r || (r = pt.create()),
              t.name != null &&
                Object.hasOwnProperty.call(t, "name") &&
                r.uint32(10).string(t.name),
              t.f != null &&
                Object.hasOwnProperty.call(t, "f") &&
                r.uint32(21).float(t.f),
              t.i != null &&
                Object.hasOwnProperty.call(t, "i") &&
                r.uint32(24).int64(t.i),
              t.s != null &&
                Object.hasOwnProperty.call(t, "s") &&
                r.uint32(34).bytes(t.s),
              t.t != null &&
                Object.hasOwnProperty.call(t, "t") &&
                h.onnx.TensorProto.encode(t.t, r.uint32(42).fork()).ldelim(),
              t.g != null &&
                Object.hasOwnProperty.call(t, "g") &&
                h.onnx.GraphProto.encode(t.g, r.uint32(50).fork()).ldelim(),
              t.floats != null && t.floats.length)
            ) {
              r.uint32(58).fork();
              for (var n = 0; n < t.floats.length; ++n) r.float(t.floats[n]);
              r.ldelim();
            }
            if (t.ints != null && t.ints.length) {
              r.uint32(66).fork();
              for (var n = 0; n < t.ints.length; ++n) r.int64(t.ints[n]);
              r.ldelim();
            }
            if (t.strings != null && t.strings.length)
              for (var n = 0; n < t.strings.length; ++n)
                r.uint32(74).bytes(t.strings[n]);
            if (t.tensors != null && t.tensors.length)
              for (var n = 0; n < t.tensors.length; ++n)
                h.onnx.TensorProto.encode(
                  t.tensors[n],
                  r.uint32(82).fork()
                ).ldelim();
            if (t.graphs != null && t.graphs.length)
              for (var n = 0; n < t.graphs.length; ++n)
                h.onnx.GraphProto.encode(
                  t.graphs[n],
                  r.uint32(90).fork()
                ).ldelim();
            if (
              (t.docString != null &&
                Object.hasOwnProperty.call(t, "docString") &&
                r.uint32(106).string(t.docString),
              t.tp != null &&
                Object.hasOwnProperty.call(t, "tp") &&
                h.onnx.TypeProto.encode(t.tp, r.uint32(114).fork()).ldelim(),
              t.typeProtos != null && t.typeProtos.length)
            )
              for (var n = 0; n < t.typeProtos.length; ++n)
                h.onnx.TypeProto.encode(
                  t.typeProtos[n],
                  r.uint32(122).fork()
                ).ldelim();
            if (
              (t.type != null &&
                Object.hasOwnProperty.call(t, "type") &&
                r.uint32(160).int32(t.type),
              t.refAttrName != null &&
                Object.hasOwnProperty.call(t, "refAttrName") &&
                r.uint32(170).string(t.refAttrName),
              t.sparseTensor != null &&
                Object.hasOwnProperty.call(t, "sparseTensor") &&
                h.onnx.SparseTensorProto.encode(
                  t.sparseTensor,
                  r.uint32(178).fork()
                ).ldelim(),
              t.sparseTensors != null && t.sparseTensors.length)
            )
              for (var n = 0; n < t.sparseTensors.length; ++n)
                h.onnx.SparseTensorProto.encode(
                  t.sparseTensors[n],
                  r.uint32(186).fork()
                ).ldelim();
            return r;
          }),
          (e.encodeDelimited = function (t, r) {
            return this.encode(t, r).ldelim();
          }),
          (e.decode = function (t, r) {
            t instanceof $ || (t = $.create(t));
            for (
              var n = r === void 0 ? t.len : t.pos + r,
                s = new h.onnx.AttributeProto();
              t.pos < n;

            ) {
              var a = t.uint32();
              switch (a >>> 3) {
                case 1: {
                  s.name = t.string();
                  break;
                }
                case 21: {
                  s.refAttrName = t.string();
                  break;
                }
                case 13: {
                  s.docString = t.string();
                  break;
                }
                case 20: {
                  s.type = t.int32();
                  break;
                }
                case 2: {
                  s.f = t.float();
                  break;
                }
                case 3: {
                  s.i = t.int64();
                  break;
                }
                case 4: {
                  s.s = t.bytes();
                  break;
                }
                case 5: {
                  s.t = h.onnx.TensorProto.decode(t, t.uint32());
                  break;
                }
                case 6: {
                  s.g = h.onnx.GraphProto.decode(t, t.uint32());
                  break;
                }
                case 22: {
                  s.sparseTensor = h.onnx.SparseTensorProto.decode(
                    t,
                    t.uint32()
                  );
                  break;
                }
                case 14: {
                  s.tp = h.onnx.TypeProto.decode(t, t.uint32());
                  break;
                }
                case 7: {
                  if (
                    ((s.floats && s.floats.length) || (s.floats = []),
                    (a & 7) === 2)
                  )
                    for (var u = t.uint32() + t.pos; t.pos < u; )
                      s.floats.push(t.float());
                  else s.floats.push(t.float());
                  break;
                }
                case 8: {
                  if (
                    ((s.ints && s.ints.length) || (s.ints = []), (a & 7) === 2)
                  )
                    for (var u = t.uint32() + t.pos; t.pos < u; )
                      s.ints.push(t.int64());
                  else s.ints.push(t.int64());
                  break;
                }
                case 9: {
                  (s.strings && s.strings.length) || (s.strings = []),
                    s.strings.push(t.bytes());
                  break;
                }
                case 10: {
                  (s.tensors && s.tensors.length) || (s.tensors = []),
                    s.tensors.push(h.onnx.TensorProto.decode(t, t.uint32()));
                  break;
                }
                case 11: {
                  (s.graphs && s.graphs.length) || (s.graphs = []),
                    s.graphs.push(h.onnx.GraphProto.decode(t, t.uint32()));
                  break;
                }
                case 23: {
                  (s.sparseTensors && s.sparseTensors.length) ||
                    (s.sparseTensors = []),
                    s.sparseTensors.push(
                      h.onnx.SparseTensorProto.decode(t, t.uint32())
                    );
                  break;
                }
                case 15: {
                  (s.typeProtos && s.typeProtos.length) || (s.typeProtos = []),
                    s.typeProtos.push(h.onnx.TypeProto.decode(t, t.uint32()));
                  break;
                }
                default:
                  t.skipType(a & 7);
                  break;
              }
            }
            return s;
          }),
          (e.decodeDelimited = function (t) {
            return t instanceof $ || (t = new $(t)), this.decode(t, t.uint32());
          }),
          (e.verify = function (t) {
            if (typeof t != "object" || t === null) return "object expected";
            if (
              t.name != null &&
              t.hasOwnProperty("name") &&
              !b.isString(t.name)
            )
              return "name: string expected";
            if (
              t.refAttrName != null &&
              t.hasOwnProperty("refAttrName") &&
              !b.isString(t.refAttrName)
            )
              return "refAttrName: string expected";
            if (
              t.docString != null &&
              t.hasOwnProperty("docString") &&
              !b.isString(t.docString)
            )
              return "docString: string expected";
            if (t.type != null && t.hasOwnProperty("type"))
              switch (t.type) {
                default:
                  return "type: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 11:
                case 13:
                case 6:
                case 7:
                case 8:
                case 9:
                case 10:
                case 12:
                case 14:
                  break;
              }
            if (t.f != null && t.hasOwnProperty("f") && typeof t.f != "number")
              return "f: number expected";
            if (
              t.i != null &&
              t.hasOwnProperty("i") &&
              !b.isInteger(t.i) &&
              !(t.i && b.isInteger(t.i.low) && b.isInteger(t.i.high))
            )
              return "i: integer|Long expected";
            if (
              t.s != null &&
              t.hasOwnProperty("s") &&
              !((t.s && typeof t.s.length == "number") || b.isString(t.s))
            )
              return "s: buffer expected";
            if (t.t != null && t.hasOwnProperty("t")) {
              var r = h.onnx.TensorProto.verify(t.t);
              if (r) return "t." + r;
            }
            if (t.g != null && t.hasOwnProperty("g")) {
              var r = h.onnx.GraphProto.verify(t.g);
              if (r) return "g." + r;
            }
            if (t.sparseTensor != null && t.hasOwnProperty("sparseTensor")) {
              var r = h.onnx.SparseTensorProto.verify(t.sparseTensor);
              if (r) return "sparseTensor." + r;
            }
            if (t.tp != null && t.hasOwnProperty("tp")) {
              var r = h.onnx.TypeProto.verify(t.tp);
              if (r) return "tp." + r;
            }
            if (t.floats != null && t.hasOwnProperty("floats")) {
              if (!Array.isArray(t.floats)) return "floats: array expected";
              for (var n = 0; n < t.floats.length; ++n)
                if (typeof t.floats[n] != "number")
                  return "floats: number[] expected";
            }
            if (t.ints != null && t.hasOwnProperty("ints")) {
              if (!Array.isArray(t.ints)) return "ints: array expected";
              for (var n = 0; n < t.ints.length; ++n)
                if (
                  !b.isInteger(t.ints[n]) &&
                  !(
                    t.ints[n] &&
                    b.isInteger(t.ints[n].low) &&
                    b.isInteger(t.ints[n].high)
                  )
                )
                  return "ints: integer|Long[] expected";
            }
            if (t.strings != null && t.hasOwnProperty("strings")) {
              if (!Array.isArray(t.strings)) return "strings: array expected";
              for (var n = 0; n < t.strings.length; ++n)
                if (
                  !(
                    (t.strings[n] && typeof t.strings[n].length == "number") ||
                    b.isString(t.strings[n])
                  )
                )
                  return "strings: buffer[] expected";
            }
            if (t.tensors != null && t.hasOwnProperty("tensors")) {
              if (!Array.isArray(t.tensors)) return "tensors: array expected";
              for (var n = 0; n < t.tensors.length; ++n) {
                var r = h.onnx.TensorProto.verify(t.tensors[n]);
                if (r) return "tensors." + r;
              }
            }
            if (t.graphs != null && t.hasOwnProperty("graphs")) {
              if (!Array.isArray(t.graphs)) return "graphs: array expected";
              for (var n = 0; n < t.graphs.length; ++n) {
                var r = h.onnx.GraphProto.verify(t.graphs[n]);
                if (r) return "graphs." + r;
              }
            }
            if (t.sparseTensors != null && t.hasOwnProperty("sparseTensors")) {
              if (!Array.isArray(t.sparseTensors))
                return "sparseTensors: array expected";
              for (var n = 0; n < t.sparseTensors.length; ++n) {
                var r = h.onnx.SparseTensorProto.verify(t.sparseTensors[n]);
                if (r) return "sparseTensors." + r;
              }
            }
            if (t.typeProtos != null && t.hasOwnProperty("typeProtos")) {
              if (!Array.isArray(t.typeProtos))
                return "typeProtos: array expected";
              for (var n = 0; n < t.typeProtos.length; ++n) {
                var r = h.onnx.TypeProto.verify(t.typeProtos[n]);
                if (r) return "typeProtos." + r;
              }
            }
            return null;
          }),
          (e.fromObject = function (t) {
            if (t instanceof h.onnx.AttributeProto) return t;
            var r = new h.onnx.AttributeProto();
            switch (
              (t.name != null && (r.name = String(t.name)),
              t.refAttrName != null && (r.refAttrName = String(t.refAttrName)),
              t.docString != null && (r.docString = String(t.docString)),
              t.type)
            ) {
              default:
                if (typeof t.type == "number") {
                  r.type = t.type;
                  break;
                }
                break;
              case "UNDEFINED":
              case 0:
                r.type = 0;
                break;
              case "FLOAT":
              case 1:
                r.type = 1;
                break;
              case "INT":
              case 2:
                r.type = 2;
                break;
              case "STRING":
              case 3:
                r.type = 3;
                break;
              case "TENSOR":
              case 4:
                r.type = 4;
                break;
              case "GRAPH":
              case 5:
                r.type = 5;
                break;
              case "SPARSE_TENSOR":
              case 11:
                r.type = 11;
                break;
              case "TYPE_PROTO":
              case 13:
                r.type = 13;
                break;
              case "FLOATS":
              case 6:
                r.type = 6;
                break;
              case "INTS":
              case 7:
                r.type = 7;
                break;
              case "STRINGS":
              case 8:
                r.type = 8;
                break;
              case "TENSORS":
              case 9:
                r.type = 9;
                break;
              case "GRAPHS":
              case 10:
                r.type = 10;
                break;
              case "SPARSE_TENSORS":
              case 12:
                r.type = 12;
                break;
              case "TYPE_PROTOS":
              case 14:
                r.type = 14;
                break;
            }
            if (
              (t.f != null && (r.f = Number(t.f)),
              t.i != null &&
                (b.Long
                  ? ((r.i = b.Long.fromValue(t.i)).unsigned = !1)
                  : typeof t.i == "string"
                  ? (r.i = parseInt(t.i, 10))
                  : typeof t.i == "number"
                  ? (r.i = t.i)
                  : typeof t.i == "object" &&
                    (r.i = new b.LongBits(
                      t.i.low >>> 0,
                      t.i.high >>> 0
                    ).toNumber())),
              t.s != null &&
                (typeof t.s == "string"
                  ? b.base64.decode(
                      t.s,
                      (r.s = b.newBuffer(b.base64.length(t.s))),
                      0
                    )
                  : t.s.length >= 0 && (r.s = t.s)),
              t.t != null)
            ) {
              if (typeof t.t != "object")
                throw TypeError(".onnx.AttributeProto.t: object expected");
              r.t = h.onnx.TensorProto.fromObject(t.t);
            }
            if (t.g != null) {
              if (typeof t.g != "object")
                throw TypeError(".onnx.AttributeProto.g: object expected");
              r.g = h.onnx.GraphProto.fromObject(t.g);
            }
            if (t.sparseTensor != null) {
              if (typeof t.sparseTensor != "object")
                throw TypeError(
                  ".onnx.AttributeProto.sparseTensor: object expected"
                );
              r.sparseTensor = h.onnx.SparseTensorProto.fromObject(
                t.sparseTensor
              );
            }
            if (t.tp != null) {
              if (typeof t.tp != "object")
                throw TypeError(".onnx.AttributeProto.tp: object expected");
              r.tp = h.onnx.TypeProto.fromObject(t.tp);
            }
            if (t.floats) {
              if (!Array.isArray(t.floats))
                throw TypeError(".onnx.AttributeProto.floats: array expected");
              r.floats = [];
              for (var n = 0; n < t.floats.length; ++n)
                r.floats[n] = Number(t.floats[n]);
            }
            if (t.ints) {
              if (!Array.isArray(t.ints))
                throw TypeError(".onnx.AttributeProto.ints: array expected");
              r.ints = [];
              for (var n = 0; n < t.ints.length; ++n)
                b.Long
                  ? ((r.ints[n] = b.Long.fromValue(t.ints[n])).unsigned = !1)
                  : typeof t.ints[n] == "string"
                  ? (r.ints[n] = parseInt(t.ints[n], 10))
                  : typeof t.ints[n] == "number"
                  ? (r.ints[n] = t.ints[n])
                  : typeof t.ints[n] == "object" &&
                    (r.ints[n] = new b.LongBits(
                      t.ints[n].low >>> 0,
                      t.ints[n].high >>> 0
                    ).toNumber());
            }
            if (t.strings) {
              if (!Array.isArray(t.strings))
                throw TypeError(".onnx.AttributeProto.strings: array expected");
              r.strings = [];
              for (var n = 0; n < t.strings.length; ++n)
                typeof t.strings[n] == "string"
                  ? b.base64.decode(
                      t.strings[n],
                      (r.strings[n] = b.newBuffer(
                        b.base64.length(t.strings[n])
                      )),
                      0
                    )
                  : t.strings[n].length >= 0 && (r.strings[n] = t.strings[n]);
            }
            if (t.tensors) {
              if (!Array.isArray(t.tensors))
                throw TypeError(".onnx.AttributeProto.tensors: array expected");
              r.tensors = [];
              for (var n = 0; n < t.tensors.length; ++n) {
                if (typeof t.tensors[n] != "object")
                  throw TypeError(
                    ".onnx.AttributeProto.tensors: object expected"
                  );
                r.tensors[n] = h.onnx.TensorProto.fromObject(t.tensors[n]);
              }
            }
            if (t.graphs) {
              if (!Array.isArray(t.graphs))
                throw TypeError(".onnx.AttributeProto.graphs: array expected");
              r.graphs = [];
              for (var n = 0; n < t.graphs.length; ++n) {
                if (typeof t.graphs[n] != "object")
                  throw TypeError(
                    ".onnx.AttributeProto.graphs: object expected"
                  );
                r.graphs[n] = h.onnx.GraphProto.fromObject(t.graphs[n]);
              }
            }
            if (t.sparseTensors) {
              if (!Array.isArray(t.sparseTensors))
                throw TypeError(
                  ".onnx.AttributeProto.sparseTensors: array expected"
                );
              r.sparseTensors = [];
              for (var n = 0; n < t.sparseTensors.length; ++n) {
                if (typeof t.sparseTensors[n] != "object")
                  throw TypeError(
                    ".onnx.AttributeProto.sparseTensors: object expected"
                  );
                r.sparseTensors[n] = h.onnx.SparseTensorProto.fromObject(
                  t.sparseTensors[n]
                );
              }
            }
            if (t.typeProtos) {
              if (!Array.isArray(t.typeProtos))
                throw TypeError(
                  ".onnx.AttributeProto.typeProtos: array expected"
                );
              r.typeProtos = [];
              for (var n = 0; n < t.typeProtos.length; ++n) {
                if (typeof t.typeProtos[n] != "object")
                  throw TypeError(
                    ".onnx.AttributeProto.typeProtos: object expected"
                  );
                r.typeProtos[n] = h.onnx.TypeProto.fromObject(t.typeProtos[n]);
              }
            }
            return r;
          }),
          (e.toObject = function (t, r) {
            r || (r = {});
            var n = {};
            if (
              ((r.arrays || r.defaults) &&
                ((n.floats = []),
                (n.ints = []),
                (n.strings = []),
                (n.tensors = []),
                (n.graphs = []),
                (n.typeProtos = []),
                (n.sparseTensors = [])),
              r.defaults)
            ) {
              if (((n.name = ""), (n.f = 0), b.Long)) {
                var s = new b.Long(0, 0, !1);
                n.i =
                  r.longs === String
                    ? s.toString()
                    : r.longs === Number
                    ? s.toNumber()
                    : s;
              } else n.i = r.longs === String ? "0" : 0;
              r.bytes === String
                ? (n.s = "")
                : ((n.s = []), r.bytes !== Array && (n.s = b.newBuffer(n.s))),
                (n.t = null),
                (n.g = null),
                (n.docString = ""),
                (n.tp = null),
                (n.type = r.enums === String ? "UNDEFINED" : 0),
                (n.refAttrName = ""),
                (n.sparseTensor = null);
            }
            if (
              (t.name != null && t.hasOwnProperty("name") && (n.name = t.name),
              t.f != null &&
                t.hasOwnProperty("f") &&
                (n.f = r.json && !isFinite(t.f) ? String(t.f) : t.f),
              t.i != null &&
                t.hasOwnProperty("i") &&
                (typeof t.i == "number"
                  ? (n.i = r.longs === String ? String(t.i) : t.i)
                  : (n.i =
                      r.longs === String
                        ? b.Long.prototype.toString.call(t.i)
                        : r.longs === Number
                        ? new b.LongBits(
                            t.i.low >>> 0,
                            t.i.high >>> 0
                          ).toNumber()
                        : t.i)),
              t.s != null &&
                t.hasOwnProperty("s") &&
                (n.s =
                  r.bytes === String
                    ? b.base64.encode(t.s, 0, t.s.length)
                    : r.bytes === Array
                    ? Array.prototype.slice.call(t.s)
                    : t.s),
              t.t != null &&
                t.hasOwnProperty("t") &&
                (n.t = h.onnx.TensorProto.toObject(t.t, r)),
              t.g != null &&
                t.hasOwnProperty("g") &&
                (n.g = h.onnx.GraphProto.toObject(t.g, r)),
              t.floats && t.floats.length)
            ) {
              n.floats = [];
              for (var a = 0; a < t.floats.length; ++a)
                n.floats[a] =
                  r.json && !isFinite(t.floats[a])
                    ? String(t.floats[a])
                    : t.floats[a];
            }
            if (t.ints && t.ints.length) {
              n.ints = [];
              for (var a = 0; a < t.ints.length; ++a)
                typeof t.ints[a] == "number"
                  ? (n.ints[a] =
                      r.longs === String ? String(t.ints[a]) : t.ints[a])
                  : (n.ints[a] =
                      r.longs === String
                        ? b.Long.prototype.toString.call(t.ints[a])
                        : r.longs === Number
                        ? new b.LongBits(
                            t.ints[a].low >>> 0,
                            t.ints[a].high >>> 0
                          ).toNumber()
                        : t.ints[a]);
            }
            if (t.strings && t.strings.length) {
              n.strings = [];
              for (var a = 0; a < t.strings.length; ++a)
                n.strings[a] =
                  r.bytes === String
                    ? b.base64.encode(t.strings[a], 0, t.strings[a].length)
                    : r.bytes === Array
                    ? Array.prototype.slice.call(t.strings[a])
                    : t.strings[a];
            }
            if (t.tensors && t.tensors.length) {
              n.tensors = [];
              for (var a = 0; a < t.tensors.length; ++a)
                n.tensors[a] = h.onnx.TensorProto.toObject(t.tensors[a], r);
            }
            if (t.graphs && t.graphs.length) {
              n.graphs = [];
              for (var a = 0; a < t.graphs.length; ++a)
                n.graphs[a] = h.onnx.GraphProto.toObject(t.graphs[a], r);
            }
            if (
              (t.docString != null &&
                t.hasOwnProperty("docString") &&
                (n.docString = t.docString),
              t.tp != null &&
                t.hasOwnProperty("tp") &&
                (n.tp = h.onnx.TypeProto.toObject(t.tp, r)),
              t.typeProtos && t.typeProtos.length)
            ) {
              n.typeProtos = [];
              for (var a = 0; a < t.typeProtos.length; ++a)
                n.typeProtos[a] = h.onnx.TypeProto.toObject(t.typeProtos[a], r);
            }
            if (
              (t.type != null &&
                t.hasOwnProperty("type") &&
                (n.type =
                  r.enums === String
                    ? h.onnx.AttributeProto.AttributeType[t.type] === void 0
                      ? t.type
                      : h.onnx.AttributeProto.AttributeType[t.type]
                    : t.type),
              t.refAttrName != null &&
                t.hasOwnProperty("refAttrName") &&
                (n.refAttrName = t.refAttrName),
              t.sparseTensor != null &&
                t.hasOwnProperty("sparseTensor") &&
                (n.sparseTensor = h.onnx.SparseTensorProto.toObject(
                  t.sparseTensor,
                  r
                )),
              t.sparseTensors && t.sparseTensors.length)
            ) {
              n.sparseTensors = [];
              for (var a = 0; a < t.sparseTensors.length; ++a)
                n.sparseTensors[a] = h.onnx.SparseTensorProto.toObject(
                  t.sparseTensors[a],
                  r
                );
            }
            return n;
          }),
          (e.prototype.toJSON = function () {
            return this.constructor.toObject(this, nt.util.toJSONOptions);
          }),
          (e.getTypeUrl = function (t) {
            return (
              t === void 0 && (t = "type.googleapis.com"),
              t + "/onnx.AttributeProto"
            );
          }),
          (e.AttributeType = (function () {
            var o = {},
              t = Object.create(o);
            return (
              (t[(o[0] = "UNDEFINED")] = 0),
              (t[(o[1] = "FLOAT")] = 1),
              (t[(o[2] = "INT")] = 2),
              (t[(o[3] = "STRING")] = 3),
              (t[(o[4] = "TENSOR")] = 4),
              (t[(o[5] = "GRAPH")] = 5),
              (t[(o[11] = "SPARSE_TENSOR")] = 11),
              (t[(o[13] = "TYPE_PROTO")] = 13),
              (t[(o[6] = "FLOATS")] = 6),
              (t[(o[7] = "INTS")] = 7),
              (t[(o[8] = "STRINGS")] = 8),
              (t[(o[9] = "TENSORS")] = 9),
              (t[(o[10] = "GRAPHS")] = 10),
              (t[(o[12] = "SPARSE_TENSORS")] = 12),
              (t[(o[14] = "TYPE_PROTOS")] = 14),
              t
            );
          })()),
          e
        );
      })()),
      (i.ValueInfoProto = (function () {
        function e(o) {
          if (o)
            for (var t = Object.keys(o), r = 0; r < t.length; ++r)
              o[t[r]] != null && (this[t[r]] = o[t[r]]);
        }
        return (
          (e.prototype.name = ""),
          (e.prototype.type = null),
          (e.prototype.docString = ""),
          (e.create = function (t) {
            return new e(t);
          }),
          (e.encode = function (t, r) {
            return (
              r || (r = pt.create()),
              t.name != null &&
                Object.hasOwnProperty.call(t, "name") &&
                r.uint32(10).string(t.name),
              t.type != null &&
                Object.hasOwnProperty.call(t, "type") &&
                h.onnx.TypeProto.encode(t.type, r.uint32(18).fork()).ldelim(),
              t.docString != null &&
                Object.hasOwnProperty.call(t, "docString") &&
                r.uint32(26).string(t.docString),
              r
            );
          }),
          (e.encodeDelimited = function (t, r) {
            return this.encode(t, r).ldelim();
          }),
          (e.decode = function (t, r) {
            t instanceof $ || (t = $.create(t));
            for (
              var n = r === void 0 ? t.len : t.pos + r,
                s = new h.onnx.ValueInfoProto();
              t.pos < n;

            ) {
              var a = t.uint32();
              switch (a >>> 3) {
                case 1: {
                  s.name = t.string();
                  break;
                }
                case 2: {
                  s.type = h.onnx.TypeProto.decode(t, t.uint32());
                  break;
                }
                case 3: {
                  s.docString = t.string();
                  break;
                }
                default:
                  t.skipType(a & 7);
                  break;
              }
            }
            return s;
          }),
          (e.decodeDelimited = function (t) {
            return t instanceof $ || (t = new $(t)), this.decode(t, t.uint32());
          }),
          (e.verify = function (t) {
            if (typeof t != "object" || t === null) return "object expected";
            if (
              t.name != null &&
              t.hasOwnProperty("name") &&
              !b.isString(t.name)
            )
              return "name: string expected";
            if (t.type != null && t.hasOwnProperty("type")) {
              var r = h.onnx.TypeProto.verify(t.type);
              if (r) return "type." + r;
            }
            return t.docString != null &&
              t.hasOwnProperty("docString") &&
              !b.isString(t.docString)
              ? "docString: string expected"
              : null;
          }),
          (e.fromObject = function (t) {
            if (t instanceof h.onnx.ValueInfoProto) return t;
            var r = new h.onnx.ValueInfoProto();
            if ((t.name != null && (r.name = String(t.name)), t.type != null)) {
              if (typeof t.type != "object")
                throw TypeError(".onnx.ValueInfoProto.type: object expected");
              r.type = h.onnx.TypeProto.fromObject(t.type);
            }
            return (
              t.docString != null && (r.docString = String(t.docString)), r
            );
          }),
          (e.toObject = function (t, r) {
            r || (r = {});
            var n = {};
            return (
              r.defaults &&
                ((n.name = ""), (n.type = null), (n.docString = "")),
              t.name != null && t.hasOwnProperty("name") && (n.name = t.name),
              t.type != null &&
                t.hasOwnProperty("type") &&
                (n.type = h.onnx.TypeProto.toObject(t.type, r)),
              t.docString != null &&
                t.hasOwnProperty("docString") &&
                (n.docString = t.docString),
              n
            );
          }),
          (e.prototype.toJSON = function () {
            return this.constructor.toObject(this, nt.util.toJSONOptions);
          }),
          (e.getTypeUrl = function (t) {
            return (
              t === void 0 && (t = "type.googleapis.com"),
              t + "/onnx.ValueInfoProto"
            );
          }),
          e
        );
      })()),
      (i.NodeProto = (function () {
        function e(o) {
          if (((this.input = []), (this.output = []), (this.attribute = []), o))
            for (var t = Object.keys(o), r = 0; r < t.length; ++r)
              o[t[r]] != null && (this[t[r]] = o[t[r]]);
        }
        return (
          (e.prototype.input = b.emptyArray),
          (e.prototype.output = b.emptyArray),
          (e.prototype.name = ""),
          (e.prototype.opType = ""),
          (e.prototype.domain = ""),
          (e.prototype.attribute = b.emptyArray),
          (e.prototype.docString = ""),
          (e.create = function (t) {
            return new e(t);
          }),
          (e.encode = function (t, r) {
            if ((r || (r = pt.create()), t.input != null && t.input.length))
              for (var n = 0; n < t.input.length; ++n)
                r.uint32(10).string(t.input[n]);
            if (t.output != null && t.output.length)
              for (var n = 0; n < t.output.length; ++n)
                r.uint32(18).string(t.output[n]);
            if (
              (t.name != null &&
                Object.hasOwnProperty.call(t, "name") &&
                r.uint32(26).string(t.name),
              t.opType != null &&
                Object.hasOwnProperty.call(t, "opType") &&
                r.uint32(34).string(t.opType),
              t.attribute != null && t.attribute.length)
            )
              for (var n = 0; n < t.attribute.length; ++n)
                h.onnx.AttributeProto.encode(
                  t.attribute[n],
                  r.uint32(42).fork()
                ).ldelim();
            return (
              t.docString != null &&
                Object.hasOwnProperty.call(t, "docString") &&
                r.uint32(50).string(t.docString),
              t.domain != null &&
                Object.hasOwnProperty.call(t, "domain") &&
                r.uint32(58).string(t.domain),
              r
            );
          }),
          (e.encodeDelimited = function (t, r) {
            return this.encode(t, r).ldelim();
          }),
          (e.decode = function (t, r) {
            t instanceof $ || (t = $.create(t));
            for (
              var n = r === void 0 ? t.len : t.pos + r,
                s = new h.onnx.NodeProto();
              t.pos < n;

            ) {
              var a = t.uint32();
              switch (a >>> 3) {
                case 1: {
                  (s.input && s.input.length) || (s.input = []),
                    s.input.push(t.string());
                  break;
                }
                case 2: {
                  (s.output && s.output.length) || (s.output = []),
                    s.output.push(t.string());
                  break;
                }
                case 3: {
                  s.name = t.string();
                  break;
                }
                case 4: {
                  s.opType = t.string();
                  break;
                }
                case 7: {
                  s.domain = t.string();
                  break;
                }
                case 5: {
                  (s.attribute && s.attribute.length) || (s.attribute = []),
                    s.attribute.push(
                      h.onnx.AttributeProto.decode(t, t.uint32())
                    );
                  break;
                }
                case 6: {
                  s.docString = t.string();
                  break;
                }
                default:
                  t.skipType(a & 7);
                  break;
              }
            }
            return s;
          }),
          (e.decodeDelimited = function (t) {
            return t instanceof $ || (t = new $(t)), this.decode(t, t.uint32());
          }),
          (e.verify = function (t) {
            if (typeof t != "object" || t === null) return "object expected";
            if (t.input != null && t.hasOwnProperty("input")) {
              if (!Array.isArray(t.input)) return "input: array expected";
              for (var r = 0; r < t.input.length; ++r)
                if (!b.isString(t.input[r])) return "input: string[] expected";
            }
            if (t.output != null && t.hasOwnProperty("output")) {
              if (!Array.isArray(t.output)) return "output: array expected";
              for (var r = 0; r < t.output.length; ++r)
                if (!b.isString(t.output[r]))
                  return "output: string[] expected";
            }
            if (
              t.name != null &&
              t.hasOwnProperty("name") &&
              !b.isString(t.name)
            )
              return "name: string expected";
            if (
              t.opType != null &&
              t.hasOwnProperty("opType") &&
              !b.isString(t.opType)
            )
              return "opType: string expected";
            if (
              t.domain != null &&
              t.hasOwnProperty("domain") &&
              !b.isString(t.domain)
            )
              return "domain: string expected";
            if (t.attribute != null && t.hasOwnProperty("attribute")) {
              if (!Array.isArray(t.attribute))
                return "attribute: array expected";
              for (var r = 0; r < t.attribute.length; ++r) {
                var n = h.onnx.AttributeProto.verify(t.attribute[r]);
                if (n) return "attribute." + n;
              }
            }
            return t.docString != null &&
              t.hasOwnProperty("docString") &&
              !b.isString(t.docString)
              ? "docString: string expected"
              : null;
          }),
          (e.fromObject = function (t) {
            if (t instanceof h.onnx.NodeProto) return t;
            var r = new h.onnx.NodeProto();
            if (t.input) {
              if (!Array.isArray(t.input))
                throw TypeError(".onnx.NodeProto.input: array expected");
              r.input = [];
              for (var n = 0; n < t.input.length; ++n)
                r.input[n] = String(t.input[n]);
            }
            if (t.output) {
              if (!Array.isArray(t.output))
                throw TypeError(".onnx.NodeProto.output: array expected");
              r.output = [];
              for (var n = 0; n < t.output.length; ++n)
                r.output[n] = String(t.output[n]);
            }
            if (
              (t.name != null && (r.name = String(t.name)),
              t.opType != null && (r.opType = String(t.opType)),
              t.domain != null && (r.domain = String(t.domain)),
              t.attribute)
            ) {
              if (!Array.isArray(t.attribute))
                throw TypeError(".onnx.NodeProto.attribute: array expected");
              r.attribute = [];
              for (var n = 0; n < t.attribute.length; ++n) {
                if (typeof t.attribute[n] != "object")
                  throw TypeError(".onnx.NodeProto.attribute: object expected");
                r.attribute[n] = h.onnx.AttributeProto.fromObject(
                  t.attribute[n]
                );
              }
            }
            return (
              t.docString != null && (r.docString = String(t.docString)), r
            );
          }),
          (e.toObject = function (t, r) {
            r || (r = {});
            var n = {};
            if (
              ((r.arrays || r.defaults) &&
                ((n.input = []), (n.output = []), (n.attribute = [])),
              r.defaults &&
                ((n.name = ""),
                (n.opType = ""),
                (n.docString = ""),
                (n.domain = "")),
              t.input && t.input.length)
            ) {
              n.input = [];
              for (var s = 0; s < t.input.length; ++s) n.input[s] = t.input[s];
            }
            if (t.output && t.output.length) {
              n.output = [];
              for (var s = 0; s < t.output.length; ++s)
                n.output[s] = t.output[s];
            }
            if (
              (t.name != null && t.hasOwnProperty("name") && (n.name = t.name),
              t.opType != null &&
                t.hasOwnProperty("opType") &&
                (n.opType = t.opType),
              t.attribute && t.attribute.length)
            ) {
              n.attribute = [];
              for (var s = 0; s < t.attribute.length; ++s)
                n.attribute[s] = h.onnx.AttributeProto.toObject(
                  t.attribute[s],
                  r
                );
            }
            return (
              t.docString != null &&
                t.hasOwnProperty("docString") &&
                (n.docString = t.docString),
              t.domain != null &&
                t.hasOwnProperty("domain") &&
                (n.domain = t.domain),
              n
            );
          }),
          (e.prototype.toJSON = function () {
            return this.constructor.toObject(this, nt.util.toJSONOptions);
          }),
          (e.getTypeUrl = function (t) {
            return (
              t === void 0 && (t = "type.googleapis.com"), t + "/onnx.NodeProto"
            );
          }),
          e
        );
      })()),
      (i.TrainingInfoProto = (function () {
        function e(o) {
          if (((this.initializationBinding = []), (this.updateBinding = []), o))
            for (var t = Object.keys(o), r = 0; r < t.length; ++r)
              o[t[r]] != null && (this[t[r]] = o[t[r]]);
        }
        return (
          (e.prototype.initialization = null),
          (e.prototype.algorithm = null),
          (e.prototype.initializationBinding = b.emptyArray),
          (e.prototype.updateBinding = b.emptyArray),
          (e.create = function (t) {
            return new e(t);
          }),
          (e.encode = function (t, r) {
            if (
              (r || (r = pt.create()),
              t.initialization != null &&
                Object.hasOwnProperty.call(t, "initialization") &&
                h.onnx.GraphProto.encode(
                  t.initialization,
                  r.uint32(10).fork()
                ).ldelim(),
              t.algorithm != null &&
                Object.hasOwnProperty.call(t, "algorithm") &&
                h.onnx.GraphProto.encode(
                  t.algorithm,
                  r.uint32(18).fork()
                ).ldelim(),
              t.initializationBinding != null && t.initializationBinding.length)
            )
              for (var n = 0; n < t.initializationBinding.length; ++n)
                h.onnx.StringStringEntryProto.encode(
                  t.initializationBinding[n],
                  r.uint32(26).fork()
                ).ldelim();
            if (t.updateBinding != null && t.updateBinding.length)
              for (var n = 0; n < t.updateBinding.length; ++n)
                h.onnx.StringStringEntryProto.encode(
                  t.updateBinding[n],
                  r.uint32(34).fork()
                ).ldelim();
            return r;
          }),
          (e.encodeDelimited = function (t, r) {
            return this.encode(t, r).ldelim();
          }),
          (e.decode = function (t, r) {
            t instanceof $ || (t = $.create(t));
            for (
              var n = r === void 0 ? t.len : t.pos + r,
                s = new h.onnx.TrainingInfoProto();
              t.pos < n;

            ) {
              var a = t.uint32();
              switch (a >>> 3) {
                case 1: {
                  s.initialization = h.onnx.GraphProto.decode(t, t.uint32());
                  break;
                }
                case 2: {
                  s.algorithm = h.onnx.GraphProto.decode(t, t.uint32());
                  break;
                }
                case 3: {
                  (s.initializationBinding && s.initializationBinding.length) ||
                    (s.initializationBinding = []),
                    s.initializationBinding.push(
                      h.onnx.StringStringEntryProto.decode(t, t.uint32())
                    );
                  break;
                }
                case 4: {
                  (s.updateBinding && s.updateBinding.length) ||
                    (s.updateBinding = []),
                    s.updateBinding.push(
                      h.onnx.StringStringEntryProto.decode(t, t.uint32())
                    );
                  break;
                }
                default:
                  t.skipType(a & 7);
                  break;
              }
            }
            return s;
          }),
          (e.decodeDelimited = function (t) {
            return t instanceof $ || (t = new $(t)), this.decode(t, t.uint32());
          }),
          (e.verify = function (t) {
            if (typeof t != "object" || t === null) return "object expected";
            if (
              t.initialization != null &&
              t.hasOwnProperty("initialization")
            ) {
              var r = h.onnx.GraphProto.verify(t.initialization);
              if (r) return "initialization." + r;
            }
            if (t.algorithm != null && t.hasOwnProperty("algorithm")) {
              var r = h.onnx.GraphProto.verify(t.algorithm);
              if (r) return "algorithm." + r;
            }
            if (
              t.initializationBinding != null &&
              t.hasOwnProperty("initializationBinding")
            ) {
              if (!Array.isArray(t.initializationBinding))
                return "initializationBinding: array expected";
              for (var n = 0; n < t.initializationBinding.length; ++n) {
                var r = h.onnx.StringStringEntryProto.verify(
                  t.initializationBinding[n]
                );
                if (r) return "initializationBinding." + r;
              }
            }
            if (t.updateBinding != null && t.hasOwnProperty("updateBinding")) {
              if (!Array.isArray(t.updateBinding))
                return "updateBinding: array expected";
              for (var n = 0; n < t.updateBinding.length; ++n) {
                var r = h.onnx.StringStringEntryProto.verify(
                  t.updateBinding[n]
                );
                if (r) return "updateBinding." + r;
              }
            }
            return null;
          }),
          (e.fromObject = function (t) {
            if (t instanceof h.onnx.TrainingInfoProto) return t;
            var r = new h.onnx.TrainingInfoProto();
            if (t.initialization != null) {
              if (typeof t.initialization != "object")
                throw TypeError(
                  ".onnx.TrainingInfoProto.initialization: object expected"
                );
              r.initialization = h.onnx.GraphProto.fromObject(t.initialization);
            }
            if (t.algorithm != null) {
              if (typeof t.algorithm != "object")
                throw TypeError(
                  ".onnx.TrainingInfoProto.algorithm: object expected"
                );
              r.algorithm = h.onnx.GraphProto.fromObject(t.algorithm);
            }
            if (t.initializationBinding) {
              if (!Array.isArray(t.initializationBinding))
                throw TypeError(
                  ".onnx.TrainingInfoProto.initializationBinding: array expected"
                );
              r.initializationBinding = [];
              for (var n = 0; n < t.initializationBinding.length; ++n) {
                if (typeof t.initializationBinding[n] != "object")
                  throw TypeError(
                    ".onnx.TrainingInfoProto.initializationBinding: object expected"
                  );
                r.initializationBinding[n] =
                  h.onnx.StringStringEntryProto.fromObject(
                    t.initializationBinding[n]
                  );
              }
            }
            if (t.updateBinding) {
              if (!Array.isArray(t.updateBinding))
                throw TypeError(
                  ".onnx.TrainingInfoProto.updateBinding: array expected"
                );
              r.updateBinding = [];
              for (var n = 0; n < t.updateBinding.length; ++n) {
                if (typeof t.updateBinding[n] != "object")
                  throw TypeError(
                    ".onnx.TrainingInfoProto.updateBinding: object expected"
                  );
                r.updateBinding[n] = h.onnx.StringStringEntryProto.fromObject(
                  t.updateBinding[n]
                );
              }
            }
            return r;
          }),
          (e.toObject = function (t, r) {
            r || (r = {});
            var n = {};
            if (
              ((r.arrays || r.defaults) &&
                ((n.initializationBinding = []), (n.updateBinding = [])),
              r.defaults && ((n.initialization = null), (n.algorithm = null)),
              t.initialization != null &&
                t.hasOwnProperty("initialization") &&
                (n.initialization = h.onnx.GraphProto.toObject(
                  t.initialization,
                  r
                )),
              t.algorithm != null &&
                t.hasOwnProperty("algorithm") &&
                (n.algorithm = h.onnx.GraphProto.toObject(t.algorithm, r)),
              t.initializationBinding && t.initializationBinding.length)
            ) {
              n.initializationBinding = [];
              for (var s = 0; s < t.initializationBinding.length; ++s)
                n.initializationBinding[s] =
                  h.onnx.StringStringEntryProto.toObject(
                    t.initializationBinding[s],
                    r
                  );
            }
            if (t.updateBinding && t.updateBinding.length) {
              n.updateBinding = [];
              for (var s = 0; s < t.updateBinding.length; ++s)
                n.updateBinding[s] = h.onnx.StringStringEntryProto.toObject(
                  t.updateBinding[s],
                  r
                );
            }
            return n;
          }),
          (e.prototype.toJSON = function () {
            return this.constructor.toObject(this, nt.util.toJSONOptions);
          }),
          (e.getTypeUrl = function (t) {
            return (
              t === void 0 && (t = "type.googleapis.com"),
              t + "/onnx.TrainingInfoProto"
            );
          }),
          e
        );
      })()),
      (i.ModelProto = (function () {
        function e(o) {
          if (
            ((this.opsetImport = []),
            (this.metadataProps = []),
            (this.trainingInfo = []),
            (this.functions = []),
            o)
          )
            for (var t = Object.keys(o), r = 0; r < t.length; ++r)
              o[t[r]] != null && (this[t[r]] = o[t[r]]);
        }
        return (
          (e.prototype.irVersion = b.Long ? b.Long.fromBits(0, 0, !1) : 0),
          (e.prototype.opsetImport = b.emptyArray),
          (e.prototype.producerName = ""),
          (e.prototype.producerVersion = ""),
          (e.prototype.domain = ""),
          (e.prototype.modelVersion = b.Long ? b.Long.fromBits(0, 0, !1) : 0),
          (e.prototype.docString = ""),
          (e.prototype.graph = null),
          (e.prototype.metadataProps = b.emptyArray),
          (e.prototype.trainingInfo = b.emptyArray),
          (e.prototype.functions = b.emptyArray),
          (e.create = function (t) {
            return new e(t);
          }),
          (e.encode = function (t, r) {
            if (
              (r || (r = pt.create()),
              t.irVersion != null &&
                Object.hasOwnProperty.call(t, "irVersion") &&
                r.uint32(8).int64(t.irVersion),
              t.producerName != null &&
                Object.hasOwnProperty.call(t, "producerName") &&
                r.uint32(18).string(t.producerName),
              t.producerVersion != null &&
                Object.hasOwnProperty.call(t, "producerVersion") &&
                r.uint32(26).string(t.producerVersion),
              t.domain != null &&
                Object.hasOwnProperty.call(t, "domain") &&
                r.uint32(34).string(t.domain),
              t.modelVersion != null &&
                Object.hasOwnProperty.call(t, "modelVersion") &&
                r.uint32(40).int64(t.modelVersion),
              t.docString != null &&
                Object.hasOwnProperty.call(t, "docString") &&
                r.uint32(50).string(t.docString),
              t.graph != null &&
                Object.hasOwnProperty.call(t, "graph") &&
                h.onnx.GraphProto.encode(t.graph, r.uint32(58).fork()).ldelim(),
              t.opsetImport != null && t.opsetImport.length)
            )
              for (var n = 0; n < t.opsetImport.length; ++n)
                h.onnx.OperatorSetIdProto.encode(
                  t.opsetImport[n],
                  r.uint32(66).fork()
                ).ldelim();
            if (t.metadataProps != null && t.metadataProps.length)
              for (var n = 0; n < t.metadataProps.length; ++n)
                h.onnx.StringStringEntryProto.encode(
                  t.metadataProps[n],
                  r.uint32(114).fork()
                ).ldelim();
            if (t.trainingInfo != null && t.trainingInfo.length)
              for (var n = 0; n < t.trainingInfo.length; ++n)
                h.onnx.TrainingInfoProto.encode(
                  t.trainingInfo[n],
                  r.uint32(162).fork()
                ).ldelim();
            if (t.functions != null && t.functions.length)
              for (var n = 0; n < t.functions.length; ++n)
                h.onnx.FunctionProto.encode(
                  t.functions[n],
                  r.uint32(202).fork()
                ).ldelim();
            return r;
          }),
          (e.encodeDelimited = function (t, r) {
            return this.encode(t, r).ldelim();
          }),
          (e.decode = function (t, r) {
            t instanceof $ || (t = $.create(t));
            for (
              var n = r === void 0 ? t.len : t.pos + r,
                s = new h.onnx.ModelProto();
              t.pos < n;

            ) {
              var a = t.uint32();
              switch (a >>> 3) {
                case 1: {
                  s.irVersion = t.int64();
                  break;
                }
                case 8: {
                  (s.opsetImport && s.opsetImport.length) ||
                    (s.opsetImport = []),
                    s.opsetImport.push(
                      h.onnx.OperatorSetIdProto.decode(t, t.uint32())
                    );
                  break;
                }
                case 2: {
                  s.producerName = t.string();
                  break;
                }
                case 3: {
                  s.producerVersion = t.string();
                  break;
                }
                case 4: {
                  s.domain = t.string();
                  break;
                }
                case 5: {
                  s.modelVersion = t.int64();
                  break;
                }
                case 6: {
                  s.docString = t.string();
                  break;
                }
                case 7: {
                  s.graph = h.onnx.GraphProto.decode(t, t.uint32());
                  break;
                }
                case 14: {
                  (s.metadataProps && s.metadataProps.length) ||
                    (s.metadataProps = []),
                    s.metadataProps.push(
                      h.onnx.StringStringEntryProto.decode(t, t.uint32())
                    );
                  break;
                }
                case 20: {
                  (s.trainingInfo && s.trainingInfo.length) ||
                    (s.trainingInfo = []),
                    s.trainingInfo.push(
                      h.onnx.TrainingInfoProto.decode(t, t.uint32())
                    );
                  break;
                }
                case 25: {
                  (s.functions && s.functions.length) || (s.functions = []),
                    s.functions.push(
                      h.onnx.FunctionProto.decode(t, t.uint32())
                    );
                  break;
                }
                default:
                  t.skipType(a & 7);
                  break;
              }
            }
            return s;
          }),
          (e.decodeDelimited = function (t) {
            return t instanceof $ || (t = new $(t)), this.decode(t, t.uint32());
          }),
          (e.verify = function (t) {
            if (typeof t != "object" || t === null) return "object expected";
            if (
              t.irVersion != null &&
              t.hasOwnProperty("irVersion") &&
              !b.isInteger(t.irVersion) &&
              !(
                t.irVersion &&
                b.isInteger(t.irVersion.low) &&
                b.isInteger(t.irVersion.high)
              )
            )
              return "irVersion: integer|Long expected";
            if (t.opsetImport != null && t.hasOwnProperty("opsetImport")) {
              if (!Array.isArray(t.opsetImport))
                return "opsetImport: array expected";
              for (var r = 0; r < t.opsetImport.length; ++r) {
                var n = h.onnx.OperatorSetIdProto.verify(t.opsetImport[r]);
                if (n) return "opsetImport." + n;
              }
            }
            if (
              t.producerName != null &&
              t.hasOwnProperty("producerName") &&
              !b.isString(t.producerName)
            )
              return "producerName: string expected";
            if (
              t.producerVersion != null &&
              t.hasOwnProperty("producerVersion") &&
              !b.isString(t.producerVersion)
            )
              return "producerVersion: string expected";
            if (
              t.domain != null &&
              t.hasOwnProperty("domain") &&
              !b.isString(t.domain)
            )
              return "domain: string expected";
            if (
              t.modelVersion != null &&
              t.hasOwnProperty("modelVersion") &&
              !b.isInteger(t.modelVersion) &&
              !(
                t.modelVersion &&
                b.isInteger(t.modelVersion.low) &&
                b.isInteger(t.modelVersion.high)
              )
            )
              return "modelVersion: integer|Long expected";
            if (
              t.docString != null &&
              t.hasOwnProperty("docString") &&
              !b.isString(t.docString)
            )
              return "docString: string expected";
            if (t.graph != null && t.hasOwnProperty("graph")) {
              var n = h.onnx.GraphProto.verify(t.graph);
              if (n) return "graph." + n;
            }
            if (t.metadataProps != null && t.hasOwnProperty("metadataProps")) {
              if (!Array.isArray(t.metadataProps))
                return "metadataProps: array expected";
              for (var r = 0; r < t.metadataProps.length; ++r) {
                var n = h.onnx.StringStringEntryProto.verify(
                  t.metadataProps[r]
                );
                if (n) return "metadataProps." + n;
              }
            }
            if (t.trainingInfo != null && t.hasOwnProperty("trainingInfo")) {
              if (!Array.isArray(t.trainingInfo))
                return "trainingInfo: array expected";
              for (var r = 0; r < t.trainingInfo.length; ++r) {
                var n = h.onnx.TrainingInfoProto.verify(t.trainingInfo[r]);
                if (n) return "trainingInfo." + n;
              }
            }
            if (t.functions != null && t.hasOwnProperty("functions")) {
              if (!Array.isArray(t.functions))
                return "functions: array expected";
              for (var r = 0; r < t.functions.length; ++r) {
                var n = h.onnx.FunctionProto.verify(t.functions[r]);
                if (n) return "functions." + n;
              }
            }
            return null;
          }),
          (e.fromObject = function (t) {
            if (t instanceof h.onnx.ModelProto) return t;
            var r = new h.onnx.ModelProto();
            if (
              (t.irVersion != null &&
                (b.Long
                  ? ((r.irVersion = b.Long.fromValue(t.irVersion)).unsigned =
                      !1)
                  : typeof t.irVersion == "string"
                  ? (r.irVersion = parseInt(t.irVersion, 10))
                  : typeof t.irVersion == "number"
                  ? (r.irVersion = t.irVersion)
                  : typeof t.irVersion == "object" &&
                    (r.irVersion = new b.LongBits(
                      t.irVersion.low >>> 0,
                      t.irVersion.high >>> 0
                    ).toNumber())),
              t.opsetImport)
            ) {
              if (!Array.isArray(t.opsetImport))
                throw TypeError(".onnx.ModelProto.opsetImport: array expected");
              r.opsetImport = [];
              for (var n = 0; n < t.opsetImport.length; ++n) {
                if (typeof t.opsetImport[n] != "object")
                  throw TypeError(
                    ".onnx.ModelProto.opsetImport: object expected"
                  );
                r.opsetImport[n] = h.onnx.OperatorSetIdProto.fromObject(
                  t.opsetImport[n]
                );
              }
            }
            if (
              (t.producerName != null &&
                (r.producerName = String(t.producerName)),
              t.producerVersion != null &&
                (r.producerVersion = String(t.producerVersion)),
              t.domain != null && (r.domain = String(t.domain)),
              t.modelVersion != null &&
                (b.Long
                  ? ((r.modelVersion = b.Long.fromValue(
                      t.modelVersion
                    )).unsigned = !1)
                  : typeof t.modelVersion == "string"
                  ? (r.modelVersion = parseInt(t.modelVersion, 10))
                  : typeof t.modelVersion == "number"
                  ? (r.modelVersion = t.modelVersion)
                  : typeof t.modelVersion == "object" &&
                    (r.modelVersion = new b.LongBits(
                      t.modelVersion.low >>> 0,
                      t.modelVersion.high >>> 0
                    ).toNumber())),
              t.docString != null && (r.docString = String(t.docString)),
              t.graph != null)
            ) {
              if (typeof t.graph != "object")
                throw TypeError(".onnx.ModelProto.graph: object expected");
              r.graph = h.onnx.GraphProto.fromObject(t.graph);
            }
            if (t.metadataProps) {
              if (!Array.isArray(t.metadataProps))
                throw TypeError(
                  ".onnx.ModelProto.metadataProps: array expected"
                );
              r.metadataProps = [];
              for (var n = 0; n < t.metadataProps.length; ++n) {
                if (typeof t.metadataProps[n] != "object")
                  throw TypeError(
                    ".onnx.ModelProto.metadataProps: object expected"
                  );
                r.metadataProps[n] = h.onnx.StringStringEntryProto.fromObject(
                  t.metadataProps[n]
                );
              }
            }
            if (t.trainingInfo) {
              if (!Array.isArray(t.trainingInfo))
                throw TypeError(
                  ".onnx.ModelProto.trainingInfo: array expected"
                );
              r.trainingInfo = [];
              for (var n = 0; n < t.trainingInfo.length; ++n) {
                if (typeof t.trainingInfo[n] != "object")
                  throw TypeError(
                    ".onnx.ModelProto.trainingInfo: object expected"
                  );
                r.trainingInfo[n] = h.onnx.TrainingInfoProto.fromObject(
                  t.trainingInfo[n]
                );
              }
            }
            if (t.functions) {
              if (!Array.isArray(t.functions))
                throw TypeError(".onnx.ModelProto.functions: array expected");
              r.functions = [];
              for (var n = 0; n < t.functions.length; ++n) {
                if (typeof t.functions[n] != "object")
                  throw TypeError(
                    ".onnx.ModelProto.functions: object expected"
                  );
                r.functions[n] = h.onnx.FunctionProto.fromObject(
                  t.functions[n]
                );
              }
            }
            return r;
          }),
          (e.toObject = function (t, r) {
            r || (r = {});
            var n = {};
            if (
              ((r.arrays || r.defaults) &&
                ((n.opsetImport = []),
                (n.metadataProps = []),
                (n.trainingInfo = []),
                (n.functions = [])),
              r.defaults)
            ) {
              if (b.Long) {
                var s = new b.Long(0, 0, !1);
                n.irVersion =
                  r.longs === String
                    ? s.toString()
                    : r.longs === Number
                    ? s.toNumber()
                    : s;
              } else n.irVersion = r.longs === String ? "0" : 0;
              if (
                ((n.producerName = ""),
                (n.producerVersion = ""),
                (n.domain = ""),
                b.Long)
              ) {
                var s = new b.Long(0, 0, !1);
                n.modelVersion =
                  r.longs === String
                    ? s.toString()
                    : r.longs === Number
                    ? s.toNumber()
                    : s;
              } else n.modelVersion = r.longs === String ? "0" : 0;
              (n.docString = ""), (n.graph = null);
            }
            if (
              (t.irVersion != null &&
                t.hasOwnProperty("irVersion") &&
                (typeof t.irVersion == "number"
                  ? (n.irVersion =
                      r.longs === String ? String(t.irVersion) : t.irVersion)
                  : (n.irVersion =
                      r.longs === String
                        ? b.Long.prototype.toString.call(t.irVersion)
                        : r.longs === Number
                        ? new b.LongBits(
                            t.irVersion.low >>> 0,
                            t.irVersion.high >>> 0
                          ).toNumber()
                        : t.irVersion)),
              t.producerName != null &&
                t.hasOwnProperty("producerName") &&
                (n.producerName = t.producerName),
              t.producerVersion != null &&
                t.hasOwnProperty("producerVersion") &&
                (n.producerVersion = t.producerVersion),
              t.domain != null &&
                t.hasOwnProperty("domain") &&
                (n.domain = t.domain),
              t.modelVersion != null &&
                t.hasOwnProperty("modelVersion") &&
                (typeof t.modelVersion == "number"
                  ? (n.modelVersion =
                      r.longs === String
                        ? String(t.modelVersion)
                        : t.modelVersion)
                  : (n.modelVersion =
                      r.longs === String
                        ? b.Long.prototype.toString.call(t.modelVersion)
                        : r.longs === Number
                        ? new b.LongBits(
                            t.modelVersion.low >>> 0,
                            t.modelVersion.high >>> 0
                          ).toNumber()
                        : t.modelVersion)),
              t.docString != null &&
                t.hasOwnProperty("docString") &&
                (n.docString = t.docString),
              t.graph != null &&
                t.hasOwnProperty("graph") &&
                (n.graph = h.onnx.GraphProto.toObject(t.graph, r)),
              t.opsetImport && t.opsetImport.length)
            ) {
              n.opsetImport = [];
              for (var a = 0; a < t.opsetImport.length; ++a)
                n.opsetImport[a] = h.onnx.OperatorSetIdProto.toObject(
                  t.opsetImport[a],
                  r
                );
            }
            if (t.metadataProps && t.metadataProps.length) {
              n.metadataProps = [];
              for (var a = 0; a < t.metadataProps.length; ++a)
                n.metadataProps[a] = h.onnx.StringStringEntryProto.toObject(
                  t.metadataProps[a],
                  r
                );
            }
            if (t.trainingInfo && t.trainingInfo.length) {
              n.trainingInfo = [];
              for (var a = 0; a < t.trainingInfo.length; ++a)
                n.trainingInfo[a] = h.onnx.TrainingInfoProto.toObject(
                  t.trainingInfo[a],
                  r
                );
            }
            if (t.functions && t.functions.length) {
              n.functions = [];
              for (var a = 0; a < t.functions.length; ++a)
                n.functions[a] = h.onnx.FunctionProto.toObject(
                  t.functions[a],
                  r
                );
            }
            return n;
          }),
          (e.prototype.toJSON = function () {
            return this.constructor.toObject(this, nt.util.toJSONOptions);
          }),
          (e.getTypeUrl = function (t) {
            return (
              t === void 0 && (t = "type.googleapis.com"),
              t + "/onnx.ModelProto"
            );
          }),
          e
        );
      })()),
      (i.StringStringEntryProto = (function () {
        function e(o) {
          if (o)
            for (var t = Object.keys(o), r = 0; r < t.length; ++r)
              o[t[r]] != null && (this[t[r]] = o[t[r]]);
        }
        return (
          (e.prototype.key = ""),
          (e.prototype.value = ""),
          (e.create = function (t) {
            return new e(t);
          }),
          (e.encode = function (t, r) {
            return (
              r || (r = pt.create()),
              t.key != null &&
                Object.hasOwnProperty.call(t, "key") &&
                r.uint32(10).string(t.key),
              t.value != null &&
                Object.hasOwnProperty.call(t, "value") &&
                r.uint32(18).string(t.value),
              r
            );
          }),
          (e.encodeDelimited = function (t, r) {
            return this.encode(t, r).ldelim();
          }),
          (e.decode = function (t, r) {
            t instanceof $ || (t = $.create(t));
            for (
              var n = r === void 0 ? t.len : t.pos + r,
                s = new h.onnx.StringStringEntryProto();
              t.pos < n;

            ) {
              var a = t.uint32();
              switch (a >>> 3) {
                case 1: {
                  s.key = t.string();
                  break;
                }
                case 2: {
                  s.value = t.string();
                  break;
                }
                default:
                  t.skipType(a & 7);
                  break;
              }
            }
            return s;
          }),
          (e.decodeDelimited = function (t) {
            return t instanceof $ || (t = new $(t)), this.decode(t, t.uint32());
          }),
          (e.verify = function (t) {
            return typeof t != "object" || t === null
              ? "object expected"
              : t.key != null && t.hasOwnProperty("key") && !b.isString(t.key)
              ? "key: string expected"
              : t.value != null &&
                t.hasOwnProperty("value") &&
                !b.isString(t.value)
              ? "value: string expected"
              : null;
          }),
          (e.fromObject = function (t) {
            if (t instanceof h.onnx.StringStringEntryProto) return t;
            var r = new h.onnx.StringStringEntryProto();
            return (
              t.key != null && (r.key = String(t.key)),
              t.value != null && (r.value = String(t.value)),
              r
            );
          }),
          (e.toObject = function (t, r) {
            r || (r = {});
            var n = {};
            return (
              r.defaults && ((n.key = ""), (n.value = "")),
              t.key != null && t.hasOwnProperty("key") && (n.key = t.key),
              t.value != null &&
                t.hasOwnProperty("value") &&
                (n.value = t.value),
              n
            );
          }),
          (e.prototype.toJSON = function () {
            return this.constructor.toObject(this, nt.util.toJSONOptions);
          }),
          (e.getTypeUrl = function (t) {
            return (
              t === void 0 && (t = "type.googleapis.com"),
              t + "/onnx.StringStringEntryProto"
            );
          }),
          e
        );
      })()),
      (i.TensorAnnotation = (function () {
        function e(o) {
          if (((this.quantParameterTensorNames = []), o))
            for (var t = Object.keys(o), r = 0; r < t.length; ++r)
              o[t[r]] != null && (this[t[r]] = o[t[r]]);
        }
        return (
          (e.prototype.tensorName = ""),
          (e.prototype.quantParameterTensorNames = b.emptyArray),
          (e.create = function (t) {
            return new e(t);
          }),
          (e.encode = function (t, r) {
            if (
              (r || (r = pt.create()),
              t.tensorName != null &&
                Object.hasOwnProperty.call(t, "tensorName") &&
                r.uint32(10).string(t.tensorName),
              t.quantParameterTensorNames != null &&
                t.quantParameterTensorNames.length)
            )
              for (var n = 0; n < t.quantParameterTensorNames.length; ++n)
                h.onnx.StringStringEntryProto.encode(
                  t.quantParameterTensorNames[n],
                  r.uint32(18).fork()
                ).ldelim();
            return r;
          }),
          (e.encodeDelimited = function (t, r) {
            return this.encode(t, r).ldelim();
          }),
          (e.decode = function (t, r) {
            t instanceof $ || (t = $.create(t));
            for (
              var n = r === void 0 ? t.len : t.pos + r,
                s = new h.onnx.TensorAnnotation();
              t.pos < n;

            ) {
              var a = t.uint32();
              switch (a >>> 3) {
                case 1: {
                  s.tensorName = t.string();
                  break;
                }
                case 2: {
                  (s.quantParameterTensorNames &&
                    s.quantParameterTensorNames.length) ||
                    (s.quantParameterTensorNames = []),
                    s.quantParameterTensorNames.push(
                      h.onnx.StringStringEntryProto.decode(t, t.uint32())
                    );
                  break;
                }
                default:
                  t.skipType(a & 7);
                  break;
              }
            }
            return s;
          }),
          (e.decodeDelimited = function (t) {
            return t instanceof $ || (t = new $(t)), this.decode(t, t.uint32());
          }),
          (e.verify = function (t) {
            if (typeof t != "object" || t === null) return "object expected";
            if (
              t.tensorName != null &&
              t.hasOwnProperty("tensorName") &&
              !b.isString(t.tensorName)
            )
              return "tensorName: string expected";
            if (
              t.quantParameterTensorNames != null &&
              t.hasOwnProperty("quantParameterTensorNames")
            ) {
              if (!Array.isArray(t.quantParameterTensorNames))
                return "quantParameterTensorNames: array expected";
              for (var r = 0; r < t.quantParameterTensorNames.length; ++r) {
                var n = h.onnx.StringStringEntryProto.verify(
                  t.quantParameterTensorNames[r]
                );
                if (n) return "quantParameterTensorNames." + n;
              }
            }
            return null;
          }),
          (e.fromObject = function (t) {
            if (t instanceof h.onnx.TensorAnnotation) return t;
            var r = new h.onnx.TensorAnnotation();
            if (
              (t.tensorName != null && (r.tensorName = String(t.tensorName)),
              t.quantParameterTensorNames)
            ) {
              if (!Array.isArray(t.quantParameterTensorNames))
                throw TypeError(
                  ".onnx.TensorAnnotation.quantParameterTensorNames: array expected"
                );
              r.quantParameterTensorNames = [];
              for (var n = 0; n < t.quantParameterTensorNames.length; ++n) {
                if (typeof t.quantParameterTensorNames[n] != "object")
                  throw TypeError(
                    ".onnx.TensorAnnotation.quantParameterTensorNames: object expected"
                  );
                r.quantParameterTensorNames[n] =
                  h.onnx.StringStringEntryProto.fromObject(
                    t.quantParameterTensorNames[n]
                  );
              }
            }
            return r;
          }),
          (e.toObject = function (t, r) {
            r || (r = {});
            var n = {};
            if (
              ((r.arrays || r.defaults) && (n.quantParameterTensorNames = []),
              r.defaults && (n.tensorName = ""),
              t.tensorName != null &&
                t.hasOwnProperty("tensorName") &&
                (n.tensorName = t.tensorName),
              t.quantParameterTensorNames && t.quantParameterTensorNames.length)
            ) {
              n.quantParameterTensorNames = [];
              for (var s = 0; s < t.quantParameterTensorNames.length; ++s)
                n.quantParameterTensorNames[s] =
                  h.onnx.StringStringEntryProto.toObject(
                    t.quantParameterTensorNames[s],
                    r
                  );
            }
            return n;
          }),
          (e.prototype.toJSON = function () {
            return this.constructor.toObject(this, nt.util.toJSONOptions);
          }),
          (e.getTypeUrl = function (t) {
            return (
              t === void 0 && (t = "type.googleapis.com"),
              t + "/onnx.TensorAnnotation"
            );
          }),
          e
        );
      })()),
      (i.GraphProto = (function () {
        function e(o) {
          if (
            ((this.node = []),
            (this.initializer = []),
            (this.sparseInitializer = []),
            (this.input = []),
            (this.output = []),
            (this.valueInfo = []),
            (this.quantizationAnnotation = []),
            o)
          )
            for (var t = Object.keys(o), r = 0; r < t.length; ++r)
              o[t[r]] != null && (this[t[r]] = o[t[r]]);
        }
        return (
          (e.prototype.node = b.emptyArray),
          (e.prototype.name = ""),
          (e.prototype.initializer = b.emptyArray),
          (e.prototype.sparseInitializer = b.emptyArray),
          (e.prototype.docString = ""),
          (e.prototype.input = b.emptyArray),
          (e.prototype.output = b.emptyArray),
          (e.prototype.valueInfo = b.emptyArray),
          (e.prototype.quantizationAnnotation = b.emptyArray),
          (e.create = function (t) {
            return new e(t);
          }),
          (e.encode = function (t, r) {
            if ((r || (r = pt.create()), t.node != null && t.node.length))
              for (var n = 0; n < t.node.length; ++n)
                h.onnx.NodeProto.encode(
                  t.node[n],
                  r.uint32(10).fork()
                ).ldelim();
            if (
              (t.name != null &&
                Object.hasOwnProperty.call(t, "name") &&
                r.uint32(18).string(t.name),
              t.initializer != null && t.initializer.length)
            )
              for (var n = 0; n < t.initializer.length; ++n)
                h.onnx.TensorProto.encode(
                  t.initializer[n],
                  r.uint32(42).fork()
                ).ldelim();
            if (
              (t.docString != null &&
                Object.hasOwnProperty.call(t, "docString") &&
                r.uint32(82).string(t.docString),
              t.input != null && t.input.length)
            )
              for (var n = 0; n < t.input.length; ++n)
                h.onnx.ValueInfoProto.encode(
                  t.input[n],
                  r.uint32(90).fork()
                ).ldelim();
            if (t.output != null && t.output.length)
              for (var n = 0; n < t.output.length; ++n)
                h.onnx.ValueInfoProto.encode(
                  t.output[n],
                  r.uint32(98).fork()
                ).ldelim();
            if (t.valueInfo != null && t.valueInfo.length)
              for (var n = 0; n < t.valueInfo.length; ++n)
                h.onnx.ValueInfoProto.encode(
                  t.valueInfo[n],
                  r.uint32(106).fork()
                ).ldelim();
            if (
              t.quantizationAnnotation != null &&
              t.quantizationAnnotation.length
            )
              for (var n = 0; n < t.quantizationAnnotation.length; ++n)
                h.onnx.TensorAnnotation.encode(
                  t.quantizationAnnotation[n],
                  r.uint32(114).fork()
                ).ldelim();
            if (t.sparseInitializer != null && t.sparseInitializer.length)
              for (var n = 0; n < t.sparseInitializer.length; ++n)
                h.onnx.SparseTensorProto.encode(
                  t.sparseInitializer[n],
                  r.uint32(122).fork()
                ).ldelim();
            return r;
          }),
          (e.encodeDelimited = function (t, r) {
            return this.encode(t, r).ldelim();
          }),
          (e.decode = function (t, r) {
            t instanceof $ || (t = $.create(t));
            for (
              var n = r === void 0 ? t.len : t.pos + r,
                s = new h.onnx.GraphProto();
              t.pos < n;

            ) {
              var a = t.uint32();
              switch (a >>> 3) {
                case 1: {
                  (s.node && s.node.length) || (s.node = []),
                    s.node.push(h.onnx.NodeProto.decode(t, t.uint32()));
                  break;
                }
                case 2: {
                  s.name = t.string();
                  break;
                }
                case 5: {
                  (s.initializer && s.initializer.length) ||
                    (s.initializer = []),
                    s.initializer.push(
                      h.onnx.TensorProto.decode(t, t.uint32())
                    );
                  break;
                }
                case 15: {
                  (s.sparseInitializer && s.sparseInitializer.length) ||
                    (s.sparseInitializer = []),
                    s.sparseInitializer.push(
                      h.onnx.SparseTensorProto.decode(t, t.uint32())
                    );
                  break;
                }
                case 10: {
                  s.docString = t.string();
                  break;
                }
                case 11: {
                  (s.input && s.input.length) || (s.input = []),
                    s.input.push(h.onnx.ValueInfoProto.decode(t, t.uint32()));
                  break;
                }
                case 12: {
                  (s.output && s.output.length) || (s.output = []),
                    s.output.push(h.onnx.ValueInfoProto.decode(t, t.uint32()));
                  break;
                }
                case 13: {
                  (s.valueInfo && s.valueInfo.length) || (s.valueInfo = []),
                    s.valueInfo.push(
                      h.onnx.ValueInfoProto.decode(t, t.uint32())
                    );
                  break;
                }
                case 14: {
                  (s.quantizationAnnotation &&
                    s.quantizationAnnotation.length) ||
                    (s.quantizationAnnotation = []),
                    s.quantizationAnnotation.push(
                      h.onnx.TensorAnnotation.decode(t, t.uint32())
                    );
                  break;
                }
                default:
                  t.skipType(a & 7);
                  break;
              }
            }
            return s;
          }),
          (e.decodeDelimited = function (t) {
            return t instanceof $ || (t = new $(t)), this.decode(t, t.uint32());
          }),
          (e.verify = function (t) {
            if (typeof t != "object" || t === null) return "object expected";
            if (t.node != null && t.hasOwnProperty("node")) {
              if (!Array.isArray(t.node)) return "node: array expected";
              for (var r = 0; r < t.node.length; ++r) {
                var n = h.onnx.NodeProto.verify(t.node[r]);
                if (n) return "node." + n;
              }
            }
            if (
              t.name != null &&
              t.hasOwnProperty("name") &&
              !b.isString(t.name)
            )
              return "name: string expected";
            if (t.initializer != null && t.hasOwnProperty("initializer")) {
              if (!Array.isArray(t.initializer))
                return "initializer: array expected";
              for (var r = 0; r < t.initializer.length; ++r) {
                var n = h.onnx.TensorProto.verify(t.initializer[r]);
                if (n) return "initializer." + n;
              }
            }
            if (
              t.sparseInitializer != null &&
              t.hasOwnProperty("sparseInitializer")
            ) {
              if (!Array.isArray(t.sparseInitializer))
                return "sparseInitializer: array expected";
              for (var r = 0; r < t.sparseInitializer.length; ++r) {
                var n = h.onnx.SparseTensorProto.verify(t.sparseInitializer[r]);
                if (n) return "sparseInitializer." + n;
              }
            }
            if (
              t.docString != null &&
              t.hasOwnProperty("docString") &&
              !b.isString(t.docString)
            )
              return "docString: string expected";
            if (t.input != null && t.hasOwnProperty("input")) {
              if (!Array.isArray(t.input)) return "input: array expected";
              for (var r = 0; r < t.input.length; ++r) {
                var n = h.onnx.ValueInfoProto.verify(t.input[r]);
                if (n) return "input." + n;
              }
            }
            if (t.output != null && t.hasOwnProperty("output")) {
              if (!Array.isArray(t.output)) return "output: array expected";
              for (var r = 0; r < t.output.length; ++r) {
                var n = h.onnx.ValueInfoProto.verify(t.output[r]);
                if (n) return "output." + n;
              }
            }
            if (t.valueInfo != null && t.hasOwnProperty("valueInfo")) {
              if (!Array.isArray(t.valueInfo))
                return "valueInfo: array expected";
              for (var r = 0; r < t.valueInfo.length; ++r) {
                var n = h.onnx.ValueInfoProto.verify(t.valueInfo[r]);
                if (n) return "valueInfo." + n;
              }
            }
            if (
              t.quantizationAnnotation != null &&
              t.hasOwnProperty("quantizationAnnotation")
            ) {
              if (!Array.isArray(t.quantizationAnnotation))
                return "quantizationAnnotation: array expected";
              for (var r = 0; r < t.quantizationAnnotation.length; ++r) {
                var n = h.onnx.TensorAnnotation.verify(
                  t.quantizationAnnotation[r]
                );
                if (n) return "quantizationAnnotation." + n;
              }
            }
            return null;
          }),
          (e.fromObject = function (t) {
            if (t instanceof h.onnx.GraphProto) return t;
            var r = new h.onnx.GraphProto();
            if (t.node) {
              if (!Array.isArray(t.node))
                throw TypeError(".onnx.GraphProto.node: array expected");
              r.node = [];
              for (var n = 0; n < t.node.length; ++n) {
                if (typeof t.node[n] != "object")
                  throw TypeError(".onnx.GraphProto.node: object expected");
                r.node[n] = h.onnx.NodeProto.fromObject(t.node[n]);
              }
            }
            if ((t.name != null && (r.name = String(t.name)), t.initializer)) {
              if (!Array.isArray(t.initializer))
                throw TypeError(".onnx.GraphProto.initializer: array expected");
              r.initializer = [];
              for (var n = 0; n < t.initializer.length; ++n) {
                if (typeof t.initializer[n] != "object")
                  throw TypeError(
                    ".onnx.GraphProto.initializer: object expected"
                  );
                r.initializer[n] = h.onnx.TensorProto.fromObject(
                  t.initializer[n]
                );
              }
            }
            if (t.sparseInitializer) {
              if (!Array.isArray(t.sparseInitializer))
                throw TypeError(
                  ".onnx.GraphProto.sparseInitializer: array expected"
                );
              r.sparseInitializer = [];
              for (var n = 0; n < t.sparseInitializer.length; ++n) {
                if (typeof t.sparseInitializer[n] != "object")
                  throw TypeError(
                    ".onnx.GraphProto.sparseInitializer: object expected"
                  );
                r.sparseInitializer[n] = h.onnx.SparseTensorProto.fromObject(
                  t.sparseInitializer[n]
                );
              }
            }
            if (
              (t.docString != null && (r.docString = String(t.docString)),
              t.input)
            ) {
              if (!Array.isArray(t.input))
                throw TypeError(".onnx.GraphProto.input: array expected");
              r.input = [];
              for (var n = 0; n < t.input.length; ++n) {
                if (typeof t.input[n] != "object")
                  throw TypeError(".onnx.GraphProto.input: object expected");
                r.input[n] = h.onnx.ValueInfoProto.fromObject(t.input[n]);
              }
            }
            if (t.output) {
              if (!Array.isArray(t.output))
                throw TypeError(".onnx.GraphProto.output: array expected");
              r.output = [];
              for (var n = 0; n < t.output.length; ++n) {
                if (typeof t.output[n] != "object")
                  throw TypeError(".onnx.GraphProto.output: object expected");
                r.output[n] = h.onnx.ValueInfoProto.fromObject(t.output[n]);
              }
            }
            if (t.valueInfo) {
              if (!Array.isArray(t.valueInfo))
                throw TypeError(".onnx.GraphProto.valueInfo: array expected");
              r.valueInfo = [];
              for (var n = 0; n < t.valueInfo.length; ++n) {
                if (typeof t.valueInfo[n] != "object")
                  throw TypeError(
                    ".onnx.GraphProto.valueInfo: object expected"
                  );
                r.valueInfo[n] = h.onnx.ValueInfoProto.fromObject(
                  t.valueInfo[n]
                );
              }
            }
            if (t.quantizationAnnotation) {
              if (!Array.isArray(t.quantizationAnnotation))
                throw TypeError(
                  ".onnx.GraphProto.quantizationAnnotation: array expected"
                );
              r.quantizationAnnotation = [];
              for (var n = 0; n < t.quantizationAnnotation.length; ++n) {
                if (typeof t.quantizationAnnotation[n] != "object")
                  throw TypeError(
                    ".onnx.GraphProto.quantizationAnnotation: object expected"
                  );
                r.quantizationAnnotation[n] =
                  h.onnx.TensorAnnotation.fromObject(
                    t.quantizationAnnotation[n]
                  );
              }
            }
            return r;
          }),
          (e.toObject = function (t, r) {
            r || (r = {});
            var n = {};
            if (
              ((r.arrays || r.defaults) &&
                ((n.node = []),
                (n.initializer = []),
                (n.input = []),
                (n.output = []),
                (n.valueInfo = []),
                (n.quantizationAnnotation = []),
                (n.sparseInitializer = [])),
              r.defaults && ((n.name = ""), (n.docString = "")),
              t.node && t.node.length)
            ) {
              n.node = [];
              for (var s = 0; s < t.node.length; ++s)
                n.node[s] = h.onnx.NodeProto.toObject(t.node[s], r);
            }
            if (
              (t.name != null && t.hasOwnProperty("name") && (n.name = t.name),
              t.initializer && t.initializer.length)
            ) {
              n.initializer = [];
              for (var s = 0; s < t.initializer.length; ++s)
                n.initializer[s] = h.onnx.TensorProto.toObject(
                  t.initializer[s],
                  r
                );
            }
            if (
              (t.docString != null &&
                t.hasOwnProperty("docString") &&
                (n.docString = t.docString),
              t.input && t.input.length)
            ) {
              n.input = [];
              for (var s = 0; s < t.input.length; ++s)
                n.input[s] = h.onnx.ValueInfoProto.toObject(t.input[s], r);
            }
            if (t.output && t.output.length) {
              n.output = [];
              for (var s = 0; s < t.output.length; ++s)
                n.output[s] = h.onnx.ValueInfoProto.toObject(t.output[s], r);
            }
            if (t.valueInfo && t.valueInfo.length) {
              n.valueInfo = [];
              for (var s = 0; s < t.valueInfo.length; ++s)
                n.valueInfo[s] = h.onnx.ValueInfoProto.toObject(
                  t.valueInfo[s],
                  r
                );
            }
            if (t.quantizationAnnotation && t.quantizationAnnotation.length) {
              n.quantizationAnnotation = [];
              for (var s = 0; s < t.quantizationAnnotation.length; ++s)
                n.quantizationAnnotation[s] = h.onnx.TensorAnnotation.toObject(
                  t.quantizationAnnotation[s],
                  r
                );
            }
            if (t.sparseInitializer && t.sparseInitializer.length) {
              n.sparseInitializer = [];
              for (var s = 0; s < t.sparseInitializer.length; ++s)
                n.sparseInitializer[s] = h.onnx.SparseTensorProto.toObject(
                  t.sparseInitializer[s],
                  r
                );
            }
            return n;
          }),
          (e.prototype.toJSON = function () {
            return this.constructor.toObject(this, nt.util.toJSONOptions);
          }),
          (e.getTypeUrl = function (t) {
            return (
              t === void 0 && (t = "type.googleapis.com"),
              t + "/onnx.GraphProto"
            );
          }),
          e
        );
      })()),
      (i.TensorProto = (function () {
        function e(o) {
          if (
            ((this.dims = []),
            (this.floatData = []),
            (this.int32Data = []),
            (this.stringData = []),
            (this.int64Data = []),
            (this.externalData = []),
            (this.doubleData = []),
            (this.uint64Data = []),
            o)
          )
            for (var t = Object.keys(o), r = 0; r < t.length; ++r)
              o[t[r]] != null && (this[t[r]] = o[t[r]]);
        }
        return (
          (e.prototype.dims = b.emptyArray),
          (e.prototype.dataType = 0),
          (e.prototype.segment = null),
          (e.prototype.floatData = b.emptyArray),
          (e.prototype.int32Data = b.emptyArray),
          (e.prototype.stringData = b.emptyArray),
          (e.prototype.int64Data = b.emptyArray),
          (e.prototype.name = ""),
          (e.prototype.docString = ""),
          (e.prototype.rawData = b.newBuffer([])),
          (e.prototype.externalData = b.emptyArray),
          (e.prototype.dataLocation = 0),
          (e.prototype.doubleData = b.emptyArray),
          (e.prototype.uint64Data = b.emptyArray),
          (e.create = function (t) {
            return new e(t);
          }),
          (e.encode = function (t, r) {
            if ((r || (r = pt.create()), t.dims != null && t.dims.length)) {
              r.uint32(10).fork();
              for (var n = 0; n < t.dims.length; ++n) r.int64(t.dims[n]);
              r.ldelim();
            }
            if (
              (t.dataType != null &&
                Object.hasOwnProperty.call(t, "dataType") &&
                r.uint32(16).int32(t.dataType),
              t.segment != null &&
                Object.hasOwnProperty.call(t, "segment") &&
                h.onnx.TensorProto.Segment.encode(
                  t.segment,
                  r.uint32(26).fork()
                ).ldelim(),
              t.floatData != null && t.floatData.length)
            ) {
              r.uint32(34).fork();
              for (var n = 0; n < t.floatData.length; ++n)
                r.float(t.floatData[n]);
              r.ldelim();
            }
            if (t.int32Data != null && t.int32Data.length) {
              r.uint32(42).fork();
              for (var n = 0; n < t.int32Data.length; ++n)
                r.int32(t.int32Data[n]);
              r.ldelim();
            }
            if (t.stringData != null && t.stringData.length)
              for (var n = 0; n < t.stringData.length; ++n)
                r.uint32(50).bytes(t.stringData[n]);
            if (t.int64Data != null && t.int64Data.length) {
              r.uint32(58).fork();
              for (var n = 0; n < t.int64Data.length; ++n)
                r.int64(t.int64Data[n]);
              r.ldelim();
            }
            if (
              (t.name != null &&
                Object.hasOwnProperty.call(t, "name") &&
                r.uint32(66).string(t.name),
              t.rawData != null &&
                Object.hasOwnProperty.call(t, "rawData") &&
                r.uint32(74).bytes(t.rawData),
              t.doubleData != null && t.doubleData.length)
            ) {
              r.uint32(82).fork();
              for (var n = 0; n < t.doubleData.length; ++n)
                r.double(t.doubleData[n]);
              r.ldelim();
            }
            if (t.uint64Data != null && t.uint64Data.length) {
              r.uint32(90).fork();
              for (var n = 0; n < t.uint64Data.length; ++n)
                r.uint64(t.uint64Data[n]);
              r.ldelim();
            }
            if (
              (t.docString != null &&
                Object.hasOwnProperty.call(t, "docString") &&
                r.uint32(98).string(t.docString),
              t.externalData != null && t.externalData.length)
            )
              for (var n = 0; n < t.externalData.length; ++n)
                h.onnx.StringStringEntryProto.encode(
                  t.externalData[n],
                  r.uint32(106).fork()
                ).ldelim();
            return (
              t.dataLocation != null &&
                Object.hasOwnProperty.call(t, "dataLocation") &&
                r.uint32(112).int32(t.dataLocation),
              r
            );
          }),
          (e.encodeDelimited = function (t, r) {
            return this.encode(t, r).ldelim();
          }),
          (e.decode = function (t, r) {
            t instanceof $ || (t = $.create(t));
            for (
              var n = r === void 0 ? t.len : t.pos + r,
                s = new h.onnx.TensorProto();
              t.pos < n;

            ) {
              var a = t.uint32();
              switch (a >>> 3) {
                case 1: {
                  if (
                    ((s.dims && s.dims.length) || (s.dims = []), (a & 7) === 2)
                  )
                    for (var u = t.uint32() + t.pos; t.pos < u; )
                      s.dims.push(t.int64());
                  else s.dims.push(t.int64());
                  break;
                }
                case 2: {
                  s.dataType = t.int32();
                  break;
                }
                case 3: {
                  s.segment = h.onnx.TensorProto.Segment.decode(t, t.uint32());
                  break;
                }
                case 4: {
                  if (
                    ((s.floatData && s.floatData.length) || (s.floatData = []),
                    (a & 7) === 2)
                  )
                    for (var u = t.uint32() + t.pos; t.pos < u; )
                      s.floatData.push(t.float());
                  else s.floatData.push(t.float());
                  break;
                }
                case 5: {
                  if (
                    ((s.int32Data && s.int32Data.length) || (s.int32Data = []),
                    (a & 7) === 2)
                  )
                    for (var u = t.uint32() + t.pos; t.pos < u; )
                      s.int32Data.push(t.int32());
                  else s.int32Data.push(t.int32());
                  break;
                }
                case 6: {
                  (s.stringData && s.stringData.length) || (s.stringData = []),
                    s.stringData.push(t.bytes());
                  break;
                }
                case 7: {
                  if (
                    ((s.int64Data && s.int64Data.length) || (s.int64Data = []),
                    (a & 7) === 2)
                  )
                    for (var u = t.uint32() + t.pos; t.pos < u; )
                      s.int64Data.push(t.int64());
                  else s.int64Data.push(t.int64());
                  break;
                }
                case 8: {
                  s.name = t.string();
                  break;
                }
                case 12: {
                  s.docString = t.string();
                  break;
                }
                case 9: {
                  s.rawData = t.bytes();
                  break;
                }
                case 13: {
                  (s.externalData && s.externalData.length) ||
                    (s.externalData = []),
                    s.externalData.push(
                      h.onnx.StringStringEntryProto.decode(t, t.uint32())
                    );
                  break;
                }
                case 14: {
                  s.dataLocation = t.int32();
                  break;
                }
                case 10: {
                  if (
                    ((s.doubleData && s.doubleData.length) ||
                      (s.doubleData = []),
                    (a & 7) === 2)
                  )
                    for (var u = t.uint32() + t.pos; t.pos < u; )
                      s.doubleData.push(t.double());
                  else s.doubleData.push(t.double());
                  break;
                }
                case 11: {
                  if (
                    ((s.uint64Data && s.uint64Data.length) ||
                      (s.uint64Data = []),
                    (a & 7) === 2)
                  )
                    for (var u = t.uint32() + t.pos; t.pos < u; )
                      s.uint64Data.push(t.uint64());
                  else s.uint64Data.push(t.uint64());
                  break;
                }
                default:
                  t.skipType(a & 7);
                  break;
              }
            }
            return s;
          }),
          (e.decodeDelimited = function (t) {
            return t instanceof $ || (t = new $(t)), this.decode(t, t.uint32());
          }),
          (e.verify = function (t) {
            if (typeof t != "object" || t === null) return "object expected";
            if (t.dims != null && t.hasOwnProperty("dims")) {
              if (!Array.isArray(t.dims)) return "dims: array expected";
              for (var r = 0; r < t.dims.length; ++r)
                if (
                  !b.isInteger(t.dims[r]) &&
                  !(
                    t.dims[r] &&
                    b.isInteger(t.dims[r].low) &&
                    b.isInteger(t.dims[r].high)
                  )
                )
                  return "dims: integer|Long[] expected";
            }
            if (
              t.dataType != null &&
              t.hasOwnProperty("dataType") &&
              !b.isInteger(t.dataType)
            )
              return "dataType: integer expected";
            if (t.segment != null && t.hasOwnProperty("segment")) {
              var n = h.onnx.TensorProto.Segment.verify(t.segment);
              if (n) return "segment." + n;
            }
            if (t.floatData != null && t.hasOwnProperty("floatData")) {
              if (!Array.isArray(t.floatData))
                return "floatData: array expected";
              for (var r = 0; r < t.floatData.length; ++r)
                if (typeof t.floatData[r] != "number")
                  return "floatData: number[] expected";
            }
            if (t.int32Data != null && t.hasOwnProperty("int32Data")) {
              if (!Array.isArray(t.int32Data))
                return "int32Data: array expected";
              for (var r = 0; r < t.int32Data.length; ++r)
                if (!b.isInteger(t.int32Data[r]))
                  return "int32Data: integer[] expected";
            }
            if (t.stringData != null && t.hasOwnProperty("stringData")) {
              if (!Array.isArray(t.stringData))
                return "stringData: array expected";
              for (var r = 0; r < t.stringData.length; ++r)
                if (
                  !(
                    (t.stringData[r] &&
                      typeof t.stringData[r].length == "number") ||
                    b.isString(t.stringData[r])
                  )
                )
                  return "stringData: buffer[] expected";
            }
            if (t.int64Data != null && t.hasOwnProperty("int64Data")) {
              if (!Array.isArray(t.int64Data))
                return "int64Data: array expected";
              for (var r = 0; r < t.int64Data.length; ++r)
                if (
                  !b.isInteger(t.int64Data[r]) &&
                  !(
                    t.int64Data[r] &&
                    b.isInteger(t.int64Data[r].low) &&
                    b.isInteger(t.int64Data[r].high)
                  )
                )
                  return "int64Data: integer|Long[] expected";
            }
            if (
              t.name != null &&
              t.hasOwnProperty("name") &&
              !b.isString(t.name)
            )
              return "name: string expected";
            if (
              t.docString != null &&
              t.hasOwnProperty("docString") &&
              !b.isString(t.docString)
            )
              return "docString: string expected";
            if (
              t.rawData != null &&
              t.hasOwnProperty("rawData") &&
              !(
                (t.rawData && typeof t.rawData.length == "number") ||
                b.isString(t.rawData)
              )
            )
              return "rawData: buffer expected";
            if (t.externalData != null && t.hasOwnProperty("externalData")) {
              if (!Array.isArray(t.externalData))
                return "externalData: array expected";
              for (var r = 0; r < t.externalData.length; ++r) {
                var n = h.onnx.StringStringEntryProto.verify(t.externalData[r]);
                if (n) return "externalData." + n;
              }
            }
            if (t.dataLocation != null && t.hasOwnProperty("dataLocation"))
              switch (t.dataLocation) {
                default:
                  return "dataLocation: enum value expected";
                case 0:
                case 1:
                  break;
              }
            if (t.doubleData != null && t.hasOwnProperty("doubleData")) {
              if (!Array.isArray(t.doubleData))
                return "doubleData: array expected";
              for (var r = 0; r < t.doubleData.length; ++r)
                if (typeof t.doubleData[r] != "number")
                  return "doubleData: number[] expected";
            }
            if (t.uint64Data != null && t.hasOwnProperty("uint64Data")) {
              if (!Array.isArray(t.uint64Data))
                return "uint64Data: array expected";
              for (var r = 0; r < t.uint64Data.length; ++r)
                if (
                  !b.isInteger(t.uint64Data[r]) &&
                  !(
                    t.uint64Data[r] &&
                    b.isInteger(t.uint64Data[r].low) &&
                    b.isInteger(t.uint64Data[r].high)
                  )
                )
                  return "uint64Data: integer|Long[] expected";
            }
            return null;
          }),
          (e.fromObject = function (t) {
            if (t instanceof h.onnx.TensorProto) return t;
            var r = new h.onnx.TensorProto();
            if (t.dims) {
              if (!Array.isArray(t.dims))
                throw TypeError(".onnx.TensorProto.dims: array expected");
              r.dims = [];
              for (var n = 0; n < t.dims.length; ++n)
                b.Long
                  ? ((r.dims[n] = b.Long.fromValue(t.dims[n])).unsigned = !1)
                  : typeof t.dims[n] == "string"
                  ? (r.dims[n] = parseInt(t.dims[n], 10))
                  : typeof t.dims[n] == "number"
                  ? (r.dims[n] = t.dims[n])
                  : typeof t.dims[n] == "object" &&
                    (r.dims[n] = new b.LongBits(
                      t.dims[n].low >>> 0,
                      t.dims[n].high >>> 0
                    ).toNumber());
            }
            if (
              (t.dataType != null && (r.dataType = t.dataType | 0),
              t.segment != null)
            ) {
              if (typeof t.segment != "object")
                throw TypeError(".onnx.TensorProto.segment: object expected");
              r.segment = h.onnx.TensorProto.Segment.fromObject(t.segment);
            }
            if (t.floatData) {
              if (!Array.isArray(t.floatData))
                throw TypeError(".onnx.TensorProto.floatData: array expected");
              r.floatData = [];
              for (var n = 0; n < t.floatData.length; ++n)
                r.floatData[n] = Number(t.floatData[n]);
            }
            if (t.int32Data) {
              if (!Array.isArray(t.int32Data))
                throw TypeError(".onnx.TensorProto.int32Data: array expected");
              r.int32Data = [];
              for (var n = 0; n < t.int32Data.length; ++n)
                r.int32Data[n] = t.int32Data[n] | 0;
            }
            if (t.stringData) {
              if (!Array.isArray(t.stringData))
                throw TypeError(".onnx.TensorProto.stringData: array expected");
              r.stringData = [];
              for (var n = 0; n < t.stringData.length; ++n)
                typeof t.stringData[n] == "string"
                  ? b.base64.decode(
                      t.stringData[n],
                      (r.stringData[n] = b.newBuffer(
                        b.base64.length(t.stringData[n])
                      )),
                      0
                    )
                  : t.stringData[n].length >= 0 &&
                    (r.stringData[n] = t.stringData[n]);
            }
            if (t.int64Data) {
              if (!Array.isArray(t.int64Data))
                throw TypeError(".onnx.TensorProto.int64Data: array expected");
              r.int64Data = [];
              for (var n = 0; n < t.int64Data.length; ++n)
                b.Long
                  ? ((r.int64Data[n] = b.Long.fromValue(
                      t.int64Data[n]
                    )).unsigned = !1)
                  : typeof t.int64Data[n] == "string"
                  ? (r.int64Data[n] = parseInt(t.int64Data[n], 10))
                  : typeof t.int64Data[n] == "number"
                  ? (r.int64Data[n] = t.int64Data[n])
                  : typeof t.int64Data[n] == "object" &&
                    (r.int64Data[n] = new b.LongBits(
                      t.int64Data[n].low >>> 0,
                      t.int64Data[n].high >>> 0
                    ).toNumber());
            }
            if (
              (t.name != null && (r.name = String(t.name)),
              t.docString != null && (r.docString = String(t.docString)),
              t.rawData != null &&
                (typeof t.rawData == "string"
                  ? b.base64.decode(
                      t.rawData,
                      (r.rawData = b.newBuffer(b.base64.length(t.rawData))),
                      0
                    )
                  : t.rawData.length >= 0 && (r.rawData = t.rawData)),
              t.externalData)
            ) {
              if (!Array.isArray(t.externalData))
                throw TypeError(
                  ".onnx.TensorProto.externalData: array expected"
                );
              r.externalData = [];
              for (var n = 0; n < t.externalData.length; ++n) {
                if (typeof t.externalData[n] != "object")
                  throw TypeError(
                    ".onnx.TensorProto.externalData: object expected"
                  );
                r.externalData[n] = h.onnx.StringStringEntryProto.fromObject(
                  t.externalData[n]
                );
              }
            }
            switch (t.dataLocation) {
              default:
                if (typeof t.dataLocation == "number") {
                  r.dataLocation = t.dataLocation;
                  break;
                }
                break;
              case "DEFAULT":
              case 0:
                r.dataLocation = 0;
                break;
              case "EXTERNAL":
              case 1:
                r.dataLocation = 1;
                break;
            }
            if (t.doubleData) {
              if (!Array.isArray(t.doubleData))
                throw TypeError(".onnx.TensorProto.doubleData: array expected");
              r.doubleData = [];
              for (var n = 0; n < t.doubleData.length; ++n)
                r.doubleData[n] = Number(t.doubleData[n]);
            }
            if (t.uint64Data) {
              if (!Array.isArray(t.uint64Data))
                throw TypeError(".onnx.TensorProto.uint64Data: array expected");
              r.uint64Data = [];
              for (var n = 0; n < t.uint64Data.length; ++n)
                b.Long
                  ? ((r.uint64Data[n] = b.Long.fromValue(
                      t.uint64Data[n]
                    )).unsigned = !0)
                  : typeof t.uint64Data[n] == "string"
                  ? (r.uint64Data[n] = parseInt(t.uint64Data[n], 10))
                  : typeof t.uint64Data[n] == "number"
                  ? (r.uint64Data[n] = t.uint64Data[n])
                  : typeof t.uint64Data[n] == "object" &&
                    (r.uint64Data[n] = new b.LongBits(
                      t.uint64Data[n].low >>> 0,
                      t.uint64Data[n].high >>> 0
                    ).toNumber(!0));
            }
            return r;
          }),
          (e.toObject = function (t, r) {
            r || (r = {});
            var n = {};
            if (
              ((r.arrays || r.defaults) &&
                ((n.dims = []),
                (n.floatData = []),
                (n.int32Data = []),
                (n.stringData = []),
                (n.int64Data = []),
                (n.doubleData = []),
                (n.uint64Data = []),
                (n.externalData = [])),
              r.defaults &&
                ((n.dataType = 0),
                (n.segment = null),
                (n.name = ""),
                r.bytes === String
                  ? (n.rawData = "")
                  : ((n.rawData = []),
                    r.bytes !== Array && (n.rawData = b.newBuffer(n.rawData))),
                (n.docString = ""),
                (n.dataLocation = r.enums === String ? "DEFAULT" : 0)),
              t.dims && t.dims.length)
            ) {
              n.dims = [];
              for (var s = 0; s < t.dims.length; ++s)
                typeof t.dims[s] == "number"
                  ? (n.dims[s] =
                      r.longs === String ? String(t.dims[s]) : t.dims[s])
                  : (n.dims[s] =
                      r.longs === String
                        ? b.Long.prototype.toString.call(t.dims[s])
                        : r.longs === Number
                        ? new b.LongBits(
                            t.dims[s].low >>> 0,
                            t.dims[s].high >>> 0
                          ).toNumber()
                        : t.dims[s]);
            }
            if (
              (t.dataType != null &&
                t.hasOwnProperty("dataType") &&
                (n.dataType = t.dataType),
              t.segment != null &&
                t.hasOwnProperty("segment") &&
                (n.segment = h.onnx.TensorProto.Segment.toObject(t.segment, r)),
              t.floatData && t.floatData.length)
            ) {
              n.floatData = [];
              for (var s = 0; s < t.floatData.length; ++s)
                n.floatData[s] =
                  r.json && !isFinite(t.floatData[s])
                    ? String(t.floatData[s])
                    : t.floatData[s];
            }
            if (t.int32Data && t.int32Data.length) {
              n.int32Data = [];
              for (var s = 0; s < t.int32Data.length; ++s)
                n.int32Data[s] = t.int32Data[s];
            }
            if (t.stringData && t.stringData.length) {
              n.stringData = [];
              for (var s = 0; s < t.stringData.length; ++s)
                n.stringData[s] =
                  r.bytes === String
                    ? b.base64.encode(
                        t.stringData[s],
                        0,
                        t.stringData[s].length
                      )
                    : r.bytes === Array
                    ? Array.prototype.slice.call(t.stringData[s])
                    : t.stringData[s];
            }
            if (t.int64Data && t.int64Data.length) {
              n.int64Data = [];
              for (var s = 0; s < t.int64Data.length; ++s)
                typeof t.int64Data[s] == "number"
                  ? (n.int64Data[s] =
                      r.longs === String
                        ? String(t.int64Data[s])
                        : t.int64Data[s])
                  : (n.int64Data[s] =
                      r.longs === String
                        ? b.Long.prototype.toString.call(t.int64Data[s])
                        : r.longs === Number
                        ? new b.LongBits(
                            t.int64Data[s].low >>> 0,
                            t.int64Data[s].high >>> 0
                          ).toNumber()
                        : t.int64Data[s]);
            }
            if (
              (t.name != null && t.hasOwnProperty("name") && (n.name = t.name),
              t.rawData != null &&
                t.hasOwnProperty("rawData") &&
                (n.rawData =
                  r.bytes === String
                    ? b.base64.encode(t.rawData, 0, t.rawData.length)
                    : r.bytes === Array
                    ? Array.prototype.slice.call(t.rawData)
                    : t.rawData),
              t.doubleData && t.doubleData.length)
            ) {
              n.doubleData = [];
              for (var s = 0; s < t.doubleData.length; ++s)
                n.doubleData[s] =
                  r.json && !isFinite(t.doubleData[s])
                    ? String(t.doubleData[s])
                    : t.doubleData[s];
            }
            if (t.uint64Data && t.uint64Data.length) {
              n.uint64Data = [];
              for (var s = 0; s < t.uint64Data.length; ++s)
                typeof t.uint64Data[s] == "number"
                  ? (n.uint64Data[s] =
                      r.longs === String
                        ? String(t.uint64Data[s])
                        : t.uint64Data[s])
                  : (n.uint64Data[s] =
                      r.longs === String
                        ? b.Long.prototype.toString.call(t.uint64Data[s])
                        : r.longs === Number
                        ? new b.LongBits(
                            t.uint64Data[s].low >>> 0,
                            t.uint64Data[s].high >>> 0
                          ).toNumber(!0)
                        : t.uint64Data[s]);
            }
            if (
              (t.docString != null &&
                t.hasOwnProperty("docString") &&
                (n.docString = t.docString),
              t.externalData && t.externalData.length)
            ) {
              n.externalData = [];
              for (var s = 0; s < t.externalData.length; ++s)
                n.externalData[s] = h.onnx.StringStringEntryProto.toObject(
                  t.externalData[s],
                  r
                );
            }
            return (
              t.dataLocation != null &&
                t.hasOwnProperty("dataLocation") &&
                (n.dataLocation =
                  r.enums === String
                    ? h.onnx.TensorProto.DataLocation[t.dataLocation] === void 0
                      ? t.dataLocation
                      : h.onnx.TensorProto.DataLocation[t.dataLocation]
                    : t.dataLocation),
              n
            );
          }),
          (e.prototype.toJSON = function () {
            return this.constructor.toObject(this, nt.util.toJSONOptions);
          }),
          (e.getTypeUrl = function (t) {
            return (
              t === void 0 && (t = "type.googleapis.com"),
              t + "/onnx.TensorProto"
            );
          }),
          (e.DataType = (function () {
            var o = {},
              t = Object.create(o);
            return (
              (t[(o[0] = "UNDEFINED")] = 0),
              (t[(o[1] = "FLOAT")] = 1),
              (t[(o[2] = "UINT8")] = 2),
              (t[(o[3] = "INT8")] = 3),
              (t[(o[4] = "UINT16")] = 4),
              (t[(o[5] = "INT16")] = 5),
              (t[(o[6] = "INT32")] = 6),
              (t[(o[7] = "INT64")] = 7),
              (t[(o[8] = "STRING")] = 8),
              (t[(o[9] = "BOOL")] = 9),
              (t[(o[10] = "FLOAT16")] = 10),
              (t[(o[11] = "DOUBLE")] = 11),
              (t[(o[12] = "UINT32")] = 12),
              (t[(o[13] = "UINT64")] = 13),
              (t[(o[14] = "COMPLEX64")] = 14),
              (t[(o[15] = "COMPLEX128")] = 15),
              (t[(o[16] = "BFLOAT16")] = 16),
              (t[(o[17] = "FLOAT8E4M3FN")] = 17),
              (t[(o[18] = "FLOAT8E4M3FNUZ")] = 18),
              (t[(o[19] = "FLOAT8E5M2")] = 19),
              (t[(o[20] = "FLOAT8E5M2FNUZ")] = 20),
              t
            );
          })()),
          (e.Segment = (function () {
            function o(t) {
              if (t)
                for (var r = Object.keys(t), n = 0; n < r.length; ++n)
                  t[r[n]] != null && (this[r[n]] = t[r[n]]);
            }
            return (
              (o.prototype.begin = b.Long ? b.Long.fromBits(0, 0, !1) : 0),
              (o.prototype.end = b.Long ? b.Long.fromBits(0, 0, !1) : 0),
              (o.create = function (r) {
                return new o(r);
              }),
              (o.encode = function (r, n) {
                return (
                  n || (n = pt.create()),
                  r.begin != null &&
                    Object.hasOwnProperty.call(r, "begin") &&
                    n.uint32(8).int64(r.begin),
                  r.end != null &&
                    Object.hasOwnProperty.call(r, "end") &&
                    n.uint32(16).int64(r.end),
                  n
                );
              }),
              (o.encodeDelimited = function (r, n) {
                return this.encode(r, n).ldelim();
              }),
              (o.decode = function (r, n) {
                r instanceof $ || (r = $.create(r));
                for (
                  var s = n === void 0 ? r.len : r.pos + n,
                    a = new h.onnx.TensorProto.Segment();
                  r.pos < s;

                ) {
                  var u = r.uint32();
                  switch (u >>> 3) {
                    case 1: {
                      a.begin = r.int64();
                      break;
                    }
                    case 2: {
                      a.end = r.int64();
                      break;
                    }
                    default:
                      r.skipType(u & 7);
                      break;
                  }
                }
                return a;
              }),
              (o.decodeDelimited = function (r) {
                return (
                  r instanceof $ || (r = new $(r)), this.decode(r, r.uint32())
                );
              }),
              (o.verify = function (r) {
                return typeof r != "object" || r === null
                  ? "object expected"
                  : r.begin != null &&
                    r.hasOwnProperty("begin") &&
                    !b.isInteger(r.begin) &&
                    !(
                      r.begin &&
                      b.isInteger(r.begin.low) &&
                      b.isInteger(r.begin.high)
                    )
                  ? "begin: integer|Long expected"
                  : r.end != null &&
                    r.hasOwnProperty("end") &&
                    !b.isInteger(r.end) &&
                    !(
                      r.end &&
                      b.isInteger(r.end.low) &&
                      b.isInteger(r.end.high)
                    )
                  ? "end: integer|Long expected"
                  : null;
              }),
              (o.fromObject = function (r) {
                if (r instanceof h.onnx.TensorProto.Segment) return r;
                var n = new h.onnx.TensorProto.Segment();
                return (
                  r.begin != null &&
                    (b.Long
                      ? ((n.begin = b.Long.fromValue(r.begin)).unsigned = !1)
                      : typeof r.begin == "string"
                      ? (n.begin = parseInt(r.begin, 10))
                      : typeof r.begin == "number"
                      ? (n.begin = r.begin)
                      : typeof r.begin == "object" &&
                        (n.begin = new b.LongBits(
                          r.begin.low >>> 0,
                          r.begin.high >>> 0
                        ).toNumber())),
                  r.end != null &&
                    (b.Long
                      ? ((n.end = b.Long.fromValue(r.end)).unsigned = !1)
                      : typeof r.end == "string"
                      ? (n.end = parseInt(r.end, 10))
                      : typeof r.end == "number"
                      ? (n.end = r.end)
                      : typeof r.end == "object" &&
                        (n.end = new b.LongBits(
                          r.end.low >>> 0,
                          r.end.high >>> 0
                        ).toNumber())),
                  n
                );
              }),
              (o.toObject = function (r, n) {
                n || (n = {});
                var s = {};
                if (n.defaults) {
                  if (b.Long) {
                    var a = new b.Long(0, 0, !1);
                    s.begin =
                      n.longs === String
                        ? a.toString()
                        : n.longs === Number
                        ? a.toNumber()
                        : a;
                  } else s.begin = n.longs === String ? "0" : 0;
                  if (b.Long) {
                    var a = new b.Long(0, 0, !1);
                    s.end =
                      n.longs === String
                        ? a.toString()
                        : n.longs === Number
                        ? a.toNumber()
                        : a;
                  } else s.end = n.longs === String ? "0" : 0;
                }
                return (
                  r.begin != null &&
                    r.hasOwnProperty("begin") &&
                    (typeof r.begin == "number"
                      ? (s.begin =
                          n.longs === String ? String(r.begin) : r.begin)
                      : (s.begin =
                          n.longs === String
                            ? b.Long.prototype.toString.call(r.begin)
                            : n.longs === Number
                            ? new b.LongBits(
                                r.begin.low >>> 0,
                                r.begin.high >>> 0
                              ).toNumber()
                            : r.begin)),
                  r.end != null &&
                    r.hasOwnProperty("end") &&
                    (typeof r.end == "number"
                      ? (s.end = n.longs === String ? String(r.end) : r.end)
                      : (s.end =
                          n.longs === String
                            ? b.Long.prototype.toString.call(r.end)
                            : n.longs === Number
                            ? new b.LongBits(
                                r.end.low >>> 0,
                                r.end.high >>> 0
                              ).toNumber()
                            : r.end)),
                  s
                );
              }),
              (o.prototype.toJSON = function () {
                return this.constructor.toObject(this, nt.util.toJSONOptions);
              }),
              (o.getTypeUrl = function (r) {
                return (
                  r === void 0 && (r = "type.googleapis.com"),
                  r + "/onnx.TensorProto.Segment"
                );
              }),
              o
            );
          })()),
          (e.DataLocation = (function () {
            var o = {},
              t = Object.create(o);
            return (t[(o[0] = "DEFAULT")] = 0), (t[(o[1] = "EXTERNAL")] = 1), t;
          })()),
          e
        );
      })()),
      (i.SparseTensorProto = (function () {
        function e(o) {
          if (((this.dims = []), o))
            for (var t = Object.keys(o), r = 0; r < t.length; ++r)
              o[t[r]] != null && (this[t[r]] = o[t[r]]);
        }
        return (
          (e.prototype.values = null),
          (e.prototype.indices = null),
          (e.prototype.dims = b.emptyArray),
          (e.create = function (t) {
            return new e(t);
          }),
          (e.encode = function (t, r) {
            if (
              (r || (r = pt.create()),
              t.values != null &&
                Object.hasOwnProperty.call(t, "values") &&
                h.onnx.TensorProto.encode(
                  t.values,
                  r.uint32(10).fork()
                ).ldelim(),
              t.indices != null &&
                Object.hasOwnProperty.call(t, "indices") &&
                h.onnx.TensorProto.encode(
                  t.indices,
                  r.uint32(18).fork()
                ).ldelim(),
              t.dims != null && t.dims.length)
            ) {
              r.uint32(26).fork();
              for (var n = 0; n < t.dims.length; ++n) r.int64(t.dims[n]);
              r.ldelim();
            }
            return r;
          }),
          (e.encodeDelimited = function (t, r) {
            return this.encode(t, r).ldelim();
          }),
          (e.decode = function (t, r) {
            t instanceof $ || (t = $.create(t));
            for (
              var n = r === void 0 ? t.len : t.pos + r,
                s = new h.onnx.SparseTensorProto();
              t.pos < n;

            ) {
              var a = t.uint32();
              switch (a >>> 3) {
                case 1: {
                  s.values = h.onnx.TensorProto.decode(t, t.uint32());
                  break;
                }
                case 2: {
                  s.indices = h.onnx.TensorProto.decode(t, t.uint32());
                  break;
                }
                case 3: {
                  if (
                    ((s.dims && s.dims.length) || (s.dims = []), (a & 7) === 2)
                  )
                    for (var u = t.uint32() + t.pos; t.pos < u; )
                      s.dims.push(t.int64());
                  else s.dims.push(t.int64());
                  break;
                }
                default:
                  t.skipType(a & 7);
                  break;
              }
            }
            return s;
          }),
          (e.decodeDelimited = function (t) {
            return t instanceof $ || (t = new $(t)), this.decode(t, t.uint32());
          }),
          (e.verify = function (t) {
            if (typeof t != "object" || t === null) return "object expected";
            if (t.values != null && t.hasOwnProperty("values")) {
              var r = h.onnx.TensorProto.verify(t.values);
              if (r) return "values." + r;
            }
            if (t.indices != null && t.hasOwnProperty("indices")) {
              var r = h.onnx.TensorProto.verify(t.indices);
              if (r) return "indices." + r;
            }
            if (t.dims != null && t.hasOwnProperty("dims")) {
              if (!Array.isArray(t.dims)) return "dims: array expected";
              for (var n = 0; n < t.dims.length; ++n)
                if (
                  !b.isInteger(t.dims[n]) &&
                  !(
                    t.dims[n] &&
                    b.isInteger(t.dims[n].low) &&
                    b.isInteger(t.dims[n].high)
                  )
                )
                  return "dims: integer|Long[] expected";
            }
            return null;
          }),
          (e.fromObject = function (t) {
            if (t instanceof h.onnx.SparseTensorProto) return t;
            var r = new h.onnx.SparseTensorProto();
            if (t.values != null) {
              if (typeof t.values != "object")
                throw TypeError(
                  ".onnx.SparseTensorProto.values: object expected"
                );
              r.values = h.onnx.TensorProto.fromObject(t.values);
            }
            if (t.indices != null) {
              if (typeof t.indices != "object")
                throw TypeError(
                  ".onnx.SparseTensorProto.indices: object expected"
                );
              r.indices = h.onnx.TensorProto.fromObject(t.indices);
            }
            if (t.dims) {
              if (!Array.isArray(t.dims))
                throw TypeError(".onnx.SparseTensorProto.dims: array expected");
              r.dims = [];
              for (var n = 0; n < t.dims.length; ++n)
                b.Long
                  ? ((r.dims[n] = b.Long.fromValue(t.dims[n])).unsigned = !1)
                  : typeof t.dims[n] == "string"
                  ? (r.dims[n] = parseInt(t.dims[n], 10))
                  : typeof t.dims[n] == "number"
                  ? (r.dims[n] = t.dims[n])
                  : typeof t.dims[n] == "object" &&
                    (r.dims[n] = new b.LongBits(
                      t.dims[n].low >>> 0,
                      t.dims[n].high >>> 0
                    ).toNumber());
            }
            return r;
          }),
          (e.toObject = function (t, r) {
            r || (r = {});
            var n = {};
            if (
              ((r.arrays || r.defaults) && (n.dims = []),
              r.defaults && ((n.values = null), (n.indices = null)),
              t.values != null &&
                t.hasOwnProperty("values") &&
                (n.values = h.onnx.TensorProto.toObject(t.values, r)),
              t.indices != null &&
                t.hasOwnProperty("indices") &&
                (n.indices = h.onnx.TensorProto.toObject(t.indices, r)),
              t.dims && t.dims.length)
            ) {
              n.dims = [];
              for (var s = 0; s < t.dims.length; ++s)
                typeof t.dims[s] == "number"
                  ? (n.dims[s] =
                      r.longs === String ? String(t.dims[s]) : t.dims[s])
                  : (n.dims[s] =
                      r.longs === String
                        ? b.Long.prototype.toString.call(t.dims[s])
                        : r.longs === Number
                        ? new b.LongBits(
                            t.dims[s].low >>> 0,
                            t.dims[s].high >>> 0
                          ).toNumber()
                        : t.dims[s]);
            }
            return n;
          }),
          (e.prototype.toJSON = function () {
            return this.constructor.toObject(this, nt.util.toJSONOptions);
          }),
          (e.getTypeUrl = function (t) {
            return (
              t === void 0 && (t = "type.googleapis.com"),
              t + "/onnx.SparseTensorProto"
            );
          }),
          e
        );
      })()),
      (i.TensorShapeProto = (function () {
        function e(o) {
          if (((this.dim = []), o))
            for (var t = Object.keys(o), r = 0; r < t.length; ++r)
              o[t[r]] != null && (this[t[r]] = o[t[r]]);
        }
        return (
          (e.prototype.dim = b.emptyArray),
          (e.create = function (t) {
            return new e(t);
          }),
          (e.encode = function (t, r) {
            if ((r || (r = pt.create()), t.dim != null && t.dim.length))
              for (var n = 0; n < t.dim.length; ++n)
                h.onnx.TensorShapeProto.Dimension.encode(
                  t.dim[n],
                  r.uint32(10).fork()
                ).ldelim();
            return r;
          }),
          (e.encodeDelimited = function (t, r) {
            return this.encode(t, r).ldelim();
          }),
          (e.decode = function (t, r) {
            t instanceof $ || (t = $.create(t));
            for (
              var n = r === void 0 ? t.len : t.pos + r,
                s = new h.onnx.TensorShapeProto();
              t.pos < n;

            ) {
              var a = t.uint32();
              switch (a >>> 3) {
                case 1: {
                  (s.dim && s.dim.length) || (s.dim = []),
                    s.dim.push(
                      h.onnx.TensorShapeProto.Dimension.decode(t, t.uint32())
                    );
                  break;
                }
                default:
                  t.skipType(a & 7);
                  break;
              }
            }
            return s;
          }),
          (e.decodeDelimited = function (t) {
            return t instanceof $ || (t = new $(t)), this.decode(t, t.uint32());
          }),
          (e.verify = function (t) {
            if (typeof t != "object" || t === null) return "object expected";
            if (t.dim != null && t.hasOwnProperty("dim")) {
              if (!Array.isArray(t.dim)) return "dim: array expected";
              for (var r = 0; r < t.dim.length; ++r) {
                var n = h.onnx.TensorShapeProto.Dimension.verify(t.dim[r]);
                if (n) return "dim." + n;
              }
            }
            return null;
          }),
          (e.fromObject = function (t) {
            if (t instanceof h.onnx.TensorShapeProto) return t;
            var r = new h.onnx.TensorShapeProto();
            if (t.dim) {
              if (!Array.isArray(t.dim))
                throw TypeError(".onnx.TensorShapeProto.dim: array expected");
              r.dim = [];
              for (var n = 0; n < t.dim.length; ++n) {
                if (typeof t.dim[n] != "object")
                  throw TypeError(
                    ".onnx.TensorShapeProto.dim: object expected"
                  );
                r.dim[n] = h.onnx.TensorShapeProto.Dimension.fromObject(
                  t.dim[n]
                );
              }
            }
            return r;
          }),
          (e.toObject = function (t, r) {
            r || (r = {});
            var n = {};
            if (
              ((r.arrays || r.defaults) && (n.dim = []), t.dim && t.dim.length)
            ) {
              n.dim = [];
              for (var s = 0; s < t.dim.length; ++s)
                n.dim[s] = h.onnx.TensorShapeProto.Dimension.toObject(
                  t.dim[s],
                  r
                );
            }
            return n;
          }),
          (e.prototype.toJSON = function () {
            return this.constructor.toObject(this, nt.util.toJSONOptions);
          }),
          (e.getTypeUrl = function (t) {
            return (
              t === void 0 && (t = "type.googleapis.com"),
              t + "/onnx.TensorShapeProto"
            );
          }),
          (e.Dimension = (function () {
            function o(r) {
              if (r)
                for (var n = Object.keys(r), s = 0; s < n.length; ++s)
                  r[n[s]] != null && (this[n[s]] = r[n[s]]);
            }
            (o.prototype.dimValue = null),
              (o.prototype.dimParam = null),
              (o.prototype.denotation = "");
            var t;
            return (
              Object.defineProperty(o.prototype, "value", {
                get: b.oneOfGetter((t = ["dimValue", "dimParam"])),
                set: b.oneOfSetter(t),
              }),
              (o.create = function (n) {
                return new o(n);
              }),
              (o.encode = function (n, s) {
                return (
                  s || (s = pt.create()),
                  n.dimValue != null &&
                    Object.hasOwnProperty.call(n, "dimValue") &&
                    s.uint32(8).int64(n.dimValue),
                  n.dimParam != null &&
                    Object.hasOwnProperty.call(n, "dimParam") &&
                    s.uint32(18).string(n.dimParam),
                  n.denotation != null &&
                    Object.hasOwnProperty.call(n, "denotation") &&
                    s.uint32(26).string(n.denotation),
                  s
                );
              }),
              (o.encodeDelimited = function (n, s) {
                return this.encode(n, s).ldelim();
              }),
              (o.decode = function (n, s) {
                n instanceof $ || (n = $.create(n));
                for (
                  var a = s === void 0 ? n.len : n.pos + s,
                    u = new h.onnx.TensorShapeProto.Dimension();
                  n.pos < a;

                ) {
                  var l = n.uint32();
                  switch (l >>> 3) {
                    case 1: {
                      u.dimValue = n.int64();
                      break;
                    }
                    case 2: {
                      u.dimParam = n.string();
                      break;
                    }
                    case 3: {
                      u.denotation = n.string();
                      break;
                    }
                    default:
                      n.skipType(l & 7);
                      break;
                  }
                }
                return u;
              }),
              (o.decodeDelimited = function (n) {
                return (
                  n instanceof $ || (n = new $(n)), this.decode(n, n.uint32())
                );
              }),
              (o.verify = function (n) {
                if (typeof n != "object" || n === null)
                  return "object expected";
                var s = {};
                if (
                  n.dimValue != null &&
                  n.hasOwnProperty("dimValue") &&
                  ((s.value = 1),
                  !b.isInteger(n.dimValue) &&
                    !(
                      n.dimValue &&
                      b.isInteger(n.dimValue.low) &&
                      b.isInteger(n.dimValue.high)
                    ))
                )
                  return "dimValue: integer|Long expected";
                if (n.dimParam != null && n.hasOwnProperty("dimParam")) {
                  if (s.value === 1) return "value: multiple values";
                  if (((s.value = 1), !b.isString(n.dimParam)))
                    return "dimParam: string expected";
                }
                return n.denotation != null &&
                  n.hasOwnProperty("denotation") &&
                  !b.isString(n.denotation)
                  ? "denotation: string expected"
                  : null;
              }),
              (o.fromObject = function (n) {
                if (n instanceof h.onnx.TensorShapeProto.Dimension) return n;
                var s = new h.onnx.TensorShapeProto.Dimension();
                return (
                  n.dimValue != null &&
                    (b.Long
                      ? ((s.dimValue = b.Long.fromValue(n.dimValue)).unsigned =
                          !1)
                      : typeof n.dimValue == "string"
                      ? (s.dimValue = parseInt(n.dimValue, 10))
                      : typeof n.dimValue == "number"
                      ? (s.dimValue = n.dimValue)
                      : typeof n.dimValue == "object" &&
                        (s.dimValue = new b.LongBits(
                          n.dimValue.low >>> 0,
                          n.dimValue.high >>> 0
                        ).toNumber())),
                  n.dimParam != null && (s.dimParam = String(n.dimParam)),
                  n.denotation != null && (s.denotation = String(n.denotation)),
                  s
                );
              }),
              (o.toObject = function (n, s) {
                s || (s = {});
                var a = {};
                return (
                  s.defaults && (a.denotation = ""),
                  n.dimValue != null &&
                    n.hasOwnProperty("dimValue") &&
                    (typeof n.dimValue == "number"
                      ? (a.dimValue =
                          s.longs === String ? String(n.dimValue) : n.dimValue)
                      : (a.dimValue =
                          s.longs === String
                            ? b.Long.prototype.toString.call(n.dimValue)
                            : s.longs === Number
                            ? new b.LongBits(
                                n.dimValue.low >>> 0,
                                n.dimValue.high >>> 0
                              ).toNumber()
                            : n.dimValue),
                    s.oneofs && (a.value = "dimValue")),
                  n.dimParam != null &&
                    n.hasOwnProperty("dimParam") &&
                    ((a.dimParam = n.dimParam),
                    s.oneofs && (a.value = "dimParam")),
                  n.denotation != null &&
                    n.hasOwnProperty("denotation") &&
                    (a.denotation = n.denotation),
                  a
                );
              }),
              (o.prototype.toJSON = function () {
                return this.constructor.toObject(this, nt.util.toJSONOptions);
              }),
              (o.getTypeUrl = function (n) {
                return (
                  n === void 0 && (n = "type.googleapis.com"),
                  n + "/onnx.TensorShapeProto.Dimension"
                );
              }),
              o
            );
          })()),
          e
        );
      })()),
      (i.TypeProto = (function () {
        function e(t) {
          if (t)
            for (var r = Object.keys(t), n = 0; n < r.length; ++n)
              t[r[n]] != null && (this[r[n]] = t[r[n]]);
        }
        (e.prototype.tensorType = null),
          (e.prototype.sequenceType = null),
          (e.prototype.mapType = null),
          (e.prototype.optionalType = null),
          (e.prototype.sparseTensorType = null),
          (e.prototype.denotation = "");
        var o;
        return (
          Object.defineProperty(e.prototype, "value", {
            get: b.oneOfGetter(
              (o = [
                "tensorType",
                "sequenceType",
                "mapType",
                "optionalType",
                "sparseTensorType",
              ])
            ),
            set: b.oneOfSetter(o),
          }),
          (e.create = function (r) {
            return new e(r);
          }),
          (e.encode = function (r, n) {
            return (
              n || (n = pt.create()),
              r.tensorType != null &&
                Object.hasOwnProperty.call(r, "tensorType") &&
                h.onnx.TypeProto.Tensor.encode(
                  r.tensorType,
                  n.uint32(10).fork()
                ).ldelim(),
              r.sequenceType != null &&
                Object.hasOwnProperty.call(r, "sequenceType") &&
                h.onnx.TypeProto.Sequence.encode(
                  r.sequenceType,
                  n.uint32(34).fork()
                ).ldelim(),
              r.mapType != null &&
                Object.hasOwnProperty.call(r, "mapType") &&
                h.onnx.TypeProto.Map.encode(
                  r.mapType,
                  n.uint32(42).fork()
                ).ldelim(),
              r.denotation != null &&
                Object.hasOwnProperty.call(r, "denotation") &&
                n.uint32(50).string(r.denotation),
              r.sparseTensorType != null &&
                Object.hasOwnProperty.call(r, "sparseTensorType") &&
                h.onnx.TypeProto.SparseTensor.encode(
                  r.sparseTensorType,
                  n.uint32(66).fork()
                ).ldelim(),
              r.optionalType != null &&
                Object.hasOwnProperty.call(r, "optionalType") &&
                h.onnx.TypeProto.Optional.encode(
                  r.optionalType,
                  n.uint32(74).fork()
                ).ldelim(),
              n
            );
          }),
          (e.encodeDelimited = function (r, n) {
            return this.encode(r, n).ldelim();
          }),
          (e.decode = function (r, n) {
            r instanceof $ || (r = $.create(r));
            for (
              var s = n === void 0 ? r.len : r.pos + n,
                a = new h.onnx.TypeProto();
              r.pos < s;

            ) {
              var u = r.uint32();
              switch (u >>> 3) {
                case 1: {
                  a.tensorType = h.onnx.TypeProto.Tensor.decode(r, r.uint32());
                  break;
                }
                case 4: {
                  a.sequenceType = h.onnx.TypeProto.Sequence.decode(
                    r,
                    r.uint32()
                  );
                  break;
                }
                case 5: {
                  a.mapType = h.onnx.TypeProto.Map.decode(r, r.uint32());
                  break;
                }
                case 9: {
                  a.optionalType = h.onnx.TypeProto.Optional.decode(
                    r,
                    r.uint32()
                  );
                  break;
                }
                case 8: {
                  a.sparseTensorType = h.onnx.TypeProto.SparseTensor.decode(
                    r,
                    r.uint32()
                  );
                  break;
                }
                case 6: {
                  a.denotation = r.string();
                  break;
                }
                default:
                  r.skipType(u & 7);
                  break;
              }
            }
            return a;
          }),
          (e.decodeDelimited = function (r) {
            return r instanceof $ || (r = new $(r)), this.decode(r, r.uint32());
          }),
          (e.verify = function (r) {
            if (typeof r != "object" || r === null) return "object expected";
            var n = {};
            if (r.tensorType != null && r.hasOwnProperty("tensorType")) {
              n.value = 1;
              {
                var s = h.onnx.TypeProto.Tensor.verify(r.tensorType);
                if (s) return "tensorType." + s;
              }
            }
            if (r.sequenceType != null && r.hasOwnProperty("sequenceType")) {
              if (n.value === 1) return "value: multiple values";
              n.value = 1;
              {
                var s = h.onnx.TypeProto.Sequence.verify(r.sequenceType);
                if (s) return "sequenceType." + s;
              }
            }
            if (r.mapType != null && r.hasOwnProperty("mapType")) {
              if (n.value === 1) return "value: multiple values";
              n.value = 1;
              {
                var s = h.onnx.TypeProto.Map.verify(r.mapType);
                if (s) return "mapType." + s;
              }
            }
            if (r.optionalType != null && r.hasOwnProperty("optionalType")) {
              if (n.value === 1) return "value: multiple values";
              n.value = 1;
              {
                var s = h.onnx.TypeProto.Optional.verify(r.optionalType);
                if (s) return "optionalType." + s;
              }
            }
            if (
              r.sparseTensorType != null &&
              r.hasOwnProperty("sparseTensorType")
            ) {
              if (n.value === 1) return "value: multiple values";
              n.value = 1;
              {
                var s = h.onnx.TypeProto.SparseTensor.verify(
                  r.sparseTensorType
                );
                if (s) return "sparseTensorType." + s;
              }
            }
            return r.denotation != null &&
              r.hasOwnProperty("denotation") &&
              !b.isString(r.denotation)
              ? "denotation: string expected"
              : null;
          }),
          (e.fromObject = function (r) {
            if (r instanceof h.onnx.TypeProto) return r;
            var n = new h.onnx.TypeProto();
            if (r.tensorType != null) {
              if (typeof r.tensorType != "object")
                throw TypeError(".onnx.TypeProto.tensorType: object expected");
              n.tensorType = h.onnx.TypeProto.Tensor.fromObject(r.tensorType);
            }
            if (r.sequenceType != null) {
              if (typeof r.sequenceType != "object")
                throw TypeError(
                  ".onnx.TypeProto.sequenceType: object expected"
                );
              n.sequenceType = h.onnx.TypeProto.Sequence.fromObject(
                r.sequenceType
              );
            }
            if (r.mapType != null) {
              if (typeof r.mapType != "object")
                throw TypeError(".onnx.TypeProto.mapType: object expected");
              n.mapType = h.onnx.TypeProto.Map.fromObject(r.mapType);
            }
            if (r.optionalType != null) {
              if (typeof r.optionalType != "object")
                throw TypeError(
                  ".onnx.TypeProto.optionalType: object expected"
                );
              n.optionalType = h.onnx.TypeProto.Optional.fromObject(
                r.optionalType
              );
            }
            if (r.sparseTensorType != null) {
              if (typeof r.sparseTensorType != "object")
                throw TypeError(
                  ".onnx.TypeProto.sparseTensorType: object expected"
                );
              n.sparseTensorType = h.onnx.TypeProto.SparseTensor.fromObject(
                r.sparseTensorType
              );
            }
            return (
              r.denotation != null && (n.denotation = String(r.denotation)), n
            );
          }),
          (e.toObject = function (r, n) {
            n || (n = {});
            var s = {};
            return (
              n.defaults && (s.denotation = ""),
              r.tensorType != null &&
                r.hasOwnProperty("tensorType") &&
                ((s.tensorType = h.onnx.TypeProto.Tensor.toObject(
                  r.tensorType,
                  n
                )),
                n.oneofs && (s.value = "tensorType")),
              r.sequenceType != null &&
                r.hasOwnProperty("sequenceType") &&
                ((s.sequenceType = h.onnx.TypeProto.Sequence.toObject(
                  r.sequenceType,
                  n
                )),
                n.oneofs && (s.value = "sequenceType")),
              r.mapType != null &&
                r.hasOwnProperty("mapType") &&
                ((s.mapType = h.onnx.TypeProto.Map.toObject(r.mapType, n)),
                n.oneofs && (s.value = "mapType")),
              r.denotation != null &&
                r.hasOwnProperty("denotation") &&
                (s.denotation = r.denotation),
              r.sparseTensorType != null &&
                r.hasOwnProperty("sparseTensorType") &&
                ((s.sparseTensorType = h.onnx.TypeProto.SparseTensor.toObject(
                  r.sparseTensorType,
                  n
                )),
                n.oneofs && (s.value = "sparseTensorType")),
              r.optionalType != null &&
                r.hasOwnProperty("optionalType") &&
                ((s.optionalType = h.onnx.TypeProto.Optional.toObject(
                  r.optionalType,
                  n
                )),
                n.oneofs && (s.value = "optionalType")),
              s
            );
          }),
          (e.prototype.toJSON = function () {
            return this.constructor.toObject(this, nt.util.toJSONOptions);
          }),
          (e.getTypeUrl = function (r) {
            return (
              r === void 0 && (r = "type.googleapis.com"), r + "/onnx.TypeProto"
            );
          }),
          (e.Tensor = (function () {
            function t(r) {
              if (r)
                for (var n = Object.keys(r), s = 0; s < n.length; ++s)
                  r[n[s]] != null && (this[n[s]] = r[n[s]]);
            }
            return (
              (t.prototype.elemType = 0),
              (t.prototype.shape = null),
              (t.create = function (n) {
                return new t(n);
              }),
              (t.encode = function (n, s) {
                return (
                  s || (s = pt.create()),
                  n.elemType != null &&
                    Object.hasOwnProperty.call(n, "elemType") &&
                    s.uint32(8).int32(n.elemType),
                  n.shape != null &&
                    Object.hasOwnProperty.call(n, "shape") &&
                    h.onnx.TensorShapeProto.encode(
                      n.shape,
                      s.uint32(18).fork()
                    ).ldelim(),
                  s
                );
              }),
              (t.encodeDelimited = function (n, s) {
                return this.encode(n, s).ldelim();
              }),
              (t.decode = function (n, s) {
                n instanceof $ || (n = $.create(n));
                for (
                  var a = s === void 0 ? n.len : n.pos + s,
                    u = new h.onnx.TypeProto.Tensor();
                  n.pos < a;

                ) {
                  var l = n.uint32();
                  switch (l >>> 3) {
                    case 1: {
                      u.elemType = n.int32();
                      break;
                    }
                    case 2: {
                      u.shape = h.onnx.TensorShapeProto.decode(n, n.uint32());
                      break;
                    }
                    default:
                      n.skipType(l & 7);
                      break;
                  }
                }
                return u;
              }),
              (t.decodeDelimited = function (n) {
                return (
                  n instanceof $ || (n = new $(n)), this.decode(n, n.uint32())
                );
              }),
              (t.verify = function (n) {
                if (typeof n != "object" || n === null)
                  return "object expected";
                if (
                  n.elemType != null &&
                  n.hasOwnProperty("elemType") &&
                  !b.isInteger(n.elemType)
                )
                  return "elemType: integer expected";
                if (n.shape != null && n.hasOwnProperty("shape")) {
                  var s = h.onnx.TensorShapeProto.verify(n.shape);
                  if (s) return "shape." + s;
                }
                return null;
              }),
              (t.fromObject = function (n) {
                if (n instanceof h.onnx.TypeProto.Tensor) return n;
                var s = new h.onnx.TypeProto.Tensor();
                if (
                  (n.elemType != null && (s.elemType = n.elemType | 0),
                  n.shape != null)
                ) {
                  if (typeof n.shape != "object")
                    throw TypeError(
                      ".onnx.TypeProto.Tensor.shape: object expected"
                    );
                  s.shape = h.onnx.TensorShapeProto.fromObject(n.shape);
                }
                return s;
              }),
              (t.toObject = function (n, s) {
                s || (s = {});
                var a = {};
                return (
                  s.defaults && ((a.elemType = 0), (a.shape = null)),
                  n.elemType != null &&
                    n.hasOwnProperty("elemType") &&
                    (a.elemType = n.elemType),
                  n.shape != null &&
                    n.hasOwnProperty("shape") &&
                    (a.shape = h.onnx.TensorShapeProto.toObject(n.shape, s)),
                  a
                );
              }),
              (t.prototype.toJSON = function () {
                return this.constructor.toObject(this, nt.util.toJSONOptions);
              }),
              (t.getTypeUrl = function (n) {
                return (
                  n === void 0 && (n = "type.googleapis.com"),
                  n + "/onnx.TypeProto.Tensor"
                );
              }),
              t
            );
          })()),
          (e.Sequence = (function () {
            function t(r) {
              if (r)
                for (var n = Object.keys(r), s = 0; s < n.length; ++s)
                  r[n[s]] != null && (this[n[s]] = r[n[s]]);
            }
            return (
              (t.prototype.elemType = null),
              (t.create = function (n) {
                return new t(n);
              }),
              (t.encode = function (n, s) {
                return (
                  s || (s = pt.create()),
                  n.elemType != null &&
                    Object.hasOwnProperty.call(n, "elemType") &&
                    h.onnx.TypeProto.encode(
                      n.elemType,
                      s.uint32(10).fork()
                    ).ldelim(),
                  s
                );
              }),
              (t.encodeDelimited = function (n, s) {
                return this.encode(n, s).ldelim();
              }),
              (t.decode = function (n, s) {
                n instanceof $ || (n = $.create(n));
                for (
                  var a = s === void 0 ? n.len : n.pos + s,
                    u = new h.onnx.TypeProto.Sequence();
                  n.pos < a;

                ) {
                  var l = n.uint32();
                  switch (l >>> 3) {
                    case 1: {
                      u.elemType = h.onnx.TypeProto.decode(n, n.uint32());
                      break;
                    }
                    default:
                      n.skipType(l & 7);
                      break;
                  }
                }
                return u;
              }),
              (t.decodeDelimited = function (n) {
                return (
                  n instanceof $ || (n = new $(n)), this.decode(n, n.uint32())
                );
              }),
              (t.verify = function (n) {
                if (typeof n != "object" || n === null)
                  return "object expected";
                if (n.elemType != null && n.hasOwnProperty("elemType")) {
                  var s = h.onnx.TypeProto.verify(n.elemType);
                  if (s) return "elemType." + s;
                }
                return null;
              }),
              (t.fromObject = function (n) {
                if (n instanceof h.onnx.TypeProto.Sequence) return n;
                var s = new h.onnx.TypeProto.Sequence();
                if (n.elemType != null) {
                  if (typeof n.elemType != "object")
                    throw TypeError(
                      ".onnx.TypeProto.Sequence.elemType: object expected"
                    );
                  s.elemType = h.onnx.TypeProto.fromObject(n.elemType);
                }
                return s;
              }),
              (t.toObject = function (n, s) {
                s || (s = {});
                var a = {};
                return (
                  s.defaults && (a.elemType = null),
                  n.elemType != null &&
                    n.hasOwnProperty("elemType") &&
                    (a.elemType = h.onnx.TypeProto.toObject(n.elemType, s)),
                  a
                );
              }),
              (t.prototype.toJSON = function () {
                return this.constructor.toObject(this, nt.util.toJSONOptions);
              }),
              (t.getTypeUrl = function (n) {
                return (
                  n === void 0 && (n = "type.googleapis.com"),
                  n + "/onnx.TypeProto.Sequence"
                );
              }),
              t
            );
          })()),
          (e.Map = (function () {
            function t(r) {
              if (r)
                for (var n = Object.keys(r), s = 0; s < n.length; ++s)
                  r[n[s]] != null && (this[n[s]] = r[n[s]]);
            }
            return (
              (t.prototype.keyType = 0),
              (t.prototype.valueType = null),
              (t.create = function (n) {
                return new t(n);
              }),
              (t.encode = function (n, s) {
                return (
                  s || (s = pt.create()),
                  n.keyType != null &&
                    Object.hasOwnProperty.call(n, "keyType") &&
                    s.uint32(8).int32(n.keyType),
                  n.valueType != null &&
                    Object.hasOwnProperty.call(n, "valueType") &&
                    h.onnx.TypeProto.encode(
                      n.valueType,
                      s.uint32(18).fork()
                    ).ldelim(),
                  s
                );
              }),
              (t.encodeDelimited = function (n, s) {
                return this.encode(n, s).ldelim();
              }),
              (t.decode = function (n, s) {
                n instanceof $ || (n = $.create(n));
                for (
                  var a = s === void 0 ? n.len : n.pos + s,
                    u = new h.onnx.TypeProto.Map();
                  n.pos < a;

                ) {
                  var l = n.uint32();
                  switch (l >>> 3) {
                    case 1: {
                      u.keyType = n.int32();
                      break;
                    }
                    case 2: {
                      u.valueType = h.onnx.TypeProto.decode(n, n.uint32());
                      break;
                    }
                    default:
                      n.skipType(l & 7);
                      break;
                  }
                }
                return u;
              }),
              (t.decodeDelimited = function (n) {
                return (
                  n instanceof $ || (n = new $(n)), this.decode(n, n.uint32())
                );
              }),
              (t.verify = function (n) {
                if (typeof n != "object" || n === null)
                  return "object expected";
                if (
                  n.keyType != null &&
                  n.hasOwnProperty("keyType") &&
                  !b.isInteger(n.keyType)
                )
                  return "keyType: integer expected";
                if (n.valueType != null && n.hasOwnProperty("valueType")) {
                  var s = h.onnx.TypeProto.verify(n.valueType);
                  if (s) return "valueType." + s;
                }
                return null;
              }),
              (t.fromObject = function (n) {
                if (n instanceof h.onnx.TypeProto.Map) return n;
                var s = new h.onnx.TypeProto.Map();
                if (
                  (n.keyType != null && (s.keyType = n.keyType | 0),
                  n.valueType != null)
                ) {
                  if (typeof n.valueType != "object")
                    throw TypeError(
                      ".onnx.TypeProto.Map.valueType: object expected"
                    );
                  s.valueType = h.onnx.TypeProto.fromObject(n.valueType);
                }
                return s;
              }),
              (t.toObject = function (n, s) {
                s || (s = {});
                var a = {};
                return (
                  s.defaults && ((a.keyType = 0), (a.valueType = null)),
                  n.keyType != null &&
                    n.hasOwnProperty("keyType") &&
                    (a.keyType = n.keyType),
                  n.valueType != null &&
                    n.hasOwnProperty("valueType") &&
                    (a.valueType = h.onnx.TypeProto.toObject(n.valueType, s)),
                  a
                );
              }),
              (t.prototype.toJSON = function () {
                return this.constructor.toObject(this, nt.util.toJSONOptions);
              }),
              (t.getTypeUrl = function (n) {
                return (
                  n === void 0 && (n = "type.googleapis.com"),
                  n + "/onnx.TypeProto.Map"
                );
              }),
              t
            );
          })()),
          (e.Optional = (function () {
            function t(r) {
              if (r)
                for (var n = Object.keys(r), s = 0; s < n.length; ++s)
                  r[n[s]] != null && (this[n[s]] = r[n[s]]);
            }
            return (
              (t.prototype.elemType = null),
              (t.create = function (n) {
                return new t(n);
              }),
              (t.encode = function (n, s) {
                return (
                  s || (s = pt.create()),
                  n.elemType != null &&
                    Object.hasOwnProperty.call(n, "elemType") &&
                    h.onnx.TypeProto.encode(
                      n.elemType,
                      s.uint32(10).fork()
                    ).ldelim(),
                  s
                );
              }),
              (t.encodeDelimited = function (n, s) {
                return this.encode(n, s).ldelim();
              }),
              (t.decode = function (n, s) {
                n instanceof $ || (n = $.create(n));
                for (
                  var a = s === void 0 ? n.len : n.pos + s,
                    u = new h.onnx.TypeProto.Optional();
                  n.pos < a;

                ) {
                  var l = n.uint32();
                  switch (l >>> 3) {
                    case 1: {
                      u.elemType = h.onnx.TypeProto.decode(n, n.uint32());
                      break;
                    }
                    default:
                      n.skipType(l & 7);
                      break;
                  }
                }
                return u;
              }),
              (t.decodeDelimited = function (n) {
                return (
                  n instanceof $ || (n = new $(n)), this.decode(n, n.uint32())
                );
              }),
              (t.verify = function (n) {
                if (typeof n != "object" || n === null)
                  return "object expected";
                if (n.elemType != null && n.hasOwnProperty("elemType")) {
                  var s = h.onnx.TypeProto.verify(n.elemType);
                  if (s) return "elemType." + s;
                }
                return null;
              }),
              (t.fromObject = function (n) {
                if (n instanceof h.onnx.TypeProto.Optional) return n;
                var s = new h.onnx.TypeProto.Optional();
                if (n.elemType != null) {
                  if (typeof n.elemType != "object")
                    throw TypeError(
                      ".onnx.TypeProto.Optional.elemType: object expected"
                    );
                  s.elemType = h.onnx.TypeProto.fromObject(n.elemType);
                }
                return s;
              }),
              (t.toObject = function (n, s) {
                s || (s = {});
                var a = {};
                return (
                  s.defaults && (a.elemType = null),
                  n.elemType != null &&
                    n.hasOwnProperty("elemType") &&
                    (a.elemType = h.onnx.TypeProto.toObject(n.elemType, s)),
                  a
                );
              }),
              (t.prototype.toJSON = function () {
                return this.constructor.toObject(this, nt.util.toJSONOptions);
              }),
              (t.getTypeUrl = function (n) {
                return (
                  n === void 0 && (n = "type.googleapis.com"),
                  n + "/onnx.TypeProto.Optional"
                );
              }),
              t
            );
          })()),
          (e.SparseTensor = (function () {
            function t(r) {
              if (r)
                for (var n = Object.keys(r), s = 0; s < n.length; ++s)
                  r[n[s]] != null && (this[n[s]] = r[n[s]]);
            }
            return (
              (t.prototype.elemType = 0),
              (t.prototype.shape = null),
              (t.create = function (n) {
                return new t(n);
              }),
              (t.encode = function (n, s) {
                return (
                  s || (s = pt.create()),
                  n.elemType != null &&
                    Object.hasOwnProperty.call(n, "elemType") &&
                    s.uint32(8).int32(n.elemType),
                  n.shape != null &&
                    Object.hasOwnProperty.call(n, "shape") &&
                    h.onnx.TensorShapeProto.encode(
                      n.shape,
                      s.uint32(18).fork()
                    ).ldelim(),
                  s
                );
              }),
              (t.encodeDelimited = function (n, s) {
                return this.encode(n, s).ldelim();
              }),
              (t.decode = function (n, s) {
                n instanceof $ || (n = $.create(n));
                for (
                  var a = s === void 0 ? n.len : n.pos + s,
                    u = new h.onnx.TypeProto.SparseTensor();
                  n.pos < a;

                ) {
                  var l = n.uint32();
                  switch (l >>> 3) {
                    case 1: {
                      u.elemType = n.int32();
                      break;
                    }
                    case 2: {
                      u.shape = h.onnx.TensorShapeProto.decode(n, n.uint32());
                      break;
                    }
                    default:
                      n.skipType(l & 7);
                      break;
                  }
                }
                return u;
              }),
              (t.decodeDelimited = function (n) {
                return (
                  n instanceof $ || (n = new $(n)), this.decode(n, n.uint32())
                );
              }),
              (t.verify = function (n) {
                if (typeof n != "object" || n === null)
                  return "object expected";
                if (
                  n.elemType != null &&
                  n.hasOwnProperty("elemType") &&
                  !b.isInteger(n.elemType)
                )
                  return "elemType: integer expected";
                if (n.shape != null && n.hasOwnProperty("shape")) {
                  var s = h.onnx.TensorShapeProto.verify(n.shape);
                  if (s) return "shape." + s;
                }
                return null;
              }),
              (t.fromObject = function (n) {
                if (n instanceof h.onnx.TypeProto.SparseTensor) return n;
                var s = new h.onnx.TypeProto.SparseTensor();
                if (
                  (n.elemType != null && (s.elemType = n.elemType | 0),
                  n.shape != null)
                ) {
                  if (typeof n.shape != "object")
                    throw TypeError(
                      ".onnx.TypeProto.SparseTensor.shape: object expected"
                    );
                  s.shape = h.onnx.TensorShapeProto.fromObject(n.shape);
                }
                return s;
              }),
              (t.toObject = function (n, s) {
                s || (s = {});
                var a = {};
                return (
                  s.defaults && ((a.elemType = 0), (a.shape = null)),
                  n.elemType != null &&
                    n.hasOwnProperty("elemType") &&
                    (a.elemType = n.elemType),
                  n.shape != null &&
                    n.hasOwnProperty("shape") &&
                    (a.shape = h.onnx.TensorShapeProto.toObject(n.shape, s)),
                  a
                );
              }),
              (t.prototype.toJSON = function () {
                return this.constructor.toObject(this, nt.util.toJSONOptions);
              }),
              (t.getTypeUrl = function (n) {
                return (
                  n === void 0 && (n = "type.googleapis.com"),
                  n + "/onnx.TypeProto.SparseTensor"
                );
              }),
              t
            );
          })()),
          e
        );
      })()),
      (i.OperatorSetIdProto = (function () {
        function e(o) {
          if (o)
            for (var t = Object.keys(o), r = 0; r < t.length; ++r)
              o[t[r]] != null && (this[t[r]] = o[t[r]]);
        }
        return (
          (e.prototype.domain = ""),
          (e.prototype.version = b.Long ? b.Long.fromBits(0, 0, !1) : 0),
          (e.create = function (t) {
            return new e(t);
          }),
          (e.encode = function (t, r) {
            return (
              r || (r = pt.create()),
              t.domain != null &&
                Object.hasOwnProperty.call(t, "domain") &&
                r.uint32(10).string(t.domain),
              t.version != null &&
                Object.hasOwnProperty.call(t, "version") &&
                r.uint32(16).int64(t.version),
              r
            );
          }),
          (e.encodeDelimited = function (t, r) {
            return this.encode(t, r).ldelim();
          }),
          (e.decode = function (t, r) {
            t instanceof $ || (t = $.create(t));
            for (
              var n = r === void 0 ? t.len : t.pos + r,
                s = new h.onnx.OperatorSetIdProto();
              t.pos < n;

            ) {
              var a = t.uint32();
              switch (a >>> 3) {
                case 1: {
                  s.domain = t.string();
                  break;
                }
                case 2: {
                  s.version = t.int64();
                  break;
                }
                default:
                  t.skipType(a & 7);
                  break;
              }
            }
            return s;
          }),
          (e.decodeDelimited = function (t) {
            return t instanceof $ || (t = new $(t)), this.decode(t, t.uint32());
          }),
          (e.verify = function (t) {
            return typeof t != "object" || t === null
              ? "object expected"
              : t.domain != null &&
                t.hasOwnProperty("domain") &&
                !b.isString(t.domain)
              ? "domain: string expected"
              : t.version != null &&
                t.hasOwnProperty("version") &&
                !b.isInteger(t.version) &&
                !(
                  t.version &&
                  b.isInteger(t.version.low) &&
                  b.isInteger(t.version.high)
                )
              ? "version: integer|Long expected"
              : null;
          }),
          (e.fromObject = function (t) {
            if (t instanceof h.onnx.OperatorSetIdProto) return t;
            var r = new h.onnx.OperatorSetIdProto();
            return (
              t.domain != null && (r.domain = String(t.domain)),
              t.version != null &&
                (b.Long
                  ? ((r.version = b.Long.fromValue(t.version)).unsigned = !1)
                  : typeof t.version == "string"
                  ? (r.version = parseInt(t.version, 10))
                  : typeof t.version == "number"
                  ? (r.version = t.version)
                  : typeof t.version == "object" &&
                    (r.version = new b.LongBits(
                      t.version.low >>> 0,
                      t.version.high >>> 0
                    ).toNumber())),
              r
            );
          }),
          (e.toObject = function (t, r) {
            r || (r = {});
            var n = {};
            if (r.defaults)
              if (((n.domain = ""), b.Long)) {
                var s = new b.Long(0, 0, !1);
                n.version =
                  r.longs === String
                    ? s.toString()
                    : r.longs === Number
                    ? s.toNumber()
                    : s;
              } else n.version = r.longs === String ? "0" : 0;
            return (
              t.domain != null &&
                t.hasOwnProperty("domain") &&
                (n.domain = t.domain),
              t.version != null &&
                t.hasOwnProperty("version") &&
                (typeof t.version == "number"
                  ? (n.version =
                      r.longs === String ? String(t.version) : t.version)
                  : (n.version =
                      r.longs === String
                        ? b.Long.prototype.toString.call(t.version)
                        : r.longs === Number
                        ? new b.LongBits(
                            t.version.low >>> 0,
                            t.version.high >>> 0
                          ).toNumber()
                        : t.version)),
              n
            );
          }),
          (e.prototype.toJSON = function () {
            return this.constructor.toObject(this, nt.util.toJSONOptions);
          }),
          (e.getTypeUrl = function (t) {
            return (
              t === void 0 && (t = "type.googleapis.com"),
              t + "/onnx.OperatorSetIdProto"
            );
          }),
          e
        );
      })()),
      (i.OperatorStatus = (function () {
        var e = {},
          o = Object.create(e);
        return (o[(e[0] = "EXPERIMENTAL")] = 0), (o[(e[1] = "STABLE")] = 1), o;
      })()),
      (i.FunctionProto = (function () {
        function e(o) {
          if (
            ((this.input = []),
            (this.output = []),
            (this.attribute = []),
            (this.attributeProto = []),
            (this.node = []),
            (this.opsetImport = []),
            o)
          )
            for (var t = Object.keys(o), r = 0; r < t.length; ++r)
              o[t[r]] != null && (this[t[r]] = o[t[r]]);
        }
        return (
          (e.prototype.name = ""),
          (e.prototype.input = b.emptyArray),
          (e.prototype.output = b.emptyArray),
          (e.prototype.attribute = b.emptyArray),
          (e.prototype.attributeProto = b.emptyArray),
          (e.prototype.node = b.emptyArray),
          (e.prototype.docString = ""),
          (e.prototype.opsetImport = b.emptyArray),
          (e.prototype.domain = ""),
          (e.create = function (t) {
            return new e(t);
          }),
          (e.encode = function (t, r) {
            if (
              (r || (r = pt.create()),
              t.name != null &&
                Object.hasOwnProperty.call(t, "name") &&
                r.uint32(10).string(t.name),
              t.input != null && t.input.length)
            )
              for (var n = 0; n < t.input.length; ++n)
                r.uint32(34).string(t.input[n]);
            if (t.output != null && t.output.length)
              for (var n = 0; n < t.output.length; ++n)
                r.uint32(42).string(t.output[n]);
            if (t.attribute != null && t.attribute.length)
              for (var n = 0; n < t.attribute.length; ++n)
                r.uint32(50).string(t.attribute[n]);
            if (t.node != null && t.node.length)
              for (var n = 0; n < t.node.length; ++n)
                h.onnx.NodeProto.encode(
                  t.node[n],
                  r.uint32(58).fork()
                ).ldelim();
            if (
              (t.docString != null &&
                Object.hasOwnProperty.call(t, "docString") &&
                r.uint32(66).string(t.docString),
              t.opsetImport != null && t.opsetImport.length)
            )
              for (var n = 0; n < t.opsetImport.length; ++n)
                h.onnx.OperatorSetIdProto.encode(
                  t.opsetImport[n],
                  r.uint32(74).fork()
                ).ldelim();
            if (
              (t.domain != null &&
                Object.hasOwnProperty.call(t, "domain") &&
                r.uint32(82).string(t.domain),
              t.attributeProto != null && t.attributeProto.length)
            )
              for (var n = 0; n < t.attributeProto.length; ++n)
                h.onnx.AttributeProto.encode(
                  t.attributeProto[n],
                  r.uint32(90).fork()
                ).ldelim();
            return r;
          }),
          (e.encodeDelimited = function (t, r) {
            return this.encode(t, r).ldelim();
          }),
          (e.decode = function (t, r) {
            t instanceof $ || (t = $.create(t));
            for (
              var n = r === void 0 ? t.len : t.pos + r,
                s = new h.onnx.FunctionProto();
              t.pos < n;

            ) {
              var a = t.uint32();
              switch (a >>> 3) {
                case 1: {
                  s.name = t.string();
                  break;
                }
                case 4: {
                  (s.input && s.input.length) || (s.input = []),
                    s.input.push(t.string());
                  break;
                }
                case 5: {
                  (s.output && s.output.length) || (s.output = []),
                    s.output.push(t.string());
                  break;
                }
                case 6: {
                  (s.attribute && s.attribute.length) || (s.attribute = []),
                    s.attribute.push(t.string());
                  break;
                }
                case 11: {
                  (s.attributeProto && s.attributeProto.length) ||
                    (s.attributeProto = []),
                    s.attributeProto.push(
                      h.onnx.AttributeProto.decode(t, t.uint32())
                    );
                  break;
                }
                case 7: {
                  (s.node && s.node.length) || (s.node = []),
                    s.node.push(h.onnx.NodeProto.decode(t, t.uint32()));
                  break;
                }
                case 8: {
                  s.docString = t.string();
                  break;
                }
                case 9: {
                  (s.opsetImport && s.opsetImport.length) ||
                    (s.opsetImport = []),
                    s.opsetImport.push(
                      h.onnx.OperatorSetIdProto.decode(t, t.uint32())
                    );
                  break;
                }
                case 10: {
                  s.domain = t.string();
                  break;
                }
                default:
                  t.skipType(a & 7);
                  break;
              }
            }
            return s;
          }),
          (e.decodeDelimited = function (t) {
            return t instanceof $ || (t = new $(t)), this.decode(t, t.uint32());
          }),
          (e.verify = function (t) {
            if (typeof t != "object" || t === null) return "object expected";
            if (
              t.name != null &&
              t.hasOwnProperty("name") &&
              !b.isString(t.name)
            )
              return "name: string expected";
            if (t.input != null && t.hasOwnProperty("input")) {
              if (!Array.isArray(t.input)) return "input: array expected";
              for (var r = 0; r < t.input.length; ++r)
                if (!b.isString(t.input[r])) return "input: string[] expected";
            }
            if (t.output != null && t.hasOwnProperty("output")) {
              if (!Array.isArray(t.output)) return "output: array expected";
              for (var r = 0; r < t.output.length; ++r)
                if (!b.isString(t.output[r]))
                  return "output: string[] expected";
            }
            if (t.attribute != null && t.hasOwnProperty("attribute")) {
              if (!Array.isArray(t.attribute))
                return "attribute: array expected";
              for (var r = 0; r < t.attribute.length; ++r)
                if (!b.isString(t.attribute[r]))
                  return "attribute: string[] expected";
            }
            if (
              t.attributeProto != null &&
              t.hasOwnProperty("attributeProto")
            ) {
              if (!Array.isArray(t.attributeProto))
                return "attributeProto: array expected";
              for (var r = 0; r < t.attributeProto.length; ++r) {
                var n = h.onnx.AttributeProto.verify(t.attributeProto[r]);
                if (n) return "attributeProto." + n;
              }
            }
            if (t.node != null && t.hasOwnProperty("node")) {
              if (!Array.isArray(t.node)) return "node: array expected";
              for (var r = 0; r < t.node.length; ++r) {
                var n = h.onnx.NodeProto.verify(t.node[r]);
                if (n) return "node." + n;
              }
            }
            if (
              t.docString != null &&
              t.hasOwnProperty("docString") &&
              !b.isString(t.docString)
            )
              return "docString: string expected";
            if (t.opsetImport != null && t.hasOwnProperty("opsetImport")) {
              if (!Array.isArray(t.opsetImport))
                return "opsetImport: array expected";
              for (var r = 0; r < t.opsetImport.length; ++r) {
                var n = h.onnx.OperatorSetIdProto.verify(t.opsetImport[r]);
                if (n) return "opsetImport." + n;
              }
            }
            return t.domain != null &&
              t.hasOwnProperty("domain") &&
              !b.isString(t.domain)
              ? "domain: string expected"
              : null;
          }),
          (e.fromObject = function (t) {
            if (t instanceof h.onnx.FunctionProto) return t;
            var r = new h.onnx.FunctionProto();
            if ((t.name != null && (r.name = String(t.name)), t.input)) {
              if (!Array.isArray(t.input))
                throw TypeError(".onnx.FunctionProto.input: array expected");
              r.input = [];
              for (var n = 0; n < t.input.length; ++n)
                r.input[n] = String(t.input[n]);
            }
            if (t.output) {
              if (!Array.isArray(t.output))
                throw TypeError(".onnx.FunctionProto.output: array expected");
              r.output = [];
              for (var n = 0; n < t.output.length; ++n)
                r.output[n] = String(t.output[n]);
            }
            if (t.attribute) {
              if (!Array.isArray(t.attribute))
                throw TypeError(
                  ".onnx.FunctionProto.attribute: array expected"
                );
              r.attribute = [];
              for (var n = 0; n < t.attribute.length; ++n)
                r.attribute[n] = String(t.attribute[n]);
            }
            if (t.attributeProto) {
              if (!Array.isArray(t.attributeProto))
                throw TypeError(
                  ".onnx.FunctionProto.attributeProto: array expected"
                );
              r.attributeProto = [];
              for (var n = 0; n < t.attributeProto.length; ++n) {
                if (typeof t.attributeProto[n] != "object")
                  throw TypeError(
                    ".onnx.FunctionProto.attributeProto: object expected"
                  );
                r.attributeProto[n] = h.onnx.AttributeProto.fromObject(
                  t.attributeProto[n]
                );
              }
            }
            if (t.node) {
              if (!Array.isArray(t.node))
                throw TypeError(".onnx.FunctionProto.node: array expected");
              r.node = [];
              for (var n = 0; n < t.node.length; ++n) {
                if (typeof t.node[n] != "object")
                  throw TypeError(".onnx.FunctionProto.node: object expected");
                r.node[n] = h.onnx.NodeProto.fromObject(t.node[n]);
              }
            }
            if (
              (t.docString != null && (r.docString = String(t.docString)),
              t.opsetImport)
            ) {
              if (!Array.isArray(t.opsetImport))
                throw TypeError(
                  ".onnx.FunctionProto.opsetImport: array expected"
                );
              r.opsetImport = [];
              for (var n = 0; n < t.opsetImport.length; ++n) {
                if (typeof t.opsetImport[n] != "object")
                  throw TypeError(
                    ".onnx.FunctionProto.opsetImport: object expected"
                  );
                r.opsetImport[n] = h.onnx.OperatorSetIdProto.fromObject(
                  t.opsetImport[n]
                );
              }
            }
            return t.domain != null && (r.domain = String(t.domain)), r;
          }),
          (e.toObject = function (t, r) {
            r || (r = {});
            var n = {};
            if (
              ((r.arrays || r.defaults) &&
                ((n.input = []),
                (n.output = []),
                (n.attribute = []),
                (n.node = []),
                (n.opsetImport = []),
                (n.attributeProto = [])),
              r.defaults &&
                ((n.name = ""), (n.docString = ""), (n.domain = "")),
              t.name != null && t.hasOwnProperty("name") && (n.name = t.name),
              t.input && t.input.length)
            ) {
              n.input = [];
              for (var s = 0; s < t.input.length; ++s) n.input[s] = t.input[s];
            }
            if (t.output && t.output.length) {
              n.output = [];
              for (var s = 0; s < t.output.length; ++s)
                n.output[s] = t.output[s];
            }
            if (t.attribute && t.attribute.length) {
              n.attribute = [];
              for (var s = 0; s < t.attribute.length; ++s)
                n.attribute[s] = t.attribute[s];
            }
            if (t.node && t.node.length) {
              n.node = [];
              for (var s = 0; s < t.node.length; ++s)
                n.node[s] = h.onnx.NodeProto.toObject(t.node[s], r);
            }
            if (
              (t.docString != null &&
                t.hasOwnProperty("docString") &&
                (n.docString = t.docString),
              t.opsetImport && t.opsetImport.length)
            ) {
              n.opsetImport = [];
              for (var s = 0; s < t.opsetImport.length; ++s)
                n.opsetImport[s] = h.onnx.OperatorSetIdProto.toObject(
                  t.opsetImport[s],
                  r
                );
            }
            if (
              (t.domain != null &&
                t.hasOwnProperty("domain") &&
                (n.domain = t.domain),
              t.attributeProto && t.attributeProto.length)
            ) {
              n.attributeProto = [];
              for (var s = 0; s < t.attributeProto.length; ++s)
                n.attributeProto[s] = h.onnx.AttributeProto.toObject(
                  t.attributeProto[s],
                  r
                );
            }
            return n;
          }),
          (e.prototype.toJSON = function () {
            return this.constructor.toObject(this, nt.util.toJSONOptions);
          }),
          (e.getTypeUrl = function (t) {
            return (
              t === void 0 && (t = "type.googleapis.com"),
              t + "/onnx.FunctionProto"
            );
          }),
          e
        );
      })()),
      i
    );
  })();
  zu.exports = h;
});
function ur(i, e) {
  if (!i) throw new Error(typeof e == "string" ? e : e());
}
function kr(i) {
  return new TextDecoder().decode(i);
}
var ot,
  Me,
  ai,
  kt,
  Sn,
  At,
  Rt,
  B,
  $r,
  Ue,
  Ve,
  ze,
  Y = O(() => {
    "use strict";
    wn();
    qo();
    ot = rr(sr());
    We();
    (Me = class {
      static arraysEqual(e, o) {
        if (e.length !== o.length) return !1;
        for (let t = 0; t < e.length; t++) if (e[t] !== o[t]) return !1;
        return !0;
      }
    }),
      (ai = class {
        static preprocessInputShapes(e, o) {
          let t = e.length === 1 ? [1, e[0]] : e,
            r = o.length === 1 ? [o[0], 1] : o;
          return [t, r];
        }
        static postprocessOutputShape(e, o, t) {
          o === 1 && e.splice(e.length - 2, 1), t === 1 && e.pop();
        }
        static calcMatMulShape(e, o) {
          return e[1] !== o[0] ? void 0 : [e[0], o[1]];
        }
      }),
      (kt = class i {
        static calcShape(e, o, t = !1) {
          let r = e.length,
            n = o.length;
          if (r === 0) return o;
          if (n === 0) return e;
          let s = Math.max(e.length, o.length),
            a = new Array(s);
          if (t) {
            if (r < 2 || n < 2) return;
            let u = ai.calcMatMulShape(
              [e[r - 2], e[r - 1]],
              [o[n - 2], o[n - 1]]
            );
            if (u === void 0) return;
            [a[s - 2], a[s - 1]] = u;
          }
          for (let u = t ? 3 : 1; u <= s; u++) {
            let l = r - u < 0 ? 1 : e[r - u],
              f = n - u < 0 ? 1 : o[n - u];
            if (l !== f && l > 1 && f > 1) return;
            a[s - u] = Math.max(l, f);
          }
          return a;
        }
        static index(e, o) {
          let t = new Array(o.length);
          return i.fillIndex(e, o, t), t;
        }
        static fillIndex(e, o, t) {
          let r = e.length - o.length;
          for (let n = 0; n < o.length; n++) t[n] = e[r + n] % o[n];
        }
        static calc(e, o, t, r, n) {
          let s = i.calcShape(e.dims, o.dims);
          if (s) {
            if (r && !B.areEqual(s, e.dims)) return;
            let a = B.size(s),
              u = r ? e : new bt(s, n || e.type);
            if (s.length === 0) u.set([], t(e.get([]), o.get([])));
            else {
              let l = new Array(s.length),
                f = new Array(e.dims.length),
                p = new Array(o.dims.length),
                d = 0,
                y = 0,
                T = !1,
                v = !1;
              e.dims.length === 0 && ((d = e.get([])), (T = !0)),
                o.dims.length === 0 && ((y = o.get([])), (v = !0));
              let S;
              for (let L = 0; L < a; L++) {
                S = L;
                for (let P = s.length - 1; P >= 0; P--)
                  (l[P] = S % s[P]), (S = Math.floor(S / s[P]));
                T || (i.fillIndex(l, e.dims, f), (d = e.get(f))),
                  v || (i.fillIndex(l, o.dims, p), (y = o.get(p))),
                  u.set(l, t(d, y));
              }
            }
            return u;
          }
        }
        static isValidBroadcast(e, o) {
          let t = e.length,
            r = o.length;
          if (t > r) return !1;
          for (let n = 1; n <= t; n++)
            if (e[t - n] !== 1 && e[t - n] !== o[r - n]) return !1;
          return !0;
        }
        static getBroadcastDims(e, o) {
          let t = e.length,
            r = [];
          for (let n = 0; n < t; n++) {
            let s = t - 1 - n,
              a = e[s] || 1;
            (o[o.length - 1 - n] || 1) > 1 && a === 1 && r.unshift(s);
          }
          return r;
        }
      }),
      (Sn = class {
        static getShapeOfGemmResult(e, o, t, r, n) {
          if (e.length !== 2 || t.length !== 2)
            throw new Error("shape need to be of size 2");
          let s, a, u;
          o ? ((s = e[1]), (a = e[0])) : ((s = e[0]), (a = e[1]));
          let l = -1;
          if ((r ? ((u = t[0]), (l = 1)) : ((u = t[1]), (l = 0)), t[l] !== a))
            throw new Error("dimension mismatch");
          if (s <= 0 || u <= 0 || a <= 0)
            throw new Error("invalid shape specified");
          if (n && !kt.isValidBroadcast(n, [s, u]))
            throw new Error("gemm: invalid bias shape for broadcast");
          return [s, u, a];
        }
      }),
      (At = class i {
        static tensorDataTypeFromProto(e) {
          switch (e) {
            case ot.onnx.TensorProto.DataType.INT8:
              return "int8";
            case ot.onnx.TensorProto.DataType.UINT8:
              return "uint8";
            case ot.onnx.TensorProto.DataType.BOOL:
              return "bool";
            case ot.onnx.TensorProto.DataType.INT16:
              return "int16";
            case ot.onnx.TensorProto.DataType.UINT16:
              return "uint16";
            case ot.onnx.TensorProto.DataType.INT32:
              return "int32";
            case ot.onnx.TensorProto.DataType.UINT32:
              return "uint32";
            case ot.onnx.TensorProto.DataType.FLOAT:
              return "float32";
            case ot.onnx.TensorProto.DataType.DOUBLE:
              return "float64";
            case ot.onnx.TensorProto.DataType.STRING:
              return "string";
            case ot.onnx.TensorProto.DataType.INT64:
              return "int32";
            case ot.onnx.TensorProto.DataType.UINT64:
              return "uint32";
            default:
              throw new Error(
                `unsupported data type: ${ot.onnx.TensorProto.DataType[e]}`
              );
          }
        }
        static tensorDataTypeStringToEnum(e) {
          switch (e) {
            case "int8":
              return ot.onnx.TensorProto.DataType.INT8;
            case "uint8":
              return ot.onnx.TensorProto.DataType.UINT8;
            case "bool":
              return ot.onnx.TensorProto.DataType.BOOL;
            case "int16":
              return ot.onnx.TensorProto.DataType.INT16;
            case "uint16":
              return ot.onnx.TensorProto.DataType.UINT16;
            case "int32":
              return ot.onnx.TensorProto.DataType.INT32;
            case "uint32":
              return ot.onnx.TensorProto.DataType.UINT32;
            case "float32":
              return ot.onnx.TensorProto.DataType.FLOAT;
            case "float64":
              return ot.onnx.TensorProto.DataType.DOUBLE;
            case "string":
              return ot.onnx.TensorProto.DataType.STRING;
            case "int64":
              return ot.onnx.TensorProto.DataType.INT64;
            case "uint64":
              return ot.onnx.TensorProto.DataType.UINT64;
            default:
              throw new Error(`unsupported data type: ${e}`);
          }
        }
        static tensorDimsFromProto(e) {
          return e.map((o) => (xe.isLong(o) ? o.toNumber() : o));
        }
        static tensorValueTypeFromProto(e) {
          return {
            tensorType: i.tensorDataTypeFromProto(e.elemType),
            shape: {
              dims: i.tensorDimsFromProto(e.shape.dim.map((o) => o.dimValue)),
            },
          };
        }
        static tensorDimsFromORTFormat(e) {
          let o = [];
          for (let t = 0; t < e.dimsLength(); t++)
            o.push(Rt.longToNumber(e.dims(t)));
          return o;
        }
        static tensorAttributesFromORTFormat(e) {
          let o = [];
          for (let t = 0; t < e.attributesLength(); t++)
            o.push(e.attributes(t));
          return o;
        }
      }),
      (Rt = class {
        static longToNumber(e, o) {
          return xe.isLong(e)
            ? e.toNumber()
            : e instanceof w.Long
            ? xe
                .fromValue({ low: e.low, high: e.high, unsigned: o ?? !1 })
                .toNumber()
            : e;
        }
        static isLong(e) {
          return xe.isLong(e) || e instanceof w.Long;
        }
      }),
      (B = class i {
        static size(e) {
          return i.getSizeFromDimensionRange(e, 0, e.length);
        }
        static sizeFromDimension(e, o) {
          if (o < 0 || o > e.length)
            throw new Error(
              `invalid dimension of ${o} for sizeFromDimension as Tensor has ${e.length} dimensions.`
            );
          return i.getSizeFromDimensionRange(e, o, e.length);
        }
        static sizeToDimension(e, o) {
          if (o < 0 || o > e.length)
            throw new Error(
              `invalid dimension of ${o} for sizeToDimension as Tensor has ${e.length} dimensions.`
            );
          return i.getSizeFromDimensionRange(e, 0, o);
        }
        static getSizeFromDimensionRange(e, o, t) {
          let r = 1;
          for (let n = o; n < t; n++) {
            if (e[n] <= 0)
              throw new Error(
                "cannot get valid size from specified dimension range. Most likely the range contains 0 or negative values in them."
              );
            r *= e[n];
          }
          return r;
        }
        static computeStrides(e) {
          let o = e.length;
          if (o === 0) return [];
          if (o === 1) return [1];
          let t = new Array(o);
          (t[o - 1] = 1), (t[o - 2] = e[o - 1]);
          for (let r = o - 3; r >= 0; --r) t[r] = t[r + 1] * e[r + 1];
          return t;
        }
        static transpose(e) {
          return e.slice().reverse();
        }
        static indicesToOffset(e, o, t) {
          t === void 0 && (t = e.length);
          let r = 0;
          for (let n = 0; n < t; ++n) r += o[n] * e[n];
          return r;
        }
        static offsetToIndices(e, o) {
          let t = o.length;
          if (t === 0) return [];
          if (t === 1) return [e * o[0]];
          let r = new Array(o.length);
          for (let n = 0; n < r.length - 1; ++n)
            (r[n] = Math.floor(e / o[n])), (e -= r[n] * o[n]);
          return (r[r.length - 1] = e), r;
        }
        static normalizeAxis(e, o) {
          if (e < -o && e >= o)
            throw new Error("unsupported axis for this operation.");
          return e < 0 ? e + o : e;
        }
        static normalizeAxes(e, o) {
          return e.map((t) => this.normalizeAxis(t, o));
        }
        static incrementIndex(e, o, t) {
          if (o.length === 0 || e.length === 0)
            throw new Error("Index incrementing unsupported for scalar Tensor");
          if (t === void 0) t = o.length;
          else if (t <= 0 || t > o.length)
            throw new Error("Incorrect axis to increment on");
          for (let r = t - 1; r >= 0 && (e[r]++, !(e[r] < o[r])); --r) e[r] = 0;
        }
        static calculateReshapedDims(e, o) {
          if (o.length === 0) {
            if (e.length === 0 || i.size(e) === 1) return [];
            throw new Error("cannot reshape to a scalar Tensor");
          }
          let t = o.length,
            r = new Array(t),
            n = -1,
            s = 1;
          for (let u = 0; u < t; u++) {
            if (o[u] < -1)
              throw new Error(
                "a dimension in shape hints cannot be less than -1"
              );
            if (o[u] === -1) {
              if (n !== -1)
                throw new Error(
                  "at most one dimension in shape hints can be -1"
                );
              n = u;
            } else {
              if (o[u] === 0) {
                if (u >= e.length)
                  throw new Error(
                    "the dimension with value zero exceeds the dimension size of the input tensor"
                  );
                r[u] = e[u];
              } else r[u] = o[u];
              s *= r[u];
            }
          }
          let a = i.size(e);
          if (n !== -1) {
            if (a % s !== 0)
              throw new Error(
                `the input tensor cannot be reshaped to the requested shape. Input shape: [${e}] Output shape: [${o}]`
              );
            r[n] = a / s;
          } else if (s !== a)
            throw new Error(
              "reshapedDims and originalDims don't have matching sizes"
            );
          return r;
        }
        static sortBasedOnPerm(e, o) {
          return o ? o.map((t) => e[t]) : e.slice().reverse();
        }
        static padShape(e, o) {
          let t = e.length;
          return e.map((r, n) => r + o[n] + o[n + t]);
        }
        static areEqual(e, o) {
          return e.length !== o.length ? !1 : e.every((t, r) => t === o[r]);
        }
        static validateDimsAndCalcSize(e) {
          if (e.length > 6)
            throw new TypeError(
              "Only rank 0 to 6 is supported for tensor shape."
            );
          let o = 1;
          for (let t of e) {
            if (!Number.isInteger(t))
              throw new TypeError(`Invalid shape: ${t} is not an integer`);
            if (t < 0 || t > 2147483647)
              throw new TypeError(`Invalid shape: length ${t} is not allowed`);
            o *= t;
          }
          return o;
        }
        static flattenShape(e, o) {
          o < 0 && (o += e.length);
          let t = e.reduce((s, a) => s * a, 1),
            r = e.slice(o).reduce((s, a) => s * a, 1);
          return [t / r, r];
        }
        static squeezeShape(e, o) {
          let t = new Array();
          o = i.normalizeAxes(o, e.length);
          for (let r = 0; r < e.length; r++) {
            let n = o.indexOf(r) >= 0;
            if (n && e[r] !== 1)
              throw new Error("squeeze an axis of size different than 1");
            ((o.length === 0 && e[r] > 1) || (o.length > 0 && !n)) &&
              t.push(e[r]);
          }
          return t;
        }
        static unsqueezeShape(e, o) {
          let t = new Array(e.length + o.length);
          t.fill(0);
          for (let n = 0; n < o.length; n++) {
            let s = i.normalizeAxis(o[n], t.length);
            if (s >= t.length)
              throw new Error("'axes' has an out of range axis");
            if (t[s] !== 0) throw new Error("'axes' has a duplicate axis");
            t[s] = 1;
          }
          let r = 0;
          for (let n = 0; n < t.length; n++) t[n] === 0 && (t[n] = e[r++]);
          if (r !== e.length)
            throw new Error(
              "the unsqueezed dimension could not be established"
            );
          return t;
        }
      }),
      ($r = class i {
        static splitShape(e, o, t, r) {
          if (t.length === 0) {
            if (!r)
              throw new Error(
                "need to know number of outputs when the 'split' attribute is not specified"
              );
            i.determineSplit(e[o], r, t);
          }
          let n = [],
            s = [0];
          for (let a = 0; a < t.length; ++a) {
            a !== 0 && s.push(s[a - 1] + t[a - 1]);
            let u = e.slice();
            (u[o] = t[a]), n.push(u);
          }
          return [n, s];
        }
        static determineSplit(e, o, t) {
          if (e % o !== 0)
            throw new Error("cannot split tensor to equal sized parts");
          for (let r = 0; r < o; ++r) t.push(e / o);
        }
      }),
      (Ue = class i {
        static adjustPoolAttributes(e, o, t, r, n, s) {
          if (!e && t.length !== o.length - 2)
            throw new Error(
              "length of specified kernel shapes should be 2 less than length of input dimensions"
            );
          if (e)
            for (let a = 0; a < o.length - 2; a++)
              a >= t.length ? t.push(o[a + 2]) : (t[a] = o[a + 2]);
          for (let a = 0; a < t.length; a++)
            if (a < r.length) {
              if (r[a] < 0)
                throw new Error("strides should be greater than or equal to 1");
            } else r.push(1);
          for (let a = 0; a < t.length; a++)
            if (a < n.length) {
              if (n[a] < 0)
                throw new Error(
                  "dilations should be greater than or equal to 1"
                );
            } else n.push(1);
          for (let a = 0; a < t.length * 2; a++)
            if (a < s.length) {
              if (s[a] < 0)
                throw new Error("pad should be greater than or equal to 1");
            } else s.push(0);
          for (let a = 0; a < t.length; a++) {
            if (t[a] <= 0)
              throw new Error("kernel shapes need to be greater than 0");
            if (s[a] >= t[a] || s[a + t.length] >= t[a])
              throw new Error("pads should be smaller than kernel");
          }
        }
        static adjustPadsBasedOnAutoPad(e, o, t, r, n, s) {
          if (s) {
            if (n.length !== 2 * (e.length - 2))
              throw new Error(
                "length of pads should be twice the length of data dimensions"
              );
            if (o.length !== e.length - 2)
              throw new Error(
                "length of strides should be the length of data dimensions"
              );
            if (r.length !== e.length - 2)
              throw new Error(
                "length of kernel shapes should be the length of data dimensions"
              );
            for (let a = 0; a < e.length - 2; a++)
              i.adjustPadAndReturnShape(
                e[a + 2],
                o[a],
                t[a],
                r[a],
                n,
                a,
                a + e.length - 2,
                s
              );
          }
        }
        static computePoolOutputShape(e, o, t, r, n, s, a) {
          if (o.length <= 0)
            throw new Error("input shape must be of size greater than 0");
          let u = [o[0], o[1]];
          return i.computeShapeHelper(e, o, u, t, r, n, s, a), u;
        }
        static computeConvOutputShape(e, o, t, r, n, s, a) {
          if (e.length <= 0 || o.length <= 0)
            throw new Error(
              "invalid input tensor dims or invalid filter tensor dims"
            );
          let u = [e[0], o[0]];
          return i.computeShapeHelper(!1, e, u, t, r, n, s, a), u;
        }
        static computeShapeHelper(e, o, t, r, n, s, a, u) {
          if (e) for (let l = 0; l < o.length - 2; l++) t.push(1);
          else
            for (let l = 0; l < o.length - 2; l++)
              t.push(
                i.adjustPadAndReturnShape(
                  o[l + 2],
                  r[l],
                  n[l],
                  s[l],
                  a,
                  l,
                  l + o.length - 2,
                  u
                )
              );
        }
        static adjustPadAndReturnShape(e, o, t, r, n, s, a, u) {
          let l = t * (r - 1) + 1;
          if (u && u !== "NOTSET")
            switch (u) {
              case "VALID":
                return (n[s] = 0), (n[a] = 0), Math.floor((e - l) / o + 1);
              case "SAME_LOWER":
              case "SAME_UPPER":
                if (t !== 1)
                  throw new Error(
                    "Dilation not supported for SAME_UPPER or SAME_LOWER"
                  );
                {
                  let p = ((e + o - 1) / o - 1) * o + r - e;
                  return (
                    (n[s] = Math.floor(
                      u === "SAME_LOWER" ? (p + 1) / 2 : p / 2
                    )),
                    (n[a] = p - n[s]),
                    Math.floor((e + p - r) / o + 1)
                  );
                }
              default:
                throw new Error("Unsupported AutoPad type");
            }
          else return Math.floor((e + n[s] + n[a] - l) / o + 1);
        }
      }),
      (Ve = -34028234663852886e22),
      (ze = 34028234663852886e22);
  });
function hh(i) {
  switch (i) {
    case "bool":
    case "int8":
    case "uint8":
      return 1;
    case "int16":
    case "uint16":
      return 2;
    case "int32":
    case "uint32":
    case "float32":
      return 4;
    case "float64":
      return 8;
    default:
      throw new Error(`cannot calculate sizeof() on type ${i}`);
  }
}
function Wu(i) {
  switch (i) {
    case H.onnx.TensorProto.DataType.UINT8:
    case H.onnx.TensorProto.DataType.INT8:
    case H.onnx.TensorProto.DataType.BOOL:
      return 1;
    case H.onnx.TensorProto.DataType.UINT16:
    case H.onnx.TensorProto.DataType.INT16:
      return 2;
    case H.onnx.TensorProto.DataType.FLOAT:
    case H.onnx.TensorProto.DataType.INT32:
    case H.onnx.TensorProto.DataType.UINT32:
      return 4;
    case H.onnx.TensorProto.DataType.INT64:
    case H.onnx.TensorProto.DataType.DOUBLE:
    case H.onnx.TensorProto.DataType.UINT64:
      return 8;
    default:
      throw new Error(
        `cannot calculate sizeof() on type ${H.onnx.TensorProto.DataType[i]}`
      );
  }
}
function mh(i, e) {
  return new (ju(e))(i);
}
function ju(i) {
  switch (i) {
    case "bool":
    case "uint8":
      return Uint8Array;
    case "int8":
      return Int8Array;
    case "int16":
      return Int16Array;
    case "uint16":
      return Uint16Array;
    case "int32":
      return Int32Array;
    case "uint32":
      return Uint32Array;
    case "int64":
      return BigInt64Array;
    case "float32":
      return Float32Array;
    case "float64":
      return Float64Array;
    default:
      throw new Error("unspecified error");
  }
}
function ui(i, e) {
  if (
    e === H.onnx.TensorProto.DataType.INT64 ||
    e === si.TensorDataType.INT64
  ) {
    if (i.greaterThanOrEqual(2147483648) || i.lessThan(-2147483648))
      throw new TypeError("int64 is not supported");
  } else if (
    e === H.onnx.TensorProto.DataType.UINT32 ||
    e === si.TensorDataType.UINT32 ||
    e === H.onnx.TensorProto.DataType.UINT64 ||
    e === si.TensorDataType.UINT64
  ) {
    if (i.greaterThanOrEqual(4294967296) || i.lessThan(0))
      throw new TypeError("uint64 is not supported");
  } else
    throw new TypeError(`not a LONG type: ${H.onnx.TensorProto.DataType[e]}`);
  return i.toNumber();
}
function Hu(i, e, o) {
  switch (e) {
    case H.onnx.TensorProto.DataType.BOOL:
    case H.onnx.TensorProto.DataType.UINT8:
      return i.getUint8(o);
    case H.onnx.TensorProto.DataType.INT8:
      return i.getInt8(o);
    case H.onnx.TensorProto.DataType.UINT16:
      return i.getUint16(o, !0);
    case H.onnx.TensorProto.DataType.INT16:
      return i.getInt16(o, !0);
    case H.onnx.TensorProto.DataType.FLOAT:
      return i.getFloat32(o, !0);
    case H.onnx.TensorProto.DataType.INT32:
      return i.getInt32(o, !0);
    case H.onnx.TensorProto.DataType.UINT32:
      return i.getUint32(o, !0);
    case H.onnx.TensorProto.DataType.INT64:
      return ui(xe.fromBits(i.getUint32(o, !0), i.getUint32(o + 4, !0), !1), e);
    case H.onnx.TensorProto.DataType.DOUBLE:
      return i.getFloat64(o, !0);
    case H.onnx.TensorProto.DataType.UINT64:
      return ui(xe.fromBits(i.getUint32(o, !0), i.getUint32(o + 4, !0), !0), e);
    default:
      throw new Error(
        `cannot read from DataView for type ${H.onnx.TensorProto.DataType[e]}`
      );
  }
}
var qu,
  H,
  si,
  bt,
  We = O(() => {
    "use strict";
    qu = rr(Fs());
    qo();
    Pr();
    H = rr(sr());
    Y();
    (si = F.experimental.fbs),
      (bt = class i {
        constructor(e, o, t, r, n, s = qu.Guid.create()) {
          this.dims = e;
          this.type = o;
          this.dataProvider = t;
          this.asyncDataProvider = r;
          this.cache = n;
          this.dataId = s;
          this.size = B.validateDimsAndCalcSize(e);
          let a = this.size,
            u = t === void 0 && r === void 0 && n === void 0;
          if (n !== void 0 && n.length !== a)
            throw new RangeError("Input dims doesn't match data length.");
          if (o === "string") {
            if (
              n !== void 0 &&
              (!Array.isArray(n) || !n.every((l) => typeof l == "string"))
            )
              throw new TypeError("cache should be a string array");
            u && (this.cache = new Array(a));
          } else {
            if (n !== void 0) {
              let l = ju(o);
              if (!(n instanceof l))
                throw new TypeError(`cache should be type ${l.name}`);
            }
            if (u) {
              let l = new ArrayBuffer(a * hh(o));
              this.cache = mh(l, o);
            }
          }
        }
        get data() {
          if (this.cache === void 0) {
            let e = this.dataProvider(this.dataId);
            if (e.length !== this.size)
              throw new Error(
                "Length of data provided by the Data Provider is inconsistent with the dims of this Tensor."
              );
            this.cache = e;
          }
          return this.cache;
        }
        get stringData() {
          if (this.type !== "string")
            throw new TypeError("data type is not string");
          return this.data;
        }
        get integerData() {
          switch (this.type) {
            case "uint8":
            case "int8":
            case "uint16":
            case "int16":
            case "int32":
            case "uint32":
            case "bool":
              return this.data;
            default:
              throw new TypeError(
                "data type is not integer (uint8, int8, uint16, int16, int32, uint32, bool)"
              );
          }
        }
        get floatData() {
          switch (this.type) {
            case "float32":
            case "float64":
              return this.data;
            default:
              throw new TypeError("data type is not float (float32, float64)");
          }
        }
        get numberData() {
          if (this.type !== "string") return this.data;
          throw new TypeError("type cannot be non-number (string)");
        }
        get(e) {
          return this.data[B.indicesToOffset(e, this.strides)];
        }
        set(e, o) {
          this.data[B.indicesToOffset(e, this.strides)] = o;
        }
        async getData() {
          return (
            this.cache === void 0 &&
              (this.cache = await this.asyncDataProvider(this.dataId)),
            this.cache
          );
        }
        get strides() {
          return (
            this._strides || (this._strides = B.computeStrides(this.dims)),
            this._strides
          );
        }
        static fromProto(e) {
          if (!e)
            throw new Error("cannot construct Value from an empty tensor");
          let o = At.tensorDataTypeFromProto(e.dataType),
            t = At.tensorDimsFromProto(e.dims),
            r = new i(t, o);
          if (o === "string")
            e.stringData.forEach((n, s) => {
              r.data[s] = kr(n);
            });
          else if (
            e.rawData &&
            typeof e.rawData.byteLength == "number" &&
            e.rawData.byteLength > 0
          ) {
            let n = r.data,
              s = new DataView(
                e.rawData.buffer,
                e.rawData.byteOffset,
                e.rawData.byteLength
              ),
              a = Wu(e.dataType),
              u = e.rawData.byteLength / a;
            if (e.rawData.byteLength % a !== 0)
              throw new Error("invalid buffer length");
            if (n.length !== u) throw new Error("buffer length mismatch");
            for (let l = 0; l < u; l++) {
              let f = Hu(s, e.dataType, l * a);
              n[l] = f;
            }
          } else {
            let n;
            switch (e.dataType) {
              case H.onnx.TensorProto.DataType.FLOAT:
                n = e.floatData;
                break;
              case H.onnx.TensorProto.DataType.INT32:
              case H.onnx.TensorProto.DataType.INT16:
              case H.onnx.TensorProto.DataType.UINT16:
              case H.onnx.TensorProto.DataType.INT8:
              case H.onnx.TensorProto.DataType.UINT8:
              case H.onnx.TensorProto.DataType.BOOL:
                n = e.int32Data;
                break;
              case H.onnx.TensorProto.DataType.INT64:
                n = e.int64Data;
                break;
              case H.onnx.TensorProto.DataType.DOUBLE:
                n = e.doubleData;
                break;
              case H.onnx.TensorProto.DataType.UINT32:
              case H.onnx.TensorProto.DataType.UINT64:
                n = e.uint64Data;
                break;
              default:
                throw new Error("unspecific error");
            }
            if (n == null)
              throw new Error(
                "failed to populate data from a tensorproto value"
              );
            let s = r.data;
            if (s.length !== n.length) throw new Error("array length mismatch");
            for (let a = 0; a < n.length; a++) {
              let u = n[a];
              xe.isLong(u) ? (s[a] = ui(u, e.dataType)) : (s[a] = u);
            }
          }
          return r;
        }
        static fromData(e, o, t) {
          return new i(o, t, void 0, void 0, e);
        }
        static fromOrtTensor(e) {
          if (!e)
            throw new Error("cannot construct Value from an empty tensor");
          let o = At.tensorDimsFromORTFormat(e),
            t = At.tensorDataTypeFromProto(e.dataType()),
            r = new i(o, t);
          if (t === "string")
            for (let n = 0; n < e.stringDataLength(); n++)
              r.data[n] = e.stringData(n);
          else if (
            e.rawDataArray() &&
            typeof e.rawDataLength() == "number" &&
            e.rawDataLength() > 0
          ) {
            let n = r.data,
              s = new DataView(
                e.rawDataArray().buffer,
                e.rawDataArray().byteOffset,
                e.rawDataLength()
              ),
              a = Wu(e.dataType()),
              u = e.rawDataLength() / a;
            if (e.rawDataLength() % a !== 0)
              throw new Error("invalid buffer length");
            if (n.length !== u) throw new Error("buffer length mismatch");
            for (let l = 0; l < u; l++) {
              let f = Hu(s, e.dataType(), l * a);
              n[l] = f;
            }
          }
          return r;
        }
      });
  });
function G(i) {
  return i === 1 ? bh : gh;
}
function Xu(i) {
  let e = G(i);
  return `${e.version}
      precision highp float;
      ${e.attribute} vec3 position;
      ${e.attribute} vec2 textureCoord;

      ${e.varyingVertex} vec2 TexCoords;

      void main()
      {
          gl_Position = vec4(position, 1.0);
          TexCoords = textureCoord;
      }`;
}
function Ku(i) {
  let e = G(i);
  return `${e.version}
    precision highp float;
    precision highp int;
    precision highp sampler2D;
    ${e.varyingFrag} vec2 TexCoords;
    ${e.outputDeclaration}
    const vec2 halfCR = vec2(0.5, 0.5);

    // Custom vector types to handle higher dimenalities.
    struct ivec5
    {
      int x;
      int y;
      int z;
      int w;
      int u;
    };

    struct ivec6
    {
      int x;
      int y;
      int z;
      int w;
      int u;
      int v;
    };

    int imod(int x, int y) {
      return x - y * (x / y);
    }

    `;
}
function Ju(i, e) {
  let o = G(i);
  return `
  void main() {
    int indices[${e}];
    toVec(TexCoords, indices);
    vec4 result = vec4(process(indices));
    ${o.output} = result;
  }
  `;
}
var bh,
  gh,
  ut = O(() => {
    "use strict";
    (bh = {
      version: "",
      attribute: "attribute",
      varyingVertex: "varying",
      varyingFrag: "varying",
      texture2D: "texture2D",
      output: "gl_FragColor",
      outputDeclaration: "",
    }),
      (gh = {
        version: "#version 300 es",
        attribute: "in",
        varyingVertex: "out",
        varyingFrag: "in",
        texture2D: "texture",
        output: "outputColor",
        outputDeclaration: "out vec4 outputColor;",
      });
  });
var j = O(() => {
  "use strict";
});
async function li(i, e = (t) => 0, o) {
  return new Promise((t, r) => {
    let n = 0,
      s = () => {
        if (i()) {
          t();
          return;
        }
        n++;
        let a = e(n);
        if (o != null && n >= o) {
          r();
          return;
        }
        setTimeout(s, a);
      };
    s();
  });
}
function An(i) {
  return (
    ur(
      typeof i < "u" && i.length !== 0,
      () => "empty string found for sampler name"
    ),
    "get" + i.charAt(0).toUpperCase() + i.slice(1)
  );
}
function Yu(i) {
  return (
    ur(
      typeof i < "u" && i.length !== 0,
      () => "empty string found for sampler name"
    ),
    "get" + i.charAt(0).toUpperCase() + i.slice(1) + "AtOutCoords"
  );
}
function lr(i, e) {
  let o = JSON.parse(JSON.stringify(i));
  return (o = e), o;
}
function fr(i, e) {
  return e.map((o) => i[o]).join(", ");
}
function Bt(i) {
  if (i <= 1) return "int";
  if (i === 2) return "ivec2";
  if (i === 3) return "ivec3";
  if (i === 4) return "ivec4";
  if (i === 5) return "ivec5";
  if (i === 6) return "ivec6";
  throw Error(`GPU for rank ${i} is not yet supported`);
}
function ne(i = 6) {
  return ["x", "y", "z", "w", "u", "v"].slice(0, i);
}
var pe = O(() => {
  "use strict";
  Y();
});
function yh(i, e) {
  return ne(e).map((o) => `${i}.${o}`);
}
function cr(i, e) {
  return e === 1 ? [i] : yh(i, e);
}
function de() {
  return `
    float getChannel(vec4 frag, int dim) {
      int modCoord = imod(dim, 2);
      return modCoord == 0 ? frag.r : frag.g;
    }

    float getChannel(vec4 frag, vec2 innerDims) {
      vec2 modCoord = mod(innerDims, 2.);
      return modCoord.x == 0. ?
        (modCoord.y == 0. ? frag.r : frag.g) :
        (modCoord.y == 0. ? frag.b : frag.a);
    }
  `;
}
var He = O(() => {
  "use strict";
  pe();
});
function Th(i, e, o) {
  if (i === 0) return "false";
  if (i === 1) return `rc > ${e[0]}`;
  let t = "";
  for (let r = i - 2; r < i; r++)
    (t += `${o[r]} >= ${e[r - i + 2]}`), r < i - 1 && (t += "||");
  return t;
}
function wh(i, e) {
  let o = i.length;
  if (o === 0) return "getA(), 0, 0, 0";
  if (o === 1)
    return `getA(rc),
            rc + 1 >= ${i[0]} ? 0. : getA(rc + 1),
            0, 0`;
  let t = "r, c",
    r = "r, cp1",
    n = "rp1, c",
    s = "rp1, cp1",
    a = "";
  if (o > 2) for (let u = 0; u < o - 2; ++u) a = a + `${e[u]},`;
  return `getA(${a}${t}),
          rEdge ? 0. : getA(${a}${n}),
          cEdge ? 0. : getA(${a}${r}),
          rEdge || cEdge ? 0. : getA(${a}${s})`;
}
function vh(i, e, o, t) {
  return i === 0 || i === 1
    ? ""
    : `
    int r = ${e[i - 2]};
    int c = ${e[i - 1]};
    int rp1 = ${e[i - 2]} + 1;
    int cp1 = ${e[i - 1]} + 1;
    bool rEdge = rp1 >= ${t};
    bool cEdge = cp1 >= ${o};
    `;
}
var Zu,
  xh,
  Qu,
  tl = O(() => {
    "use strict";
    ut();
    j();
    pe();
    He();
    (Zu = { name: "pack", inputNames: ["A"], inputTypes: [1] }),
      (xh = (i, e) => {
        let o = G(i.session.backend.glContext.version),
          t = e.dims,
          r = t.length,
          n = e.dims.length,
          s = Bt(n),
          a = cr("rc", n),
          u = vh(n, a, t[t.length - 2], t[t.length - 1]),
          l;
        r === 0
          ? (l = [1, 1])
          : r === 1
          ? (l = [t[0], 1])
          : (l = [t[n - 1], t[n - 2]]);
        let f = Th(n, l, a),
          p = wh(t, a),
          d = `
        void main() {
          ${s} rc = getOutputCoords();

          if(${f}) {
            ${o.output} = vec4(0);
          } else {
            ${u}

            ${o.output} = vec4(${p});
          }
        }
      `;
        return {
          ...Zu,
          hasMain: !0,
          output: { dims: e.dims, type: e.type, textureType: 2 },
          shaderSource: d,
        };
      }),
      (Qu = (i, e) => ({ ...Zu, get: () => xh(i, e) }));
  });
function fi(i) {
  if (i.length === 0) return [1, 1, 1];
  let e = 1;
  for (let o = 0; o < i.length - 2; ++o) e *= i[o];
  return [e, i.length > 1 ? i[i.length - 2] : 1, i[i.length - 1]];
}
function rl(i, e) {
  let o = !1;
  return (
    i.length === 0 || e.length === 0
      ? (o = !0)
      : i.length < 2 || e.length < 2
      ? (o = i[i.length - 1] === e[e.length - 1])
      : (o =
          i[i.length - 1] === e[e.length - 1] &&
          i[i.length - 2] === e[e.length - 2]),
    o
  );
}
function Oh(i) {
  let e = B.computeStrides(i),
    o = ["b", "r", "c"],
    t = "index";
  return `
    ivec3 inputCoordsFromReshapedOutCoords(int index) {
      ${e
        .map((n, s) => {
          let a = `int ${o[s]} = ${t} / ${n}`,
            u =
              s === e.length - 1
                ? `int ${o[s + 1]} = ${t} - ${o[s]} * ${n}`
                : `index -= ${o[s]} * ${n}`;
          return `${a}; ${u};`;
        })
        .join("")}
      return ivec3(b, r, c);
    }
  `;
}
function Sh(i) {
  let e = B.computeStrides(i);
  return `
  int getFlattenedIndex(ivec3 coords) {
    // reverse y, z order
    return coords.x * ${e[0]} + coords.z * ${e[1]} + coords.y;
  }
`;
}
var Ih,
  _h,
  el,
  nl = O(() => {
    "use strict";
    Y();
    ut();
    j();
    He();
    (Ih = (i) => ({
      name: "Reshape (packed)",
      inputTypes: [2],
      inputNames: ["A"],
      cacheHint: `${i}`,
    })),
      (_h = (i, e, o, t) => {
        let r = e.dims,
          n = t,
          s = "";
        for (let l = 0; l < 4; l++) {
          let f = "";
          switch (l) {
            case 0:
              f = "outputCoords = rc;";
              break;
            case 1:
              f = "outputCoords = ivec3(rc.x, rc.y+1, rc.z);";
              break;
            case 2:
              f = "outputCoords = ivec3(rc.x, rc.y, rc.z+1);";
              break;
            case 3:
              f = "outputCoords = ivec3(rc.x, rc.y+1, rc.z+1);";
              break;
            default:
              throw new Error();
          }
          s += `
        ${f}
        ${l > 0 ? "if(outputCoords.y < rows && outputCoords.z < cols){" : ""}
          int flattenedIndex = getFlattenedIndex(outputCoords);

          ivec3 inputRC = inputCoordsFromReshapedOutCoords(flattenedIndex);
          vec2 innerDims = vec2(float(inputRC.y),float(inputRC.z));

          result[${l}] = getChannel(getA(inputRC.x, inputRC.y, inputRC.z), innerDims);

        ${l > 0 ? "}" : ""}
      `;
        }
        let a = G(i.session.backend.glContext.version),
          u = `
      ${Oh(r)}
      ${Sh(n)}
      ${de()}

      void main() {
        ivec3 rc = getOutputCoords();

        vec4 result = vec4(0.0);

        ivec3 outputCoords;
        int rows = ${n[2]};
        int cols = ${n[1]};

        ${s}
        ${a.output} = result;
      }
    `;
        return {
          ...o,
          output: { dims: n, type: e.type, textureType: 2 },
          shaderSource: u,
          hasMain: !0,
        };
      }),
      (el = (i, e, o) => {
        let t = Ih(o);
        return { ...t, get: () => _h(i, e, t, o) };
      });
  });
var ci,
  ol = O(() => {
    "use strict";
    ut();
    j();
    ci = (i, e) => {
      let o = e.shape,
        t = G(i.session.backend.glContext.version),
        r = `
    const float FLOAT_MAX = 1.70141184e38;
    const float FLOAT_MIN = 1.17549435e-38;

    bool isNaN(float val) {
      return (val < 1.0 || 0.0 < val || val == 0.0) ? false : true;
    }

    highp vec4 encodeAsUint8(highp float v) {
      if (isNaN(v)) {
        return vec4(255, 255, 255, 255);
      }

      highp float av = abs(v);

      if(av < FLOAT_MIN) {
        return vec4(0.0, 0.0, 0.0, 0.0);
      } else if(v > FLOAT_MAX) {
        return vec4(0.0, 0.0, 128.0, 127.0) / 255.0;
      } else if(v < -FLOAT_MAX) {
        return vec4(0.0, 0.0,  128.0, 255.0) / 255.0;
      }

      highp vec4 c = vec4(0,0,0,0);

      highp float e = floor(log2(av));
      highp float m = exp2(fract(log2(av))) - 1.0;

      c[2] = floor(128.0 * m);
      m -= c[2] / 128.0;
      c[1] = floor(32768.0 * m);
      m -= c[1] / 32768.0;
      c[0] = floor(8388608.0 * m);

      highp float ebias = e + 127.0;
      c[3] = floor(ebias / 2.0);
      ebias -= c[3] * 2.0;
      c[2] += floor(ebias) * 128.0;

      c[3] += 128.0 * step(0.0, -v);

      return c / 255.0;
    }

    void main() {
      float value = ${t.texture2D}(X,TexCoords).r;
      ${t.output} = encodeAsUint8(value);
    }`,
        n = {
          name: "Uint8Encode",
          inputTypes: [0],
          inputNames: ["X"],
          output: { dims: o, type: e.tensor.type, textureType: 3 },
          shaderSource: r,
          hasMain: !0,
        };
      return i.executeProgram(n, [e.tensor]);
    };
  });
function Ph(i, e) {
  if (i === 1) return "rc";
  let o = "";
  for (let t = 0; t < i; t++) (o += e[t]), t < i - 1 && (o += ",");
  return o;
}
var il,
  Ah,
  al,
  sl = O(() => {
    "use strict";
    ut();
    j();
    pe();
    He();
    (il = { name: "unpack", inputNames: ["A"], inputTypes: [2] }),
      (Ah = (i, e) => {
        let o = e.dims.length,
          t = cr("rc", o),
          r = t.slice(-2),
          n = Bt(o),
          s = de(),
          u = e.dims.length === 0 ? "" : Ph(o, t),
          l = o <= 1 ? "rc" : `vec2(${r.join(",")})`,
          f = G(i.session.backend.glContext.version),
          p = `
    ${s}
    void main() {
      ${n} rc = getOutputCoords();

       // Sample the texture with the coords to get the rgba channel value.
       vec4 packedInput = getA(${u});

       ${f.output} = vec4(getChannel(packedInput, ${l}), 0, 0, 0);
     }
   `;
        return {
          ...il,
          hasMain: !0,
          output: { dims: e.dims, type: e.type, textureType: 0 },
          shaderSource: p,
        };
      }),
      (al = (i, e) => ({ ...il, get: () => Ah(i, e) }));
  });
var Pn,
  Br,
  En,
  Fr = O(() => {
    "use strict";
    Ut();
    (Pn = class {
      constructor(e, o = 1) {
        if (o === 1)
          (this.internalFormat = e.R32F),
            (this.format = e.RED),
            (this.textureType = e.FLOAT),
            (this.channelSize = o);
        else if (o === 4)
          (this.internalFormat = e.RGBA32F),
            (this.format = e.RGBA),
            (this.textureType = e.FLOAT),
            (this.channelSize = o);
        else throw new Error(`Invalid number of channels: ${o}`);
      }
      encode(e, o) {
        let t, r;
        return (
          e.constructor !== Float32Array &&
            (tt.warning(
              "Encoder",
              "data was not of type Float32; creating new Float32Array"
            ),
            (r = new Float32Array(e))),
          o * this.channelSize > e.length
            ? (tt.warning(
                "Encoder",
                "Source data too small. Allocating larger array"
              ),
              (r = e),
              (t = this.allocate(o * this.channelSize)),
              r.forEach((n, s) => (t[s] = n)))
            : ((r = e), (t = r)),
          t
        );
      }
      allocate(e) {
        return new Float32Array(e * 4);
      }
      decode(e, o) {
        return this.channelSize === 1
          ? e.filter((r, n) => n % 4 === 0).subarray(0, o)
          : e.subarray(0, o);
      }
    }),
      (Br = class {
        constructor(e, o = 1, t) {
          if (o !== 1 && o !== 4)
            throw new Error(`Invalid number of channels: ${o}`);
          (this.internalFormat = e.RGBA),
            (this.format = e.RGBA),
            (this.channelSize = o),
            (this.textureType = t || e.FLOAT);
        }
        encode(e, o) {
          let t = e;
          return (
            this.channelSize === 1 &&
              (tt.verbose("Encoder", "Exploding into a larger array"),
              (t = this.allocate(o)),
              e.forEach((r, n) => (t[n * 4] = r))),
            t
          );
        }
        allocate(e) {
          return new Float32Array(e * 4);
        }
        decode(e, o) {
          return this.channelSize === 1
            ? e.filter((r, n) => n % 4 === 0).subarray(0, o)
            : e.subarray(0, o);
        }
      }),
      (En = class {
        constructor(e, o = 1) {
          this.channelSize = 4;
          if (o === 1)
            (this.internalFormat = e.ALPHA),
              (this.format = e.ALPHA),
              (this.textureType = e.UNSIGNED_BYTE),
              (this.channelSize = o);
          else if (o === 4)
            (this.internalFormat = e.RGBA),
              (this.format = e.RGBA),
              (this.textureType = e.UNSIGNED_BYTE),
              (this.channelSize = o);
          else throw new Error(`Invalid number of channels: ${o}`);
        }
        encode(e, o) {
          return new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
        }
        allocate(e) {
          return new Uint8Array(e * this.channelSize);
        }
        decode(e, o) {
          if (e instanceof Uint8Array) return e.subarray(0, o);
          throw new Error(`Invalid array type: ${e.constructor}`);
        }
      });
  });
var Cr,
  ul,
  pi,
  ll = O(() => {
    "use strict";
    Y();
    j();
    (Cr = (i, e, o) => {
      let t = o === 0 || o === 1 ? 1 : 4,
        r = o === 2,
        n = o === 1 || o === 2,
        s = o === 4 ? e.length - 1 : void 0,
        a =
          o === 4 ? e.map((u, l) => (l === e.length - 1 ? u * 4 : u)) : void 0;
      return pi(i, e, t, a, { isPacked: r, reverseWH: n, breakAxis: s });
    }),
      (ul = (i, e, o) => {
        let t = Cr(i, e, o);
        return [t.width, t.height];
      }),
      (pi = (i, e, o = 1, t, r) => {
        let n = !!(r && r.isPacked),
          [s, a] = i.computeTextureWH((n && t) || e, r),
          u = e.length,
          l = e.slice(0);
        if ((u === 0 && (l = [1]), o === 1)) t = e;
        else if (n) {
          if (o !== 4) throw new Error("a packed texture must be 4-channel");
          (t = e),
            u > 0 && (l[u - 1] = Math.ceil(l[u - 1] / 2)),
            u > 1 && (l[u - 2] = Math.ceil(l[u - 2] / 2));
        } else if (!t)
          throw new Error("Unpacked shape is needed when using channels > 1");
        return {
          width: s,
          height: a,
          channels: o,
          isPacked: n,
          shape: l,
          strides: B.computeStrides(l),
          unpackedShape: t,
          reversedWH: r && r.reverseWH,
        };
      });
  });
var Dh,
  Dn,
  cl = O(() => {
    "use strict";
    Ut();
    We();
    Y();
    tl();
    nl();
    ol();
    sl();
    Fr();
    ll();
    j();
    (Dh = (i, e) => {
      let o = e
          .map((r) => `${r.unpackedShape.join(",")};${r.width}x${r.height}`)
          .join("_"),
        t = i.name;
      return i.cacheHint && (t += "[" + i.cacheHint + "]"), (t += ":" + o), t;
    }),
      (Dn = class {
        constructor(e) {
          this.session = e;
          (this.packedTextureDataCache = new Map()),
            (this.unpackedTextureDataCache = new Map());
        }
        calculateTextureWidthAndHeight(e, o) {
          return ul(this.session.layoutStrategy, e, o);
        }
        executeProgram(e, o) {
          if (o.length < e.inputNames.length)
            throw new Error(
              `Input size mustn't be less than ${e.inputNames.length}.`
            );
          if (e.inputNames.length !== e.inputTypes.length)
            throw new Error("input names size does not match input types");
          let t = [];
          for (let l = 0; l < e.inputNames.length; ++l)
            t[l] = this.getOrCreateTextureData(o[l], e.inputTypes[l]);
          let r = Dh(e, t),
            n = this.session.programManager.getArtifact(r),
            s = n ? n.programInfo : typeof e.get == "function" ? e.get() : e,
            a = Cr(
              this.session.layoutStrategy,
              s.output.dims,
              s.output.textureType
            ),
            u = this.createTextureData(a, s.output.type);
          return (
            n ||
              ((n = this.session.programManager.build(s, t, u)),
              this.session.programManager.setArtifact(r, n)),
            this.runProgram(n, t, u),
            u
          );
        }
        run(e, o) {
          return this.executeProgram(e, o).tensor;
        }
        runProgram(e, o, t) {
          for (let r = 0; r < o.length; ++r)
            if (!!o[r].isPacked != (e.programInfo.inputTypes[r] === 2))
              throw new Error(`input[${r}] property packed inconsistent`);
          if (!!t.isPacked != (e.programInfo.output.textureType === 2))
            throw new Error("output property packed inconsistent");
          this.session.programManager.run(e, o, t);
        }
        getOrCreateTextureData(e, o) {
          let t = this.getTextureData(e.dataId, o === 2);
          if (!t && ((t = this.getTextureData(e.dataId, o !== 2)), t))
            return o === 2 ? this.pack(t) : this.unpack(t);
          if (!t) {
            let r = Cr(this.session.layoutStrategy, e.dims, o);
            if (o === 4) {
              let a = e.dims;
              if (a.length === 4) {
                let u = [a[0], Math.ceil((a[1] * a[2] * a[3]) / 4)],
                  l = Cr(this.session.layoutStrategy, u, o),
                  f = e.numberData;
                if ((a[1] * a[2] * a[3]) % 4 !== 0) {
                  let p = a[0],
                    d = a[1] * a[2] * a[3],
                    y = Math.ceil((d * 1) / 4) * 4,
                    T = p * y;
                  f = new Float32Array(T);
                  for (let v = 0; v < p; ++v) {
                    let S = v * d,
                      L = v * y + (v % 1) * d;
                    f.set(e.numberData.subarray(S, S + d), L);
                  }
                }
                return this.createTextureData(l, e.type, f, e, 1);
              }
            }
            if (o === 2) {
              let n = pi(this.session.layoutStrategy, e.dims, 1, [], {
                  reverseWH: !0,
                }),
                s = this.createTextureData(n, e.type, e.numberData, e, 1);
              t = this.pack(s);
            } else t = this.createTextureData(r, e.type, e.numberData, e, 1);
          }
          return t;
        }
        createTextureDataFromLayoutBindTensor(e, o, t, r) {
          return this.createTextureData(e, o, t, r, 1);
        }
        createTextureData(e, o, t, r, n) {
          tt.verbose(
            "InferenceHandler",
            `Creating TextureData: layout:[${JSON.stringify(e)}]`
          );
          let s = this.session.textureManager.createTextureFromLayout(
            o,
            e,
            t,
            n
          );
          return this.createTextureDataFromTexture(e, o, s, r);
        }
        reshapeUnpacked(e, o) {
          let t = this.getOrCreateTextureData(e, 0),
            r = {
              channels: t.channels,
              height: t.height,
              width: t.width,
              shape: o.length !== 0 ? o : [1],
              strides: B.computeStrides(o),
              unpackedShape: o,
            };
          return this.createTextureDataFromTexture(r, e.type, t.texture).tensor;
        }
        reshapePacked(e, o) {
          let t = this.getOrCreateTextureData(e, 2);
          if (rl(e.dims, o)) {
            let l = {
              channels: t.channels,
              height: t.height,
              width: t.width,
              shape: o.length !== 0 ? o : [1],
              strides: B.computeStrides(o),
              unpackedShape: o,
              isPacked: !0,
            };
            return this.createTextureDataFromTexture(l, e.type, t.texture)
              .tensor;
          }
          let r = fi(e.dims),
            n = fi(o),
            s = this.reshapePacked(e, r),
            a = this.run(el(this, s, n), [s]);
          return this.reshapePacked(a, o);
        }
        cast(e, o) {
          let t = this.getOrCreateTextureData(e, 0);
          return this.createTextureDataFromTexture(t, o, t.texture).tensor;
        }
        createTextureDataFromTexture(e, o, t, r, n) {
          let s = {
            ...e,
            tensor:
              r ||
              new bt(
                e.unpackedShape,
                o,
                (a) => this.readTexture(s),
                async (a) => this.readTextureAsync(s),
                void 0,
                n
              ),
            texture: t,
          };
          return this.setTextureData(s.tensor.dataId, s, e.isPacked), s;
        }
        getTextureData(e, o = !1) {
          return this.session.isInitializer(e)
            ? this.session.getTextureData(e, o)
            : o
            ? this.packedTextureDataCache.get(e)
            : this.unpackedTextureDataCache.get(e);
        }
        setTextureData(e, o, t = !1) {
          this.session.isInitializer(e)
            ? this.session.setTextureData(e, o, t)
            : (t
                ? this.packedTextureDataCache
                : this.unpackedTextureDataCache
              ).set(e, o);
        }
        isTextureLayoutCached(e, o = !1) {
          return !!this.getTextureData(e.dataId, o);
        }
        dispose() {
          this.session.textureManager.clearActiveTextures(),
            this.packedTextureDataCache.forEach((e) =>
              this.session.textureManager.releaseTexture(e)
            ),
            (this.packedTextureDataCache = new Map()),
            this.unpackedTextureDataCache.forEach((e) =>
              this.session.textureManager.releaseTexture(e)
            ),
            (this.unpackedTextureDataCache = new Map());
        }
        readTexture(e) {
          return e.isPacked
            ? this.readTexture(this.unpack(e))
            : this.session.backend.glContext.isFloat32DownloadSupported
            ? this.session.textureManager.readTexture(
                e,
                e.tensor.type,
                e.channels
              )
            : this.session.textureManager.readUint8TextureAsFloat(ci(this, e));
        }
        async readTextureAsync(e) {
          return e.isPacked
            ? this.readTextureAsync(this.unpack(e))
            : this.session.backend.glContext.isFloat32DownloadSupported
            ? this.session.textureManager.readTextureAsync(
                e,
                e.tensor.type,
                e.channels
              )
            : this.session.textureManager.readUint8TextureAsFloat(ci(this, e));
        }
        pack(e) {
          return this.executeProgram(Qu(this, e.tensor), [e.tensor]);
        }
        unpack(e) {
          return this.executeProgram(al(this, e.tensor), [e.tensor]);
        }
      });
  });
var di,
  W,
  It = O(() => {
    "use strict";
    (di = class {
      constructor(e) {
        Object.assign(this, e);
      }
      get cacheKey() {
        return (
          this.key ||
            (this.key = Object.getOwnPropertyNames(this)
              .sort()
              .map((e) => `${this[e]}`)
              .join(";")),
          this.key
        );
      }
    }),
      (W = (i) => new di(i));
  });
var pl,
  dl,
  hl,
  Lh,
  $h,
  ml = O(() => {
    "use strict";
    It();
    ut();
    j();
    (pl = {
      name: "BatchNormalization",
      inputNames: ["A", "Scale", "B", "Mean", "Variance"],
      inputTypes: [0, 0, 0, 0, 0],
    }),
      (dl = (i, e, o) => (
        $h(e),
        [i.run({ ...pl, cacheHint: o.cacheKey, get: () => Lh(i, e, o) }, e)]
      )),
      (hl = (i) => {
        let e = i.attributes.getFloat("epsilon", 1e-5),
          o = i.attributes.getFloat("momentum", 0.9),
          t = i.attributes.getInt("spatial", 1);
        return W({ epsilon: e, momentum: o, spatial: t });
      }),
      (Lh = (i, e, o) => {
        let t = G(i.session.backend.glContext.version),
          r = e[0].dims.length,
          [n, s] = i.calculateTextureWidthAndHeight(e[1].dims, 0),
          a = `
  float process(int[${r}] indices) {
    vec2 position = offsetToCoords(indices[1], ${n}, ${s});
    float scale = getColorAsFloat(${t.texture2D}(Scale, position));
    float mean = getColorAsFloat(${t.texture2D}(Mean, position));
    float variance = getColorAsFloat(${t.texture2D}(Variance, position));
    float b = getColorAsFloat(${t.texture2D}(B, position));

    return scale * ( (_A(indices) - mean) / sqrt(variance + float(${o.epsilon})) ) + b;
  }`;
        return {
          ...pl,
          output: { dims: e[0].dims, type: e[0].type, textureType: 0 },
          shaderSource: a,
        };
      }),
      ($h = (i) => {
        if (!i || i.length !== 5)
          throw new Error("BatchNormalization requires 5 inputs.");
        let e = i[0],
          o = i[1],
          t = i[2],
          r = i[3],
          n = i[4];
        if (
          e.dims.length < 3 ||
          o.dims.length !== 1 ||
          t.dims.length !== 1 ||
          r.dims.length !== 1 ||
          n.dims.length !== 1
        )
          throw new Error("invalid input shape.");
        if (
          o.dims[0] !== e.dims[1] ||
          t.dims[0] !== e.dims[1] ||
          r.dims[0] !== e.dims[1] ||
          n.dims[0] !== e.dims[1]
        )
          throw new Error("invalid input shape.");
        if (
          (e.type !== "float32" && e.type !== "float64") ||
          (o.type !== "float32" && o.type !== "float64") ||
          (t.type !== "float32" && t.type !== "float64") ||
          (r.type !== "float32" && r.type !== "float64") ||
          (n.type !== "float32" && n.type !== "float64")
        )
          throw new Error("invalid input tensor types.");
      });
  });
var Ln,
  Ht,
  k,
  Nr,
  $n,
  Te = O(() => {
    "use strict";
    (Ln = class {
      constructor(e, o, t, r) {
        this.glContext = e;
        this.programInfo = o;
        this.inputTextureLayouts = t;
        this.outputTextureLayout = r;
      }
    }),
      (Ht = class {
        constructor(e) {
          this.context = e;
        }
      }),
      (k = class {
        constructor(e, o) {
          this.routineBody = e;
          this.dependencies = o;
        }
      }),
      (Nr = class {
        constructor(e, o, t) {
          this.name = e;
          t ? (this.dependencies = t) : (this.dependencies = []),
            o && (this.routineBody = o);
        }
        addDependency(e) {
          e && this.dependencies.push(e);
        }
      }),
      ($n = class {
        static returnOrderedNodes(e) {
          if (!e || e.length === 0) return [];
          if (e.length === 1) return e;
          let o = new Set(),
            t = new Set(),
            r = new Array();
          return this.createOrderedNodes(e, o, t, r), r;
        }
        static createOrderedNodes(e, o, t, r) {
          for (let n = 0; n < e.length; ++n) this.dfsTraverse(e[n], o, t, r);
        }
        static dfsTraverse(e, o, t, r) {
          if (!e || t.has(e.name)) return;
          if (o.has(e.name))
            throw new Error(
              "Cyclic dependency detected. Can't topologically sort routines needed for shader."
            );
          o.add(e.name);
          let n = e.dependencies;
          if (n && n.length > 0)
            for (let s = 0; s < n.length; ++s) this.dfsTraverse(n[s], o, t, r);
          r.push(e), t.add(e.name), o.delete(e.name);
        }
      });
  });
function Bh() {
  let i = "add_";
  return {
    body: `
  float ${i}(float a, float b) {
    return a + b;
  }
  vec4 ${i}(vec4 v1, vec4 v2) {
    return v1 + v2;
  }
  `,
    name: i,
    type: 0,
  };
}
function Fh() {
  let i = "div_";
  return {
    body: `
  float ${i}(float a, float b) {
    return a / b;
  }
  vec4 ${i}(vec4 v1, vec4 v2) {
    return v1 / v2;
  }
  `,
    name: i,
    type: 0,
  };
}
function Ch() {
  let i = "mul_";
  return {
    body: `
  float ${i}(float a, float b) {
    return a * b;
  }
  vec4 ${i}(vec4 v1, vec4 v2) {
    return v1 * v2;
  }
  `,
    name: i,
    type: 0,
  };
}
function Nh() {
  let i = "sub_";
  return {
    body: `
  float ${i}(float a, float b) {
    return a - b;
  }
  vec4 ${i}(vec4 v1, vec4 v2) {
    return v1 - v2;
  }
  `,
    name: i,
    type: 0,
  };
}
function Rh() {
  let i = "equal_";
  return {
    body: `
  float ${i}(float a, float b) {
    return float(a == b);
  }
  vec4 ${i}(vec4 v1, vec4 v2) {
    return vec4(equal(v1, v2));
  }
  `,
    name: i,
    type: 0,
  };
}
function Gh() {
  let i = "greater_";
  return {
    body: `
  float ${i}(float a, float b) {
    return float(a > b);
  }
  vec4 ${i}(vec4 v1, vec4 v2) {
    return vec4( v1.r > v2.r ,
      v1.g > v2.g,
      v1.b > v2.b,
      v1.a > v2.a );
  }
  `,
    name: i,
    type: 0,
  };
}
function Mh() {
  let i = "less_";
  return {
    body: `
  float ${i}(float a, float b) {
    return float(a < b);
  }
  vec4 ${i}(vec4 v1, vec4 v2) {
    return vec4( v1.r < v2.r ,
                v1.g < v2.g,
                v1.b < v2.b,
                v1.a < v2.a );
  }
  `,
    name: i,
    type: 0,
  };
}
function Uh() {
  let i = "and_";
  return {
    body: `
  float ${i}(float a, float b) {
    return float( bool(a) && bool(b) );
  }
  vec4 ${i}(vec4 v1, vec4 v2) {
    bvec4 b1 = bvec4(v1);
    bvec4 b2 = bvec4(v2);
    return vec4( b1.r && b2.r ,
                b1.g && b2.g,
                b1.b && b2.b,
                b1.a && b2.a );
  }
  `,
    name: i,
    type: 0,
  };
}
function Vh() {
  let i = "or_";
  return {
    body: `
  float ${i}(float a, float b) {
    return float( bool(a) || bool(b) );
  }
  vec4 ${i}(vec4 v1, vec4 v2) {
    bvec4 b1 = bvec4(v1);
    bvec4 b2 = bvec4(v2);
    return vec4( b1.r || b2.r ,
                b1.g || b2.g,
                b1.b || b2.b,
                b1.a || b2.a );
  }
  `,
    name: i,
    type: 0,
  };
}
function zh() {
  let i = "xor_";
  return {
    body: `
  float ${i}(float a, float b) {
    return float( bool(a) ^^ bool(b) );
  }
  vec4 ${i}(vec4 v1, vec4 v2) {
    bvec4 b1 = bvec4(v1);
    bvec4 b2 = bvec4(v2);
    return vec4( b1.r ^^ b2.r ,
                b1.g ^^ b2.g,
                b1.b ^^ b2.b,
                b1.a ^^ b2.a );
  }
  `,
    name: i,
    type: 0,
  };
}
function Wh() {
  return qh("pow");
}
function Hh() {
  let i = "prelu_";
  return {
    body: `
  float ${i}(float a, float b) {
    return a < 0.0 ? a * b: a;
  }
  vec4 ${i}(vec4 v1, vec4 v2) {
    return vec4(
      v1.r < 0.0 ? v1.r * v2.r: v1.r,
      v1.g < 0.0 ? v1.g * v2.g: v1.g,
      v1.b < 0.0 ? v1.b * v2.b: v1.b,
      v1.a < 0.0 ? v1.a * v2.a: v1.a
      );
  }
  `,
    name: i,
    type: 0,
  };
}
function qh(i) {
  let e = `${i}_`;
  return {
    body: `
  float ${e}(float a, float b) {
    return ${i}(a, b);
  }
  vec4 ${e}(vec4 v1, vec4 v2) {
    return ${i}(v1, v2);
  }
  `,
    name: e,
    type: 0,
  };
}
var qt,
  jh,
  bl,
  gl,
  yl,
  xl,
  Tl,
  wl,
  vl,
  Il,
  _l,
  Ol,
  Sl,
  Al,
  Pl = O(() => {
    "use strict";
    Y();
    Te();
    ut();
    j();
    (qt = (i, e, o, t = e[0].type, r) => {
      let n = i.session.pack ? 2 : 0;
      return {
        name: o.name,
        inputNames: ["A", "B"],
        inputTypes: [n, n],
        cacheHint: r,
        get: () => jh(i, e, o, t),
      };
    }),
      (jh = (i, e, o, t = e[0].type) => {
        let r = i.session.pack ? 2 : 0,
          n = !B.areEqual(e[0].dims, e[1].dims),
          s = e[0].dims,
          a = i.session.pack;
        if (n) {
          let f = kt.calcShape(e[0].dims, e[1].dims, !1);
          if (!f)
            throw new Error("Can't perform binary op on the given tensors");
          s = f;
          let p = s.length,
            d = e[0].dims.length !== 0 ? e[0].dims.length : 1,
            y = e[1].dims.length !== 0 ? e[1].dims.length : 1,
            T =
              e[0].dims.length !== 0
                ? "bcastIndices_A(indices, aindices);"
                : "aindices[0] = 0;",
            v =
              e[1].dims.length !== 0
                ? "bcastIndices_B(indices, bindices);"
                : "bindices[0] = 0;",
            S = G(i.session.backend.glContext.version),
            L = a
              ? `
      ${o.body}
      void main() {
        vec4 a = getAAtOutCoords();
        vec4 b = getBAtOutCoords();
        vec4 result = ${o.name}(a, b);
        ${S.output} = result;
      }`
              : `
      ${o.body}
      float process(int indices[${p}]) {
        int aindices[${d}];
        int bindices[${y}];
        ${T}
        ${v}
        return ${o.name}(_A(aindices), _B(bindices));
      }`;
          return {
            name: o.name,
            inputNames: ["A", "B"],
            inputTypes: [r, r],
            output: { dims: s, type: t, textureType: r },
            shaderSource: L,
            hasMain: a,
          };
        }
        let u = G(i.session.backend.glContext.version),
          l = `
    ${o.body}
    void main() {
      vec4 v1 = ${u.texture2D}(A, TexCoords);
      vec4 v2 = ${u.texture2D}(B, TexCoords);
      vec4 result = ${o.name}(v1, v2);
      ${u.output} = result;
    }
    `;
        return {
          name: o.name,
          inputNames: ["A", "B"],
          inputTypes: [r, r],
          output: { dims: e[0].dims, type: t, textureType: r },
          shaderSource: l,
          hasMain: !0,
        };
      }),
      (bl = (i, e) => [i.run(qt(i, e, Bh()), e)]),
      (gl = (i, e) => [i.run(qt(i, e, Uh(), "bool"), e)]),
      (yl = (i, e) => [i.run(qt(i, e, Fh()), e)]),
      (xl = (i, e) => [i.run(qt(i, e, Rh(), "bool"), e)]),
      (Tl = (i, e) => [i.run(qt(i, e, Gh(), "bool"), e)]),
      (wl = (i, e) => [i.run(qt(i, e, Mh(), "bool"), e)]),
      (vl = (i, e) => [i.run(qt(i, e, Ch()), e)]),
      (Il = (i, e) => [i.run(qt(i, e, Vh(), "bool"), e)]),
      (_l = (i, e) => [i.run(qt(i, e, Wh()), e)]),
      (Ol = (i, e) => [i.run(qt(i, e, Hh()), e)]),
      (Sl = (i, e) => [i.run(qt(i, e, Nh()), e)]),
      (Al = (i, e) => [i.run(qt(i, e, zh(), "bool"), e)]);
  });
var El,
  Dl,
  Kh,
  Ll = O(() => {
    "use strict";
    Y();
    (El = (i, e, o) => (Kh(e), [i.cast(e[0], o)])),
      (Dl = (i) => At.tensorDataTypeFromProto(i.attributes.getInt("to"))),
      (Kh = (i) => {
        if (!i || i.length !== 1) throw new Error("Cast requires 1 input.");
        if (i[0].type === "string") throw new Error("Invalid input type.");
      });
  });
var Jh,
  Yh,
  $l,
  kn,
  kl = O(() => {
    "use strict";
    ut();
    j();
    pe();
    He();
    (Jh = (i, e) => ({
      name: "Concat (packed)",
      inputNames: Array.from({ length: i }, (o, t) => `X${t}`),
      inputTypes: Array(i).fill(2),
      cacheHint: e,
    })),
      (Yh = (i, e, o, t) => {
        let r = o[0].dims.slice();
        if (t >= r.length || t < -1 * r.length)
          throw new Error(
            "axis specified for concat doesn't match input dimensionality"
          );
        t < 0 && (t = r.length + t);
        let n = r.slice(0);
        for (let V = 1; V < o.length; V++) {
          let lt = o[V].dims.slice();
          for (let wt = 0; wt < r.length; wt++)
            if (wt === t) n[t] += lt[wt];
            else if (r[wt] !== lt[wt])
              throw new Error("non concat dimensions must match");
        }
        let s = n.length,
          a = cr("coords", s),
          u = Bt(s),
          l = de(),
          f = o.map((V) => V.dims),
          p = ne(s),
          d = new Array(f.length - 1);
        d[0] = f[0][t];
        for (let V = 1; V < d.length; V++) d[V] = d[V - 1] + f[V][t];
        let y = p[t],
          T = p.slice(-2),
          v = p.join(),
          S = `if (${y} < ${d[0]}) {
        return getChannel(
            getX0(${v}), vec2(${T.join()}));
        }`;
        for (let V = 1; V < d.length; V++) {
          let lt = d[V - 1];
          S += `
            if (${y} < ${d[V]}  && ${y} >= ${d[V - 1]}) {
              return getChannel(
                getX${V}(${kn(p, y, lt)}),
                vec2(${kn(T, y, lt)}));
            }`;
        }
        let L = d.length,
          P = d[d.length - 1];
        S += `
            return getChannel(
              getX${L}(${kn(p, y, P)}),
              vec2(${kn(T, y, P)}));`;
        let A = G(i.session.backend.glContext.version),
          M = `
          ${l}
          float getValue(${p.map((V) => "int " + V)}) {
            ${S}
          }

          void main() {
            ${u} coords = getOutputCoords();
            int lastDim = coords.${p[s - 1]};
            coords.${p[s - 1]} = coords.${p[s - 2]};
            coords.${p[s - 2]} = lastDim;

            vec4 result = vec4(getValue(${a}), 0., 0., 0.);

            ${a[s - 1]} = ${a[s - 1]} + 1;
            if (${a[s - 1]} < ${n[s - 1]}) {
              result.g = getValue(${a});
            }

            ${a[s - 2]} = ${a[s - 2]} + 1;
            if (${a[s - 2]} < ${n[s - 2]}) {
              result.a = getValue(${a});
            }

            ${a[s - 1]} = ${a[s - 1]} - 1;
            if (${a[s - 2]} < ${n[s - 2]} &&
                ${a[s - 1]} < ${n[s - 1]}) {
              result.b = getValue(${a});
            }
            ${A.output} = result;
          }
        `;
        return {
          ...e,
          output: { dims: n, type: o[0].type, textureType: 2 },
          shaderSource: M,
          hasMain: !0,
        };
      }),
      ($l = (i, e, o) => {
        let t = Jh(e.length, o.cacheKey);
        return { ...t, get: () => Yh(i, t, e, o.axis) };
      }),
      (kn = (i, e, o) => {
        let t = i.indexOf(e);
        return i.map((n, s) => (s === t ? `${n} - ${o}` : n)).join();
      });
  });
var Bl,
  Zh,
  Qh,
  tm,
  Fl,
  em,
  rm,
  nm,
  Cl,
  om,
  Nl = O(() => {
    "use strict";
    It();
    j();
    kl();
    (Bl = (i, e, o) => (
      om(e),
      i.session.pack && e[0].dims.length > 1
        ? [i.run($l(i, e, o), e)]
        : [i.run(tm(i, e, o), e)]
    )),
      (Zh = (i, e) => ({
        name: "Concat",
        inputNames: Array.from({ length: i }, (o, t) => `X${t}`),
        inputTypes: Array(i).fill(0),
        cacheHint: e,
      })),
      (Qh = (i, e, o, t) => {
        let r = o[0].dims.slice();
        if (t >= r.length || t < -1 * r.length)
          throw new Error(
            "axis specified for concat doesn't match input dimensionality"
          );
        t < 0 && (t = r.length + t);
        let n = r.slice(0);
        for (let y = 1; y < o.length; y++) {
          let T = o[y].dims.slice();
          for (let v = 0; v < r.length; v++)
            if (v === t) n[t] += T[v];
            else if (r[v] !== T[v])
              throw new Error("non concat dimensions must match");
        }
        let s = n.length,
          a = new Array(o.length),
          u = 0;
        for (let y = 0; y < a.length; ++y) (u += o[y].dims[t]), (a[y] = u);
        let l = "";
        o.length < 5 ? (l = Fl(a)) : (l = em(a));
        let f = rm(o.length, s),
          p = nm(a),
          d = `
        ${f}
        ${p}
        ${l}
        float process(int indices[${s}]) {
          int textureIndex = getTextureWhereDataResides (indices[${t}]);

          if(textureIndex != 0) {
            indices[${t}] = indices[${t}] - int(getSizeInConcatAxisValueFromIndex(textureIndex-int(1)));
          }

          return fetchDataFromCorrectTexture(textureIndex, indices);
        }`;
        return {
          ...e,
          output: { dims: n, type: o[0].type, textureType: 0 },
          shaderSource: d,
        };
      }),
      (tm = (i, e, o) => {
        let t = Zh(e.length, o.cacheKey);
        return { ...t, get: () => Qh(i, t, e, o.axis) };
      }),
      (Fl = (i) => `int getTextureWhereDataResides(int index) {
      ${i
        .map(
          (o, t) => `if(index<${o}) {return ${t};}
`
        )
        .join("")}
    }`),
      (em = (i) => Fl(i)),
      (rm = (i, e) => {
        let o = [
          `float fetchDataFromCorrectTexture(int textureIndex, int indices[${e}]) {`,
        ];
        for (let t = 0; t < i; ++t)
          t === 0
            ? o.push(`	if (textureIndex == ${t}) { return _X${t}(indices); }`)
            : t === i - 1
            ? o.push(`	else { return _X${t}(indices); }`)
            : o.push(
                `	else if (textureIndex == ${t}) { return _X${t}(indices); }`
              );
        return (
          o.push("	}"),
          o.join(`
`)
        );
      }),
      (nm = (i) => {
        let e = ["int getSizeInConcatAxisValueFromIndex(int index) {"];
        for (let o = 0; o < i.length; ++o)
          o === 0
            ? e.push(`	if (index == ${o}) { return ${i[o]}; }`)
            : o === i.length - 1
            ? e.push(`	else { return ${i[o]}; }`)
            : e.push(`	else if (index == ${o}) { return ${i[o]}; }`);
        return (
          e.push("	}"),
          e.join(`
`)
        );
      }),
      (Cl = (i) => W({ axis: i.attributes.getInt("axis") })),
      (om = (i) => {
        if (!i || i.length < 1) throw new Error("too few inputs");
        let e = i[0].type,
          o = i[0].dims.length;
        if (e === "string")
          throw new Error("string tensor is not supported yet");
        for (let t of i) {
          if (t.type !== e) throw new Error("input tensors should be one type");
          if (t.dims.length !== o)
            throw new Error("input tensors should have the same shape");
        }
      });
  });
function im() {
  return jt("abs");
}
function am() {
  return jt("acos");
}
function sm() {
  return jt("asin");
}
function um() {
  return jt("atan");
}
function lm() {
  return jt("ceil");
}
function fm() {
  return jt("cos");
}
function cm(i) {
  let e = "elu";
  return {
    body: `
  const float alpha = float(${i});

  float ${e}_(float a) {
    return a >= 0.0 ? a: (exp(a) - 1.0) * alpha;
  }
  vec4 ${e}_(vec4 v) {
    return vec4(${e}_(v.x), ${e}_(v.y), ${e}_(v.z), ${e}_(v.w));
  }
  `,
    name: e,
    type: 0,
  };
}
function pm() {
  return jt("exp");
}
function dm() {
  return jt("floor");
}
function hi(i, e) {
  let o = "clip";
  return {
    body: `
  const float min = float(${i});
  const float max = float(${e});

  float ${o}_(float a) {
    return clamp(a, min, max);
  }
  vec4 ${o}_(vec4 v) {
    return clamp(v, min, max);
  }
  `,
    name: o,
    type: 0,
  };
}
function hm() {
  let i = "indentity";
  return {
    body: `
  float ${i}_(float a) {
    return a;
  }
  vec4 ${i}_(vec4 v) {
    return v;
  }
  `,
    name: i,
    type: 0,
  };
}
function mm(i) {
  let e = "leakyRelu";
  return {
    body: `
  const float alpha = float(${i});

  float ${e}_(float a) {
    return a < 0.0 ? a * alpha : a;
  }
  vec4 ${e}_(vec4 v) {
    return vec4(${e}_(v.x), ${e}_(v.y), ${e}_(v.z), ${e}_(v.w));
  }
  `,
    name: e,
    type: 0,
  };
}
function bm() {
  return jt("log");
}
function gm() {
  let i = "neg";
  return {
    body: `
  float ${i}_(float a) {
    return -a;
  }
  vec4 ${i}_(vec4 v) {
    return -v;
  }
  `,
    name: i,
    type: 0,
  };
}
function ym() {
  let i = "not";
  return {
    body: `
  float ${i}_(float a) {
    return float( ! bool(a) );
  }
  bool ${i}_(bool a) {
    return !a;
  }
  vec4 ${i}_(vec4 v) {
    return vec4(!bool(v.x), !bool(v.y), !bool(v.z), !bool(v.w));
  }
  bvec4 ${i}_(bvec4 v) {
    return bvec4(!v.x, !v.y, !v.z, !v.w);
  }
  `,
    name: i,
    type: 0,
  };
}
function xm() {
  return jt("sin");
}
function mi() {
  let i = "relu";
  return {
    body: `
  float ${i}_(float a) {
    return max( a, 0.0 );
  }
  vec4 ${i}_(vec4 v) {
    return max( v, 0.0 );
  }
  `,
    name: i,
    type: 0,
  };
}
function bi() {
  let i = "sigmoid";
  return {
    body: `
  float ${i}_(float a) {
    return 1.0 / (1.0 + exp(-a));
  }
  vec4 ${i}_(vec4 v) {
    return 1.0 / (1.0 + exp(-v));
  }
  `,
    name: i,
    type: 0,
  };
}
function Tm() {
  return jt("sqrt");
}
function wm() {
  return jt("tan");
}
function vm() {
  let i = "tanh";
  return {
    body: `
  float ${i}_(float a) {
    a = clamp(a, -10., 10.);
    a = exp(2.*a);
    return (a - 1.) / (a + 1.);
  }
  vec4 ${i}_(vec4 v) {
    v = clamp(v, -10., 10.);
    v = exp(2.*v);
    return (v - 1.) / (v + 1.);
  }
  `,
    name: i,
    type: 0,
  };
}
function jt(i) {
  return {
    body: `
  float ${i}_(float a) {
    return ${i}(a);
  }
  vec4 ${i}_(vec4 v) {
    return ${i}(v);
  }
  `,
    name: i,
    type: 0,
  };
}
var Im,
  dt,
  Rl,
  Gl,
  Ml,
  Ul,
  gi,
  Vl,
  zl,
  _m,
  Wl,
  Hl,
  ql,
  jl,
  Xl,
  Kl,
  yi,
  Jl,
  Yl,
  Zl,
  Ql,
  tf,
  ef,
  rf,
  nf,
  of,
  af,
  sf,
  xi = O(() => {
    "use strict";
    It();
    Y();
    Te();
    ut();
    j();
    (Im = (i, e, o, t) => {
      let r = i.session.pack ? 2 : 0,
        n = G(i.session.backend.glContext.version);
      return {
        ...e,
        output: { dims: o.dims, type: o.type, textureType: r },
        shaderSource: `
     ${t.body}
     void main() {
       vec4 v = ${n.texture2D}(A, TexCoords);
       v = ${t.name}_(v);
       ${n.output} = v;
     }
     `,
        hasMain: !0,
      };
    }),
      (dt = (i, e, o, t) => {
        let r = i.session.pack ? 2 : 0,
          n = {
            name: o.name,
            inputTypes: [r],
            inputNames: ["A"],
            cacheHint: t,
          };
        return { ...n, get: () => Im(i, n, e, o) };
      }),
      (Rl = (i, e) => [i.run(dt(i, e[0], im()), e)]),
      (Gl = (i, e) => [i.run(dt(i, e[0], am()), e)]),
      (Ml = (i, e) => [i.run(dt(i, e[0], sm()), e)]),
      (Ul = (i, e) => [i.run(dt(i, e[0], um()), e)]),
      (gi = (i, e, o) => [i.run(dt(i, e[0], hi(o.min, o.max), o.cacheKey), e)]),
      (Vl = (i) =>
        W({
          min: i.attributes.getFloat("min", Ve),
          max: i.attributes.getFloat("max", ze),
        })),
      (zl = (i, e) => {
        let o = _m(i, e);
        return gi(i, [e[0]], o);
      }),
      (_m = (i, e) => {
        if (
          e.length >= 3 &&
          (!i.session.isInitializer(e[1].dataId) ||
            !i.session.isInitializer(e[2].dataId))
        )
          throw new Error("dynamic clip attributes are not allowed");
        let o = e.length >= 3 ? e[1].numberData[0] : Ve,
          t = e.length >= 3 ? e[2].numberData[0] : ze;
        return W({ min: o, max: t });
      }),
      (Wl = (i, e) => [i.run(dt(i, e[0], lm()), e)]),
      (Hl = (i, e) => [i.run(dt(i, e[0], fm()), e)]),
      (ql = (i, e, o) => [i.run(dt(i, e[0], cm(o.alpha), o.cacheKey), e)]),
      (jl = (i) => W({ alpha: i.attributes.getFloat("alpha", 1) })),
      (Xl = (i, e) => [i.run(dt(i, e[0], pm()), e)]),
      (Kl = (i, e) => [i.run(dt(i, e[0], dm()), e)]),
      (yi = (i, e) => [i.run(dt(i, e[0], hm()), e)]),
      (Jl = (i, e, o) => [i.run(dt(i, e[0], mm(o.alpha), o.cacheKey), e)]),
      (Yl = (i) => W({ alpha: i.attributes.getFloat("alpha", 0.01) })),
      (Zl = (i, e) => [i.run(dt(i, e[0], bm()), e)]),
      (Ql = (i, e) => [i.run(dt(i, e[0], gm()), e)]),
      (tf = (i, e) => [i.run(dt(i, e[0], ym()), e)]),
      (ef = (i, e) => [i.run(dt(i, e[0], mi()), e)]),
      (rf = (i, e) => [i.run(dt(i, e[0], bi()), e)]),
      (nf = (i, e) => [i.run(dt(i, e[0], xm()), e)]),
      (of = (i, e) => [i.run(dt(i, e[0], Tm()), e)]),
      (af = (i, e) => [i.run(dt(i, e[0], wm()), e)]),
      (sf = (i, e) => [i.run(dt(i, e[0], vm()), e)]);
  });
function he(i) {
  let e;
  switch (i.activation) {
    case "Relu":
      e = mi();
      break;
    case "Sigmoid":
      e = bi();
      break;
    case "Clip":
      e = hi(i.clipMin, i.clipMax);
      break;
    default:
      return { activationFunction: "", applyActivation: "" };
  }
  let o = e.name,
    t = e.body,
    r = `value = ${o}_(value);`;
  return { activationFunction: t, applyActivation: r };
}
var pr,
  qe = O(() => {
    "use strict";
    Y();
    xi();
    pr = (i) => {
      let e = i.getString("activation", "");
      if (e === "Clip") {
        let [o, t] = i.getFloats("activation_params", [Ve, ze]);
        return {
          activation: e,
          clipMax: t,
          clipMin: o,
          activationCacheKey: `${e}:${o},${t}`,
        };
      }
      return { activation: e, activationCacheKey: e };
    };
  });
var Sm,
  Am,
  uf,
  lf = O(() => {
    "use strict";
    Ut();
    ut();
    j();
    Bn();
    qe();
    (Sm = (i, e) => ({
      name: "GroupedConv",
      inputNames: i ? ["X", "W", "Bias"] : ["X", "W"],
      inputTypes: i ? [0, 0, 0] : [0, 0],
      cacheHint: e,
    })),
      (Am = (i, e, o, t) => {
        let n = e.length > 2 ? "value += getBias(output_channel);" : "",
          s = e[0].dims.slice(),
          a = e[1].dims.slice(),
          u = a[0] / t.group;
        tt.verbose(
          "GroupedConv",
          `autpPad:${t.autoPad}, dilations:${t.dilations}, group:${t.group}, kernelShape:${t.kernelShape}, pads:${t.pads}, strides:${t.strides}`
        );
        let l = dr(s, a, t.dilations, t.pads, t.strides),
          f = G(i.session.backend.glContext.version),
          { activationFunction: p, applyActivation: d } = he(t),
          y = `
  const ivec2 strides = ivec2(${t.strides[0]}, ${t.strides[1]});
  const ivec2 pads = ivec2(${t.pads[0]}, ${t.pads[1]});
  ${p}
  void main() {
    ivec4 coords = getOutputCoords();
    int batch = coords.x;
    int output_channel = coords.y;
    ivec2 xRCCorner = coords.zw * strides - pads;
    int group_id = output_channel / ${u};

    float value = 0.0;
    for (int wInChannel = 0; wInChannel < ${a[1]}; wInChannel++) {
      int input_channel = group_id * ${a[1]} + wInChannel;
      for (int wHeight = 0; wHeight < ${a[2]}; wHeight++) {
        int xHeight = xRCCorner.x + wHeight * ${t.dilations[0]};

        if (xHeight < 0 || xHeight >= ${s[2]}) {
          continue;
        }

        for (int wWidth = 0; wWidth < ${a[3]}; wWidth++) {
          int xWidth = xRCCorner.y + wWidth * ${t.dilations[1]};
          if (xWidth < 0 || xWidth >= ${s[3]}) {
            continue;
          }

          float xVal = getX(batch, input_channel, xWidth, xHeight);
          float wVal = getW(output_channel, wInChannel, wWidth, wHeight);
          value += xVal*wVal;
        }
      }
    }
    ${n}
    ${d}
    ${f.output} = vec4(value, .0, .0, .0);
  }
`;
        return {
          ...o,
          output: { dims: l, type: e[0].type, textureType: 0 },
          shaderSource: y,
          hasMain: !0,
        };
      }),
      (uf = (i, e, o) => {
        let t = Sm(e.length > 2, o.cacheKey);
        return { ...t, get: () => Am(i, e, t, o) };
      });
  });
var Pm,
  Em,
  ff,
  cf = O(() => {
    "use strict";
    ut();
    j();
    He();
    (Pm = (i) => ({
      name: "Im2Col (packed)",
      inputNames: ["A"],
      inputTypes: [2],
      cacheHint: i,
    })),
      (Em = (i, e, o, t, r, n) => {
        let s = o.dims,
          a = t.dims,
          u = 2,
          l = 3,
          f = r.length,
          p = [a[1] * a[2] * a[3], r[2] * r[3]],
          d = a[2] * a[3],
          y = de(),
          T = G(i.session.backend.glContext.version),
          v = "";
        for (let L = 0; L <= 1; L++)
          for (let P = 0; P <= 1; P++)
            v += `
            blockIndex = rc.x + ${P};
            pos = rc.y + ${L};

            if(blockIndex < ${p[1]} && pos < ${p[0]}) {
              offsetY = int(blockIndex / (${r[f - 1]})) * ${n.strides[0]} -
                ${n.pads[0]};
              d0 = offsetY + ${n.dilations[0]} * (imod(pos, ${d}) / ${a[2]});

              if(d0 < ${s[u]} && d0 >= 0) {
                offsetX = imod(blockIndex, ${r[f - 1]}) * ${n.strides[1]} -
                  ${n.pads[1]};
                d1 = offsetX + ${n.dilations[1]} * imod(imod(pos, ${d}), ${
              a[2]
            });

                if(d1 < ${s[l]} && d1 >= 0) {

                  ch = int(float(pos)/ ${d}.);
                    innerDims = vec2(d0, d1);
                    result[${L * 2 + P}] = getChannel(
                      getA(0, ch, int(innerDims.x),
                      int(innerDims.y)), innerDims);
                }
              }
            }

          `;
        let S = `
      ${y}

      void main() {
        ivec2 rc = getOutputCoords();
          vec4 result = vec4(0.0);
          int blockIndex, pos, offsetY, d0, offsetX, d1, ch;
          vec2 innerDims;
          ${v}
          ${T.output} = result;
      }
            `;
        return {
          ...e,
          output: { dims: p, type: o.type, textureType: 2 },
          shaderSource: S,
          hasMain: !0,
        };
      }),
      (ff = (i, e, o, t, r) => {
        let n = Pm(r.cacheKey);
        return { ...n, get: () => Em(i, n, e, o, t, r) };
      });
  });
function Lm(i, e, o) {
  let t = e[0].dims,
    r = e[1].dims,
    n = kt.calcShape(t, r, !0);
  if (!n) throw new Error("Can't use matmul on the given tensors");
  let s = Bt(n.length),
    a = ne(),
    { activationFunction: u, applyActivation: l } = he(o),
    f = e.length > 2,
    p = f ? "value += getBiasForMatmul();" : "",
    d = f ? `${wi(s, a, e[2].dims, n, !1)}` : "",
    y = n.length,
    T = t.length,
    v = r.length,
    S = t[t.length - 1],
    L = `
    ${u}
    ${d}
    float process(int indices[${y}]) {
        int a[${T}];
        int b[${v}];
        bcastMatmulIndices_A(indices, a);
        bcastMatmulIndices_B(indices, b);

        float value;
        for (int k=0; k<${S}; ++k) {
            a[${T - 1}] = k;
            b[${v - 2}] = k;
            value += _A(a) * _B(b);
        }
        ${p}
        ${l}
        return value;
    }`;
  return {
    ...i,
    output: { dims: n, type: e[0].type, textureType: 0 },
    shaderSource: L,
  };
}
function Ti(i, e) {
  let o = Dm(i.length > 2, e.activationCacheKey);
  return { ...o, get: () => Lm(o, i, e) };
}
function wi(i, e, o, t, r) {
  let n = "",
    s = o.length,
    a = t.length,
    u = a - s;
  a < 2 && s > 0
    ? (n = "coords")
    : (n = o.map((v, S) => `coords.${e[S + u]}`).join(", "));
  let f = kt.getBroadcastDims(o, t).map((v) => `coords.${e[v + u]} = 0;`).join(`
`),
    d = B.size(o) === 1,
    y = "vec4(outputValue.xx, outputValue.yy)";
  return (
    d && (y = "vec4(outputValue.x)"),
    r
      ? `
vec4 getBiasForMatmul() {
  ${i} coords = getOutputCoords();
  ${f}
  vec4 outputValue = getBias(${n});
  return ${y};
}`
      : `
float getBiasForMatmul() {
  ${i} coords = getOutputCoords();
  ${f}
  return getBias(coords.x);
}`
  );
}
var pf,
  df,
  Dm,
  $m,
  Fn = O(() => {
    "use strict";
    Y();
    j();
    pe();
    qe();
    vi();
    (pf = (i, e, o) => (
      $m(e), i.session.pack ? [i.run(Cn(i, e, o), e)] : [i.run(Ti(e, o), e)]
    )),
      (df = (i) => pr(i.attributes)),
      (Dm = (i, e) => ({
        name: "MatMul",
        inputNames: i ? ["A", "B", "Bias"] : ["A", "B"],
        inputTypes: i ? [0, 0, 0] : [0, 0],
        cacheHint: e,
      }));
    $m = (i) => {
      if (!i || i.length !== 2) throw new Error("MatMul requires 2 inputs.");
      if (i[0].dims[i[0].dims.length - 1] !== i[1].dims[i[1].dims.length - 2])
        throw new Error("shared dimension does not match.");
      if (
        (i[0].type !== "float32" && i[0].type !== "float64") ||
        (i[1].type !== "float32" && i[1].type !== "float64")
      )
        throw new Error("inputs should be float type");
      if (i[0].type !== i[1].type) throw new Error("inputs types should match");
    };
  });
function Fm(i, e, o, t) {
  let r = [],
    n = [],
    s = o[0].dims,
    a = o[1].dims,
    u = s.length,
    l = a.length,
    f = t.length,
    p = f - u,
    d = f - l;
  (r = s.map((A, M) => `coords.${e[M + p]}`)),
    (r[u - 1] = "i*2"),
    r.join(", "),
    (n = a.map((A, M) => `coords.${e[M + d]}`)),
    (n[l - 2] = "i*2"),
    n.join(", ");
  let y = kt.getBroadcastDims(s, t),
    T = kt.getBroadcastDims(a, t),
    v = y.map((A) => `coords.${e[A + p]} = 0;`).join(`
`),
    S = T.map((A) => `coords.${e[A + d]} = 0;`).join(`
`),
    L = `int lastDim = coords.${e[f - 1]};
  coords.${e[f - 1]} = coords.${e[f - 2]};
  coords.${e[f - 2]} = lastDim;`;
  return `
vec4 getAAtOutCoordsMatmul(int i) {
  ${i} coords = getOutputCoords();
  ${L}
  ${v}
  vec4 outputValue = getA(${r});
  return outputValue;
}

vec4 getBAtOutCoordsMatmul(int i) {
  ${i} coords = getOutputCoords();
  ${L}
  ${S}
  vec4 outputValue = getB(${n});
  return outputValue;
}`;
}
function Cm(i, e) {
  let o = "";
  for (let t = 0; t < e - 2; t++) o += `rc.${i[t]}, `;
  return (o += `rc.${i[e - 2]}, i*2`), o;
}
function Nm(i, e) {
  let o = "";
  for (let t = 0; t < e - 2; t++) o += `rc.${i[t]}, `;
  return (o += `i*2, rc.${i[e - 1]}`), o;
}
var km,
  Bm,
  Cn,
  vi = O(() => {
    "use strict";
    Y();
    ut();
    j();
    pe();
    qe();
    Fn();
    (km = (i, e) => ({
      name: "MatMul (packed)",
      inputNames: i ? ["A", "B", "Bias"] : ["A", "B"],
      inputTypes: i ? [2, 2, 2] : [2, 2],
      cacheHint: e,
    })),
      (Bm = (i, e, o, t) => {
        let r = o.length > 2,
          n = r ? "value += getBiasForMatmul();" : "",
          s = o[0].dims,
          a = o[1].dims,
          u = kt.calcShape(s, a, !0),
          l = !B.areEqual(o[0].dims, o[1].dims);
        if (!u) throw new Error("Can't use matmul on the given tensors");
        let f = s[s.length - 1],
          p = Math.ceil(f / 2),
          d = s.length,
          y = a.length,
          T = G(i.session.backend.glContext.version),
          v = Bt(u.length),
          S = u.length,
          L = ne(),
          { activationFunction: P, applyActivation: A } = he(t),
          M = r ? `${wi(v, L, o[2].dims, u, !0)}` : "",
          V = l ? `${Fm(v, L, o, u)}` : "",
          lt = l ? "getAAtOutCoordsMatmul(i)" : `getA(${Cm(L, d)})`,
          wt = l ? "getBAtOutCoordsMatmul(i)" : `getB(${Nm(L, y)})`,
          et = l
            ? ""
            : `${v} rc =
          getOutputCoords(); int lastDim = rc.${L[S - 1]}; rc.${L[S - 1]} =
          rc.${L[S - 2]}; rc.${L[S - 2]} = lastDim;
      `,
          Dt = `
            ${V}
            ${M}
            ${P}
            void main() {
              ${et}

              vec4 value = vec4(0);
              for (int i = 0; i < ${p}; i++) {
                vec4 a = ${lt};
                vec4 b = ${wt};

                value += (a.rrbb * b.rgrg);
                value += (a.ggaa * b.baba);
              }
              ${n}
              ${A}
              ${T.output} = value;
            }`;
        return {
          ...e,
          output: { dims: u, type: o[0].type, textureType: 2 },
          shaderSource: Dt,
          hasMain: !0,
        };
      }),
      (Cn = (i, e, o) => {
        let t = km(e.length > 2, o.activationCacheKey);
        return { ...t, get: () => Bm(i, t, e, o) };
      });
  });
var hf,
  mf = O(() => {
    "use strict";
    Bn();
    cf();
    vi();
    hf = (i, e, o) => {
      let t = e[0].dims,
        r = e[1].dims,
        n = dr(t, r, o.dilations, o.pads, o.strides),
        s = i.run(ff(i, e[0], e[1], n, o), [e[0]]),
        a = i.reshapePacked(e[1], [r[0], r[1] * r[2] * r[3]]),
        u = e.length === 3 ? [a, s, e[2]] : [a, s],
        l = i.run(Cn(i, u, o), u);
      return i.reshapePacked(l, n);
    };
  });
var Rm,
  Gm,
  bf,
  Ii,
  _i = O(() => {
    "use strict";
    j();
    (Rm = (i) => ({
      name: "Im2Col",
      inputNames: ["X"],
      inputTypes: [0],
      cacheHint: i,
    })),
      (Gm = (i, e, o, t, r, n) => {
        let s = o.dims,
          a = t.dims,
          u = r.length,
          l = Ii(s, a, r, 4),
          f = `
        const int XC = ${s[1]};
        const int XH = ${s[2]};
        const int XW = ${s[3]};
        const int KH = ${n.kernelShape[0]};
        const int KW = ${n.kernelShape[1]};
        const int dilationH = ${n.dilations[0]};
        const int dilationW = ${n.dilations[1]};
        const int strideH = ${n.strides[0]};
        const int strideW = ${n.strides[1]};
        const int padH = ${n.pads[0]};
        const int padW = ${n.pads[1]};
        const int KHKW = KH*KW;
        const int XCKHKW = XC * KHKW;
        const int outputChannels = 4;
        vec4 process(int indices[${u}]) {
          int b  = indices[0]; // batch size
          int oh = indices[1] * strideH - padH; //output height
          int ow = indices[2] * strideW - padW; //output width
          int p = indices[3] * outputChannels; //patch
          vec4 value = vec4(0.0);
          for(int i=0; i < outputChannels; ++i) {
            if(p < XCKHKW) {
              int patchC = p / KHKW;
              int patchH = (p - patchC*KHKW) / KW;
              int patchW = (p - patchC*KHKW) - patchH * KW;
              int xh2 = oh + patchH * dilationH;
              int xw2 = ow + patchW * dilationW;
              int x[${s.length}];
              x[0] = b;
              x[1] = patchC;
              x[2] = xh2;
              x[3] = xw2;
              if(xh2 >= 0 &&
                  xh2 < XH &&
                  xw2 >= 0 &&
                  xw2 < XW) {
                value[i] = _X(x);
              }
            }
            ++p;
          }
          return value;
        }
        `;
        return {
          ...e,
          output: { dims: l, type: o.type, textureType: 4 },
          shaderSource: f,
        };
      }),
      (bf = (i, e, o, t, r) => {
        let n = Rm(r.cacheKey);
        return { ...n, get: () => Gm(i, n, e, o, t, r) };
      }),
      (Ii = (i, e, o, t = 4) => [
        o[0],
        o[2],
        o[3],
        Math.ceil((i[1] * e[2] * e[3]) / t),
      ]);
  });
var Mm,
  Um,
  gf,
  yf = O(() => {
    "use strict";
    Y();
    ut();
    j();
    qe();
    _i();
    (Mm = (i, e) => ({
      name: "ConvDotProduct",
      inputNames: i ? ["Im2Col", "K", "B"] : ["Im2Col", "K"],
      inputTypes: i ? [0, 4, 0] : [0, 4],
      cacheKey: e.activationCacheKey,
    })),
      (Um = (i, e, o, t, r) => {
        let n = o[0].dims,
          s = o[1].dims,
          a = [s[0], Math.ceil((n[1] * s[2] * s[3]) / 4)],
          u = Ii(n, s, t),
          [l, f] = i.calculateTextureWidthAndHeight(a, 4),
          p = B.computeStrides(u),
          [d, y] = i.calculateTextureWidthAndHeight(u, 4),
          T = t.length,
          v = o.length < 3 ? "0.0" : "_B(b)",
          S = Math.ceil((n[1] * s[2] * s[3]) / 4),
          { activationFunction: L, applyActivation: P } = he(r),
          A = G(i.session.backend.glContext.version),
          M = `
${L}
float process(int indices[${T}]) {
  int b[1];
  b[0] = indices[1];
  int im2col[4];
  im2col[0] = indices[0];
  im2col[1] = indices[2];
  im2col[2] = indices[3];
  int im2colOffset = im2col[0] * ${p[0]} + im2col[1] * ${p[1]} + im2col[2] * ${p[2]};
  int kernelOffset = indices[1] * ${a[1]};
  float value = ${v};
  for (int i = 0; i < ${S}; ++i) {
    vec2 im2colCoords = offsetToCoords(im2colOffset, ${d}, ${y});
    vec2 kernelCoords = offsetToCoords(kernelOffset, ${l}, ${f});
    value += dot(${A.texture2D}(Im2Col, im2colCoords), ${A.texture2D}(K, kernelCoords));
    ++im2colOffset;
    ++kernelOffset;
  }
  ${P}
  return value;
}`;
        return {
          ...e,
          output: { dims: t, type: o[0].type, textureType: 0 },
          shaderSource: M,
        };
      }),
      (gf = (i, e, o, t) => {
        let r = Mm(e.length > 2, t);
        return { ...r, get: () => Um(i, r, e, o, t) };
      });
  });
var dr,
  Oi,
  Vm,
  zm,
  Wm,
  Hm,
  Si,
  qm,
  Bn = O(() => {
    "use strict";
    It();
    Y();
    lf();
    mf();
    yf();
    qe();
    _i();
    Fn();
    (dr = (i, e, o, t, r) => {
      let n = i[0],
        s = i.slice(2),
        a = s.length,
        u = e[0],
        f = e.slice(2).map((T, v) => T + (T - 1) * (o[v] - 1)),
        d = s
          .map((T, v) => T + t[v] + t[v + a])
          .map((T, v) => Math.floor((T - f[v] + r[v]) / r[v]));
      return [n, u].concat(...d);
    }),
      (Oi = (i, e, o) => (qm(e, o), Vm(i, e, o))),
      (Vm = (i, e, o) => {
        let t = Hm(o, e),
          r = i.session.pack,
          n = t.kernelShape[0] === 1 && t.kernelShape[1] === 1;
        return t.group > 1
          ? [i.run(uf(i, e, t), e)]
          : n && r
          ? [zm(i, e, t)]
          : r && e[0].dims.length === 4 && e[0].dims[0] === 1 && !n
          ? [hf(i, e, t)]
          : [Wm(i, e, t)];
      }),
      (zm = (i, e, o) => {
        let t = e[0].dims,
          r = e[1].dims,
          n = dr(t, r, o.dilations, o.pads, o.strides),
          s = i.reshapeUnpacked(e[0], [t[1], t[2] * t[3]]),
          a = i.reshapeUnpacked(e[1], [r[0], r[1]]),
          u = e.length > 2 ? [a, s, e[2]] : [a, s],
          l = i.run(Ti(u, o), u);
        return i.reshapeUnpacked(l, n);
      }),
      (Wm = (i, e, o) => {
        let t = e[0].dims,
          r = e[1].dims,
          n = dr(t, r, o.dilations, o.pads, o.strides),
          s = i.run(bf(i, e[0], e[1], n, o), [e[0]]),
          a = e.length === 3 ? [s, e[1], e[2]] : [s, e[1]];
        return i.run(gf(i, e, n, o), a);
      }),
      (Hm = (i, e) => {
        let o = i.kernelShape.slice();
        if (i.kernelShape.length === 0)
          for (let n = 2; n < e[1].dims.length; ++n) o.push(e[1].dims[n]);
        let t = i.pads.slice();
        Ue.adjustPadsBasedOnAutoPad(
          e[0].dims,
          i.strides,
          i.dilations,
          o,
          t,
          i.autoPad
        );
        let r = Object.assign({}, i);
        return (
          Object.assign(r, { kernelShape: o, pads: t, cacheKey: i.cacheKey }), r
        );
      }),
      (Si = (i) => {
        let e = i.attributes,
          o = pr(e),
          t = e.getString("auto_pad", "NOTSET"),
          r = e.getInts("dilations", [1, 1]),
          n = e.getInt("group", 1),
          s = e.getInts("kernel_shape", []),
          a = e.getInts("pads", [0, 0, 0, 0]),
          u = e.getInts("strides", [1, 1]);
        return W({
          autoPad: t,
          dilations: r,
          group: n,
          kernelShape: s,
          pads: a,
          strides: u,
          ...o,
        });
      }),
      (qm = (i, e) => {
        if (!i || (i.length !== 2 && i.length !== 3))
          throw new Error("Conv requires 2 or 3 inputs");
        if (i[0].dims.length !== 4 || i[1].dims.length !== 4)
          throw new Error("currently only support 2-dimensional conv");
        let o = i[0].dims[1],
          t = i[1].dims[1] * e.group;
        if (o !== t)
          throw new Error("FILTER_IN_CHANNEL should be equal to DATA_CHANNEL");
        if (
          i.length === 3 &&
          (i[2].dims.length !== 1 || i[1].dims[0] !== i[2].dims[0])
        )
          throw new Error("invalid bias");
        let r = i[0].dims.length - 2;
        if (e.dilations.length !== r)
          throw new Error(`dilations should be ${r}D`);
        if (e.strides.length !== r) throw new Error(`strides should be ${r}D`);
        if (e.pads.length !== r * 2)
          throw new Error(`pads should be ${r * 2}D`);
        if (
          e.kernelShape.length !== 0 &&
          e.kernelShape.length !== i[1].dims.length - 2
        )
          throw new Error("invalid kernel shape");
        if (i[0].type !== "float32" || i[1].type !== "float32")
          throw new Error("Conv input(X,W) should be float tensor");
        if (i.length === 3 && i[2].type !== "float32")
          throw new Error("Conv input(bias) should be float tensor");
      });
  });
var jm,
  Xm,
  Km,
  xf,
  Jm,
  Ym,
  Zm,
  Qm,
  tb,
  eb,
  Tf,
  rb,
  wf = O(() => {
    "use strict";
    It();
    ut();
    j();
    qe();
    (jm = (i, e, o, t, r, n) => (i - 1) * e + o + (t - 1) * r + 1 - n),
      (Xm = (i, e, o, t, r) => {
        let n = Math.floor(i / 2);
        e === "SAME_UPPER"
          ? ((o[t] = n), (o[r] = i - n))
          : e === "SAME_LOWER" && ((o[t] = i - n), (o[r] = n));
      }),
      (Km = (i, e, o, t, r, n, s, a) => {
        let u = i.length - 2,
          l = a.length === 0;
        for (let f = 0; f < u; ++f) {
          let p = l ? i[f + 2] * n[f] : a[f],
            d = jm(i[f + 2], n[f], r[f], e[f], o[f], p);
          Xm(d, t, r, f, f + u),
            l &&
              a.push(
                n[f] * (i[f + 2] - 1) +
                  s[f] +
                  (e[f] - 1) * o[f] +
                  1 -
                  r[f] -
                  r[f + u]
              );
        }
      }),
      (xf = (i, e, o) => (rb(e, o), Jm(i, e, o))),
      (Jm = (i, e, o) => {
        let t = eb(o, e);
        return [tb(i, e, t)];
      }),
      (Ym = (i, e) => ({
        name: "ConvTranspose",
        inputNames: i ? ["X", "W", "B"] : ["X", "W"],
        inputTypes: i ? [0, 0, 0] : [0, 0],
        cacheHint: e,
      })),
      (Zm = (i, e, o, t) => {
        let n = e.length > 2 ? "getB(output_channel)" : "0.0",
          s = e[0].dims,
          a = e[1].dims,
          u = a[1],
          l = a[0] / t.group,
          f = [e[0].dims[0], e[1].dims[1] * t.group, ...t.outputShape],
          p = G(i.session.backend.glContext.version),
          { activationFunction: d, applyActivation: y } = he(t),
          T = `
  const ivec2 strides = ivec2(${t.strides[0]}, ${t.strides[1]});
  const ivec2 pads = ivec2(${t.pads[0]}, ${t.pads[1]});
  ${d}
  void main() {
    ivec4 coords = getOutputCoords();
    int batch = coords.x;
    int output_channel = coords.y;

    ivec2 loc = coords.zw + pads;

    int group_id = output_channel / ${u};
    int wOutChannel = output_channel - group_id * ${u};

    float value = ${n};
    for (int inChannelOffset = 0; inChannelOffset < ${l}; inChannelOffset++) {
      int input_channel = group_id * ${l} + inChannelOffset;
      for (int wWOff = 0; wWOff < ${a[2]}; wWOff++) {
        for (int wHOff = 0; wHOff < ${a[3]}; wHOff++) {
          ivec2 wOff = ivec2(wWOff * ${t.dilations[0]}, wHOff * ${t.dilations[1]});
          ivec2 wLoc = loc - wOff;
          ivec2 wLocIn = wLoc / strides;
          if (
            wLocIn * strides == wLoc &&
            wLocIn.x >= 0 && wLocIn.x < ${s[2]} &&
            wLocIn.y >= 0 && wLocIn.y < ${s[3]}
          ) {
            float xVal = getX(batch, input_channel, wLocIn.y, wLocIn.x);
            float wVal = getW(input_channel, wOutChannel, wHOff, wWOff);
            value += xVal * wVal;
          }
        }
      }
    }
    ${y}
    ${p.output} = vec4(value, .0, .0, .0);
  }
`;
        return {
          ...o,
          output: { dims: f, type: e[0].type, textureType: 0 },
          shaderSource: T,
          hasMain: !0,
        };
      }),
      (Qm = (i, e, o) => {
        let t = Ym(e.length > 2, o.cacheKey);
        return { ...t, get: () => Zm(i, e, t, o) };
      }),
      (tb = (i, e, o) => i.run(Qm(i, e, o), e)),
      (eb = (i, e) => {
        let o = i.kernelShape.slice();
        if (i.kernelShape.length === 0)
          for (let a = 2; a < e[1].dims.length; ++a) o.push(e[1].dims[a]);
        let t = i.pads.slice(),
          r = i.outputShape.slice(),
          n = e[0].dims;
        Km(n, o, i.dilations, i.autoPad, t, i.strides, i.outputPadding, r);
        let s = Object.assign({}, i);
        return (
          Object.assign(s, {
            kernelShape: o,
            pads: t,
            outputShape: r,
            cacheKey: i.cacheKey,
          }),
          s
        );
      }),
      (Tf = (i) => {
        let e = i.attributes,
          o = pr(e),
          t = e.getString("auto_pad", "NOTSET"),
          r = e.getInts("dilations", [1, 1]),
          n = e.getInt("group", 1),
          s = e.getInts("kernel_shape", []),
          a = e.getInts("output_padding", [0, 0]),
          u = e.getInts("output_shape", []),
          l = e.getInts("pads", [0, 0, 0, 0]),
          f = e.getInts("strides", [1, 1]);
        return W({
          autoPad: t,
          dilations: r,
          group: n,
          kernelShape: s,
          outputPadding: a,
          outputShape: u,
          pads: l,
          strides: f,
          ...o,
        });
      }),
      (rb = (i, e) => {
        if (!i || (i.length !== 2 && i.length !== 3))
          throw new Error("Conv requires 2 or 3 inputs");
        if (i[0].dims.length !== 4 || i[1].dims.length !== 4)
          throw new Error("currently only support 2-dimensional conv");
        let o = i[0].dims[1],
          t = i[1].dims[0];
        if (o !== t)
          throw new Error("FILTER_IN_CHANNEL should be equal to DATA_CHANNEL");
        let r = i[1].dims[1] * e.group;
        if (i.length === 3 && (i[2].dims.length !== 1 || i[2].dims[0] !== r))
          throw new Error("invalid bias");
        let n = i[0].dims.length - 2;
        if (e.dilations.length !== n)
          throw new Error(`dilations should be ${n}D`);
        if (e.strides.length !== n) throw new Error(`strides should be ${n}D`);
        if (e.pads.length !== n * 2)
          throw new Error(`pads should be ${n * 2}D`);
        if (e.outputPadding.length !== n)
          throw new Error(`output_padding should be ${n}D`);
        if (
          e.kernelShape.length !== 0 &&
          e.kernelShape.length !== i[1].dims.length - 2
        )
          throw new Error("invalid kernel shape");
        if (
          e.outputShape.length !== 0 &&
          e.outputShape.length !== i[0].dims.length - 2
        )
          throw new Error("invalid output shape");
        if (i[0].type !== "float32" || i[1].type !== "float32")
          throw new Error("ConvTranspose input(X,W) should be float tensor");
        if (i.length === 3 && i[2].type !== "float32")
          throw new Error("ConvTranspose input(bias) should be float tensor");
      });
  });
var vf,
  je,
  If,
  nb,
  _f,
  ob,
  ib,
  ab,
  Nn = O(() => {
    "use strict";
    It();
    Y();
    j();
    (vf = { name: "Transpose", inputNames: ["A"], inputTypes: [0] }),
      (je = (i, e, o) => (
        ab(e),
        [
          i.run(
            { ...vf, cacheHint: o.cacheKey, get: () => nb(i, e[0], o.perm) },
            e
          ),
        ]
      )),
      (If = (i) => W({ perm: i.attributes.getInts("perm", []) })),
      (nb = (i, e, o) => {
        let t = e.dims;
        o = _f(t, o);
        let r = ob(t, o),
          n = t.length,
          s = `
      ${ib("perm", o, n)}
      float process(int indices[${n}]) {
        int a[${n}];
        perm(a, indices);
        return _A(a);
      }`;
        return {
          ...vf,
          output: { dims: r, type: e.type, textureType: 0 },
          shaderSource: s,
        };
      }),
      (_f = (i, e) => (
        e && e.length !== i.length && (e = [...i.keys()].reverse()), e
      )),
      (ob = (i, e) => ((e = _f(i, e)), B.sortBasedOnPerm(i, e))),
      (ib = (i, e, o) => {
        let t = [];
        t.push(`void ${i}(out int a[${o}], int src[${o}]) {`);
        for (let r = 0; r < o; ++r) t.push(`	a[${e[r]}]=src[${r}];`);
        return (
          t.push("	}"),
          t.join(`
`)
        );
      }),
      (ab = (i) => {
        if (!i || i.length !== 1)
          throw new Error("Transpose requires 1 input.");
        if (i[0].type !== "float32" && i[0].type !== "float64")
          throw new Error("input should be float tensor");
      });
  });
var Of,
  Sf,
  sb,
  Af = O(() => {
    "use strict";
    Nn();
    (Of = (i, e, o) => {
      sb(e);
      let t = o.blocksize,
        r = t * t,
        n = o.mode === "DCR" ? [0, 3, 4, 1, 5, 2] : [0, 1, 4, 2, 5, 3],
        s =
          o.mode === "DCR"
            ? [e[0].dims[0], t, t, e[0].dims[1] / r, e[0].dims[2], e[0].dims[3]]
            : [
                e[0].dims[0],
                e[0].dims[1] / r,
                t,
                t,
                e[0].dims[2],
                e[0].dims[3],
              ],
        a = i.reshapeUnpacked(e[0], s),
        u = { perm: n, cacheKey: `${n}` },
        [l] = je(i, [a], u),
        f = [
          e[0].dims[0],
          e[0].dims[1] / r,
          e[0].dims[2] * t,
          e[0].dims[3] * t,
        ];
      return [i.reshapeUnpacked(l, f)];
    }),
      (Sf = (i) => {
        let e = i.attributes.getInt("blocksize");
        if (e < 1)
          throw new Error(
            `blocksize must be >= 1, but got : ${e} for DepthToSpace`
          );
        let o = i.attributes.getString("mode", "DCR");
        if (o !== "DCR" && o !== "CRD")
          throw new Error(`unrecognized mode: ${o} for DepthToSpace`);
        return { mode: o, blocksize: e };
      }),
      (sb = (i) => {
        if (i.length !== 1)
          throw new Error(`DepthToSpace expect 1 inputs, but got ${i.length}`);
        if (i[0].type === "string" || i[0].dims.length !== 4)
          throw new TypeError(
            "DepthToSpace input should be a 4-D numeric tensor"
          );
      });
  });
var Pf,
  Ef,
  ub,
  Df = O(() => {
    "use strict";
    Y();
    (Pf = (i, e, o) => {
      ub(e, o);
      let t = B.flattenShape(e[0].dims, o);
      return [i.reshapeUnpacked(e[0], t)];
    }),
      (Ef = (i) => i.attributes.getInt("axis", 1)),
      (ub = (i, e) => {
        if (!i || i.length !== 1) throw new Error("Flatten requires 1 input.");
        let o = i[0].dims.length;
        if (o === 0) throw new Error("scalar tensor is not supported.");
        if (e < -o || e > o) throw new Error("Invalid axis");
        if (i[0].type === "string")
          throw new Error("string tensor is not supported.");
      });
  });
var Pe,
  Rr = O(() => {
    "use strict";
    Pe = [
      "float32",
      "float64",
      "int32",
      "int16",
      "int8",
      "uint16",
      "uint32",
      "uint8",
    ];
  });
var Lf,
  $f,
  lb,
  fb,
  cb,
  pb,
  kf = O(() => {
    "use strict";
    It();
    Rr();
    Y();
    j();
    (Lf = (i, e, o) => (pb(e, o.axis), [i.run(cb(i, e, o), e)])),
      ($f = (i) => W({ axis: i.attributes.getInt("axis", 0) })),
      (lb = { name: "Gather", inputNames: ["A", "B"], inputTypes: [0, 0] }),
      (fb = (i, e, o, t) => {
        let r = o[0].dims.slice(),
          n = o[1].dims.slice(),
          s = new Array(r.length + n.length - 1);
        t = B.normalizeAxis(t, r.length);
        let a = [];
        for (let d = 0; d < s.length; d++)
          d < t
            ? ((s[d] = r[d]), a.push(`inputIdx[${d}] = outputIdx[${d}];`))
            : d < t + n.length
            ? ((s[d] = n[d - t]),
              a.push(`indexDataIdx[${d - t}] = outputIdx[${d}];`))
            : ((s[d] = r[d - n.length + 1]),
              a.push(`inputIdx[${d - n.length + 1}] = outputIdx[${d}];`));
        let u = s.length || 1,
          l = r.length,
          f = n.length || 1,
          p = `
      float process(int outputIdx[${u}]) {
        int inputIdx[${l}];
        int indexDataIdx[${f}];
        indexDataIdx[0] = 0;
        ${a.join(`
        `)}
        int idx = int(_B(indexDataIdx));
        inputIdx[${t}] = idx < 0 ? idx + ${r[t]} : idx;
        return _A(inputIdx);
      }`;
        return {
          ...e,
          output: { dims: s, type: o[0].type, textureType: 0 },
          shaderSource: p,
        };
      }),
      (cb = (i, e, o) => {
        let t = { ...lb, cacheHint: o.cacheKey };
        return { ...t, get: () => fb(i, t, e, o.axis) };
      }),
      (pb = (i, e) => {
        if (!i || i.length !== 2) throw new Error("Gather requires 2 inputs.");
        let o = i[0].dims.length;
        if (o < 1) throw new Error("Invalid input shape.");
        if (e < -o || e > o - 1) throw new Error("Invalid axis.");
        if (Pe.indexOf(i[0].type) === -1) throw new Error("Invaid input type.");
        if (i[1].type !== "int32" && i[1].type !== "int16")
          throw new Error("Invaid input type.");
      });
  });
var Ai,
  Bf,
  Ff,
  Cf,
  db,
  hb,
  mb,
  Nf = O(() => {
    "use strict";
    It();
    Y();
    j();
    (Ai = (i, e, o) => (mb(e, o), [i.run(db(e, o), e)])),
      (Bf = (i, e) => {
        let o = i.attributes.getInt("transA", 0) !== 0,
          t = i.attributes.getInt("transB", 0) !== 0,
          r = i.attributes.getFloat("alpha", 1),
          n = i.attributes.getFloat("beta", 1);
        return W({ transA: o, transB: t, alpha: r, beta: n, isOptionalC: e });
      }),
      (Ff = (i) => Bf(i, !1)),
      (Cf = (i) => Bf(i, !0)),
      (db = (i, e) => {
        let o = {
          name: "Gemm",
          inputNames: i.length === 3 ? ["A", "B", "C"] : ["A", "B"],
          inputTypes: i.length === 3 ? [0, 0, 0] : [0, 0],
          key: e.cacheKey,
        };
        return { ...o, get: () => hb(o, i, e) };
      }),
      (hb = (i, e, o) => {
        let t = e[0].dims.slice(),
          r = e[1].dims.slice(),
          [n, s] = Sn.getShapeOfGemmResult(
            t,
            o.transA,
            r,
            o.transB,
            e.length === 3 ? e[2].dims : void 0
          ),
          a = [n, s];
        if (!a) throw new Error("Can't use gemm on the given tensors");
        let u = t[t.length - 1],
          l = "";
        o.transA && (u = t[0]),
          o.transA && o.transB
            ? (l = "value += _A_T(a) * _B_T(b);")
            : o.transA && !o.transB
            ? (l = "value += _A_T(a) * _B(b);")
            : !o.transA && o.transB
            ? (l = "value += _A(a) * _B_T(b);")
            : !o.transA && !o.transB && (l = "value += _A(a) * _B(b);");
        let f = a.length,
          p = e.length === 3 ? `int c[${e[2].dims.length}];` : "",
          d = e.length === 3 ? "bcastIndices_C(indices, c);" : "",
          y = e.length === 3 ? "value += beta * _C(c);" : "",
          T = `
      float process(int indices[${f}]) {
          int a[${f}];
          int b[${f}];
          ${p}

          copyVec(indices, a);
          copyVec(indices, b);
          ${d}

          float value = 0.0;
          for (int k=0; k<${u}; ++k) {
              a[${f - 1}] = k;
              b[${f - 2}] = k;
              ${l}
          }

          value = value * alpha;
          ${y}
          return value;
      }`;
        return {
          ...i,
          output: { dims: a, type: e[0].type, textureType: 0 },
          variables: [
            { name: "alpha", type: "float", data: o.alpha },
            { name: "beta", type: "float", data: o.beta },
          ],
          shaderSource: T,
        };
      }),
      (mb = (i, e) => {
        if (!i) throw new Error("Input is missing");
        if (e.isOptionalC && (i.length < 2 || i.length > 3))
          throw new Error("Invaid input shape.");
        if (!e.isOptionalC && i.length !== 3)
          throw new Error("Gemm requires 3 inputs");
        if (i.length === 3 && i[2].dims.length !== 1 && i[2].dims.length !== 2)
          throw new Error("Invalid input shape of C");
        if (
          (i[0].type !== "float32" && i[0].type !== "float64") ||
          (i[1].type !== "float32" && i[1].type !== "float64") ||
          (i.length === 3 && i[2].type !== "float32" && i[2].type !== "float64")
        )
          throw new Error("Invalid input type.");
        if (
          i[0].type !== i[1].type ||
          (i.length === 3 && i[0].type !== i[2].type)
        )
          throw new Error("Input types are mismatched");
      });
  });
var Rf,
  Gf,
  bb,
  gb,
  yb,
  xb,
  Tb,
  Mf = O(() => {
    "use strict";
    It();
    j();
    (Rf = (i, e, o) => (Tb(e), [i.run(yb(i, e, o), e)])),
      (Gf = (i) => {
        let e = i.attributes.getFloat("scale"),
          o = i.attributes.getFloats("bias");
        return W({ scale: e, bias: o });
      }),
      (bb = { name: "ImageScaler", inputNames: ["X"], inputTypes: [0] }),
      (gb = (i, e, o, t) => {
        let r = o[0].dims.slice(),
          n = r.length,
          a = `
      ${xb(t.bias.length)}
      float process(int indices[${n}]) {
        return _X(indices) * scale + getBias(bias, indices[1]);
      }`;
        return {
          ...e,
          output: { dims: r, type: o[0].type, textureType: 0 },
          variables: [
            {
              name: "bias",
              type: "float",
              arrayLength: t.bias.length,
              data: t.bias,
            },
            { name: "scale", type: "float", data: t.scale },
          ],
          shaderSource: a,
        };
      }),
      (yb = (i, e, o) => {
        let t = { ...bb, cacheHint: o.cacheKey };
        return { ...t, get: () => gb(i, t, e, o) };
      }),
      (xb = (i) => {
        let e = [`float getBias(float bias[${i}], int channel) {`];
        for (let o = 0; o < i; ++o)
          o === 0
            ? e.push(`	if (channel == ${o}) { return bias[${o}]; }`)
            : o === i - 1
            ? e.push(`	else { return bias[${o}]; }`)
            : e.push(`	else if (channel == ${o}) { return bias[${o}]; }`);
        return (
          e.push("	}"),
          e.join(`
`)
        );
      }),
      (Tb = (i) => {
        if (!i || i.length !== 1)
          throw new Error("ImageScaler requires 1 input.");
        if (i[0].dims.length !== 4) throw new Error("Invalid input shape.");
        if (i[0].type !== "float32" && i[0].type !== "float64")
          throw new Error("Invalid input type.");
      });
  });
var Vf,
  zf,
  Uf,
  wb,
  vb,
  Ib,
  _b,
  Ob,
  Sb,
  Wf = O(() => {
    "use strict";
    ut();
    j();
    (Vf = (i, e, o) => {
      Sb(e);
      let t = i.run(vb(e[0]), e);
      return [i.run(Ob(i, e[0], o, t.dims), [e[0], t, e[1], e[2]])];
    }),
      (zf = (i) => i.attributes.getFloat("epsilon", 1e-5)),
      (Uf = {
        name: "InstanceNormalization_MeanAndVariance",
        inputNames: ["X"],
        inputTypes: [0],
      }),
      (wb = (i, e) => {
        let o = e.dims.slice(),
          t = o[1],
          r = o[2] * o[3],
          n = [o[0], t],
          s = `
      vec4 process(int[2] indices) {
        vec4 v = vec4(0.0);
        int a[4];
        a[0] = indices[0];
        a[1] = indices[1];
        float temp = 0.0;
        for(int a2=0; a2<${o[2]}; a2++) {
          a[2] = a2;
          for(int a3=0; a3<${o[3]}; a3++) {
            a[3] = a3;
            float x = _X(a);
            temp += x;
          }
        }
        float mean = temp / float(${r});
        temp = 0.0;
        for(int a2=0; a2<${o[2]}; a2++) {
          a[2] = a2;
          for(int a3=0; a3<${o[3]}; a3++) {
            a[3] = a3;
            float x = _X(a);
            temp += (x - mean) * (x - mean);
          }
        }
        v.r = mean;
        v.g = temp / float(${r});

        return v;
      }`;
        return {
          ...i,
          output: { dims: n, type: e.type, textureType: 4 },
          shaderSource: s,
        };
      }),
      (vb = (i) => ({ ...Uf, get: () => wb(Uf, i) })),
      (Ib = {
        name: "InstanceNormalization_ComputeOutput",
        inputNames: ["X", "MeanAndVariance", "Scale", "B"],
        inputTypes: [0, 4, 0, 0],
      }),
      (_b = (i, e, o, t, r) => {
        let n = G(i.session.backend.glContext.version),
          [s, a] = i.calculateTextureWidthAndHeight(r, 4),
          [u, l] = [s / 4, a],
          f = `
      vec4 get_MeanAndVariance(int[2] mv) {
        int offset = indicesToOffset_MeanAndVariance(mv);
        vec2 coords = offsetToCoords(offset, ${u}, ${l});
        return ${n.texture2D}(MeanAndVariance, coords);
      }

      float process(int[4] indices) {
        int mv[2];
        mv[0] = indices[0];
        mv[1] = indices[1];
        vec4 mean_and_variance = get_MeanAndVariance(mv);
        float mean = mean_and_variance.r;
        float variance = mean_and_variance.g;

        int sb[1];
        sb[0] = indices[1];
        float scale = _Scale(sb);
        float b = _B(sb);

        return scale * (_X(indices) - mean) / sqrt(variance + epsilon) + b;
      }`;
        return {
          ...e,
          output: { dims: o.dims, type: o.type, textureType: 0 },
          variables: [{ name: "epsilon", type: "float", data: t }],
          shaderSource: f,
        };
      }),
      (Ob = (i, e, o, t) => {
        let r = { ...Ib, cacheHint: `${o}` };
        return { ...r, get: () => _b(i, r, e, o, t) };
      }),
      (Sb = (i) => {
        if (!i || i.length !== 3)
          throw new Error("InstanceNormalization requires 3 inputs.");
        let e = i[0],
          o = i[1],
          t = i[2];
        if (e.dims.length < 3 || o.dims.length !== 1 || t.dims.length !== 1)
          throw new Error("Invalid input shape.");
        if (o.dims[0] !== e.dims[1] || t.dims[0] !== e.dims[1])
          throw new Error("Input shapes are mismatched.");
        if (
          (e.type !== "float32" && e.type !== "float64") ||
          (o.type !== "float32" && o.type !== "float64") ||
          (t.type !== "float32" && t.type !== "float64")
        )
          throw new Error("Invalid input type.");
        if (i[0].dims.length !== 4)
          throw new Error("Only support 4-D input shape.");
      });
  });
function Ab(i, e) {
  let o = i[0].dims[1],
    t = i[0].dims.length,
    r = -Math.floor((e.size - 1) / 2),
    n = Math.ceil((e.size - 1) / 2),
    s = `float(${e.alpha}) / float(${e.size})`,
    a = `float(${e.bias})`,
    u = `float(${e.beta})`,
    l = `
    float process(int indices[${t}]) {
        int c = indices[1];
        float x = _X(indices);
        float square_sum = 0.0;

        for (int i = ${r}; i <= ${n}; i++) {
          int idx = c + i;
          if (c >= 0 && c < ${o}) {
            indices[1] = idx;
            float j = _X(indices);
            square_sum += j * j;
          }
        }
        return x / pow(${a} + ${s} * square_sum, ${u});
    }`;
  return {
    ...jf,
    cacheHint: e.cacheKey,
    output: { dims: i[0].dims, type: i[0].type, textureType: 0 },
    shaderSource: l,
  };
}
function Pb(i, e) {
  return { ...jf, cacheHint: e.cacheKey, get: () => Ab(i, e) };
}
var Hf,
  qf,
  jf,
  Eb,
  Xf = O(() => {
    "use strict";
    It();
    j();
    (Hf = (i, e, o) => (Eb(e), [i.run(Pb(e, o), e)])),
      (qf = (i) => {
        let e = i.attributes.getFloat("alpha", 1e-4),
          o = i.attributes.getFloat("beta", 0.75),
          t = i.attributes.getFloat("bias", 1),
          r = i.attributes.getInt("size");
        return W({ alpha: e, beta: o, bias: t, size: r });
      }),
      (jf = { name: "LRN", inputNames: ["X"], inputTypes: [0] });
    Eb = (i) => {
      if (!i || i.length !== 1) throw new Error("LRN requires 1 input.");
      if (i[0].dims.length !== 4)
        throw new Error(
          'currently only support LRN for input with "NCHW" format'
        );
      if (i[0].type !== "float32")
        throw new Error("input should be float type");
    };
  });
var Db,
  Pi,
  Kf,
  Jf,
  Yf,
  Lb,
  $b,
  kb,
  Bb,
  Fb,
  Cb,
  Nb,
  Rb,
  Zf = O(() => {
    "use strict";
    It();
    Y();
    ut();
    j();
    (Db = { name: "Pad", inputNames: ["A"], inputTypes: [0] }),
      (Pi = (i, e, o) => (
        kb(e),
        [i.run({ ...Db, cacheHint: o.cacheKey, get: () => $b(i, e[0], o) }, e)]
      )),
      (Kf = (i) => {
        let e = i.attributes.getString("mode", "constant"),
          o = i.attributes.getFloat("value", 0),
          t = i.attributes.getInts("pads");
        return W({ mode: e, value: o, pads: t });
      }),
      (Jf = (i, e, o) => {
        Bb(e);
        let t = Lb(i, e, o);
        return Pi(i, [e[0]], t);
      }),
      (Yf = (i) => i.attributes.getString("mode", "constant")),
      (Lb = (i, e, o) => {
        if (
          !i.session.isInitializer(e[1].dataId) ||
          (e.length >= 3 && !i.session.isInitializer(e[2].dataId))
        )
          throw new Error("dynamic pad attributes are not allowed");
        let t = Array.from(e[1].integerData),
          r = e.length >= 3 ? e[2].floatData[0] : 0;
        return W({ mode: o, pads: t, value: r });
      }),
      ($b = (i, e, o) => {
        let t = B.padShape(e.dims.slice(), o.pads),
          r = t.length,
          s = `
      ${Fb(i, e, o)}
      float process(int[${r}] indices) {
          return padA(indices);
      }`;
        return {
          name: "Pad",
          inputNames: ["A"],
          inputTypes: [0],
          output: { dims: t, type: e.type, textureType: 0 },
          shaderSource: s,
        };
      }),
      (kb = (i) => {
        if (!i || i.length !== 1) throw new Error("Pad requires 1 input");
        if (i[0].type !== "float32" && i[0].type !== "float64")
          throw new Error("Invalid input type.");
      }),
      (Bb = (i) => {
        if (!i || (i.length !== 2 && i.length !== 3))
          throw new Error("Pad requires 2 or 3 inputs");
        if (i[1].type !== "int32") throw new Error("Invalid input type.");
        if (i.length >= 3 && i[2].type === "string")
          throw new Error("Invalid input type.");
      }),
      (Fb = (i, e, o) => {
        let t = G(i.session.backend.glContext.version),
          [r, n] = i.calculateTextureWidthAndHeight(e.dims, 0),
          s = B.computeStrides(e.dims);
        switch (o.mode) {
          case "constant":
            return Cb(t, e.dims, s, r, n, o.pads, o.value);
          case "reflect":
            return Nb(t, e.dims, s, r, n, o.pads);
          case "edge":
            return Rb(t, e.dims, s, r, n, o.pads);
          default:
            throw new Error("Invalid mode");
        }
      }),
      (Cb = (i, e, o, t, r, n, s) => {
        let a = e.length,
          u = "";
        for (let l = a - 1; l >= 0; --l)
          u += `
        k = m[${l}] - ${n[l]};
        if (k < 0)  return constant;
        if (k >= ${e[l]}) return constant;
        offset += k * ${o[l]};
        `;
        return `
      float padA(int m[${a}]) {
        const float constant = float(${s});
        int offset = 0;
        int k = 0;
        ${u}
        vec2 coords = offsetToCoords(offset, ${t}, ${r});
        float value = getColorAsFloat(${i.texture2D}(A, coords));
        return value;
      }
      `;
      }),
      (Nb = (i, e, o, t, r, n) => {
        let s = e.length,
          a = "";
        for (let u = s - 1; u >= 0; --u)
          a += `
        k = m[${u}] - ${n[u]};
        if (k < 0) { k = -k; }
        {
          const int _2n_1 = ${2 * (e[u] - 1)};
          k = int( mod( float(k), float(_2n_1) ) ) ;
          if(k >= ${e[u]}) { k = _2n_1 - k; }
        }
        offset += k * ${o[u]};
        `;
        return `
      float padA(int m[${s}]) {
        int offset = 0;
        int k = 0;
        ${a}
        vec2 coords = offsetToCoords(offset, ${t}, ${r});
        float value = getColorAsFloat(${i.texture2D}(A, coords));
        return value;
      }
      `;
      }),
      (Rb = (i, e, o, t, r, n) => {
        let s = e.length,
          a = "";
        for (let u = s - 1; u >= 0; --u)
          a += `
        k = m[${u}] - ${n[u]};
        if (k < 0)  k = 0;
        if (k >= ${e[u]}) k = ${e[u] - 1};
        offset += k * ${o[u]};
      `;
        return `
      float padA(int m[${s}]) {
        int offset = 0;
        int k = 0;
        ${a}
        vec2 coords = offsetToCoords(offset, ${t}, ${r});
        float value = getColorAsFloat(${i.texture2D}(A, coords));
        return value;
      }
      `;
      });
  });
var tc,
  ec,
  rc,
  nc,
  oc,
  ic,
  ac,
  sc,
  uc,
  Gb,
  Qf,
  lc,
  Gn,
  fc,
  Rn,
  Mb,
  cc = O(() => {
    "use strict";
    It();
    Y();
    j();
    (tc = (i, e, o) => {
      Gn(e);
      let t = {
        name: "AveragePool",
        inputNames: ["X"],
        inputTypes: [0],
        cacheHint: o.cacheKey,
      };
      return [i.run({ ...t, get: () => rc(e, t, !1, o) }, e)];
    }),
      (ec = (i) => {
        let e = i.attributes.getString("auto_pad", "NOTSET"),
          o = i.attributes.getInt("ceil_mode", 0),
          t = i.attributes.getInt("count_include_pad", 0) !== 0,
          r = i.attributes.getInts("kernel_shape"),
          n = i.attributes.getInts("strides", []),
          s = i.attributes.getInts("pads", []);
        if (o !== 0)
          throw new Error(
            "using ceil() in shape computation is not yet supported for AveragePool"
          );
        return W({
          autoPad: e,
          ceilMode: o,
          countIncludePad: t,
          kernelShape: r,
          strides: n,
          pads: s,
        });
      }),
      (rc = (i, e, o, t) => {
        let [r, n] = uc(i, t, o),
          s = B.size(r.kernelShape),
          a = "value += _X(x);",
          u = "";
        r.countIncludePad
          ? (u += `value /= float(${s});`)
          : (u += `value /= float(${s} - pad);`);
        let f = `
        ${fc(i[0].dims, r, a, u, "0.0")}
      `;
        return {
          ...e,
          output: { dims: n, type: i[0].type, textureType: 0 },
          shaderSource: f,
        };
      }),
      (nc = (i, e, o) => {
        Gn(e);
        let t = {
          name: "GlobalAveragePool",
          inputNames: ["X"],
          inputTypes: [0],
          cacheHint: `${o.countIncludePad}`,
        };
        return [i.run({ ...t, get: () => rc(e, t, !0, o) }, e)];
      }),
      (oc = (i) => {
        let e = i.attributes.getInt("count_include_pad", 0) !== 0;
        return W({
          autoPad: "",
          ceilMode: 0,
          countIncludePad: e,
          kernelShape: [],
          strides: [],
          pads: [],
        });
      }),
      (ic = (i, e, o) => {
        Gn(e);
        let t = {
          name: "MaxPool",
          inputNames: ["X"],
          inputTypes: [0],
          cacheHint: o.cacheKey,
        };
        return [i.run({ ...t, get: () => sc(e, t, !1, o) }, e)];
      }),
      (ac = (i) => {
        let e = i.attributes.getString("auto_pad", "NOTSET"),
          o = i.attributes.getInt("ceil_mode", 0),
          t = i.attributes.getInts("kernel_shape"),
          r = i.attributes.getInts("strides", []),
          n = i.attributes.getInts("pads", []),
          s = i.attributes.getInt("storage_order", 0),
          a = i.attributes.getInts("dilations", []);
        if (s !== 0)
          throw new Error(
            "column major storage order is not yet supported for MaxPool"
          );
        if (o !== 0)
          throw new Error(
            "using ceil() in shape computation is not yet supported for MaxPool"
          );
        return W({
          autoPad: e,
          ceilMode: o,
          countIncludePad: !1,
          kernelShape: t,
          strides: r,
          pads: n,
          storageOrder: s,
          dilations: a,
        });
      }),
      (sc = (i, e, o, t) => {
        let [r, n] = uc(i, t, o),
          s = `
      value = max(_X(x), value);
    `,
          a = "",
          l = `
      ${fc(i[0].dims, r, s, a, "-1e5")}
    `;
        return {
          ...e,
          output: { dims: n, type: i[0].type, textureType: 0 },
          shaderSource: l,
        };
      }),
      (uc = (i, e, o) => {
        let t = i[0].dims.slice(),
          r = Object.hasOwnProperty.call(e, "dilations"),
          n = e.kernelShape.slice(),
          s = e.strides.slice(),
          a = r ? e.dilations.slice() : [],
          u = e.pads.slice();
        Ue.adjustPoolAttributes(o, t, n, s, a, u);
        let l = Ue.computePoolOutputShape(o, t, s, a, n, u, e.autoPad),
          f = Object.assign({}, e);
        return (
          r
            ? Object.assign(f, {
                kernelShape: n,
                strides: s,
                pads: u,
                dilations: a,
                cacheKey: e.cacheKey,
              })
            : Object.assign(f, {
                kernelShape: n,
                strides: s,
                pads: u,
                cacheKey: e.cacheKey,
              }),
          [f, l]
        );
      }),
      (Gb = {
        autoPad: "",
        ceilMode: 0,
        countIncludePad: !1,
        kernelShape: [],
        strides: [],
        pads: [],
        storageOrder: 0,
        dilations: [],
        cacheKey: "",
      }),
      (Qf = { name: "GlobalMaxPool", inputNames: ["X"], inputTypes: [0] }),
      (lc = (i, e) => (
        Gn(e), [i.run({ ...Qf, get: () => sc(e, Qf, !0, Gb) }, e)]
      )),
      (Gn = (i) => {
        if (!i || i.length !== 1) throw new Error("Pool ops requires 1 input.");
        if (i[0].type !== "float32" && i[0].type !== "float64")
          throw new Error("Invalid input type.");
      }),
      (fc = (i, e, o, t, r) => {
        let n = i.length;
        if (e.kernelShape.length <= 2) {
          let s = e.kernelShape[e.kernelShape.length - 1],
            a = e.strides[e.strides.length - 1],
            u = e.pads[e.pads.length / 2 - 1],
            l = e.pads[e.pads.length - 1],
            f = i[n - 1],
            p = "",
            d = "",
            y = "";
          if (
            (u + l !== 0
              ? (p = `
          for (int i = 0; i < ${s}; i++) {
            x[${n} - 1] = indices[${n} - 1] * ${a} - ${u} + i;
            if (x[${n} - 1] < 0 || x[${n} - 1] >= ${f}) {
              pad++;
              continue;
            }
            ${o}
          }`)
              : (p = `
          for (int i = 0; i < ${s}; i++) {
            x[${n} - 1] = indices[${n} - 1] * ${a} - ${u} + i;
            ${o}
          }`),
            e.kernelShape.length === 2)
          ) {
            let v = e.kernelShape[e.kernelShape.length - 2],
              S = e.strides[e.strides.length - 2],
              L = e.pads[e.pads.length / 2 - 2],
              P = e.pads[e.pads.length - 2],
              A = i[n - 2];
            L + P !== 0
              ? (d = `
            for (int j = 0; j < ${v}; j++) {
              x[${n} - 2] = indices[${n} - 2] * ${S} - ${L} + j;
              if (x[${n} - 2] < 0 || x[${n} - 2] >= ${A}) {
                pad+= ${s};
                continue;
              }
          `)
              : (d = `
            for (int j = 0; j < ${v}; j++) {
              x[${n} - 2] = indices[${n} - 2] * ${S} - ${L} + j;
            `),
              (y = `
          }
        `);
          }
          return `
        float process(int indices[${n}]) {
          int x[${n}];
          copyVec(indices, x);

          float value = ${r};
          int pad = 0;
          ${d}
          ${p}
          ${y}
          ${t}
          return value;
        }
      `;
        } else {
          let s = B.size(e.kernelShape),
            a = B.computeStrides(e.kernelShape),
            u = a.length,
            l = e.pads.length,
            f = Mb(u),
            p = Rn(i, "inputDims"),
            d = Rn(e.pads, "pads"),
            y = Rn(a, "kernelStrides"),
            T = Rn(e.strides, "strides"),
            v = e.pads.reduce((P, A) => P + A),
            S = "";
          return (
            v
              ? (S = `
            if (x[j] >= inputDims[j] || x[j] < 0) {
              pad++;
              isPad = true;
              break;
            }
          }
          if (!isPad) {
            ${o}
          }`)
              : (S = `
          }
          ${o}
        `),
            `
        ${f}
        float process(int indices[${n}]) {
          int x[${n}];
          copyVec(indices, x);
          int offset[${u}];
          int pads[${l}];
          int inputDims[${n}];
          int kernelStrides[${u}];
          int strides[${u}];
          ${d}
          ${p}
          ${T}
          ${y}

          float value = ${r};
          int pad = 0;
          bool isPad = false;
          for (int i = 0; i < ${s}; i++) {
            offsetToIndices(i, kernelStrides, offset);
            isPad = false;
            for (int j = ${n} - ${u}; j < ${n}; j++) {
              x[j] = indices[j] * strides[j - ${n} + ${u}]
                + offset[j - ${n} + ${u}] - pads[j - 2];
              ${S}
          }
          ${t}

          return value;
        }
      `
          );
        }
      }),
      (Rn = (i, e) => {
        let o = "";
        for (let t = 0; t < i.length; t++)
          o += `
      ${e}[${t}] = ${i[t]};
    `;
        return o;
      }),
      (Mb = (i) => `
  void offsetToIndices(int offset, int[${i}] strides, out int[${i}] indices) {
    if (${i} == 0) {
      return;
    }
    for (int i = 0; i < ${i} - 1; ++i) {
      indices[i] = offset / strides[i];
      offset -= indices[i] * strides[i];
    }
    indices[${i} - 1] = offset;
  }`);
  });
var Xe,
  Ee,
  Ub,
  Vb,
  pc,
  dc,
  hc,
  mc,
  bc,
  gc,
  yc,
  xc = O(() => {
    "use strict";
    It();
    Rr();
    Y();
    j();
    (Xe = (i, e, o, t, r) => {
      Vb(e);
      let n = { name: t, inputNames: ["A"], inputTypes: [0] };
      return [
        i.run(
          { ...n, cacheHint: o.cacheKey, get: () => Ub(i, e, o, t, r, n) },
          e
        ),
      ];
    }),
      (Ee = (i) => {
        let e = i.attributes.getInts("axes", []),
          o = i.attributes.getInt("keepdims", 1) === 1;
        return W({ axes: e, keepDims: o });
      }),
      (Ub = (i, e, o, t, r, n) => {
        let s = [],
          a = e[0].dims.length || 1,
          u = [],
          l = B.normalizeAxes(o.axes, e[0].dims.length),
          f = r(e, l),
          p = f[1];
        for (let T = 0; T < e[0].dims.length; T++)
          l.indexOf(T) >= 0 || l.length === 0
            ? (o.keepDims && s.push(1),
              (p = `
          for(int j${T} = 0; j${T} < ${e[0].dims[T]}; j${T}++) {
            inputIdx[${T}] = j${T};
            ${p}
          }`))
            : (u.push(`inputIdx[${T}] = outputIdx[${s.length}];`),
              s.push(e[0].dims[T]));
        let y = `
      float process(int outputIdx[${s.length || 1}]) {
        float value;                 // final result
        int inputIdx[${a}];      // addressing input data
        ${u.join(`
`)}
        ${f[0]}       // init ops for reduce max/min
        ${p}
        ${f[2]}       // final computation for reduce mean
        return value;
      }`;
        return {
          ...n,
          output: { dims: s, type: e[0].type, textureType: 0 },
          shaderSource: y,
        };
      }),
      (Vb = (i) => {
        if (!i || i.length !== 1)
          throw new Error("Reduce op requires 1 input.");
        if (Pe.indexOf(i[0].type) === -1)
          throw new Error("Invalid input type.");
      }),
      (pc = (i, e, o) =>
        Xe(i, e, o, "ReduceSum", () => [
          "value = 0.0;",
          "value += _A(inputIdx);",
          "",
        ])),
      (dc = (i, e, o) =>
        Xe(i, e, o, "ReduceMean", (r, n) => {
          let s = 1;
          for (let a = 0; a < r[0].dims.length; a++)
            (n.indexOf(a) >= 0 || n.length === 0) && (s *= r[0].dims[a]);
          return ["value = 0.0;", "value += _A(inputIdx);", `value /= ${s}.;`];
        })),
      (hc = (i, e, o) =>
        Xe(i, e, o, "ReduceMax", (r, n) => {
          let s = [];
          for (let a = 0; a < r[0].dims.length; a++)
            (n.indexOf(a) >= 0 || n.length === 0) &&
              s.push(`inputIdx[${a}] = 0;`);
          return [
            `${s.join(`
`)}
value = _A(inputIdx);`,
            "value = max(value, _A(inputIdx));",
            "",
          ];
        })),
      (mc = (i, e, o) =>
        Xe(i, e, o, "ReduceMin", (r, n) => {
          let s = [];
          for (let a = 0; a < r[0].dims.length; a++)
            (n.indexOf(a) >= 0 || n.length === 0) &&
              s.push(`inputIdx[${a}] = 0;`);
          return [
            `${s.join(`
`)}
value = _A(inputIdx);`,
            "value = min(value, _A(inputIdx));",
            "",
          ];
        })),
      (bc = (i, e, o) =>
        Xe(i, e, o, "ReduceProd", () => [
          "value = 1.0;",
          "value *= _A(inputIdx);",
          "",
        ])),
      (gc = (i, e, o) =>
        Xe(i, e, o, "ReduceLogSum", () => [
          "value = 0.0;",
          "value += _A(inputIdx);",
          "value = log(value);",
        ])),
      (yc = (i, e, o) =>
        Xe(i, e, o, "ReduceLogSumSquare", () => [
          "float t; value = 0.0;",
          "t = _A(inputIdx); value += t * t;",
          "",
        ]));
  });
var Tc,
  wc = O(() => {
    "use strict";
    Y();
    Tc = (i, e) => {
      let o = B.calculateReshapedDims(e[0].dims, e[1].integerData);
      return i.session.pack
        ? [i.reshapePacked(e[0], o)]
        : [i.reshapeUnpacked(e[0], o)];
    };
  });
var vc,
  Ei,
  Ic,
  _c,
  Gr,
  zb,
  Di,
  Mn,
  Li = O(() => {
    "use strict";
    It();
    ut();
    j();
    (vc = { name: "Upsample", inputNames: ["X"], inputTypes: [0] }),
      (Ei = (i, e, o) => (
        Di(e, o),
        [i.run({ ...vc, cacheHint: o.cacheKey, get: () => zb(i, e, o) }, e)]
      )),
      (Ic = (i) => Gr(i, 7)),
      (_c = (i) => Gr(i, 9)),
      (Gr = (i, e) => {
        let o = e >= 10,
          t = i.attributes.getString("mode", "nearest");
        if (t !== "nearest" && t !== "linear" && (e < 11 || t !== "cubic"))
          throw new Error(`unrecognized mode: ${t}`);
        let r = [];
        e < 9 && ((r = i.attributes.getFloats("scales")), Mn(r, t, o));
        let n = i.attributes.getFloat("extrapolation_value", 0),
          s =
            e > 10
              ? i.attributes.getString(
                  "coordinate_transformation_mode",
                  "half_pixel"
                )
              : "asymmetric";
        if (
          [
            "asymmetric",
            "pytorch_half_pixel",
            "tf_half_pixel_for_nn",
            "align_corners",
            "tf_crop_and_resize",
            "half_pixel",
          ].indexOf(s) === -1
        )
          throw new Error(`coordinate_transform_mode '${s}' is not supported`);
        let a = s === "tf_crop_and_resize",
          u = a,
          l =
            t === "nearest" && e >= 11
              ? i.attributes.getString("nearest_mode", "round_prefer_floor")
              : "";
        if (
          [
            "round_prefer_floor",
            "round_prefer_ceil",
            "floor",
            "ceil",
            "",
          ].indexOf(l) === -1
        )
          throw new Error(`nearest_mode '${l}' is not supported`);
        let f = i.attributes.getFloat("cubic_coeff_a", -0.75),
          p = i.attributes.getInt("exclude_outside", 0) !== 0;
        if (p && t !== "cubic")
          throw new Error(
            "exclude_outside can be set to 1 only when mode is CUBIC."
          );
        let d =
            e < 11
              ? !0
              : t === "nearest" && s === "asymmetric" && l === "floor",
          y = 0,
          T = 0,
          v = 0;
        return (
          e > 10
            ? i.inputs.length > 2
              ? ((y = 1), (T = 2), (v = 3))
              : ((T = 1), (v = 2))
            : e === 9 && (T = 1),
          W({
            opset: e,
            isResize: o,
            mode: t,
            scales: r,
            extrapolationValue: n,
            coordinateTransformMode: s,
            useExtrapolation: u,
            needRoiInput: a,
            nearestMode: l,
            cubicCoefficientA: f,
            excludeOutside: p,
            useNearest2xOptimization: d,
            roiInputIdx: y,
            scalesInputIdx: T,
            sizesInputIdx: v,
          })
        );
      }),
      (zb = (i, e, o) => {
        let t = G(i.session.backend.glContext.version),
          [r, n] = i.calculateTextureWidthAndHeight(e[0].dims, 0),
          s = e[0].dims.map((v, S) => Math.floor(v * o.scales[S])),
          [a, u] = i.calculateTextureWidthAndHeight(s, 0),
          l = s.length,
          f = new Array(l),
          p = new Array(l),
          d = `
      int output_pitches[${l}];
      int input_pitches[${l}];
      `;
        for (let v = l - 1; v >= 0; v--)
          (f[v] = v === l - 1 ? 1 : f[v + 1] * s[v + 1]),
            (p[v] = v === l - 1 ? 1 : p[v + 1] * e[0].dims[v + 1]),
            (d += `
        output_pitches[${v}] = ${f[v]};
        input_pitches[${v}] = ${p[v]};
        `);
        let y = `
      float getInputFloat(int index) {
        vec2 coords = offsetToCoords(index, ${r}, ${n});
        float value = getColorAsFloat(${t.texture2D}(X, coords));
        return value;
      }
      `,
          T =
            o.mode === "nearest"
              ? `
    ${y}
    float process(int indices[${l}]) {
      int input_index = 0;
      int output_index = coordsToOffset(TexCoords, ${a}, ${u});

      ${d}

      int d, m;
      for (int dim = 0; dim < ${l}; ++dim) {
        d = output_index / output_pitches[dim];
        m = output_index - d * output_pitches[dim];
        output_index = m;

        if (scales[dim] != 1 && d > 0) {
          int d2 = d / scales[dim];
          m = d - d2 * scales[dim];
          d = d2;
        }
        input_index += input_pitches[dim] * d;
      }

      return getInputFloat(input_index);
    }`
              : l === 4
              ? `
    ${y}
    float process(int indices[4]) {
      int input_index = 0;
      int output_index = coordsToOffset(TexCoords, ${a}, ${u});

      ${d}

      int m;
      int index_of_dim0, index_of_dim1, index_of_dim2, index_of_dim3;
      index_of_dim0 = output_index / output_pitches[0];
      m = output_index - index_of_dim0 * output_pitches[0];
      index_of_dim1 = m / output_pitches[1];
      m = m - index_of_dim1 * output_pitches[1];
      index_of_dim2 = m / output_pitches[2];
      m = m - index_of_dim2 * output_pitches[2];
      index_of_dim3 = m;

      int index_of_input_dim2, index_of_input_dim3, x_offset, y_offset;
      index_of_input_dim2 = index_of_dim2 / scales[2];
      y_offset = index_of_dim2 - index_of_input_dim2 * scales[2];
      index_of_input_dim3 = index_of_dim3 / scales[3];
      x_offset = index_of_dim3 - index_of_input_dim3 * scales[3];

      input_index = index_of_dim0 * input_pitches[0] +
            index_of_dim1 * input_pitches[1] +
            index_of_input_dim2 * input_pitches[2] +
            index_of_input_dim3;

      float x00 = getInputFloat(input_index);
      float x10, x01, x11;

      bool end_of_dim2 = false;
      if (index_of_input_dim2 == (${e[0].dims[2]} - 1)) {
        // It's the end in dimension 2
        x01 = x00;
        end_of_dim2 = true;
      } else {
        x01 = getInputFloat(input_index + input_pitches[2]);
      }

      if (index_of_input_dim3 == (input_pitches[2] - 1)) {
        // It's the end in dimension 3
        x10 = x00;
        x11 = x01;
      }
      else {
        x10 = getInputFloat(input_index + 1);
        x11 = end_of_dim2 ? x10 : getInputFloat(input_index + input_pitches[2] + 1);
      }

      float y0 = x00 + float(y_offset) * (x01 - x00) / float(scales[2]);
      float y1 = x10 + float(y_offset) * (x11 - x10) / float(scales[2]);
      return y0 + float(x_offset) * (y1 - y0) / float(scales[3]);
    }`
              : `
    ${y}
    float process(int indices[2]) {
      int input_index = 0;
      int output_index = coordsToOffset(TexCoords, ${a}, ${u});

      ${d}

      int m;
      int index_of_dim0, index_of_dim1;
      index_of_dim0 = output_index / output_pitches[0];
      m = output_index - index_of_dim0 * output_pitches[0];
      index_of_dim1 = m;

      int index_of_input_dim0, index_of_input_dim1, x_offset, y_offset;
      index_of_input_dim0 = index_of_dim0 / scales[0];
      y_offset = index_of_dim0 - index_of_input_dim0 * scales[0];
      index_of_input_dim1 = index_of_dim1 / scales[1];
      x_offset = index_of_dim1 - index_of_input_dim1 * scales[1];

      input_index = index_of_input_dim0 * input_pitches[0] + index_of_input_dim1;

      float x00 = getInputFloat(input_index);
      float x10, x01, x11;

      bool end_of_dim0 = false;
      if (index_of_input_dim0 == (${e[0].dims[0]} - 1)) {
        // It's the end in dimension 0
        x01 = x00;
        end_of_dim0 = true;
      } else {
        x01 = getInputFloat(input_index + input_pitches[0]);
      }

      if (index_of_input_dim1 == (input_pitches[0] - 1)) {
        // It's the end in dimension 1
        x10 = x00;
        x11 = x01;
      }
      else {
        x10 = getInputFloat(input_index + 1);
        x11 = end_of_dim0 ? x10 : getInputFloat(input_index + input_pitches[0] + 1);
      }

      float y0 = x00 + float(y_offset) * (x01 - x00) / float(scales[0]);
      float y1 = x10 + float(y_offset) * (x11 - x10) / float(scales[0]);
      return y0 + float(x_offset) * (y1 - y0) / float(scales[1]);
    }`;
        return {
          ...vc,
          output: { dims: s, type: e[0].type, textureType: 0 },
          shaderSource: T,
          variables: [
            {
              name: "scales",
              type: "int",
              arrayLength: o.scales.length,
              data: o.scales.map((v) => Math.ceil(v)),
            },
          ],
        };
      }),
      (Di = (i, e) => {
        if (
          !i ||
          (e.opset < 9 && i.length !== 1) ||
          (e.opset >= 9 && e.opset < 11 && i.length !== 2) ||
          (e.opset >= 11 && i.length < 2)
        )
          throw new Error("invalid inputs.");
        if (e.scales.length > 0 && i[0].dims.length !== e.scales.length)
          throw new Error("Invalid input shape.");
        if (i[0].type === "string")
          throw new Error("Invalid input tensor types.");
      }),
      (Mn = (i, e, o) => {
        if (o) {
          for (let t of i)
            if (t <= 0)
              throw new Error("Scale value should be greater than 0.");
        } else
          for (let t of i)
            if (t < 1)
              throw new Error(
                "Scale value should be greater than or equal to 1."
              );
        if (
          (e === "linear" || e === "cubic") &&
          i.length !== 2 &&
          (i.length !== 4 || i[0] !== 1 || i[1] !== 1)
        )
          throw new Error(
            `'Linear' mode and 'Cubic' mode only support 2-D inputs ('Bilinear', 'Bicubic')         or 4-D inputs with the corresponding outermost 2 scale values being 1         in the ${
              o ? "Resize" : "Upsample"
            } opeartor.`
          );
      });
  });
var $i,
  ki,
  Oc,
  Sc,
  Wb,
  Hb,
  qb,
  jb,
  Ac = O(() => {
    "use strict";
    ut();
    j();
    pe();
    He();
    Li();
    ($i = { name: "Resize", inputNames: ["A"], inputTypes: [2] }),
      (ki = (i, e, o) => (
        Di(e, o),
        [i.run({ ...$i, cacheHint: o.cacheKey, get: () => Wb(i, e, o) }, e)]
      )),
      (Oc = (i) => Gr(i, 10)),
      (Sc = (i) => Gr(i, 11)),
      (Wb = (i, e, o) => {
        let t = G(i.session.backend.glContext.version),
          [r, n] = Hb(e, o);
        if (
          r.every((A) => A === 1) &&
          o.coordinateTransformMode !== "tf_crop_and_resize"
        )
          return {
            ...$i,
            output: { dims: n, type: e[0].type, textureType: 2 },
            hasMain: !0,
            shaderSource: `void main() {
                    vec4 v = ${t.texture2D}(X, TexCoords);
                    ${t.output} = v;
                }`,
          };
        let a = n.length;
        if (a < 2)
          throw new Error(
            `output dimension should be at least 2, but got ${a}`
          );
        let u = n[a - 2],
          l = n[a - 1],
          f = e[0].dims;
        if (a !== f.length)
          throw new Error(
            `output dimension should match input ${f.length}, but got ${a}`
          );
        let p = f[a - 2],
          d = f[a - 1],
          y = r[a - 2],
          T = r[a - 1],
          v = "";
        if (o.mode !== "linear")
          throw new Error(`resize (packed) does not support mode: '${o.mode}'`);
        switch (o.coordinateTransformMode) {
          case "asymmetric":
            v = `
                    vec4 getSourceFracIndex(ivec4 coords) {
                        return vec4(coords) / scaleWHWH;
                    }
                `;
            break;
          case "half_pixel":
            v = `
                    vec4 getSourceFracIndex(ivec4 coords) {
                        return (vec4(coords) + 0.5) / scaleWHWH - 0.5;
                    }
                `;
            break;
          case "pytorch_half_pixel":
            v = `
                    vec4 getSourceFracIndex(ivec4 coords) {
                        vec4 fcoords = vec4(coords);
                        return vec4(
                            ${l}.0 > 1.0 ? (fcoords.x + 0.5) / scaleWHWH.x - 0.5 : 0.0,
                            ${u}.0 > 1.0 ? (fcoords.y + 0.5) / scaleWHWH.y - 0.5 : 0.0,
                            ${l}.0 > 1.0 ? (fcoords.z + 0.5) / scaleWHWH.z - 0.5 : 0.0,
                            ${u}.0 > 1.0 ? (fcoords.w + 0.5) / scaleWHWH.w - 0.5 : 0.0
                          );
                    }
                `;
            break;
          case "align_corners":
            v = `
                    vec4 getSourceFracIndex(ivec4 coords) {
                        vec4 resized = vec4(${l}.0 - 1.0, ${u}.0 - 1.0, ${l}.0 - 1.0,
                            ${u}.0 - 1.0);
                        vec4 original = vec4(${d}.0 - 1.0, ${p}.0 - 1.0, ${d}.0 - 1.0,
                            ${p}.0 - 1.0);
                        vec4 new_scale = original / resized;
                        return vec4(coords) * new_scale;
                    }
                `;
            break;
          default:
            throw new Error(
              `resize (packed) does not support coordinateTransformMode:                                 '${o.coordinateTransformMode}'`
            );
        }
        let S = Bt(a),
          L = de(),
          P = `
            const vec2 inputWH = vec2(${p}.0, ${d}.0);
            const vec4 scaleWHWH = vec4(float(${y}), float(${T}), float(${y}), float(${T}));
            ${L}
            ${v}
            float getAValue(int x10, int r, int c, int d) {
                return getChannel(getA(x10, r, c, d), vec2(c, d));
            }
            void main() {
                ${S} rc = getOutputCoords();

                int batch = rc[0];
                int depth = rc[1];

                // retrieve the 4 coordinates that is used in the 4 packed output values.
                ivec4 coords = ivec4(rc.wz, rc.w + 1, rc.z + 1);

                // calculate the source index in fraction
                vec4 sourceFrac = getSourceFracIndex(coords);

                // get the lower and upper bound of the 4 values that will be packed into one texel.
                ivec4 x00 = ivec4(max(sourceFrac.xy, vec2(0.0)), min(inputWH - 1.0, ceil(sourceFrac.xy)));
                ivec4 x01 = ivec4(max(sourceFrac.xw, vec2(0.0)), min(inputWH - 1.0, ceil(sourceFrac.xw)));
                ivec4 x10 = ivec4(max(sourceFrac.zy, vec2(0.0)), min(inputWH - 1.0, ceil(sourceFrac.zy)));
                ivec4 x11 = ivec4(max(sourceFrac.zw, vec2(0.0)), min(inputWH - 1.0, ceil(sourceFrac.zw)));

                bool hasNextRow = rc.w < ${u - 1};
                bool hasNextCol = rc.z < ${l - 1};

                // pack x00, x01, x10, x11's top-left corner into one vec4 structure
                vec4 topLeft = vec4(
                    getAValue(batch, depth, x00.x, x00.y),
                    hasNextCol ? getAValue(batch, depth, x01.x, x01.y) : 0.0,
                    hasNextRow ? getAValue(batch, depth, x10.x, x10.y) : 0.0,
                    (hasNextRow && hasNextCol) ? getAValue(batch, depth, x11.x, x11.y) : 0.0);

                // pack x00, x01, x10, x11's top-right corner into one vec4 structure
                vec4 topRight = vec4(
                    getAValue(batch, depth, x00.x, x00.w),
                    hasNextCol ? getAValue(batch, depth, x01.x, x01.w) : 0.0,
                    hasNextRow ? getAValue(batch, depth, x10.x, x10.w) : 0.0,
                    (hasNextRow && hasNextCol) ? getAValue(batch, depth, x11.x, x11.w) : 0.0);

                // pack x00, x01, x10, x11's bottom-left corner into one vec4 structure
                vec4 bottomLeft = vec4(
                    getAValue(batch, depth, x00.z, x00.y),
                    hasNextCol ? getAValue(batch, depth, x01.z, x01.y) : 0.0,
                    hasNextRow ? getAValue(batch, depth, x10.z, x10.y) : 0.0,
                    (hasNextRow && hasNextCol) ? getAValue(batch, depth, x11.z, x11.y) : 0.0);

                // pack x00, x01, x10, x11's bottom-right corner into one vec4 structure
                vec4 bottomRight = vec4(
                    getAValue(batch, depth, x00.z, x00.w),
                    hasNextCol ? getAValue(batch, depth, x01.z, x01.w) : 0.0,
                    hasNextRow ? getAValue(batch, depth, x10.z, x10.w) : 0.0,
                    (hasNextRow && hasNextCol) ? getAValue(batch, depth, x11.z, x11.w) : 0.0);

                // calculate the interpolation fraction on u and v direction
                vec4 frac = vec4(sourceFrac) - floor(sourceFrac);
                vec4 clampFrac = clamp(frac, vec4(0.0), vec4(1.0));

                vec4 top = mix(topLeft, topRight, clampFrac.ywyw);
                vec4 bottom = mix(bottomLeft, bottomRight, clampFrac.ywyw);
                vec4 newValue = mix(top, bottom, clampFrac.xxzz);

                ${t.output} = vec4(newValue);
            }
        `;
        return {
          ...$i,
          output: { dims: n, type: e[0].type, textureType: 2 },
          hasMain: !0,
          shaderSource: P,
        };
      }),
      (Hb = (i, e) => {
        let t = i[0].dims,
          r = e.scales,
          n;
        if (r.length === 0) {
          let a = i[e.scalesInputIdx];
          if (a && a.size !== 0) {
            if (i[e.sizesInputIdx])
              throw new Error(
                "Only one of scales or sizes must be provided as input."
              );
            r = qb(a, e.mode, e.isResize);
          } else {
            let u = i[e.sizesInputIdx];
            if (!u || u.size === 0)
              throw new Error(
                "Either scales or sizes MUST be provided as input."
              );
            (n = Array.from(u.integerData)), (r = jb(n, t, e.mode, e.isResize));
          }
        } else if (i[e.sizesInputIdx])
          throw new Error(
            "Only one of scales or sizes must be provided as input."
          );
        let s = n || t.map((a, u) => Math.floor(a * r[u]));
        return [r, s];
      }),
      (qb = (i, e, o) => {
        let t = Array.from(i.floatData);
        return Mn(t, e, o), t;
      }),
      (jb = (i, e, o, t) => {
        let r = e.length,
          n = new Array(r);
        for (let s = 0, a = r; s < a; s++)
          if (e[s] === 0) {
            if (i[s] !== 0)
              throw new Error(
                "Input dim is zero but required output dim is non-zero."
              );
            n[s] = 1;
          } else n[s] = i[s] / e[s];
        return Mn(n, o, t), n;
      });
  });
var Pc,
  Xb,
  Ec = O(() => {
    "use strict";
    We();
    (Pc = (i, e) => (
      Xb(e),
      [
        new bt(
          [e[0].dims.length],
          "int32",
          void 0,
          void 0,
          new Int32Array(e[0].dims)
        ),
      ]
    )),
      (Xb = (i) => {
        if (!i || i.length !== 1) throw new Error("Shape requires 1 input.");
      });
  });
var Bi,
  Dc,
  Lc,
  $c,
  Kb,
  kc,
  Jb,
  Yb,
  Bc = O(() => {
    "use strict";
    It();
    Rr();
    Y();
    j();
    (Bi = { name: "Slice", inputNames: ["A"], inputTypes: [0] }),
      (Dc = (i, e, o) => (
        Kb(e),
        [i.run({ ...Bi, cacheHint: o.cacheKey, get: () => $c(i, e[0], o) }, e)]
      )),
      (Lc = (i) => {
        let e = i.attributes.getInts("starts"),
          o = i.attributes.getInts("ends"),
          t = i.attributes.getInts("axes", []);
        return W({ starts: e, ends: o, axes: t });
      }),
      ($c = (i, e, o) => {
        let t = o.axes.length === 0 ? e.dims.slice(0).map((p, d) => d) : o.axes,
          r = B.normalizeAxes(t, e.dims.length),
          n = o.starts.map((p, d) =>
            p > e.dims[r[d]] - 1
              ? e.dims[r[d]]
              : B.normalizeAxis(p, e.dims[r[d]])
          ),
          s = o.ends.map((p, d) =>
            p > e.dims[r[d]] - 1
              ? e.dims[r[d]]
              : B.normalizeAxis(p, e.dims[r[d]])
          ),
          a = e.dims.slice(),
          u = [];
        for (let p = 0; p < r.length; p++)
          (a[r[p]] = s[p] - n[p]),
            n[p] > 0 && u.push(`outputIdx[${r[p]}] += ${n[p]};`);
        let f = `
      float process(int outputIdx[${a.length}]) {
        ${u.join(`
      `)}
        return _A(outputIdx);
      }`;
        return {
          ...Bi,
          output: { dims: a, type: e.type, textureType: 0 },
          shaderSource: f,
        };
      }),
      (Kb = (i) => {
        if (!i || i.length !== 1) throw new Error("Slice requires 1 input.");
        if (Pe.indexOf(i[0].type) === -1)
          throw new Error("Invalid input type.");
      }),
      (kc = (i, e) => {
        Yb(e);
        let o = Jb(i, e);
        return [
          i.run({ ...Bi, cacheHint: o.cacheKey, get: () => $c(i, e[0], o) }, [
            e[0],
          ]),
        ];
      }),
      (Jb = (i, e) => {
        if (
          !i.session.isInitializer(e[1].dataId) ||
          !i.session.isInitializer(e[2].dataId) ||
          (e.length >= 4 && !i.session.isInitializer(e[3].dataId)) ||
          (e.length >= 5 && !i.session.isInitializer(e[4].dataId))
        )
          throw new Error("dynamic slice attributes are not allowed");
        if (e.length >= 5 && e[4].integerData.some((s) => s !== 1))
          throw new Error("currently non-1 steps is not supported for Slice");
        let o = Array.from(e[1].integerData),
          t = Array.from(e[2].integerData),
          r = e.length >= 4 ? Array.from(e[3].integerData) : [],
          n = `${r};${o};${t}`;
        return { starts: o, ends: t, axes: r, cacheKey: n };
      }),
      (Yb = (i) => {
        if (!i || i.length < 3 || i.length > 5)
          throw new Error("Invalid input number.");
        if (i[1].type !== "int32" || i[1].dims.length !== 1)
          throw new Error("Invalid input type.");
        if (i[2].type !== "int32" || i[2].dims.length !== 1)
          throw new Error("Invalid input type.");
        if (i.length >= 4 && (i[3].type !== "int32" || i[3].dims.length !== 1))
          throw new Error("Invalid input type.");
        if (i.length >= 5 && (i[4].type !== "int32" || i[4].dims.length !== 1))
          throw new Error("Invalid input type.");
      });
  });
var Fc,
  Cc,
  Nc,
  Rc,
  Gc,
  Mc,
  Uc,
  Vc,
  Zb,
  Qb,
  tg,
  zc,
  Wc = O(() => {
    "use strict";
    It();
    Y();
    ut();
    j();
    Nn();
    (Fc = { name: "SoftmaxComputeMax", inputNames: ["A"], inputTypes: [0] }),
      (Cc = {
        name: "SoftmaxComputeScale",
        inputNames: ["A", "Max"],
        inputTypes: [0, 0],
      }),
      (Nc = {
        name: "SoftMax",
        inputNames: ["A", "Max", "Norm"],
        inputTypes: [0, 0, 0],
      }),
      (Rc = (i, e, o) => {
        zc(e);
        let t = e[0].dims.slice(),
          r = B.normalizeAxis(o.axis, t.length),
          n = B.sizeToDimension(t, r),
          s = B.sizeFromDimension(t, r);
        return Vc(i, e, o, n, s);
      }),
      (Gc = (i) => W({ axis: i.attributes.getInt("axis", 1) })),
      (Mc = (i) => W({ axis: i.attributes.getInt("axis", -1) })),
      (Uc = (i, e, o) => {
        zc(e);
        let t = e[0].dims.slice(),
          r = B.normalizeAxis(o.axis, t.length),
          n = t.length,
          s = r !== n - 1,
          a = [],
          u = [],
          l = [],
          f;
        s &&
          ((u = Array.from({ length: n }).map((T, v) => v)),
          (u[r] = n - 1),
          (u[n - 1] = r),
          u.map((T) => a.push(t[T])),
          (f = W({ perm: u })),
          (l = je(i, e, f)));
        let p = s ? B.sizeToDimension(a, n - 1) : B.sizeToDimension(t, n - 1),
          d = s ? B.sizeFromDimension(a, n - 1) : B.sizeFromDimension(t, n - 1),
          y = Vc(i, s ? l : e, o, p, d);
        return s ? je(i, y, f) : y;
      }),
      (Vc = (i, e, o, t, r) => {
        let n = Zb(i, e[0], t, r, [t]),
          s = i.run({ ...Fc, cacheHint: o.cacheKey, get: () => n }, e),
          a = Qb(i, e[0], t, r, n.output.dims, [t]),
          u = i.run({ ...Cc, cacheHint: o.cacheKey, get: () => a }, [e[0], s]),
          l = tg(i, e[0], t, r, n.output.dims, a.output.dims);
        return [
          i.run({ ...Nc, cacheHint: o.cacheKey, get: () => l }, [e[0], s, u]),
        ];
      }),
      (Zb = (i, e, o, t, r) => {
        let [n, s] = i.calculateTextureWidthAndHeight(e.dims, 0),
          a = r.length;
        if (o < 1 || t < 1)
          throw new Error(
            "Logical row count N and feature count D must be greater than or equal to 1"
          );
        if (r.length !== 1)
          throw new Error("Dimensionality of the output should be 1");
        if (r[0] !== o)
          throw new Error(
            "Shape of the output should be equal to logical row count"
          );
        let u = G(i.session.backend.glContext.version),
          l = `
      float process(int[${a}] indices) {
        int logical_row_start_offset = indices[0] * ${t};

        float max = getColorAsFloat(${u.texture2D}(A, offsetToCoords(logical_row_start_offset, ${n},
        ${s} )));
        for(int i=1; i<${t}; ++i)
        {
          float current = getColorAsFloat(${u.texture2D}(A, offsetToCoords(logical_row_start_offset + i,
            ${n}, ${s})));
          if(current > max)
          max = current;
        }

        return max;
      }`;
        return {
          ...Fc,
          output: { dims: r, type: e.type, textureType: 0 },
          shaderSource: l,
        };
      }),
      (Qb = (i, e, o, t, r, n) => {
        let [s, a] = i.calculateTextureWidthAndHeight(e.dims, 0),
          u = n.length;
        if (o < 1 || t < 1)
          throw new Error(
            "Logical row count N and feature count D must be greater than or equal to 1"
          );
        if (n.length !== 1)
          throw new Error("Dimensionality of the output should be 1");
        if (n[0] !== o)
          throw new Error(
            "Shape of the output should be equal to logical row count"
          );
        if (r.length !== 1)
          throw new Error(
            "Dimensionality of the intermediate results should be 1"
          );
        if (r[0] !== o)
          throw new Error(
            "Shape of the intermediate results should be equal to logical row count"
          );
        let l = G(i.session.backend.glContext.version),
          f = `
      float process(int[${u}] indices) {
        int logical_row_start_offset = indices[0] * ${t};

        float norm_factor = 0.0;
        float max = _Max(indices);
        for(int i=0; i<${t}; ++i)
        {
          norm_factor += exp(getColorAsFloat(${l.texture2D}(A, offsetToCoords(logical_row_start_offset + i,
            ${s}, ${a}))) - max);
        }

        return norm_factor;
      }`;
        return {
          ...Cc,
          output: { dims: n, type: e.type, textureType: 0 },
          shaderSource: f,
        };
      }),
      (tg = (i, e, o, t, r, n) => {
        let [s, a] = i.calculateTextureWidthAndHeight(e.dims, 0),
          u = e.dims.length;
        if (o < 1 || t < 1)
          throw new Error(
            "Logical row count N and feature count D must be greater than or equal to 1"
          );
        if (r.length !== 1 || n.length !== 1)
          throw new Error(
            "Dimensionality of the intermediate results should be 1"
          );
        if (r[0] !== o || n[0] !== o)
          throw new Error(
            "Shape of the intermediate results should be equal to logical row count"
          );
        let l = `
      float process(int[${u}] indices) {

      // get offset of current logical tensor index from the 2-D texture coordinates (TexCoords)
      int offset = coordsToOffset(TexCoords, ${s}, ${a});

      //determine the logical row for this index
      int logical_row_index[1];
      logical_row_index[0] = offset / ${t};

      float norm_factor = _Norm(logical_row_index);

      // avoid possible division by 0
      // if norm_facor is 0, all elements are zero
      // if so, return 0
      if(norm_factor == 0.0)
        return 0.0;

      return exp(_A(indices) - _Max(logical_row_index)) / norm_factor;
    }`;
        return {
          ...Nc,
          output: { dims: e.dims, type: e.type, textureType: 0 },
          shaderSource: l,
        };
      }),
      (zc = (i) => {
        if (!i || i.length !== 1) throw new Error("Softmax requires 1 input.");
        if (i[0].type !== "float32" && i[0].type !== "float64")
          throw new Error("Invalid input type");
      });
  });
var Hc,
  qc,
  jc,
  eg,
  rg,
  ng,
  Xc = O(() => {
    "use strict";
    It();
    Y();
    j();
    (Hc = { name: "Split", inputNames: ["A"], inputTypes: [0] }),
      (qc = (i, e, o) => {
        ng(e);
        let t = B.normalizeAxis(o.axis, e[0].dims.length),
          r = eg(i, e, t, o),
          n = [];
        for (let s = 0; s < r; ++s)
          n.push(
            i.run(
              {
                ...Hc,
                cacheHint: `${o.cacheKey};${s}`,
                get: () => rg(i, e[0], o, t, s),
              },
              e
            )
          );
        return n;
      }),
      (jc = (i) => {
        let e = i.attributes.getInt("axis", 0),
          o = i.attributes.getInts("split", []),
          t = i.outputs.length;
        return W({ axis: e, split: o, numOutputs: t });
      }),
      (eg = (i, e, o, t) => {
        let [, r] = $r.splitShape(e[0].dims, o, t.split, t.numOutputs);
        return r.length;
      }),
      (rg = (i, e, o, t, r) => {
        let [n, s] = $r.splitShape(e.dims, t, o.split, o.numOutputs),
          a = s[r],
          u = n[r],
          f = `
      float process(int indices[${u.length}]) {
        indices[${t}] += ${a};
        return _A(indices);
      }
    `;
        return {
          ...Hc,
          cacheHint: `${o.cacheKey}:${r}`,
          output: { dims: u, type: e.type, textureType: 0 },
          shaderSource: f,
        };
      }),
      (ng = (i) => {
        if (!i || i.length !== 1) throw new Error("Split requires one input.");
        if (
          i[0].type !== "int8" &&
          i[0].type !== "uint8" &&
          i[0].type !== "int16" &&
          i[0].type !== "uint16" &&
          i[0].type !== "int32" &&
          i[0].type !== "uint32" &&
          i[0].type !== "float32" &&
          i[0].type !== "float64" &&
          i[0].type !== "bool"
        )
          throw new Error("Invalid input type.");
      });
  });
var Fi,
  Kc,
  Jc,
  og,
  ig,
  Yc = O(() => {
    "use strict";
    Y();
    (Fi = (i, e, o) => {
      og(e);
      let t = B.squeezeShape(e[0].dims, o);
      return [i.reshapeUnpacked(e[0], t)];
    }),
      (Kc = (i, e) => (ig(e), Fi(i, [e[0]], Array.from(e[1].integerData)))),
      (Jc = (i) => i.attributes.getInts("axes")),
      (og = (i) => {
        if (!i || i.length !== 1) throw new Error("Squeeze requires 1 input.");
        if (i[0].type === "string")
          throw new Error("invalid input tensor types.");
      }),
      (ig = (i) => {
        if (!i || i.length !== 2) throw new Error("Squeeze requires 2 inputs.");
        if (i[1].type !== "int32") throw new Error("Invalid input type.");
      });
  });
var Zc,
  ag,
  sg,
  Qc = O(() => {
    "use strict";
    ut();
    j();
    (Zc = (i, e) => {
      sg(e);
      let o = {
        name: "Sum",
        inputNames: e.map((r, n) => `X${n}`),
        inputTypes: new Array(e.length).fill(0),
      };
      return [i.run({ ...o, get: () => ag(i, e, o) }, e)];
    }),
      (ag = (i, e, o) => {
        let t = G(i.session.backend.glContext.version),
          r = e[0].dims.slice(),
          s = `
      void main() {
        vec4 result = ${e
          .map((a, u) => `${t.texture2D}(X${u},TexCoords)`)
          .join(" + ")};
        ${t.output} = result;
      }
    `;
        return {
          ...o,
          output: { dims: r, type: e[0].type, textureType: 0 },
          hasMain: !0,
          shaderSource: s,
        };
      }),
      (sg = (i) => {
        if (!i || i.length === 0) throw new Error("Sum requires inputs.");
        let e = i[0].dims.length;
        for (let o = 1; o < i.length; o++) {
          if (e !== i[o].dims.length)
            throw new Error("Input shapes are mismatched.");
          for (let t = 0; t < e; t++)
            if (i[0].dims[t] !== i[o].dims[t])
              throw new Error("Input shapes are not matched.");
        }
        if (i[0].type !== "float32" && i[0].type !== "float64")
          throw new Error("Invalid input type.");
        for (let o = 1; o < i.length; o++)
          if (i[0].type !== i[o].type)
            throw new Error("Input types are not matched.");
      });
  });
var tp,
  ug,
  lg,
  ep = O(() => {
    "use strict";
    Rr();
    j();
    (tp = (i, e) => {
      lg(e);
      let o = { name: "Tile", inputNames: ["A"], inputTypes: [0] };
      return [i.run({ ...o, get: () => ug(i, e, o) }, e)];
    }),
      (ug = (i, e, o) => {
        let t = e[0].dims.slice(),
          r = new Array(t.length),
          n = [];
        for (let u = 0; u < t.length; u++)
          (r[u] = t[u] * e[1].numberData[u]),
            n.push(
              `inputIdx[${u}] = int(mod(float(outputIdx[${u}]), ${t[u]}.));`
            );
        let s = r.length,
          a = `
      float process(int outputIdx[${s}]) {
        int inputIdx[${s}];
        ${n.join(`
`)}
        return _A(inputIdx);
      }
    `;
        return {
          ...o,
          output: { dims: r, type: e[0].type, textureType: 0 },
          shaderSource: a,
        };
      }),
      (lg = (i) => {
        if (!i || i.length !== 2) throw new Error("Tile requires 2 input.");
        if (i[1].dims.length !== 1)
          throw new Error("The second input shape must 1 dimension.");
        if (i[1].dims[0] !== i[0].dims.length)
          throw new Error("Invalid input shape.");
        if (Pe.indexOf(i[0].type) === -1)
          throw new Error("Invalid input type.");
        if (i[1].type !== "int32" && i[1].type !== "int16")
          throw new Error("Invalid repeat type.");
      });
  });
var Ci,
  rp,
  np,
  fg,
  cg,
  op = O(() => {
    "use strict";
    Y();
    (Ci = (i, e, o) => {
      fg(e);
      let t = B.unsqueezeShape(e[0].dims, o);
      return [i.reshapeUnpacked(e[0], t)];
    }),
      (rp = (i, e) => (cg(e), Ci(i, [e[0]], Array.from(e[1].integerData)))),
      (np = (i) => i.attributes.getInts("axes")),
      (fg = (i) => {
        if (!i || i.length !== 1)
          throw new Error("Unsqueeze requires 1 input.");
        if (i[0].type === "string")
          throw new Error("invalid input tensor types.");
      }),
      (cg = (i) => {
        if (!i || i.length !== 2)
          throw new Error("Unsqueeze requires 2 inputs.");
        if (i[1].type !== "int32") throw new Error("Invalid input type.");
      });
  });
var ip,
  ap = O(() => {
    "use strict";
    ml();
    Pl();
    Ll();
    Nl();
    Bn();
    wf();
    Af();
    Df();
    kf();
    Nf();
    Mf();
    Wf();
    Xf();
    Fn();
    Zf();
    cc();
    xc();
    wc();
    Ac();
    Ec();
    Bc();
    Wc();
    Xc();
    Yc();
    Qc();
    ep();
    Nn();
    xi();
    op();
    Li();
    ip = [
      ["Abs", "", "6+", Rl],
      ["Acos", "", "7+", Gl],
      ["Add", "", "7+", bl],
      ["And", "", "7+", gl],
      ["Asin", "", "7+", Ml],
      ["Atan", "", "7+", Ul],
      ["AveragePool", "", "7+", tc, ec],
      ["BatchNormalization", "", "7+", dl, hl],
      ["Cast", "", "6+", El, Dl],
      ["Ceil", "", "6+", Wl],
      ["Clip", "", "6-10", gi, Vl],
      ["Clip", "", "11+", zl],
      ["Concat", "", "4+", Bl, Cl],
      ["Conv", "", "1+", Oi, Si],
      ["ConvTranspose", "", "1+", xf, Tf],
      ["Cos", "", "7+", Hl],
      ["Div", "", "7+", yl],
      ["Dropout", "", "7+", yi],
      ["DepthToSpace", "", "1+", Of, Sf],
      ["Equal", "", "7+", xl],
      ["Elu", "", "6+", ql, jl],
      ["Exp", "", "6+", Xl],
      ["Flatten", "", "1+", Pf, Ef],
      ["Floor", "", "6+", Kl],
      ["FusedConv", "com.microsoft", "1+", Oi, Si],
      ["Gather", "", "1+", Lf, $f],
      ["Gemm", "", "7-10", Ai, Ff],
      ["Gemm", "", "11+", Ai, Cf],
      ["GlobalAveragePool", "", "1+", nc, oc],
      ["GlobalMaxPool", "", "1+", lc],
      ["Greater", "", "7+", Tl],
      ["Identity", "", "1+", yi],
      ["ImageScaler", "", "1+", Rf, Gf],
      ["InstanceNormalization", "", "6+", Vf, zf],
      ["LeakyRelu", "", "6+", Jl, Yl],
      ["Less", "", "7+", wl],
      ["LRN", "", "1+", Hf, qf],
      ["Log", "", "6+", Zl],
      ["MatMul", "", "1+", pf, df],
      ["MaxPool", "", "1+", ic, ac],
      ["Mul", "", "7+", vl],
      ["Neg", "", "6+", Ql],
      ["Not", "", "1+", tf],
      ["Or", "", "7+", Il],
      ["Pad", "", "2-10", Pi, Kf],
      ["Pad", "", "11+", Jf, Yf],
      ["Pow", "", "7+", _l],
      ["PRelu", "", "7+", Ol],
      ["ReduceLogSum", "", "1+", gc, Ee],
      ["ReduceMax", "", "1+", hc, Ee],
      ["ReduceMean", "", "1+", dc, Ee],
      ["ReduceMin", "", "1+", mc, Ee],
      ["ReduceProd", "", "1+", bc, Ee],
      ["ReduceSum", "", "1-12", pc, Ee],
      ["ReduceSumSquare", "", "1+", yc, Ee],
      ["Relu", "", "6+", ef],
      ["Reshape", "", "5+", Tc],
      ["Resize", "", "10", ki, Oc],
      ["Resize", "", "11+", ki, Sc],
      ["Shape", "", "1+", Pc],
      ["Sigmoid", "", "6+", rf],
      ["Sin", "", "7+", nf],
      ["Slice", "", "10+", kc],
      ["Slice", "", "1-9", Dc, Lc],
      ["Softmax", "", "1-12", Rc, Gc],
      ["Softmax", "", "13+", Uc, Mc],
      ["Split", "", "2-12", qc, jc],
      ["Sqrt", "", "6+", of],
      ["Squeeze", "", "1-12", Fi, Jc],
      ["Squeeze", "", "13+", Kc],
      ["Sub", "", "7+", Sl],
      ["Sum", "", "6+", Zc],
      ["Tan", "", "7+", af],
      ["Tanh", "", "6+", sf],
      ["Tile", "", "6+", tp],
      ["Transpose", "", "1+", je, If],
      ["Upsample", "", "7-8", Ei, Ic],
      ["Upsample", "", "9", Ei, _c],
      ["Unsqueeze", "", "1-12", Ci, np],
      ["Unsqueeze", "", "13+", rp],
      ["Xor", "", "7+", Al],
    ];
  });
function up(i) {
  let e = {},
    o;
  for (; (o = sp.exec(i)) !== null; ) {
    let t = o[3]
      .split(",")
      .map((r) => {
        let n = r.trim().split(" ");
        return n && n.length === 2 ? { type: n[0], name: n[1] } : null;
      })
      .filter((r) => r !== null);
    e[o[2]] = { params: t, body: o[4] };
  }
  for (let t in e) {
    let r = pg.replace("__FUNC__", t),
      n = new RegExp(r, "gm");
    for (; (o = n.exec(i)) !== null; ) {
      let s = o[1],
        a = o[2],
        u = o[3].split(","),
        l = s ? `${s} ${a};` : "",
        f = e[t].body,
        p = "";
      e[t].params.forEach((y, T) => {
        y &&
          (p += `${y.type} ${y.name} = ${u[T]};
`);
      }),
        (f = `${p}
 ${f}`),
        (f = f.replace("return", `${a} = `));
      let d = `
      ${l}
      {
        ${f}
      }
      `;
      i = i.replace(o[0], d);
    }
  }
  return (i = i.replace(sp, "")), i;
}
var sp,
  pg,
  lp = O(() => {
    "use strict";
    (sp =
      /@inline[\s\n\r]+(\w+)[\s\n\r]+([0-9a-zA-Z_]+)\s*\(([^)]*)\)\s*{(([^}]|[\n\r])*)}/gm),
      (pg = "(\\w+)?\\s+([_0-9a-zA-Z]+)\\s+=\\s+__FUNC__\\((.*)\\)\\s*;");
  });
function hr(i, e) {
  let o = [],
    t = [],
    r = e != null && Array.isArray(e) && e.length === 0,
    n = e == null || r ? null : dg(e, i).sort(),
    s = 0;
  for (let a = 0; a < i.length; ++a) {
    if (n != null) {
      if (n[s] === a && i[a] !== 1)
        throw new Error(
          `Can't squeeze axis ${a} since its dim '${i[a]}' is not 1`
        );
      (n[s] == null || n[s] > a) && i[a] === 1 && (o.push(i[a]), t.push(a)),
        n[s] <= a && s++;
    }
    i[a] !== 1 && (o.push(i[a]), t.push(a));
  }
  return { newShape: o, keptDims: t };
}
function dg(i, e) {
  let o = e.length;
  return (
    (i = i == null ? e.map((t, r) => r) : [].concat(i)),
    ur(
      i.every((t) => t >= -o && t < o),
      () =>
        `All values in axis param must be in range [-${o}, ${o}) but got axis ${i}`
    ),
    ur(
      i.every(hg),
      () => `All values in axis param must be integers but got axis ${i}`
    ),
    i.map((t) => (t < 0 ? o + t : t))
  );
}
function hg(i) {
  return i % 1 === 0;
}
function mg(i) {
  if (i.length === 0) return 1;
  let e = i[0];
  for (let o = 1; o < i.length; o++) e *= i[o];
  return e;
}
function fp(i) {
  let e = Math.ceil(Math.sqrt(i));
  return [e, Math.ceil(i / e)];
}
var Un,
  Ni = O(() => {
    "use strict";
    Ut();
    Y();
    Un = class {
      constructor(e) {
        this.maxTextureSize = e;
      }
      computeTextureWH(e, o) {
        let t = this.computeTexture(e, o);
        return (
          o && o.isPacked && ((t[0] /= 2), (t[1] /= 2)),
          o && o.reverseWH ? [t[1], t[0]] : t
        );
      }
      computeTexture(e, o) {
        let t = o && o.isPacked;
        if (e.length === 0) return t ? [2, 2] : [1, 1];
        let r = this.maxTextureSize;
        if (o && o.breakAxis !== void 0) {
          let a =
              o.breakAxis >= e.length
                ? 1
                : e.slice(o.breakAxis).reduce((l, f) => l * f),
            u =
              o.breakAxis <= 0
                ? 1
                : e.slice(0, o.breakAxis).reduce((l, f) => l * f);
          if (a > r || u > r)
            tt.verbose(
              "TextureLayout",
              `Given width/height preferences were unattainable: shape:${e}, breakAxis:${o.breakAxis}`
            );
          else return [a, u];
        }
        let n = e.slice(0);
        t &&
          ((r = r * 2),
          (n = n.map((a, u) =>
            u >= n.length - 2 ? (n[u] % 2 === 0 ? n[u] : n[u] + 1) : n[u]
          )),
          n.length === 1 && (n = [2, n[0]])),
          n.length !== 2 && (n = hr(n).newShape);
        let s = mg(n);
        return n.length <= 1 && s <= r
          ? [1, s]
          : n.length === 2 && n[0] <= r && n[1] <= r
          ? n
          : n.length === 3 && n[0] * n[1] <= r && n[2] <= r
          ? [n[0] * n[1], n[2]]
          : n.length === 3 && n[0] <= r && n[1] * n[2] <= r
          ? [n[0], n[1] * n[2]]
          : n.length === 4 && n[0] * n[1] * n[2] <= r && n[3] <= r
          ? [n[0] * n[1] * n[2], n[3]]
          : n.length === 4 && n[0] <= r && n[1] * n[2] * n[3] <= r
          ? [n[0], n[1] * n[2] * n[3]]
          : t
          ? fp(s / 4).map((a) => a * 2)
          : fp(s);
      }
    };
  });
var Vn,
  cp = O(() => {
    "use strict";
    Y();
    Te();
    ut();
    Ni();
    pe();
    Vn = class extends Ht {
      constructor(o) {
        super(o);
      }
      getFunctions() {
        return {
          ...this.offsetToCoords(),
          ...this.coordsToOffset(),
          ...this.toVec(),
          ...this.valueFrom(),
          ...this.getCommonUtilFuncs(),
          ...this.getInputsSamplingSnippets(),
          ...this.getOutputSamplingSnippet(),
        };
      }
      getCustomTypes() {
        return {};
      }
      offsetToCoords() {
        let o = "offsetToCoords";
        return {
          offsetToCoords: new k(`
      vec2 ${o}(int offset, int width, int height) {
        int t = offset / width;
        int s = offset - t*width;
        vec2 coords = (vec2(s,t) + vec2(0.5,0.5)) / vec2(width, height);
        return coords;
      }
      `),
        };
      }
      coordsToOffset() {
        let o = "coordsToOffset";
        return {
          coordsToOffset: new k(`
      int ${o}(vec2 coords, int width, int height) {
        float s = coords.s * float(width);
        float t = coords.t * float(height);
        int offset = int(t) * width + int(s);
        return offset;
      }
      `),
        };
      }
      getOutputSamplingSnippet() {
        let o = this.context.outputTextureLayout;
        return o.isPacked
          ? this.getPackedOutputSamplingSnippet(o)
          : this.getUnpackedOutputSamplingSnippet(o);
      }
      getPackedOutputSamplingSnippet(o) {
        let t = o.unpackedShape,
          r = [o.width, o.height],
          n = {},
          s = "getOutputCoords";
        switch (t.length) {
          case 0:
            n[s] = this.getOutputScalarCoords();
            break;
          case 1:
            n[s] = this.getOutputPacked1DCoords(t, r);
            break;
          case 2:
            n[s] = this.getOutputPacked2DCoords(t, r);
            break;
          case 3:
            n[s] = this.getOutputPacked3DCoords(t, r);
            break;
          default:
            n[s] = this.getOutputPackedNDCoords(t, r);
        }
        let u = `
      void setOutput(vec4 val) {
        ${G(this.context.glContext.version).output} = val;
      }
    `,
          l = "floatTextureSetRGBA";
        return (n[l] = new k(u)), n;
      }
      getUnpackedOutputSamplingSnippet(o) {
        let t = o.unpackedShape,
          r = [o.width, o.height],
          n = {},
          s = "getOutputCoords";
        switch (t.length) {
          case 0:
            n[s] = this.getOutputScalarCoords();
            break;
          case 1:
            n[s] = this.getOutputUnpacked1DCoords(t, r);
            break;
          case 2:
            n[s] = this.getOutputUnpacked2DCoords(t, r);
            break;
          case 3:
            n[s] = this.getOutputUnpacked3DCoords(t, r);
            break;
          case 4:
            n[s] = this.getOutputUnpacked4DCoords(t, r);
            break;
          case 5:
            n[s] = this.getOutputUnpacked5DCoords(t, r);
            break;
          case 6:
            n[s] = this.getOutputUnpacked6DCoords(t, r);
            break;
          default:
            throw new Error(`Unsupported output dimensionality: ${t.length}`);
        }
        let u = `
        void setOutput(float val) {
          ${G(this.context.glContext.version).output} = vec4(val, 0, 0, 0);
        }
    `,
          l = "floatTextureSetR";
        return (n[l] = new k(u)), n;
      }
      getOutputScalarCoords() {
        return new k(`
      int getOutputCoords() {
        return 0;
      }
    `);
      }
      getOutputPacked1DCoords(o, t) {
        let r = t,
          n = "";
        return r[0] === 1
          ? ((n = `
          int getOutputCoords() {
            return 2 * int(TexCoords.y * ${r[1]}.0);
          }
        `),
            new k(n))
          : r[1] === 1
          ? ((n = `
          int getOutputCoords() {
            return 2 * int(TexCoords.x * ${r[0]}.0);
          }
        `),
            new k(n))
          : ((n = `
        int getOutputCoords() {
          ivec2 resTexRC = ivec2(TexCoords.xy *
                                 vec2(${r[0]}, ${r[1]}));
          return 2 * (resTexRC.y * ${r[0]} + resTexRC.x);
        }
      `),
            new k(n));
      }
      getOutputPacked2DCoords(o, t) {
        let r = "";
        if (Me.arraysEqual(o, t))
          return (
            (r = `
        ivec2 getOutputCoords() {
          return 2 * ivec2(TexCoords.xy * vec2(${t[0]}, ${t[1]}));
        }
      `),
            new k(r)
          );
        let n = t,
          s = Math.ceil(o[1] / 2);
        return (
          (r = `
        ivec2 getOutputCoords() {
          ivec2 resTexRC = ivec2(TexCoords.xy *
                                vec2(${n[0]}, ${n[1]}));

          int index = resTexRC.y * ${n[0]} + resTexRC.x;

          // reverse r and c order for packed texture
          int r = imod(index, ${s}) * 2;
          int c = 2 * (index / ${s});

          return ivec2(r, c);
        }
      `),
          new k(r)
        );
      }
      getOutputPacked3DCoords(o, t) {
        let r = [t[0], t[1]],
          n = Math.ceil(o[2] / 2),
          s = n * Math.ceil(o[1] / 2),
          a = `
        ivec3 getOutputCoords() {
          ivec2 resTexRC = ivec2(TexCoords.xy *
                                vec2(${r[0]}, ${r[1]}));
          int index = resTexRC.y * ${r[0]} + resTexRC.x;

          int b = index / ${s};
          index -= b * ${s};

          // reverse r and c order for packed texture
          int r = imod(index, ${n}) * 2;
          int c = 2 * (index / ${n});

          return ivec3(b, r, c);
        }
      `;
        return new k(a);
      }
      getOutputPackedNDCoords(o, t) {
        let r = [t[0], t[1]],
          n = Math.ceil(o[o.length - 1] / 2),
          s = n * Math.ceil(o[o.length - 2] / 2),
          a = s,
          u = "",
          l = "b, r, c";
        for (let p = 2; p < o.length - 1; p++)
          (a *= o[o.length - p - 1]),
            (u =
              `
      int b${p} = index / ${a};
      index -= b${p} * ${a};
    ` + u),
            (l = `b${p}, ` + l);
        let f = `
      ivec${o.length} getOutputCoords() {
        ivec2 resTexRC = ivec2(TexCoords.xy *
                              vec2(${r[0]}, ${r[1]}));
        int index = resTexRC.y * ${r[0]} + resTexRC.x;

        ${u}

        int b = index / ${s};
        index -= b * ${s};

        // reverse r and c order for packed texture
        int r = imod(index, ${n}) * 2;
        int c = 2 * (index / ${n});

        return ivec${o.length}(${l});
      }
    `;
        return new k(f);
      }
      getOutputUnpacked1DCoords(o, t) {
        let r = `
        int getOutputCoords() {
          ivec2 resTexRC = ivec2(TexCoords.xy *
                                vec2(${t[0]}, ${t[1]}));
          return resTexRC.y * ${t[0]} + resTexRC.x;
        }
      `;
        return new k(r);
      }
      getOutputUnpacked2DCoords(o, t) {
        let r = `
        ivec2 getOutputCoords() {
          ivec2 resTexRC = ivec2(TexCoords.xy *
                                vec2(${t[0]}, ${t[1]}));
          int index = resTexRC.y * ${t[0]} + resTexRC.x;
          int r = index / ${o[1]};
          int c = index - r * ${o[1]};
          return ivec2(r, c);
        }
      `;
        return new k(r);
      }
      getOutputUnpacked3DCoords(o, t) {
        let r = "",
          n = o.length,
          s = null;
        n < 2 && (s = []), (s = new Array(n - 1)), (s[n - 2] = o[n - 1]);
        for (let l = n - 3; l >= 0; --l) s[l] = s[l + 1] * o[l + 1];
        let a = ["r", "c", "d"],
          u = s
            .map((l, f) => {
              let p = `int ${a[f]} = index / ${l}`,
                d =
                  f === s.length - 1
                    ? `int ${a[f + 1]} = index - ${a[f]} * ${l}`
                    : `index -= ${a[f]} * ${l}`;
              return `${p}; ${d};`;
            })
            .join("");
        return (
          (r = `
        ivec3 getOutputCoords() {
          ivec2 resTexRC = ivec2(TexCoords.xy *
                                vec2(${t[0]}, ${t[1]}));
          int index = resTexRC.y * ${t[0]} + resTexRC.x;
          ${u}
          return ivec3(r, c, d);
        }
      `),
          new k(r)
        );
      }
      getOutputUnpacked4DCoords(o, t) {
        let r = "",
          n = o.length,
          s = null;
        n < 2 && (s = []), (s = new Array(n - 1)), (s[n - 2] = o[n - 1]);
        for (let l = n - 3; l >= 0; --l) s[l] = s[l + 1] * o[l + 1];
        let a = ["r", "c", "d", "d2"],
          u = s
            .map((l, f) => {
              let p = `int ${a[f]} = index / ${l}`,
                d =
                  f === s.length - 1
                    ? `int ${a[f + 1]} = index - ${a[f]} * ${l}`
                    : `index -= ${a[f]} * ${l}`;
              return `${p}; ${d};`;
            })
            .join("");
        return (
          (r = `
      ivec4 getOutputCoords() {
          ivec2 resTexRC = ivec2(TexCoords.xy *
                                vec2(${t[0]}, ${t[1]}));
          int index = resTexRC.y * ${t[0]} + resTexRC.x;
          ${u}
          return ivec4(r, c, d, d2);
        }
      `),
          new k(r)
        );
      }
      getOutputUnpacked5DCoords(o, t) {
        let r = "",
          n = o.length,
          s = null;
        n < 2 && (s = []), (s = new Array(n - 1)), (s[n - 2] = o[n - 1]);
        for (let l = n - 3; l >= 0; --l) s[l] = s[l + 1] * o[l + 1];
        let a = ["r", "c", "d", "d2", "d3"],
          u = s
            .map((l, f) => {
              let p = `int ${a[f]} = index / ${l}`,
                d =
                  f === s.length - 1
                    ? `int ${a[f + 1]} = index - ${a[f]} * ${l}`
                    : `index -= ${a[f]} * ${l}`;
              return `${p}; ${d};`;
            })
            .join("");
        return (
          (r = `
      ivec5 getOutputCoords() {
          ivec2 resTexRC = ivec2(TexCoords.xy *
                                vec2(${t[0]}, ${t[1]}));
          int index = resTexRC.y * ${t[0]} + resTexRC.x;
          ${u}
          return ivec5(r, c, d, d2, d3);
        }
      `),
          new k(r)
        );
      }
      getOutputUnpacked6DCoords(o, t) {
        let r = "",
          n = o.length,
          s = null;
        n < 2 && (s = []), (s = new Array(n - 1)), (s[n - 2] = o[n - 1]);
        for (let l = n - 3; l >= 0; --l) s[l] = s[l + 1] * o[l + 1];
        let a = ["r", "c", "d", "d2", "d3", "d4"],
          u = s
            .map((l, f) => {
              let p = `int ${a[f]} = index / ${l}`,
                d =
                  f === s.length - 1
                    ? `int ${a[f + 1]} = index - ${a[f]} * ${l}`
                    : `index -= ${a[f]} * ${l}`;
              return `${p}; ${d};`;
            })
            .join("");
        return (
          (r = `
     ivec6 getOutputCoords() {
         ivec2 resTexRC = ivec2(TexCoords.xy *
                               vec2(${t[0]}, ${t[1]}));
         int index = resTexRC.y * ${t[0]} + resTexRC.x;
         ${u}
         return ivec6(r, c, d, d2, d3, d4);
       }
     `),
          new k(r)
        );
      }
      getCommonUtilFuncs() {
        let o = {},
          t = "uvFromFlat";
        (o[t] = new k(`
    vec2 uvFromFlat(int texNumR, int texNumC, int index) {
      int texC = index / texNumR;
      int texR = index - texC * texNumR;
      // TODO: swap texR, texC order in following function so row is corresponding to u and column is corresponding to
      //       v.
      return (vec2(texR, texC) + halfCR) / vec2(texNumR, texNumC);
    }
    `)),
          (t = "packedUVfrom1D"),
          (o[t] = new k(`
      vec2 packedUVfrom1D(int texNumR, int texNumC, int index) {
        int texelIndex = index / 2;
        int texR = texelIndex / texNumC;
        int texC = texelIndex - texR * texNumC;
        return (vec2(texC, texR) + halfCR) / vec2(texNumC, texNumR);
      }
      `)),
          (t = "packedUVfrom2D"),
          (o[t] = new k(`
      vec2 packedUVfrom2D(int texNumR, int texNumC, int texelsInLogicalRow, int row, int col) {
        int texelIndex = (row / 2) * texelsInLogicalRow + (col / 2);
        int texR = texelIndex / texNumC;
        int texC = texelIndex - texR * texNumC;
        return (vec2(texC, texR) + halfCR) / vec2(texNumC, texNumR);
      }
      `)),
          (t = "packedUVfrom3D"),
          (o[t] = new k(`
      vec2 packedUVfrom3D(int texNumR, int texNumC,
          int texelsInBatch, int texelsInLogicalRow, int b,
          int row, int col) {
        int index = b * texelsInBatch + (row / 2) * texelsInLogicalRow + (col / 2);
        int texR = index / texNumC;
        int texC = index - texR * texNumC;
        return (vec2(texC, texR) + halfCR) / vec2(texNumC, texNumR);
      }
      `)),
          (t = "sampleTexture");
        let r = G(this.context.glContext.version);
        return (
          (o[t] = new k(`
        float sampleTexture(sampler2D textureSampler, vec2 uv) {
            return ${r.texture2D}(textureSampler, uv).r;
        }`)),
          o
        );
      }
      getInputsSamplingSnippets() {
        let o = {},
          t = this.context.outputTextureLayout;
        return (
          this.context.programInfo.inputNames.forEach((r, n) => {
            let s = this.context.inputTextureLayouts[n],
              a = An(r);
            s.isPacked
              ? (o[a] = this.getPackedSamplerFromInput(a, r, s))
              : (o[a] = this.getUnpackedSamplerFromInput(a, r, s));
            let u = Yu(r);
            s.unpackedShape.length <= t.unpackedShape.length &&
              (s.isPacked
                ? (o[u] = this.getPackedSamplerAtOutputCoords(u, s, t, r))
                : (o[u] = this.getUnpackedSamplerAtOutputCoords(u, s, t, r)));
          }),
          o
        );
      }
      getPackedSamplerAtOutputCoords(o, t, r, n) {
        let s = t.unpackedShape,
          a = r.unpackedShape,
          l = An(n),
          f = s.length,
          p = a.length,
          d = kt.getBroadcastDims(s, a),
          y = Bt(p),
          T = p - f,
          v,
          S = ne();
        f === 0
          ? (v = "")
          : p < 2 && d.length >= 1
          ? (v = "coords = 0;")
          : (v = d.map((Dt) => `coords.${S[Dt + T]} = 0;`).join(`
`));
        let L = "";
        p < 2 && f > 0
          ? (L = "coords")
          : (L = s.map((Dt, _t) => `coords.${S[_t + T]}`).join(", "));
        let P = "return outputValue;",
          M = B.size(s) === 1,
          lt = B.size(a) === 1;
        if (f === 1 && !M && !lt)
          P = `
        return vec4(outputValue.xy, outputValue.xy);
      `;
        else if (M && !lt)
          p === 1
            ? (P = `
          return vec4(outputValue.x, outputValue.x, 0., 0.);
        `)
            : (P = `
          return vec4(outputValue.x);
        `);
        else if (d.length) {
          let Dt = f - 2,
            _t = f - 1;
          d.indexOf(Dt) > -1 && d.indexOf(_t) > -1
            ? (P = "return vec4(outputValue.x);")
            : d.indexOf(Dt) > -1
            ? (P =
                "return vec4(outputValue.x, outputValue.y, outputValue.x, outputValue.y);")
            : d.indexOf(_t) > -1 &&
              (P = "return vec4(outputValue.xx, outputValue.zz);");
        }
        let wt = `
        int lastDim = coords.${S[p - 1]};
        coords.${S[p - 1]} = coords.${S[p - 2]};
        coords.${S[p - 2]} = lastDim;
      `,
          et = `
      vec4 ${o}() {
        ${y} coords = getOutputCoords();
        ${wt}
        ${v}
        vec4 outputValue = ${l}(${L});
        ${P}
      }
    `;
        return new k(et, ["coordinates.getOutputCoords"]);
      }
      getUnpackedSamplerAtOutputCoords(o, t, r, n) {
        let s = [r.width, r.height],
          a = [t.width, t.height],
          u = t.unpackedShape.length,
          l = r.unpackedShape.length,
          f = t.unpackedShape,
          p = r.unpackedShape,
          d = An(n);
        if (u === l && Me.arraysEqual(a, s)) {
          let M = `
          float ${o}() {
            return sampleTexture(${n}, TexCoords);
          }
        `;
          return new k(M, ["coordinates.sampleTexture"]);
        }
        let y = Bt(l),
          T = kt.getBroadcastDims(f, p),
          v = l - u,
          S,
          L = ne();
        u === 0
          ? (S = "")
          : l < 2 && T.length >= 1
          ? (S = "coords = 0;")
          : (S = T.map((M) => `coords.${L[M + v]} = 0;`).join(`
`));
        let P = "";
        l < 2 && u > 0
          ? (P = "coords")
          : (P = t.unpackedShape
              .map((M, V) => `coords.${L[V + v]}`)
              .join(", "));
        let A = `
        float ${o}() {
          ${y} coords = getOutputCoords();
          ${S}
          return ${d}(${P});
        }
      `;
        return new k(A, ["coordinates.getOutputCoords"]);
      }
      getPackedSamplerFromInput(o, t, r) {
        switch (r.unpackedShape.length) {
          case 0:
            return this.getPackedSamplerScalar(o, t);
          case 1:
            return this.getPackedSampler1D(o, t, r);
          case 2:
            return this.getPackedSampler2D(o, t, r);
          case 3:
            return this.getPackedSampler3D(o, t, r);
          default:
            return this.getPackedSamplerND(o, t, r);
        }
      }
      getUnpackedSamplerFromInput(o, t, r) {
        let n = r.unpackedShape;
        switch (n.length) {
          case 0:
            return this.getUnpackedSamplerScalar(o, t, r);
          case 1:
            return this.getUnpackedSampler1D(o, t, r);
          case 2:
            return this.getUnpackedSampler2D(o, t, r);
          case 3:
            return this.getUnpackedSampler3D(o, t, r);
          case 4:
            return this.getUnpackedSampler4D(o, t, r);
          case 5:
            return this.getUnpackedSampler5D(o, t, r);
          case 6:
            return this.getUnpackedSampler6D(o, t, r);
          default:
            throw new Error(`Unsupported dimension ${n.length}-D`);
        }
      }
      getPackedSamplerScalar(o, t) {
        let r = G(this.context.glContext.version),
          n = `
          vec4 ${o}() {
            return ${r.texture2D}(${t}, halfCR);
          }
        `;
        return new k(n);
      }
      getPackedSampler1D(o, t, r) {
        let n = [r.width, r.height],
          s = [n[1], n[0]],
          a = G(this.context.glContext.version),
          l = `vec4 ${o}(int index) {
      vec2 uv = packedUVfrom1D(
      ${s[0]}, ${s[1]}, index);
      return ${a.texture2D}(${t}, uv);
    }`;
        return new k(l, ["coordinates.packedUVfrom1D"]);
      }
      getPackedSampler2D(o, t, r) {
        let n = r.unpackedShape,
          s = [r.width, r.height],
          a = G(this.context.glContext.version),
          u = s[0],
          l = s[1];
        if (s != null && Me.arraysEqual(n, s)) {
          let T = `vec4 ${o}(int row, int col) {
        vec2 uv = (vec2(col, row) + halfCR) / vec2(${l}.0, ${u}.0);
        return ${a.texture2D}(${t}, uv);
      }`;
          return new k(T);
        }
        let f = s,
          p = Math.ceil(n[1] / 2),
          y = `vec4 ${o}(int row, int col) {
      vec2 uv = packedUVfrom2D(${f[1]}, ${f[0]}, ${p}, row, col);
      return ${a.texture2D}(${t}, uv);
    }`;
        return new k(y, ["coordinates.packedUVfrom2D"]);
      }
      getPackedSampler3D(o, t, r) {
        let n = r.unpackedShape,
          s = [r.width, r.height],
          a = [s[0], s[1]],
          u = G(this.context.glContext.version);
        if (n[0] === 1) {
          let v = n.slice(1),
            S = [1, 2],
            L = lr(n, v),
            P = ["b", "row", "col"],
            A = JSON.parse(JSON.stringify(r));
          A.unpackedShape = L;
          let M = this.getPackedSamplerFromInput(o, t, A),
            lt = `${M.routineBody}
      vec4 ${o}(int b, int row, int col) {
        return ${o}(${fr(P, S)});
      } `;
          return new k(lt, M.dependencies);
        }
        let l = a[0],
          f = a[1],
          p = Math.ceil(n[2] / 2),
          d = p * Math.ceil(n[1] / 2),
          T = `vec4 ${o}(int b, int row, int col) {
      vec2 uv = packedUVfrom3D(
        ${f}, ${l}, ${d}, ${p}, b, row, col);
      return ${u.texture2D}(${t}, uv);}`;
        return new k(T, ["coordinates.packedUVfrom3D"]);
      }
      getPackedSamplerND(o, t, r) {
        let n = r.unpackedShape,
          s = n.length,
          a = [r.width, r.height],
          u = G(this.context.glContext.version),
          l = [a[0], a[1]],
          f = l[1],
          p = l[0],
          d = Math.ceil(n[s - 1] / 2),
          y = d * Math.ceil(n[s - 2] / 2),
          T = "int b, int row, int col",
          v = `b * ${y} + (row / 2) * ${d} + (col / 2)`;
        for (let P = 2; P < s - 1; P++)
          (T = `int b${P}, ` + T),
            (y *= n[s - P - 1]),
            (v = `b${P} * ${y} + ` + v);
        let L = `vec4 ${o}(${T}) {
      int index = ${v};
      int texR = index / ${p};
      int texC = index - texR * ${p};
      vec2 uv = (vec2(texC, texR) + halfCR) / vec2(${p}, ${f});
      return ${u.texture2D}(${t}, uv);
    }`;
        return new k(L);
      }
      getUnpackedSamplerScalar(o, t, r) {
        let [n, s] = [r.width, r.height];
        if (n === 1 && s === 1) {
          let u = `
          float ${o}() {
            return sampleTexture(${t}, halfCR);
          }
        `;
          return new k(u, ["coordinates.sampleTexture"]);
        }
        let a = `
        float ${o}() {
          int offset_${t} = coordsToOffset(TexCoords, ${n}, ${s});
          vec2 uv = uvFromFlat(${n}, ${s}, offset_${t});
          return sampleTexture(${t}, uv);
        }
      `;
        return new k(a, [
          "coordinates.uvFromFlat",
          "coordinates.sampleTexture",
          "coordinates.coordsToOffset",
        ]);
      }
      getUnpackedSampler1D(o, t, r) {
        let n = r.width,
          s = r.height;
        if (s === 1 && n === 1) {
          let u = `
        float ${o}(int index) {
          return sampleTexture(${t}, halfCR);
        }
      `;
          return new k(u, ["coordinates.sampleTexture"]);
        }
        if (s === 1) {
          let u = `
          float ${o}(int index) {
            vec2 uv = vec2((float(index) + 0.5) / ${n}.0, 0.5);
            return sampleTexture(${t}, uv);
          }
        `;
          return new k(u, ["coordinates.sampleTexture"]);
        }
        if (n === 1) {
          let u = `
          float ${o}(int index) {
            vec2 uv = vec2(0.5, (float(index) + 0.5) / ${s}.0);
            return sampleTexture(${t}, uv);
          }
        `;
          return new k(u, ["coordinates.sampleTexture"]);
        }
        let a = `
        float ${o}(int index) {
          vec2 uv = uvFromFlat(${n}, ${s}, index);
          return sampleTexture(${t}, uv);
        }
      `;
        return new k(a, [
          "coordinates.uvFromFlat",
          "coordinates.sampleTexture",
        ]);
      }
      getUnpackedSampler2D(o, t, r) {
        let n = r.unpackedShape,
          s = [r.height, r.width];
        if (s != null && Me.arraysEqual(n, s)) {
          let y = s[1],
            T = s[0],
            v = `
          float ${o}(int row, int col) {
            vec2 uv = (vec2(row, col) + halfCR) / vec2(${y}.0, ${T}.0);
            return sampleTexture(${t}, uv);
          }
        `;
          return new k(v, ["coordinates.sampleTexture"]);
        }
        let { newShape: a, keptDims: u } = hr(n),
          l = a;
        if (l.length < n.length) {
          let y = lr(n, l),
            T = JSON.parse(JSON.stringify(r));
          T.unpackedShape = y;
          let v = ["col", "row"],
            S = `
          ${this.getUnpackedSamplerFromInput(o, t, T).routineBody}
          float ${o}(int row, int col) {
            return ${o}(${fr(v, u)});
          }
        `;
          return new k(S, ["coordinates.sampleTexture"]);
        }
        let f = s[1],
          p = s[0];
        if (p === 1) {
          let y = `
          float ${o}(int row, int col) {
            int offset_${t} = coordsToOffset(TexCoords, ${f}, ${p});
            float index = dot(vec3(row, col, offset_${t}), vec3(${n[1]}, 1, 1));
            vec2 uv = vec2(0.5, (index + 0.5) / ${f}.0);
            return sampleTexture(${t}, uv);
          }
        `;
          return new k(y, [
            "coordinates.sampleTexture",
            "coordinates.coordsToOffset",
          ]);
        }
        if (f === 1) {
          let y = `
          float ${o}(int row, int col) {
            int offset_${t} = coordsToOffset(TexCoords, ${f}, ${p});
            float index = dot(vec3(row, col, offset_${t}), vec3(${n[1]}, 1, 1));
            vec2 uv = vec2((index + 0.5) / ${p}.0, 0.5);
            return sampleTexture(${t}, uv);
          }
        `;
          return new k(y, [
            "coordinates.sampleTexture",
            "coordinates.coordsToOffset",
          ]);
        }
        let d = `
        float ${o}(int row, int col) {
          int index = col * ${n[1]} + row;
          vec2 uv = uvFromFlat(${f}, ${p}, index);
          return sampleTexture(${t}, uv);
        }
      `;
        return new k(d, [
          "coordinates.uvFromFlat",
          "coordinates.sampleTexture",
          "coordinates.coordsToOffset",
        ]);
      }
      getUnpackedSampler3D(o, t, r) {
        let n = r.unpackedShape,
          s = n[1] * n[2],
          a = n[2],
          { newShape: u, keptDims: l } = hr(n),
          f = u;
        if (f.length < n.length) {
          let T = lr(n, f),
            v = ["batch", "col", "row"],
            S = JSON.parse(JSON.stringify(r));
          S.unpackedShape = T;
          let L = this.getUnpackedSamplerFromInput(o, t, S),
            P = l.reverse(),
            A = `
          ${L.routineBody}
          float ${o}(int batch, int row, int col) {
            return ${o}(${fr(v, P)});
          }
        `;
          return new k(A, L.dependencies);
        }
        let p = r.width,
          d = r.height,
          y = `
          float ${o}(int depth, int row, int col) {
            // Explicitly use integer operations as dot() only works on floats.
            int index = depth * ${s} + col * ${a} + row;
            vec2 uv = uvFromFlat(${p}, ${d}, index);
            return sampleTexture(${t}, uv);
          }
      `;
        return new k(y, [
          "coordinates.uvFromFlat",
          "coordinates.sampleTexture",
          "coordinates.coordsToOffset",
        ]);
      }
      getUnpackedSampler4D(o, t, r) {
        let n = r.unpackedShape,
          s = n[3],
          a = n[2] * s,
          u = n[1] * a,
          l = r.width,
          f = r.height,
          p = `
        float ${o}(int row, int col, int depth, int depth2) {
          int index = row * ${u} + col * ${a} +
              depth2 * ${s} + depth;
          vec2 uv = uvFromFlat(${l}, ${f}, index);
          return sampleTexture(${t}, uv);
        }
      `;
        return new k(p, [
          "coordinates.uvFromFlat",
          "coordinates.sampleTexture",
        ]);
      }
      getUnpackedSampler5D(o, t, r) {
        let n = r.unpackedShape,
          s = n[4],
          a = n[3] * s,
          u = n[2] * a,
          l = n[1] * u,
          { newShape: f, keptDims: p } = hr(n);
        if (f.length < n.length) {
          let v = lr(n, f),
            S = ["row", "col", "depth", "depth2", "depth3"],
            L = JSON.parse(JSON.stringify(r));
          L.unpackedShape = v;
          let P = `
          ${this.getUnpackedSamplerFromInput(o, t, L).routineBody}
          float ${o}(int row, int col, int depth, int depth2, int depth3) {
            return ${o}(${fr(S, p)});
          }
        `;
          return new k(P, [
            "coordinates.sampleTexture",
            "coordinates.uvFromFlat",
          ]);
        }
        let d = r.width,
          y = r.height,
          T = `
        float ${o}(int row, int col, int depth, int depth2, int depth3) {
          int index = row * ${l} + col * ${u} + depth * ${a} +
          depth3 * ${s} + depth2;
          vec2 uv = uvFromFlat(${d}, ${y}, index);
          return sampleTexture(${t}, uv);
        }
      `;
        return new k(T, [
          "coordinates.sampleTexture",
          "coordinates.uvFromFlat",
        ]);
      }
      getUnpackedSampler6D(o, t, r) {
        let n = r.unpackedShape,
          s = n[5],
          a = n[4] * s,
          u = n[3] * a,
          l = n[2] * u,
          f = n[1] * l,
          { newShape: p, keptDims: d } = hr(n);
        if (p.length < n.length) {
          let S = lr(n, p),
            L = ["row", "col", "depth", "depth2", "depth3", "depth4"],
            P = JSON.parse(JSON.stringify(r));
          P.unpackedShape = S;
          let A = `
            ${this.getUnpackedSamplerFromInput(o, t, P).routineBody}
            float ${o}(int row, int col, int depth,
              int depth2, int depth3, int depth4) {
              return ${o}(${fr(L, d)});
            }
          `;
          return new k(A, [
            "coordinates.sampleTexture",
            "coordinates.uvFromFlat",
          ]);
        }
        let y = r.width,
          T = r.height,
          v = `
          float ${o}(int row, int col, int depth,
            int depth2, int depth3, int depth4) {
            int index = row * ${f} + col * ${l} + depth * ${u} +
            depth2 * ${a} + depth3 * ${s} + depth4;
            vec2 uv = uvFromFlat(${y}, ${T}, index);
            return sampleTexture(${t}, uv);
          }
        `;
        return new k(v, [
          "coordinates.uvFromFlat",
          "coordinates.sampleTexture",
          "coordinates.coordsToOffset",
        ]);
      }
      toVec() {
        let o = this.context.outputTextureLayout,
          t = o.shape.length,
          r = o.strides,
          n = o.width,
          s = o.height,
          a = [];
        for (let l = 0; l < t - 1; ++l)
          a.push(`
        c[${l}] = offset / ${r[l]};`),
            a.push(`
        offset -= c[${l}] * ${r[l]};`);
        a.push(`
        c[${t - 1}] = offset;`);
        let u = `
      void toVec(vec2 texCoords, out int c[${t}]) {
        int offset = coordsToOffset(texCoords, ${n}, ${s});
        ${a.join("")}
      }
      void toVec(int offset, out int c[${t}]) {
        ${a.join("")}
      }
    `;
        return { toVec: new k(u, ["coordinates.coordsToOffset"]) };
      }
      valueFrom() {
        let o = {};
        return (
          this.context.programInfo.inputNames.forEach((t, r) => {
            let n = this.context.inputTextureLayouts[r],
              a = (n.unpackedShape.length > 0 ? n.unpackedShape : n.shape)
                .length,
              u = `_${t}`;
            (o[u] = new k(
              this.getValueFromSingle(t, a, n.width, n.height, !1),
              [
                `shapeUtils.indicesToOffset${u}`,
                "coordinates.offsetToCoords",
                "fragcolor.getColorAsFloat",
              ]
            )),
              (u = u + "_T"),
              (o[u] = new k(
                this.getValueFromSingle(t, a, n.width, n.height, !0),
                [
                  `shapeUtils.indicesToOffset${u}`,
                  "coordinates.offsetToCoords",
                  "fragcolor.getColorAsFloat",
                ]
              ));
          }),
          o
        );
      }
      getValueFromSingle(o, t, r, n, s) {
        let a = `_${o}`;
        s && (a = a + "_T");
        let u = G(this.context.glContext.version);
        return `
        float ${a}(int m[${t}]) {
          int offset = indicesToOffset${a}(m);
          vec2 coords = offsetToCoords(offset, ${r}, ${n});
          float value = getColorAsFloat(${u.texture2D}(${o}, coords));
          return value;
        }
        `;
      }
      getPackedValueFrom(o, t, r, n, s) {
        let a = `_${o}_Pack`;
        s && (a = a + "_T");
        let u = G(this.context.glContext.version);
        return `
        vec4 ${a}(int m[${t}]) {
          int offset = indicesToOffset_${o}(m);
          vec2 coords = offsetToCoords(offset, ${r}, ${n});
          return ${u.texture2D}(${o}, coords);
        }
        `;
      }
    };
  });
var zn,
  pp = O(() => {
    "use strict";
    Te();
    zn = class i extends Ht {
      constructor(e) {
        super(e);
      }
      getFunctions() {
        return { ...this.encodeFloat32(), ...this.decodeFloat32() };
      }
      getCustomTypes() {
        return {};
      }
      encodeFloat32() {
        return {
          encode: new k(`highp vec4 encode(highp float f) {
        return vec4(f, 0.0, 0.0, 0.0);
      }
        `),
        };
      }
      decodeFloat32() {
        return {
          decode: new k(`highp float decode(highp vec4 rgba) {
        return rgba.r;
      }
        `),
        };
      }
      encodeUint8() {
        let e = i.isLittleEndian() ? "rgba.rgba=rgba.abgr;" : "";
        return {
          encode: new k(`
      highp vec4 encode(highp float f) {
        highp float F = abs(f);
        highp float Sign = step(0.0,-f);
        highp float Exponent = floor(log2(F));
        highp float Mantissa = (exp2(- Exponent) * F);
        Exponent = floor(log2(F) + 127.0) + floor(log2(Mantissa));
        highp vec4 rgba;
        rgba[0] = 128.0 * Sign  + floor(Exponent*exp2(-1.0));
        rgba[1] = 128.0 * mod(Exponent,2.0) + mod(floor(Mantissa*128.0),128.0);
        rgba[2] = floor(mod(floor(Mantissa*exp2(23.0 -8.0)),exp2(8.0)));
        rgba[3] = floor(exp2(23.0)*mod(Mantissa,exp2(-15.0)));
        ${e}
        rgba = rgba / 255.0; // values need to be normalized to [0,1]
        return rgba;
    }
        `),
        };
      }
      decodeUint8() {
        let e = i.isLittleEndian() ? "rgba.rgba=rgba.abgr;" : "";
        return {
          decode: new k(`
        highp float decode(highp vec4 rgba) {
          rgba = rgba * 255.0; // values need to be de-normalized from [0,1] to [0,255]
          ${e}
          highp float Sign = 1.0 - step(128.0,rgba[0])*2.0;
          highp float Exponent = 2.0 * mod(rgba[0],128.0) + step(128.0,rgba[1]) - 127.0;
          highp float Mantissa = mod(rgba[1],128.0)*65536.0 + rgba[2]*256.0 +rgba[3] + float(0x800000);
          highp float Result =  Sign * exp2(Exponent) * (Mantissa * exp2(-23.0 ));
          return Result;
      }
        `),
        };
      }
      static isLittleEndian() {
        let e = new ArrayBuffer(4),
          o = new Uint32Array(e),
          t = new Uint8Array(e);
        if (((o[0] = 3735928559), t[0] === 239)) return !0;
        if (t[0] === 222) return !1;
        throw new Error("unknown endianness");
      }
    };
  });
var Wn,
  dp = O(() => {
    "use strict";
    Te();
    ut();
    Wn = class extends Ht {
      constructor(e) {
        super(e);
      }
      getFunctions() {
        return { ...this.setFragColor(), ...this.getColorAsFloat() };
      }
      getCustomTypes() {
        return {};
      }
      setFragColor() {
        let e = G(this.context.glContext.version);
        return {
          setFragColor: new k(
            `
        void setFragColor(float value) {
            ${e.output} = encode(value);
        }
        `,
            ["encoding.encode"]
          ),
        };
      }
      getColorAsFloat() {
        return {
          getColorAsFloat: new k(
            `
        float getColorAsFloat(vec4 color) {
            return decode(color);
        }
        `,
            ["encoding.decode"]
          ),
        };
      }
    };
  });
var Hn,
  hp = O(() => {
    "use strict";
    Te();
    Hn = class i extends Ht {
      constructor(e) {
        super(e);
      }
      getFunctions() {
        return {
          ...this.bcastIndex(),
          ...this.bcastMatmulIndex(),
          ...this.offsetToIndices(),
          ...this.indicesToOffset(),
          ...this.incrementIndices(),
        };
      }
      getCustomTypes() {
        return {};
      }
      bcastIndex() {
        let e = this.context.outputTextureLayout.shape.length,
          o = {};
        return (
          this.context.programInfo.inputNames.forEach((t, r) => {
            let n = this.context.inputTextureLayouts[r].unpackedShape;
            if (n.length <= e) {
              let s = n.length,
                a = e - s,
                u = `bcastIndices_${t}`,
                l = "";
              for (let p = 0; p < s; ++p)
                l += `
          realIndices[${p}] = int( mod(float(bcastedIndices[${a + p}]), ${
                  n[p]
                }.0) );
          `;
              let f = `
        void ${u} (int bcastedIndices[${e}], out int realIndices[${s}]) {
          ${l}
        }
        `;
              o[u] = new k(f);
            }
          }),
          o
        );
      }
      bcastMatmulIndex() {
        let e = this.context.outputTextureLayout.shape.length,
          o = {};
        return (
          this.context.programInfo.inputNames.forEach((t, r) => {
            let n = this.context.inputTextureLayouts[r].shape;
            if (!(n.length < 2 || n.length > e)) {
              let s = n.length,
                a = e - s,
                u = `bcastMatmulIndices_${t}`,
                l = "";
              for (let p = 0; p < s - 2; ++p)
                l += `
          realIndices[${p}] = int( mod(float(bcastedIndices[${a + p}]), ${
                  n[p]
                }.0) );
          `;
              let f = `
        void ${u}(int bcastedIndices[${e}], out int realIndices[${s}]) {
          ${l}
          realIndices[${s - 1}] = bcastedIndices[${e - 1}];
          realIndices[${s - 2}] = bcastedIndices[${e - 2}];
        }
        `;
              o[u] = new k(f);
            }
          }),
          o
        );
      }
      indicesToOffset() {
        let e = {};
        return (
          this.context.programInfo.inputNames.forEach((o, t) => {
            let r = this.context.inputTextureLayouts[t].shape,
              n = this.context.inputTextureLayouts[t].strides,
              s = r.length,
              a = `indicesToOffset_${o}`;
            (e[a] = new k(i.indexToOffsetSingle(a, s, n))),
              (a = `indicesToOffset_${o}_T`),
              (e[a] = new k(i.indexToOffsetSingle(a, s, n.slice().reverse())));
          }),
          e
        );
      }
      static indexToOffsetSingle(e, o, t) {
        let r = "";
        for (let n = o - 1; n >= 0; --n)
          r += `
        offset += indices[${n}] * ${t[n]};
        `;
        return `
      int ${e}(int indices[${o}]) {
        int offset = 0;
        ${r}
        return offset;
      }
      `;
      }
      offsetToIndices() {
        let e = {};
        return (
          this.context.programInfo.inputNames.forEach((o, t) => {
            let r = this.context.inputTextureLayouts[t].shape,
              n = this.context.inputTextureLayouts[t].strides,
              s = r.length,
              a = `offsetToIndices_${o}`;
            (e[a] = new k(i.offsetToIndicesSingle(a, s, n))),
              (a = `offsetToIndices_${o}_T`),
              (e[a] = new k(
                i.offsetToIndicesSingle(a, s, n.slice().reverse())
              ));
          }),
          e
        );
      }
      static offsetToIndicesSingle(e, o, t) {
        let r = [];
        for (let n = 0; n < o - 1; ++n)
          r.push(`
      indices[${n}] = offset / ${t[n]};`),
            r.push(`
        offset -= indices[${n}] * ${t[n]};`);
        return (
          r.push(`
      indices[${o - 1}] = offset;`),
          `
      void ${e}(int offset, out int indices[${o}]) {
        ${r.join("")}
      }
      `
        );
      }
      incrementIndices() {
        let e = {};
        return (
          this.context.programInfo.inputNames.forEach((o, t) => {
            let r = this.context.inputTextureLayouts[t].shape,
              n = r.length,
              s = `incrementIndices_${o}`,
              a = "";
            for (let l = 0; l < n; ++l)
              a += `
        shape[${l}] = ${r[l]};`;
            let u = `
        void ${s}(int axis, out int indices[${n}]) {
          int shape[${n}];
          ${a};
          for(int i = ${n} -1 ; i >= 0; --i) {
            if(i > axis) continue;
            indices[i] += 1;
            if(indices[i] < shape[i]) {
              break;
            }
            indices[i] = 0;
          }
        }
        `;
            e[s] = new k(u);
          }),
          e
        );
      }
    };
  });
var qn,
  mp = O(() => {
    "use strict";
    Te();
    qn = class extends Ht {
      constructor(e) {
        super(e);
      }
      getCustomTypes() {
        return {};
      }
      getFunctions() {
        return {
          ...this.binaryVecFunctions(),
          ...this.copyVec(),
          ...this.setVecItem(),
          ...this.getVecItem(),
        };
      }
      binaryVecFunctions() {
        let o = this.context.outputTextureLayout.shape.length,
          t = { add: "+=", sub: "-=", mul: "*=", div: "/=" },
          r = {};
        for (let n in t) {
          let s = `${n}Vec`,
            a = "";
          for (let l = 0; l < o; ++l)
            a += `
          dest[${l}] ${t[n]} src[${l}];
          `;
          let u = `
        void ${s}(int src[${o}], out int dest[${o}]) {
          ${a}
        }
        `;
          r[s] = new k(u);
        }
        return r;
      }
      copyVec() {
        let o = this.context.outputTextureLayout.shape.length,
          t = "";
        for (let n = 0; n < o; ++n)
          t += `
        dest[${n}] = src[${n}];
        `;
        let r = `
      void copyVec(int src[${o}], out int dest[${o}]) {
        ${t}
      }
      `;
        return { copyVec: new k(r) };
      }
      setVecItem() {
        let o = this.context.outputTextureLayout.shape.length,
          t = `
        if(index < 0)
            index =${o} + index;
        if (index == 0)
            m[0] = value;
        `;
        for (let n = 1; n < o - 1; ++n)
          t += `
        else if (index == ${n})
            m[${n}] = value;
            `;
        t += `
        else
            m[${o - 1}] = value;
        `;
        let r = `
      void setVecItem(out int m[${o}], int index, int value) {
        ${t}
      }
        `;
        return { setVecItem: new k(r) };
      }
      getVecItem() {
        let o = this.context.outputTextureLayout.shape.length,
          t = `
        if(index < 0)
            index = ${o} + index;
        if (index == 0)
            return m[0];
      `;
        for (let n = 1; n < o - 1; ++n)
          t += `
        else if (index == ${n})
            return m[${n}];
      `;
        t += `
        else
            return m[${o - 1}];
        `;
        let r = `
      int getVecItem(int m[${o}], int index) {
        ${t}
      }
    `;
        return { getVecItem: new k(r) };
      }
    };
  });
var Ri,
  bp = O(() => {
    "use strict";
    cp();
    pp();
    dp();
    hp();
    mp();
    Ri = {
      encoding: zn,
      fragcolor: Wn,
      vec: qn,
      shapeUtils: Hn,
      coordinates: Vn,
    };
  });
var jn,
  gp = O(() => {
    "use strict";
    Te();
    lp();
    bp();
    ut();
    jn = class {
      constructor(e, o, t, r) {
        this.libs = {};
        this.glslLibRoutineDependencyGraph = {};
        (this.context = new Ln(e, o, t, r)),
          Object.keys(Ri).forEach((s) => {
            let a = new Ri[s](this.context);
            this.libs[s] = a;
          });
        let n = this.glslLibRoutineDependencyGraph;
        for (let s in this.libs) {
          let u = this.libs[s].getFunctions();
          for (let l in u) {
            let f = s + "." + l,
              p;
            n[f]
              ? ((p = n[f]), (p.routineBody = u[l].routineBody))
              : ((p = new Nr(f, u[l].routineBody)), (n[f] = p));
            let d = u[l].dependencies;
            if (d)
              for (let y = 0; y < d.length; ++y)
                if (n[d[y]]) p.addDependency(n[d[y]]);
                else {
                  let T = new Nr(d[y]);
                  (n[d[y]] = T), p.addDependency(T);
                }
          }
        }
      }
      preprocess() {
        let e = this.context.programInfo,
          o = e.shaderSource;
        return (
          this.context.programInfo.hasMain ||
            (o = `${o}
      ${Ju(
        this.context.glContext.version,
        this.context.outputTextureLayout.shape.length
      )}`),
          (o = up(o)),
          `${Ku(this.context.glContext.version)}
    ${this.getUniforms(e.inputNames, e.variables)}
    ${this.getImports(o)}
    ${o}`
        );
      }
      getImports(e) {
        let o = this.selectGlslLibRoutinesToBeIncluded(e);
        if (o.length === 0) return "";
        let t = "";
        for (let r = 0; r < o.length; ++r)
          if (o[r].routineBody)
            t +=
              o[r].routineBody +
              `
`;
          else
            throw new Error(
              `Missing body for the Glsl Library routine: ${o[r].name}`
            );
        return t;
      }
      selectGlslLibRoutinesToBeIncluded(e) {
        let o = [];
        return (
          Object.keys(this.glslLibRoutineDependencyGraph).forEach((t) => {
            let r = t.split(".")[1];
            e.indexOf(r) !== -1 &&
              o.push(this.glslLibRoutineDependencyGraph[t]);
          }),
          $n.returnOrderedNodes(o)
        );
      }
      getUniforms(e, o) {
        let t = [];
        if (e) for (let r of e) t.push(`uniform sampler2D ${r};`);
        if (o)
          for (let r of o)
            t.push(
              `uniform ${r.type} ${r.name}${
                r.arrayLength ? `[${r.arrayLength}]` : ""
              };`
            );
        return t.join(`
`);
      }
    };
  });
var Xn,
  yp = O(() => {
    "use strict";
    Yt();
    Ut();
    gp();
    ut();
    Xn = class {
      constructor(e, o, t) {
        this.profiler = e;
        this.glContext = o;
        this.textureLayoutStrategy = t;
        (this.repo = new Map()), (this.attributesBound = !1);
      }
      getArtifact(e) {
        return this.repo.get(e);
      }
      setArtifact(e, o) {
        this.repo.set(e, o);
      }
      run(e, o, t) {
        this.profiler.event(
          "op",
          `ProgramManager.run ${e.programInfo.name ?? "unknown kernel"}`,
          () => {
            let r = this.glContext.gl,
              n = e.program;
            r.useProgram(n);
            try {
              this.bindOutput(t),
                this.attributesBound || this.bindAttributes(e.attribLocations),
                this.bindUniforms(
                  e.uniformLocations,
                  e.programInfo.variables ?? [],
                  o
                );
            } catch (s) {
              throw (tt.error("ProgramManager", e.programInfo.shaderSource), s);
            }
            this.profiler.event("backend", "GlContext.draw()", () => {
              this.glContext.draw();
            });
          },
          this.glContext
        );
      }
      dispose() {
        this.vertexShader && this.glContext.deleteShader(this.vertexShader),
          this.repo.forEach((e) => this.glContext.deleteProgram(e.program));
      }
      build(e, o, t) {
        return this.profiler.event("backend", "ProgramManager.build", () => {
          let r = new jn(this.glContext, e, o, t),
            n = r.preprocess(),
            s = this.compile(n);
          return {
            programInfo: e,
            program: s,
            uniformLocations: this.getUniformLocations(
              s,
              r.context.programInfo.inputNames,
              r.context.programInfo.variables
            ),
            attribLocations: this.getAttribLocations(s),
          };
        });
      }
      compile(e) {
        if (!this.vertexShader) {
          tt.verbose(
            "ProrgramManager",
            "Compiling and caching Vertex shader for the first time"
          );
          let r = Xu(this.glContext.version);
          this.vertexShader = this.glContext.compileShader(
            r,
            this.glContext.gl.VERTEX_SHADER
          );
        }
        z.debug &&
          tt.verbose(
            "ProrgramManager",
            `FragShader:
${e}
`
          );
        let o = this.glContext.compileShader(
            e,
            this.glContext.gl.FRAGMENT_SHADER
          ),
          t = this.glContext.createProgram(this.vertexShader, o);
        return this.glContext.deleteShader(o), t;
      }
      bindOutput(e) {
        let o = e.width,
          t = e.height;
        tt.verbose(
          "ProrgramManager",
          `Binding output texture to Framebuffer: w/h=${o}/${t}, shape=${e.shape}, type=${e.tensor.type}`
        ),
          this.glContext.attachFramebuffer(e.texture, o, t);
      }
      bindAttributes(e) {
        let o = e.position,
          t = e.textureCoord;
        this.glContext.setVertexAttributes(o, t), (this.attributesBound = !0);
      }
      bindUniforms(e, o, t) {
        let r = this.glContext.gl,
          n = 0;
        for (let { name: s, type: a, location: u, arrayLength: l } of e) {
          let f = o.find((p) => p.name === s)?.data;
          if (a !== "sampler2D" && !f)
            throw new Error(
              `variable '${s}' does not have data defined in program info`
            );
          switch (a) {
            case "sampler2D":
              this.bindTexture(t[n], u, n), n++;
              break;
            case "float":
              l ? r.uniform1fv(u, f) : r.uniform1f(u, f);
              break;
            case "int":
              l ? r.uniform1iv(u, f) : r.uniform1i(u, f);
              break;
            default:
              throw new Error(`Uniform not implemented: ${a}`);
          }
        }
      }
      bindTexture(e, o, t) {
        this.glContext.bindTextureToUniform(e.texture, t, o);
      }
      getAttribLocations(e) {
        return {
          position: this.getAttribLocation(e, "position"),
          textureCoord: this.getAttribLocation(e, "textureCoord"),
        };
      }
      getUniformLocations(e, o, t) {
        let r = [];
        if (o)
          for (let n of o)
            r.push({
              name: n,
              type: "sampler2D",
              location: this.getUniformLocation(e, n),
            });
        if (t)
          for (let n of t)
            r.push({ ...n, location: this.getUniformLocation(e, n.name) });
        return r;
      }
      getUniformLocation(e, o) {
        let r = this.glContext.gl.getUniformLocation(e, o);
        if (r === null) throw new Error(`Uniform ${o} not found.`);
        return r;
      }
      getAttribLocation(e, o) {
        return this.glContext.gl.getAttribLocation(e, o);
      }
    };
  });
var Kn,
  xp = O(() => {
    "use strict";
    Ut();
    Fr();
    Kn = class {
      constructor(e, o, t, r) {
        this.glContext = e;
        this.layoutStrategy = o;
        this.profiler = t;
        this.config = r;
        this.pendingRead = new Map();
        r.reuseTextures &&
          ((this.inUseTextures = new Map()),
          (this.idleTextures = new Map()),
          (this.textureLookup = new Map()));
      }
      createTextureFromLayout(e, o, t, r) {
        let n = this.toEncoderType(e),
          s = this.glContext.getEncoder(n, o.channels || 1, r);
        if (o.isPacked && r === 1) throw new Error("not implemented");
        let a = o.width,
          u = o.height,
          l,
          f;
        if (this.config.reuseTextures) {
          (l = `${a}x${u}_${s.format}_${s.internalFormat}_${s.textureType}`),
            (f = this.inUseTextures.get(l)),
            f || ((f = []), this.inUseTextures.set(l, f));
          let d = this.idleTextures.get(l);
          if (d && d.length > 0) {
            let y = d.pop();
            return (
              f.push(y),
              r === 1 &&
                this.glContext.updateTexture(
                  y,
                  a,
                  u,
                  s,
                  this.toTextureData(e, t)
                ),
              y
            );
          }
        }
        tt.verbose(
          "TextureManager",
          `Creating new texture of size ${o.width}x${o.height}`
        );
        let p = this.glContext.allocateTexture(
          a,
          u,
          s,
          this.toTextureData(e, t)
        );
        return (
          this.config.reuseTextures &&
            (f.push(p), this.textureLookup.set(p, l)),
          p
        );
      }
      readTexture(e, o, t) {
        return (
          t || (t = 1),
          this.profiler.event("backend", "TextureManager.readTexture", () => {
            let r = e.shape.reduce((s, a) => s * a) * t,
              n = this.glContext.readTexture(
                e.texture,
                e.width,
                e.height,
                r,
                this.toEncoderType(o),
                t
              );
            return this.toTensorData(o, n);
          })
        );
      }
      async readTextureAsync(e, o, t) {
        let r = e.tensor.dataId;
        if ((t || (t = 1), this.pendingRead.has(r))) {
          let n = this.pendingRead.get(r);
          return new Promise((s) => n?.push(s));
        }
        return this.profiler.event(
          "backend",
          "TextureManager.readTextureAsync",
          async () => {
            this.pendingRead.set(r, []);
            let n = e.shape.reduce((l, f) => l * f) * t;
            await this.glContext.createAndWaitForFence();
            let s = this.glContext.readTexture(
                e.texture,
                e.width,
                e.height,
                n,
                this.toEncoderType(o),
                t
              ),
              a = this.toTensorData(o, s),
              u = this.pendingRead.get(r);
            return this.pendingRead.delete(r), u?.forEach((l) => l(a)), a;
          }
        );
      }
      readUint8TextureAsFloat(e) {
        return this.profiler.event(
          "backend",
          "TextureManager.readUint8TextureAsFloat",
          () => {
            let o = e.shape.reduce((r, n) => r * n),
              t = this.glContext.readTexture(
                e.texture,
                e.width,
                e.height,
                o * 4,
                "byte",
                4
              );
            return new Float32Array(t.buffer, t.byteOffset, o);
          }
        );
      }
      releaseTexture(e, o) {
        let t;
        if (
          this.config.reuseTextures &&
          ((t = this.textureLookup.get(e.texture)), t)
        ) {
          o && this.textureLookup.delete(t);
          let r = this.inUseTextures.get(t);
          if (r) {
            let n = r.indexOf(e.texture);
            if (n !== -1) {
              r.splice(n, 1);
              let s = this.idleTextures.get(t);
              s || ((s = []), this.idleTextures.set(t, s)), s.push(e.texture);
            }
          }
        }
        (!t || o) &&
          (tt.verbose(
            "TextureManager",
            `Deleting texture of size ${e.width}x${e.height}`
          ),
          this.glContext.deleteTexture(e.texture));
      }
      toTensorData(e, o) {
        switch (e) {
          case "int16":
            return o instanceof Int16Array ? o : Int16Array.from(o);
          case "int32":
            return o instanceof Int32Array ? o : Int32Array.from(o);
          case "int8":
            return o instanceof Int8Array ? o : Int8Array.from(o);
          case "uint16":
            return o instanceof Uint16Array ? o : Uint16Array.from(o);
          case "uint32":
            return o instanceof Uint32Array ? o : Uint32Array.from(o);
          case "uint8":
          case "bool":
            return o instanceof Uint8Array ? o : Uint8Array.from(o);
          case "float32":
            return o instanceof Float32Array ? o : Float32Array.from(o);
          case "float64":
            return o instanceof Float64Array ? o : Float64Array.from(o);
          default:
            throw new Error(`TensorData type ${e} is not supported`);
        }
      }
      toTextureData(e, o) {
        if (o) return o instanceof Float32Array ? o : new Float32Array(o);
      }
      toEncoderType(e) {
        return "float";
      }
      clearActiveTextures() {
        this.glContext.clearActiveTextures();
      }
    };
  });
var Jn,
  Tp = O(() => {
    "use strict";
    Ut();
    Bs();
    cl();
    ap();
    yp();
    Ni();
    xp();
    Jn = class {
      constructor(e, o) {
        this.backend = e;
        this.context = o;
        (this.layoutStrategy = new Un(e.glContext.maxTextureSize)),
          (this.programManager = new Xn(
            this.context.profiler,
            e.glContext,
            this.layoutStrategy
          )),
          (this.textureManager = new Kn(
            e.glContext,
            this.layoutStrategy,
            this.context.profiler,
            { reuseTextures: e.textureCacheMode === "full" }
          )),
          (this.packedTextureDataCache = new Map()),
          (this.unpackedTextureDataCache = new Map()),
          (this.pack = e.pack),
          (this.pack2unpackMap = new Map()),
          (this.unpack2packMap = new Map());
      }
      createInferenceHandler() {
        return new Dn(this);
      }
      onGraphInitialized(e) {
        let o = e
          .getValues()
          .filter((t) => t.from === -1 && t.tensor)
          .map((t) => t.tensor.dataId);
        this.initializers = new Set(o);
      }
      isInitializer(e) {
        return this.initializers ? this.initializers.has(e) : !1;
      }
      addInitializer(e) {
        this.initializers.add(e);
      }
      getTextureData(e, o) {
        return o
          ? this.packedTextureDataCache.get(e)
          : this.unpackedTextureDataCache.get(e);
      }
      setTextureData(e, o, t = !1) {
        tt.verbose("WebGLSessionHandler", "Storing Texture data in cache"),
          t
            ? this.packedTextureDataCache.set(e, o)
            : this.unpackedTextureDataCache.set(e, o);
      }
      dispose() {
        this.programManager.dispose(),
          this.textureManager.clearActiveTextures(),
          this.packedTextureDataCache.forEach((e) =>
            this.textureManager.releaseTexture(e, !0)
          ),
          (this.packedTextureDataCache = new Map()),
          this.unpackedTextureDataCache.forEach((e) =>
            this.textureManager.releaseTexture(e, !0)
          ),
          (this.unpackedTextureDataCache = new Map());
      }
      resolve(e, o, t) {
        let r = ks(e, o, ip);
        return { impl: r.opImpl, context: r.opInit ? r.opInit(e, t) : e };
      }
    };
  });
function bg(i) {
  let e = 0;
  for (; e < i.length && i[e](); ++e);
  return e - 1;
}
var Mr,
  wp = O(() => {
    "use strict";
    Yt();
    Fr();
    Fr();
    pe();
    Mr = class {
      constructor(e, o) {
        this.frameBufferBound = !1;
        this.itemsToPoll = [];
        (this.gl = e),
          (this.version = o),
          this.getExtensions(),
          (this.vertexbuffer = this.createVertexbuffer()),
          (this.framebuffer = this.createFramebuffer()),
          this.queryVitalParameters();
      }
      allocateTexture(e, o, t, r) {
        let n = this.gl,
          s = n.createTexture();
        n.bindTexture(n.TEXTURE_2D, s),
          n.texParameteri(n.TEXTURE_2D, n.TEXTURE_MIN_FILTER, n.NEAREST),
          n.texParameteri(n.TEXTURE_2D, n.TEXTURE_MAG_FILTER, n.NEAREST),
          n.texParameteri(n.TEXTURE_2D, n.TEXTURE_WRAP_S, n.CLAMP_TO_EDGE),
          n.texParameteri(n.TEXTURE_2D, n.TEXTURE_WRAP_T, n.CLAMP_TO_EDGE);
        let a = r ? t.encode(r, e * o) : null;
        return (
          n.texImage2D(
            n.TEXTURE_2D,
            0,
            t.internalFormat,
            e,
            o,
            0,
            t.format,
            t.textureType,
            a
          ),
          this.checkError(),
          s
        );
      }
      updateTexture(e, o, t, r, n) {
        let s = this.gl;
        s.bindTexture(s.TEXTURE_2D, e);
        let a = r.encode(n, o * t);
        s.texSubImage2D(
          s.TEXTURE_2D,
          0,
          0,
          0,
          o,
          t,
          r.format,
          r.textureType,
          a
        ),
          this.checkError();
      }
      attachFramebuffer(e, o, t) {
        let r = this.gl;
        r.bindTexture(r.TEXTURE_2D, e),
          r.bindFramebuffer(r.FRAMEBUFFER, this.framebuffer),
          r.framebufferTexture2D(
            r.FRAMEBUFFER,
            r.COLOR_ATTACHMENT0,
            r.TEXTURE_2D,
            e,
            0
          ),
          this.checkError(),
          r.viewport(0, 0, o, t),
          r.scissor(0, 0, o, t);
      }
      readTexture(e, o, t, r, n, s) {
        let a = this.gl;
        s || (s = 1), this.frameBufferBound || this.attachFramebuffer(e, o, t);
        let u = this.getEncoder(n, s),
          l = u.allocate(o * t);
        return (
          a.bindTexture(a.TEXTURE_2D, e),
          a.framebufferTexture2D(
            a.FRAMEBUFFER,
            a.COLOR_ATTACHMENT0,
            a.TEXTURE_2D,
            e,
            0
          ),
          a.readPixels(0, 0, o, t, a.RGBA, u.textureType, l),
          this.checkError(),
          u.decode(l, r)
        );
      }
      isFramebufferReady() {
        return !0;
      }
      getActiveTexture() {
        let e = this.gl;
        return `TEXTURE${e.getParameter(this.gl.ACTIVE_TEXTURE) - e.TEXTURE0}`;
      }
      getTextureBinding() {
        return this.gl.getParameter(this.gl.TEXTURE_BINDING_2D);
      }
      getFramebufferBinding() {
        return this.gl.getParameter(this.gl.FRAMEBUFFER_BINDING);
      }
      setVertexAttributes(e, o) {
        let t = this.gl;
        t.vertexAttribPointer(e, 3, t.FLOAT, !1, 20, 0),
          t.enableVertexAttribArray(e),
          o !== -1 &&
            (t.vertexAttribPointer(o, 2, t.FLOAT, !1, 20, 12),
            t.enableVertexAttribArray(o)),
          this.checkError();
      }
      createProgram(e, o) {
        let t = this.gl,
          r = t.createProgram();
        return t.attachShader(r, e), t.attachShader(r, o), t.linkProgram(r), r;
      }
      compileShader(e, o) {
        let t = this.gl,
          r = t.createShader(o);
        if (!r) throw new Error(`createShader() returned null with type ${o}`);
        if (
          (t.shaderSource(r, e),
          t.compileShader(r),
          t.getShaderParameter(r, t.COMPILE_STATUS) === !1)
        )
          throw new Error(`Failed to compile shader: ${t.getShaderInfoLog(r)}
Shader source:
${e}`);
        return r;
      }
      deleteShader(e) {
        this.gl.deleteShader(e);
      }
      bindTextureToUniform(e, o, t) {
        let r = this.gl;
        r.activeTexture(r.TEXTURE0 + o),
          this.checkError(),
          r.bindTexture(r.TEXTURE_2D, e),
          this.checkError(),
          r.uniform1i(t, o),
          this.checkError();
      }
      draw() {
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4), this.checkError();
      }
      checkError() {
        if (z.debug) {
          let e = this.gl,
            o = e.getError(),
            t = "";
          switch (o) {
            case e.NO_ERROR:
              return;
            case e.INVALID_ENUM:
              t = "INVALID_ENUM";
              break;
            case e.INVALID_VALUE:
              t = "INVALID_VALUE";
              break;
            case e.INVALID_OPERATION:
              t = "INVALID_OPERATION";
              break;
            case e.INVALID_FRAMEBUFFER_OPERATION:
              t = "INVALID_FRAMEBUFFER_OPERATION";
              break;
            case e.OUT_OF_MEMORY:
              t = "OUT_OF_MEMORY";
              break;
            case e.CONTEXT_LOST_WEBGL:
              t = "CONTEXT_LOST_WEBGL";
              break;
            default:
              t = `Unknown WebGL Error: ${o.toString(16)}`;
          }
          throw new Error(t);
        }
      }
      deleteTexture(e) {
        this.gl.deleteTexture(e);
      }
      deleteProgram(e) {
        this.gl.deleteProgram(e);
      }
      getEncoder(e, o, t = 0) {
        if (this.version === 2) return new Pn(this.gl, o);
        switch (e) {
          case "float":
            return t === 1 || this.isRenderFloat32Supported
              ? new Br(this.gl, o)
              : new Br(
                  this.gl,
                  o,
                  this.textureHalfFloatExtension.HALF_FLOAT_OES
                );
          case "int":
            throw new Error("not implemented");
          case "byte":
            return new En(this.gl, o);
          default:
            throw new Error(`Invalid dataType: ${e}`);
        }
      }
      clearActiveTextures() {
        let e = this.gl;
        for (let o = 0; o < this.maxTextureImageUnits; ++o)
          e.activeTexture(e.TEXTURE0 + o), e.bindTexture(e.TEXTURE_2D, null);
      }
      dispose() {
        if (this.disposed) return;
        let e = this.gl;
        e.bindFramebuffer(e.FRAMEBUFFER, null),
          e.deleteFramebuffer(this.framebuffer),
          e.bindBuffer(e.ARRAY_BUFFER, null),
          e.deleteBuffer(this.vertexbuffer),
          e.bindBuffer(e.ELEMENT_ARRAY_BUFFER, null),
          e.finish(),
          (this.disposed = !0);
      }
      createDefaultGeometry() {
        return new Float32Array([
          -1, 1, 0, 0, 1, -1, -1, 0, 0, 0, 1, 1, 0, 1, 1, 1, -1, 0, 1, 0,
        ]);
      }
      createVertexbuffer() {
        let e = this.gl,
          o = e.createBuffer();
        if (!o) throw new Error("createBuffer() returned null");
        let t = this.createDefaultGeometry();
        return (
          e.bindBuffer(e.ARRAY_BUFFER, o),
          e.bufferData(e.ARRAY_BUFFER, t, e.STATIC_DRAW),
          this.checkError(),
          o
        );
      }
      createFramebuffer() {
        let e = this.gl.createFramebuffer();
        if (!e) throw new Error("createFramebuffer returned null");
        return e;
      }
      queryVitalParameters() {
        let e = this.gl;
        if (
          ((this.isFloatTextureAttachableToFrameBuffer =
            this.checkFloatTextureAttachableToFrameBuffer()),
          (this.isRenderFloat32Supported = this.checkRenderFloat32()),
          (this.isFloat32DownloadSupported = this.checkFloat32Download()),
          this.version === 1 &&
            !this.textureHalfFloatExtension &&
            !this.isRenderFloat32Supported)
        )
          throw new Error(
            "both float32 and float16 TextureType are not supported"
          );
        (this.isBlendSupported =
          !this.isRenderFloat32Supported || this.checkFloat32Blend()),
          (this.maxTextureSize = e.getParameter(e.MAX_TEXTURE_SIZE)),
          (this.maxTextureImageUnits = e.getParameter(
            e.MAX_TEXTURE_IMAGE_UNITS
          )),
          this.version;
      }
      getExtensions() {
        this.version === 2
          ? ((this.colorBufferFloatExtension = this.gl.getExtension(
              "EXT_color_buffer_float"
            )),
            (this.disjointTimerQueryWebgl2Extension = this.gl.getExtension(
              "EXT_disjoint_timer_query_webgl2"
            )))
          : ((this.textureFloatExtension =
              this.gl.getExtension("OES_texture_float")),
            (this.textureHalfFloatExtension = this.gl.getExtension(
              "OES_texture_half_float"
            )));
      }
      checkFloatTextureAttachableToFrameBuffer() {
        let e = this.gl,
          o = e.createTexture();
        e.bindTexture(e.TEXTURE_2D, o);
        let t = this.version === 2 ? e.RGBA32F : e.RGBA;
        e.texImage2D(e.TEXTURE_2D, 0, t, 1, 1, 0, e.RGBA, e.FLOAT, null);
        let r = e.createFramebuffer();
        e.bindFramebuffer(e.FRAMEBUFFER, r),
          e.framebufferTexture2D(
            e.FRAMEBUFFER,
            e.COLOR_ATTACHMENT0,
            e.TEXTURE_2D,
            o,
            0
          );
        let n =
          e.checkFramebufferStatus(e.FRAMEBUFFER) === e.FRAMEBUFFER_COMPLETE;
        return (
          e.bindTexture(e.TEXTURE_2D, null),
          e.bindFramebuffer(e.FRAMEBUFFER, null),
          e.deleteTexture(o),
          e.deleteFramebuffer(r),
          n
        );
      }
      checkRenderFloat32() {
        if (this.version === 2) {
          if (!this.colorBufferFloatExtension) return !1;
        } else if (!this.textureFloatExtension) return !1;
        return this.isFloatTextureAttachableToFrameBuffer;
      }
      checkFloat32Download() {
        if (this.version === 2) {
          if (!this.colorBufferFloatExtension) return !1;
        } else if (
          !this.textureFloatExtension ||
          !this.gl.getExtension("WEBGL_color_buffer_float")
        )
          return !1;
        return this.isFloatTextureAttachableToFrameBuffer;
      }
      checkFloat32Blend() {
        let e = this.gl,
          o,
          t,
          r,
          n,
          s;
        try {
          (o = e.createTexture()),
            (t = e.createFramebuffer()),
            e.bindTexture(e.TEXTURE_2D, o);
          let a = this.version === 2 ? e.RGBA32F : e.RGBA;
          return (
            e.texImage2D(e.TEXTURE_2D, 0, a, 1, 1, 0, e.RGBA, e.FLOAT, null),
            e.bindFramebuffer(e.FRAMEBUFFER, t),
            e.framebufferTexture2D(
              e.FRAMEBUFFER,
              e.COLOR_ATTACHMENT0,
              e.TEXTURE_2D,
              o,
              0
            ),
            e.enable(e.BLEND),
            (r = e.createShader(e.VERTEX_SHADER)),
            !r ||
            (e.shaderSource(r, "void main(){}"),
            e.compileShader(r),
            (n = e.createShader(e.FRAGMENT_SHADER)),
            !n) ||
            (e.shaderSource(
              n,
              "precision highp float;void main(){gl_FragColor=vec4(0.5);}"
            ),
            e.compileShader(n),
            (s = e.createProgram()),
            !s)
              ? !1
              : (e.attachShader(s, r),
                e.attachShader(s, n),
                e.linkProgram(s),
                e.useProgram(s),
                e.drawArrays(e.POINTS, 0, 1),
                e.getError() === e.NO_ERROR)
          );
        } finally {
          e.disable(e.BLEND),
            s && e.deleteProgram(s),
            r && e.deleteShader(r),
            n && e.deleteShader(n),
            t &&
              (e.bindFramebuffer(e.FRAMEBUFFER, null), e.deleteFramebuffer(t)),
            o && (e.bindTexture(e.TEXTURE_2D, null), e.deleteTexture(o));
        }
      }
      beginTimer() {
        if (this.version === 2 && this.disjointTimerQueryWebgl2Extension) {
          let e = this.gl,
            o = this.disjointTimerQueryWebgl2Extension,
            t = e.createQuery();
          return e.beginQuery(o.TIME_ELAPSED_EXT, t), t;
        } else throw new Error("WebGL1 profiling currently not supported.");
      }
      endTimer() {
        if (this.version === 2 && this.disjointTimerQueryWebgl2Extension) {
          let e = this.gl,
            o = this.disjointTimerQueryWebgl2Extension;
          e.endQuery(o.TIME_ELAPSED_EXT);
          return;
        } else throw new Error("WebGL1 profiling currently not supported");
      }
      isTimerResultAvailable(e) {
        let o = !1,
          t = !1;
        if (this.version === 2 && this.disjointTimerQueryWebgl2Extension) {
          let r = this.gl,
            n = this.disjointTimerQueryWebgl2Extension;
          (o = r.getQueryParameter(e, r.QUERY_RESULT_AVAILABLE)),
            (t = r.getParameter(n.GPU_DISJOINT_EXT));
        } else throw new Error("WebGL1 profiling currently not supported");
        return o && !t;
      }
      getTimerResult(e) {
        let o = 0;
        if (this.version === 2) {
          let t = this.gl;
          (o = t.getQueryParameter(e, t.QUERY_RESULT)), t.deleteQuery(e);
        } else throw new Error("WebGL1 profiling currently not supported");
        return o / 1e6;
      }
      async waitForQueryAndGetTime(e) {
        return (
          await li(() => this.isTimerResultAvailable(e)), this.getTimerResult(e)
        );
      }
      async createAndWaitForFence() {
        let e = this.createFence(this.gl);
        return this.pollFence(e);
      }
      createFence(e) {
        let o,
          t = e,
          r = t.fenceSync(t.SYNC_GPU_COMMANDS_COMPLETE, 0);
        return (
          e.flush(),
          r === null
            ? (o = () => !0)
            : (o = () => {
                let n = t.clientWaitSync(r, 0, 0);
                return n === t.ALREADY_SIGNALED || n === t.CONDITION_SATISFIED;
              }),
          { query: r, isFencePassed: o }
        );
      }
      async pollFence(e) {
        return new Promise((o) => {
          this.addItemToPoll(
            () => e.isFencePassed(),
            () => o()
          );
        });
      }
      pollItems() {
        let e = bg(this.itemsToPoll.map((o) => o.isDoneFn));
        for (let o = 0; o <= e; ++o) {
          let { resolveFn: t } = this.itemsToPoll[o];
          t();
        }
        this.itemsToPoll = this.itemsToPoll.slice(e + 1);
      }
      async addItemToPoll(e, o) {
        this.itemsToPoll.push({ isDoneFn: e, resolveFn: o }),
          !(this.itemsToPoll.length > 1) &&
            (await li(() => (this.pollItems(), this.itemsToPoll.length === 0)));
      }
    };
  });
function Gi(i) {
  let e;
  if (
    ((!i || i === "webgl2") && "webgl2" in mr
      ? (e = mr.webgl2)
      : (!i || i === "webgl") && "webgl" in mr && (e = mr.webgl),
    !e)
  )
    try {
      let t = yg();
      e = vp(t, i);
    } catch {
      let r = gg();
      e = vp(r, i);
    }
  i = i || e.version === 1 ? "webgl" : "webgl2";
  let o = e.gl;
  return (
    (mr[i] = e),
    o.isContextLost()
      ? (delete mr[i], Gi(i))
      : (o.disable(o.DEPTH_TEST),
        o.disable(o.STENCIL_TEST),
        o.disable(o.BLEND),
        o.disable(o.DITHER),
        o.disable(o.POLYGON_OFFSET_FILL),
        o.disable(o.SAMPLE_COVERAGE),
        o.enable(o.SCISSOR_TEST),
        o.enable(o.CULL_FACE),
        o.cullFace(o.BACK),
        e)
  );
}
function vp(i, e) {
  let o = {
      alpha: !1,
      depth: !1,
      antialias: !1,
      stencil: !1,
      preserveDrawingBuffer: !1,
      premultipliedAlpha: !1,
      failIfMajorPerformanceCaveat: !1,
    },
    t,
    r = o;
  if ((!e || e === "webgl2") && ((t = i.getContext("webgl2", r)), t))
    try {
      return new Mr(t, 2);
    } catch (n) {
      tt.warning(
        "GlContextFactory",
        `failed to create WebGLContext using contextId 'webgl2'. Error: ${n}`
      );
    }
  if (
    (!e || e === "webgl") &&
    ((t = i.getContext("webgl", r) || i.getContext("experimental-webgl", r)), t)
  )
    try {
      return new Mr(t, 1);
    } catch (n) {
      tt.warning(
        "GlContextFactory",
        `failed to create WebGLContext using contextId 'webgl' or 'experimental-webgl'. Error: ${n}`
      );
    }
  throw new Error("WebGL is not supported");
}
function gg() {
  if (typeof document > "u")
    throw new TypeError("failed to create canvas: document is not supported");
  let i = document.createElement("canvas");
  return (i.width = 1), (i.height = 1), i;
}
function yg() {
  if (typeof OffscreenCanvas > "u")
    throw new TypeError(
      "failed to create offscreen canvas: OffscreenCanvas is not supported"
    );
  return new OffscreenCanvas(1, 1);
}
var mr,
  Ip = O(() => {
    "use strict";
    Ut();
    wp();
    mr = {};
  });
var Yn,
  _p = O(() => {
    "use strict";
    Yt();
    Ut();
    Tp();
    Ip();
    Yn = class {
      get contextId() {
        return z.webgl.contextId;
      }
      set contextId(e) {
        z.webgl.contextId = e;
      }
      get matmulMaxBatchSize() {
        return z.webgl.matmulMaxBatchSize;
      }
      set matmulMaxBatchSize(e) {
        z.webgl.matmulMaxBatchSize = e;
      }
      get textureCacheMode() {
        return z.webgl.textureCacheMode;
      }
      set textureCacheMode(e) {
        z.webgl.textureCacheMode = e;
      }
      get pack() {
        return z.webgl.pack;
      }
      set pack(e) {
        z.webgl.pack = e;
      }
      get async() {
        return z.webgl.async;
      }
      set async(e) {
        z.webgl.async = e;
      }
      initialize() {
        try {
          return (
            (this.glContext = Gi(this.contextId)),
            typeof this.matmulMaxBatchSize != "number" &&
              (this.matmulMaxBatchSize = 16),
            typeof this.textureCacheMode != "string" &&
              (this.textureCacheMode = "full"),
            typeof this.pack != "boolean" && (this.pack = !1),
            typeof this.async != "boolean" && (this.async = !1),
            tt.setWithEnv(z),
            z.webgl.context ||
              Object.defineProperty(z.webgl, "context", {
                value: this.glContext.gl,
              }),
            tt.verbose(
              "WebGLBackend",
              `Created WebGLContext: ${typeof this
                .glContext} with matmulMaxBatchSize: ${
                this.matmulMaxBatchSize
              }; textureCacheMode: ${this.textureCacheMode}; pack: ${
                this.pack
              }; async: ${this.async}.`
            ),
            !0
          );
        } catch (e) {
          return (
            tt.warning(
              "WebGLBackend",
              `Unable to initialize WebGLBackend. ${e}`
            ),
            !1
          );
        }
      }
      createSessionHandler(e) {
        return new Jn(this, e);
      }
      dispose() {
        this.glContext.dispose();
      }
    };
  });
async function Mi(i) {
  if (i) {
    let e = typeof i == "string" ? [i] : i;
    for (let o of e) {
      let t = Op.get(o);
      if (t) return t;
      let r = await Tg(o);
      if (r) return r;
    }
  } else return Mi(["webgl"]);
  throw new Error("no available backend to use");
}
async function Tg(i) {
  let e = xg;
  if (typeof e[i] < "u" && wg(e[i])) {
    let o = e[i],
      t = o.initialize();
    if ((typeof t == "object" && "then" in t && (t = await t), t))
      return Op.set(i, o), o;
  }
}
function wg(i) {
  let e = i;
  return (
    "initialize" in e &&
    typeof e.initialize == "function" &&
    "createSessionHandler" in e &&
    typeof e.createSessionHandler == "function" &&
    "dispose" in e &&
    typeof e.dispose == "function"
  );
}
var Op,
  xg,
  Sp = O(() => {
    "use strict";
    _p();
    (Op = new Map()), (xg = { webgl: new Yn() });
  });
var Ui,
  Zn,
  Ap = O(() => {
    "use strict";
    Ut();
    (Ui = class {
      constructor(e, o) {
        this.op = e;
        this.node = o;
      }
    }),
      (Zn = class {
        constructor(e, o, t) {
          this.graph = e;
          this.profiler = t;
          this.initialize(o);
        }
        initialize(e) {
          this.profiler.event("session", "ExecutionPlan.initialize", () => {
            let o = this.graph.getNodes();
            if (o.length !== e.length)
              throw new Error("The size of nodes and OPs do not match.");
            (this._ops = e.map((t, r) => new Ui(t, o[r]))),
              this.reset(),
              (this._starter = []),
              this._ops.forEach((t, r) => {
                let n = !0;
                for (let s of t.node.inputs)
                  if (
                    !this._values[s] &&
                    this.graph.getInputIndices().indexOf(s) === -1
                  ) {
                    n = !1;
                    break;
                  }
                n && this._starter.push(r);
              });
          });
        }
        reset() {
          this._values = this.graph.getValues().map((e) => e.tensor);
        }
        async execute(e, o) {
          return this.profiler.event(
            "session",
            "ExecutionPlan.execute",
            async () => {
              this.reset();
              let t = e.createInferenceHandler(),
                r = this.graph.getInputIndices();
              if (o.length !== r.length)
                throw new Error(
                  `number of input tensors don't match the number of inputs to the model: actual: ${o.length} expected: ${r.length}`
                );
              o.forEach((f, p) => {
                let d = r[p];
                this._values[d] = f;
              });
              let n = this._starter.slice(0),
                s = this.graph.getValues(),
                a = this.graph.getNodes(),
                u = 0;
              for (; u < n.length; ) {
                let f = n[u++],
                  p = this._ops[f],
                  d = p.node.inputs.map((S) => this._values[S]);
                if (d.indexOf(void 0) !== -1)
                  throw new Error(`unresolved input detected: op: ${p.node}`);
                let y = d;
                tt.verbose(
                  "ExecPlan",
                  `Running op:${p.node.name} (${y
                    .map(
                      (S, L) =>
                        `'${p.node.inputs[L]}': ${S.type}[${S.dims.join(",")}]`
                    )
                    .join(", ")})`
                );
                let T = await this.profiler.event(
                  "node",
                  p.node.name,
                  async () => p.op.impl(t, y, p.op.context)
                );
                if (T.length !== p.node.outputs.length)
                  throw new Error(
                    "the size of output does not match model definition."
                  );
                T.forEach((S, L) => {
                  let P = p.node.outputs[L];
                  if (this._values[P])
                    throw new Error(
                      `output [${P}] already has value: op:${p.node.name}`
                    );
                  this._values[P] = S;
                });
                let v = new Set();
                T.forEach((S, L) => {
                  let P = p.node.outputs[L];
                  for (let A of s[P].to) {
                    let M = a[A],
                      V = !0;
                    for (let lt of M.inputs)
                      if (!this._values[lt]) {
                        V = !1;
                        break;
                      }
                    V && v.add(A);
                  }
                }),
                  n.push(...v);
              }
              let l = [];
              for (let f = 0; f < this.graph.getOutputIndices().length; f++) {
                let p = this.graph.getOutputIndices()[f],
                  d = this._values[p];
                if (d === void 0)
                  throw new Error(`required output [${p}] does not have value`);
                p === 0 ? await d.getData() : d.data, l.push(d);
              }
              return (
                tt.verbose("ExecPlan", "disposing of inferenceHandler"),
                t.dispose(),
                l
              );
            }
          );
        }
      });
  });
var q,
  Xt,
  Ur,
  Pp = O(() => {
    "use strict";
    Pr();
    q = rr(sr());
    We();
    Y();
    (Xt = F.experimental.fbs),
      (Ur = class i {
        constructor(e) {
          if (((this._attributes = new Map()), e != null)) {
            for (let o of e)
              o instanceof q.onnx.AttributeProto
                ? this._attributes.set(o.name, [i.getValue(o), i.getType(o)])
                : o instanceof Xt.Attribute &&
                  this._attributes.set(o.name(), [i.getValue(o), i.getType(o)]);
            if (this._attributes.size < e.length)
              throw new Error("duplicated attribute names");
          }
        }
        set(e, o, t) {
          this._attributes.set(e, [t, o]);
        }
        delete(e) {
          this._attributes.delete(e);
        }
        getFloat(e, o) {
          return this.get(e, "float", o);
        }
        getInt(e, o) {
          return this.get(e, "int", o);
        }
        getString(e, o) {
          return this.get(e, "string", o);
        }
        getTensor(e, o) {
          return this.get(e, "tensor", o);
        }
        getFloats(e, o) {
          return this.get(e, "floats", o);
        }
        getInts(e, o) {
          return this.get(e, "ints", o);
        }
        getStrings(e, o) {
          return this.get(e, "strings", o);
        }
        getTensors(e, o) {
          return this.get(e, "tensors", o);
        }
        get(e, o, t) {
          let r = this._attributes.get(e);
          if (r === void 0) {
            if (t !== void 0) return t;
            throw new Error(`required attribute not found: ${e}`);
          }
          if (r[1] !== o)
            throw new Error(`type mismatch: expected ${o} but got ${r[1]}`);
          return r[0];
        }
        static getType(e) {
          let o = e instanceof q.onnx.AttributeProto ? e.type : e.type();
          switch (o) {
            case q.onnx.AttributeProto.AttributeType.FLOAT:
              return "float";
            case q.onnx.AttributeProto.AttributeType.INT:
              return "int";
            case q.onnx.AttributeProto.AttributeType.STRING:
              return "string";
            case q.onnx.AttributeProto.AttributeType.TENSOR:
              return "tensor";
            case q.onnx.AttributeProto.AttributeType.FLOATS:
              return "floats";
            case q.onnx.AttributeProto.AttributeType.INTS:
              return "ints";
            case q.onnx.AttributeProto.AttributeType.STRINGS:
              return "strings";
            case q.onnx.AttributeProto.AttributeType.TENSORS:
              return "tensors";
            default:
              throw new Error(
                `attribute type is not supported yet: ${q.onnx.AttributeProto.AttributeType[o]}`
              );
          }
        }
        static getValue(e) {
          let o = e instanceof q.onnx.AttributeProto ? e.type : e.type();
          if (
            o === q.onnx.AttributeProto.AttributeType.GRAPH ||
            o === q.onnx.AttributeProto.AttributeType.GRAPHS
          )
            throw new Error("graph attribute is not supported yet");
          let t = this.getValueNoCheck(e);
          if (o === q.onnx.AttributeProto.AttributeType.INT && Rt.isLong(t))
            return Rt.longToNumber(t);
          if (o === q.onnx.AttributeProto.AttributeType.INTS) {
            let r = t,
              n = new Array(r.length);
            for (let s = 0; s < r.length; s++) {
              let a = r[s];
              n[s] = Rt.longToNumber(a);
            }
            return n;
          }
          if (o === q.onnx.AttributeProto.AttributeType.TENSOR)
            return e instanceof q.onnx.AttributeProto
              ? bt.fromProto(t)
              : bt.fromOrtTensor(t);
          if (o === q.onnx.AttributeProto.AttributeType.TENSORS) {
            if (e instanceof q.onnx.AttributeProto)
              return t.map((n) => bt.fromProto(n));
            if (e instanceof Xt.Attribute)
              return t.map((n) => bt.fromOrtTensor(n));
          }
          return o === q.onnx.AttributeProto.AttributeType.STRING &&
            e instanceof q.onnx.AttributeProto
            ? kr(t)
            : o === q.onnx.AttributeProto.AttributeType.STRINGS &&
              e instanceof q.onnx.AttributeProto
            ? t.map(kr)
            : t;
        }
        static getValueNoCheck(e) {
          return e instanceof q.onnx.AttributeProto
            ? this.getValueNoCheckFromOnnxFormat(e)
            : this.getValueNoCheckFromOrtFormat(e);
        }
        static getValueNoCheckFromOnnxFormat(e) {
          switch (e.type) {
            case q.onnx.AttributeProto.AttributeType.FLOAT:
              return e.f;
            case q.onnx.AttributeProto.AttributeType.INT:
              return e.i;
            case q.onnx.AttributeProto.AttributeType.STRING:
              return e.s;
            case q.onnx.AttributeProto.AttributeType.TENSOR:
              return e.t;
            case q.onnx.AttributeProto.AttributeType.GRAPH:
              return e.g;
            case q.onnx.AttributeProto.AttributeType.FLOATS:
              return e.floats;
            case q.onnx.AttributeProto.AttributeType.INTS:
              return e.ints;
            case q.onnx.AttributeProto.AttributeType.STRINGS:
              return e.strings;
            case q.onnx.AttributeProto.AttributeType.TENSORS:
              return e.tensors;
            case q.onnx.AttributeProto.AttributeType.GRAPHS:
              return e.graphs;
            default:
              throw new Error(
                `unsupported attribute type: ${
                  q.onnx.AttributeProto.AttributeType[e.type]
                }`
              );
          }
        }
        static getValueNoCheckFromOrtFormat(e) {
          switch (e.type()) {
            case Xt.AttributeType.FLOAT:
              return e.f();
            case Xt.AttributeType.INT:
              return e.i();
            case Xt.AttributeType.STRING:
              return e.s();
            case Xt.AttributeType.TENSOR:
              return e.t();
            case Xt.AttributeType.GRAPH:
              return e.g();
            case Xt.AttributeType.FLOATS:
              return e.floatsArray();
            case Xt.AttributeType.INTS: {
              let o = [];
              for (let t = 0; t < e.intsLength(); t++) o.push(e.ints(t));
              return o;
            }
            case Xt.AttributeType.STRINGS: {
              let o = [];
              for (let t = 0; t < e.stringsLength(); t++) o.push(e.strings(t));
              return o;
            }
            case Xt.AttributeType.TENSORS: {
              let o = [];
              for (let t = 0; t < e.tensorsLength(); t++) o.push(e.tensors(t));
              return o;
            }
            default:
              throw new Error(
                `unsupported attribute type: ${Xt.AttributeType[e.type()]}`
              );
          }
        }
      });
  });
var zi,
  Qn,
  Wi,
  me,
  to,
  Vi,
  Ep = O(() => {
    "use strict";
    Pp();
    Pr();
    zi = rr(sr());
    We();
    Y();
    (Qn = F.experimental.fbs),
      (Wi = { from: (i, e) => new Vi(i, e) }),
      (me = class {
        constructor(e) {
          (this._from = void 0),
            (this._to = []),
            (this.tensor = void 0),
            (this.type = void 0),
            e && (this.type = At.tensorValueTypeFromProto(e.type.tensorType));
        }
        get from() {
          return this._from;
        }
        get to() {
          return this._to;
        }
      }),
      (to = class {
        constructor(e, o) {
          e instanceof zi.onnx.NodeProto
            ? ((this.name = e.name),
              (this.opType = e.opType),
              (this.attributes = new Ur(e.attribute)))
            : e instanceof Qn.Node &&
              ((this.name = o ?? e.name()),
              (this.opType = e.opType()),
              (this.attributes = new Ur(At.tensorAttributesFromORTFormat(e)))),
            (this.inputs = []),
            (this.outputs = []),
            (this.executeNode = !0);
        }
      }),
      (Vi = class {
        constructor(e, o) {
          if (!e) throw new TypeError("graph is empty");
          this.buildGraph(e), this.transformGraph(o), this.checkIsAcyclic();
        }
        getInputIndices() {
          return this._allInputIndices;
        }
        getInputNames() {
          return this._allInputNames;
        }
        getOutputIndices() {
          return this._allOutputIndices;
        }
        getOutputNames() {
          return this._allOutputNames;
        }
        getValues() {
          return this._allData;
        }
        getNodes() {
          return this._nodes;
        }
        buildGraph(e) {
          if (e instanceof zi.onnx.GraphProto) this.buildGraphFromOnnxFormat(e);
          else if (e instanceof Qn.Graph) this.buildGraphFromOrtFormat(e);
          else throw new TypeError("Graph type is not supported.");
        }
        buildGraphFromOnnxFormat(e) {
          let o = new Map();
          (this._allData = []),
            (this._allInputIndices = []),
            (this._allInputNames = []),
            (this._allOutputIndices = []),
            (this._allOutputNames = []),
            (this._nodes = []);
          let t = new Map();
          if (!e.input) throw new Error("missing information in graph: input");
          let r = [];
          for (let n of e.input) {
            if (o.has(n.name))
              throw new Error(`duplicated input name: ${n.name}`);
            let s = this._allData.push(new me(n)) - 1;
            o.set(n.name, s), r.push(n.name);
          }
          if (!e.initializer)
            throw new Error("missing information in graph: initializer");
          for (let n of e.initializer) {
            let s = o.get(n.name);
            if (s === void 0) {
              let a = new me();
              (a.type = {
                shape: { dims: At.tensorDimsFromProto(n.dims) },
                tensorType: At.tensorDataTypeFromProto(n.dataType),
              }),
                (s = this._allData.push(a) - 1),
                o.set(n.name, s);
            }
            (this._allData[s]._from = -1),
              (this._allData[s].tensor = bt.fromProto(n));
          }
          for (let n = 0; n < this._allData.length; n++)
            this._allData[n].tensor ||
              (this._allInputIndices.push(n), this._allInputNames.push(r[n]));
          if (!e.output)
            throw new Error("missing information in graph: output");
          for (let n of e.output) {
            if (o.has(n.name))
              throw new Error(`duplicated output name: ${n.name}`);
            let s = this._allData.push(new me(n)) - 1;
            o.set(n.name, s),
              this._allOutputIndices.push(s),
              this._allOutputNames.push(n.name);
          }
          if (!e.node) throw new Error("missing information in graph: node");
          for (let n of e.node) {
            if (!n.name)
              for (let a = 0; ; a++) {
                let u = `unnamed_${n.opType}_${a}`;
                if (!t.has(u)) {
                  n.name = u;
                  break;
                }
              }
            if (t.has(n.name))
              throw new Error(`duplicated node name: ${n.name}`);
            let s = this._nodes.push(new to(n)) - 1;
            t.set(n.name, s);
          }
          for (let n = 0; n < this._nodes.length; n++) {
            let s = this._nodes[n],
              a = e.node[n];
            if (!a.output)
              throw new Error(`missing output for node: ${a.name}`);
            for (let u of a.output) {
              let l = o.get(u);
              if (
                (typeof l > "u" &&
                  ((l = this._allData.push(new me()) - 1), o.set(u, l)),
                s.outputs.push(l),
                this._allData[l]._from !== void 0)
              )
                throw new Error(
                  `multiple nodes output to one data value: ${l}`
                );
              if (((this._allData[l]._from = n), a.opType === "Constant")) {
                if (
                  !a.attribute ||
                  a.attribute.length !== 1 ||
                  !a.attribute[0].t
                )
                  throw new Error(
                    "missing attributes or missing tensor value in attributes for this Constant operator"
                  );
                if (!a.output || a.output.length !== 1)
                  throw new Error(
                    "missing output or incorrect number of outputs for this Constant operator"
                  );
                s.outputs.pop(),
                  (s.executeNode = !1),
                  (this._allData[l]._from = -1),
                  (this._allData[l].tensor = bt.fromProto(a.attribute[0].t));
              }
            }
          }
          for (let n = 0; n < this._nodes.length; n++) {
            let s = this._nodes[n],
              a = e.node[n];
            if (!a.input) throw new Error(`missing input for node: ${a.name}`);
            for (let u of a.input) {
              let l = o.get(u);
              if (typeof l > "u") {
                if (
                  u === "" &&
                  (a.input.length === 3 || a.input.length === 4) &&
                  a.opType === "Resize"
                )
                  continue;
                throw new Error(
                  `unrecognized input '${u}' for node: ${a.name}`
                );
              }
              s.inputs.push(l), this._allData[l]._to.push(n);
            }
          }
          return !0;
        }
        buildGraphFromOrtFormat(e) {
          let o = new Map();
          (this._allData = []),
            (this._allInputIndices = []),
            (this._allInputNames = []),
            (this._allOutputIndices = []),
            (this._allOutputNames = []),
            (this._nodes = []);
          let t = new Map(),
            r = [];
          for (let n = 0; n < e.inputsLength(); n++) {
            let s = e.inputs(n);
            if (o.has(s)) throw new Error(`duplicated input name: ${s}`);
            for (let a = 0; a < e.nodeArgsLength(); a++)
              if (e.nodeArgs(a)?.name() === s) {
                let u = new me();
                if (
                  e.nodeArgs(a)?.type()?.valueType() !==
                  Qn.TypeInfoValue.tensor_type
                )
                  throw new Error("Unexpected value type for the nodeArg.");
                let f = e.nodeArgs(a).type().value(new Qn.TensorTypeAndShape()),
                  p = At.tensorDataTypeFromProto(f.elemType()),
                  d = f.shape(),
                  y = [];
                for (let v = 0; v < d.dimLength(); v++)
                  y.push(Rt.longToNumber(d.dim(v).value().dimValue()));
                u.type = { shape: { dims: y }, tensorType: p };
                let T = this._allData.push(u) - 1;
                o.set(s, T), r.push(s);
              }
          }
          for (let n = 0; n < e.initializersLength(); n++) {
            let s = e.initializers(n),
              a = o.get(s.name());
            if (a === void 0) {
              let u = new me(),
                l = At.tensorDimsFromORTFormat(s),
                f = At.tensorDataTypeFromProto(s.dataType());
              (u.type = { shape: { dims: l }, tensorType: f }),
                (a = this._allData.push(u) - 1),
                o.set(s.name(), a);
            }
            (this._allData[a]._from = -1),
              (this._allData[a].tensor = bt.fromOrtTensor(s));
          }
          for (let n = 0; n < this._allData.length; n++)
            this._allData[n].tensor ||
              (this._allInputIndices.push(n), this._allInputNames.push(r[n]));
          for (let n = 0; n < e.outputsLength(); n++) {
            let s = e.outputs(n);
            if (o.has(s)) throw new Error(`duplicated output name: ${s}`);
            let a = this._allData.push(new me()) - 1;
            o.set(s, a),
              this._allOutputIndices.push(a),
              this._allOutputNames.push(s);
          }
          if (!e.nodes) throw new Error("missing information in graph: node");
          for (let n = 0; n < e.nodesLength(); n++) {
            let s = e.nodes(n),
              a = s.name();
            if (!a)
              for (
                let l = 0;
                (a = `unnamed_${s.opType()}_${l}`), !!t.has(a);
                l++
              );
            if (t.has(a)) throw new Error(`duplicated node name: ${a}`);
            let u = this._nodes.push(new to(s, a)) - 1;
            t.set(a, u);
          }
          for (let n = 0; n < this._nodes.length; n++) {
            let s = this._nodes[n],
              a = e.nodes(n);
            if (a == null) throw new Error(`No node exists at index ${n}`);
            if (a?.outputsLength() === 0)
              throw new Error(`missing output for node: ${a.name}`);
            for (let u = 0; u < a?.outputsLength(); u++) {
              let l = a?.outputs(u),
                f = o.get(l);
              if (
                (typeof f > "u" &&
                  ((f = this._allData.push(new me()) - 1), o.set(l, f)),
                s.outputs.push(f),
                this._allData[f]._from !== void 0)
              )
                throw new Error(
                  `multiple nodes output to one data value: ${f}`
                );
              if (((this._allData[f]._from = n), a.opType() === "Constant")) {
                if (a.attributesLength() !== 1 || !a.attributes(0).t())
                  throw new Error(
                    "missing attributes or missing tensor value in attributes for this Constant operator"
                  );
                if (a.outputsLength() !== 1)
                  throw new Error(
                    "missing output or incorrect number of outputs for this Constant operator"
                  );
                s.outputs.pop(),
                  (s.executeNode = !1),
                  (this._allData[f]._from = -1),
                  (this._allData[f].tensor = bt.fromOrtTensor(
                    a.attributes(0).t()
                  ));
              }
            }
          }
          for (let n = 0; n < this._nodes.length; n++) {
            let s = this._nodes[n],
              a = e.nodes(n);
            if (a.inputsLength() === 0)
              throw new Error(`missing input for node: ${a.name}`);
            for (let u = 0; u < a.inputsLength(); u++) {
              let l = a.inputs(u),
                f = o.get(l);
              if (typeof f > "u")
                throw new Error(
                  `unrecognized input '${l}' for node: ${a.name()}`
                );
              s.inputs.push(f), this._allData[f]._to.push(n);
            }
          }
        }
        checkIsAcyclic() {
          let e = new Set();
          this._allInputIndices.forEach((r) => {
            this._allData[r]._to.forEach((s) => {
              e.add(s);
            });
          });
          let o = Array.from(e),
            t = new Array(this._nodes.length).fill("white");
          for (; o.length > 0; ) {
            let r = o.pop();
            t[r] === "gray"
              ? (t[r] = "black")
              : (o.push(r),
                (t[r] = "gray"),
                this._nodes[r].outputs.forEach((n) => {
                  let s = this._allData[n];
                  if (typeof s.tensor < "u")
                    throw new Error("node outputs should not be initialized");
                  if (s._from !== r)
                    throw new Error(
                      "from property of the Value object doesn't match index of Node being processed"
                    );
                  s._to.forEach((a) => {
                    if (t[a] === "gray")
                      throw new Error("model graph is cyclic");
                    t[a] === "white" && o.push(a);
                  });
                }));
          }
        }
        transformGraph(e) {
          this.removeAllIdentityNodes(),
            this.removeAllDropoutNodes(),
            this.fuseConvActivationNodes(),
            e && e.transformGraph(this),
            this.finalizeGraph();
        }
        finalizeGraph() {
          let e = 0,
            o = new Array(this._nodes.length, 0),
            t = 0;
          for (let r = 0; r < this._nodes.length; r++)
            (o[r] = t),
              this._nodes[r].executeNode
                ? (t !== r && (this._nodes[t] = this._nodes[r]), t++)
                : this._nodes[r].outputs.forEach((n) => {
                    this._allData[n]._from = -2;
                  });
          this._nodes.splice(t, this._nodes.length - t);
          for (let r = 0; r < this._allData.length; r++) {
            let n = this._allData[r];
            n._from !== void 0 &&
              n._from !== -1 &&
              n._from !== -2 &&
              (n._from = o[n._from]);
            for (let s = 0; s < n._to.length; s++)
              if (n._to[s] >= 0) n._to[s] = o[n._to[s]];
              else throw new Error("Trying to update a removed node");
          }
          e = 0;
          for (let r = 0; r < this._allData.length; r++) {
            if (
              this._allData[r].from === -2 &&
              this._allOutputIndices.indexOf(r + e) === -1
            ) {
              e++, this._allData.splice(r, 1), r--;
              continue;
            }
            if (e > 0) {
              let n = -1;
              this._allData[r].from !== void 0 && this._allData[r].from !== -1
                ? ((n = this._nodes[this._allData[r].from].outputs.indexOf(
                    r + e
                  )),
                  n !== -1 &&
                    (this._nodes[this._allData[r].from].outputs[n] = r))
                : ((n = this._allInputIndices.indexOf(r + e)),
                  n !== -1 && (this._allInputIndices[n] = r)),
                this._allData[r].to.forEach((s) => {
                  (n = this._nodes[s].inputs.indexOf(r + e)),
                    n !== -1 && (this._nodes[s].inputs[n] = r);
                }),
                this._allData[r].to.length === 0 &&
                  ((n = this._allOutputIndices.indexOf(r + e)),
                  n !== -1 && (this._allOutputIndices[n] = r));
            }
          }
        }
        deleteNode(e) {
          let o = this._nodes[e];
          if (o.outputs.length > 1) {
            for (let a = 1; a < o.outputs.length; a++)
              if (this._allData[o.outputs[a]].to.length > 0)
                throw new Error(
                  "Node deletion with more than one output connected to other nodes is not supported. "
                );
          }
          o.executeNode = !1;
          let t = o.inputs[0],
            r = o.outputs[0],
            n = this._allData[r].to;
          for (let a = 0; a < o.inputs.length; a++) {
            let u = this._allData[o.inputs[a]].to.indexOf(e);
            if (u === -1)
              throw new Error(
                "The Value object doesn't have the current Node in it's 'to' property "
              );
            this._allData[o.inputs[a]].to.splice(u, 1);
          }
          this._allData[r]._to = [];
          let s = this._allOutputIndices.indexOf(r);
          if ((s !== -1 && (this._allOutputIndices[s] = t), n && n.length > 0))
            for (let a of n) {
              let u = this._nodes[a].inputs.indexOf(r);
              if (u === -1)
                throw new Error(
                  "The Node object doesn't have the output Value in it's 'inputs' property "
                );
              (this._nodes[a].inputs[u] = t), this._allData[t].to.push(a);
            }
        }
        removeAllDropoutNodes() {
          let e = 0;
          for (let o of this._nodes) {
            if (o.opType === "Dropout") {
              if (o.inputs.length !== 1)
                throw new Error(
                  "Dropout nodes should only contain one input. "
                );
              if (o.outputs.length !== 1 && o.outputs.length !== 2)
                throw new Error(
                  "Dropout nodes should contain either 1 or 2 output(s)"
                );
              if (
                o.outputs.length === 2 &&
                this._allData[o.outputs[1]]._to.length !== 0
              )
                throw new Error(
                  "Dropout nodes's second output should not be referenced by other nodes"
                );
              this.deleteNode(e);
            }
            e++;
          }
        }
        removeAllIdentityNodes() {
          let e = 0;
          for (let o of this._nodes)
            o.opType === "Identity" && this.deleteNode(e), e++;
        }
        isActivation(e) {
          switch (e.opType) {
            case "Relu":
            case "Sigmoid":
            case "Clip":
              return !0;
            default:
              return !1;
          }
        }
        fuseConvActivationNodes() {
          for (let e of this._nodes)
            if (e.opType === "Conv") {
              let o = this._allData[e.outputs[0]]._to;
              if (o.length === 1 && this.isActivation(this._nodes[o[0]])) {
                let t = this._nodes[o[0]];
                if (t.opType === "Clip")
                  if (t.inputs.length === 1)
                    try {
                      e.attributes.set("activation_params", "floats", [
                        t.attributes.getFloat("min"),
                        t.attributes.getFloat("max"),
                      ]);
                    } catch {
                      e.attributes.set("activation_params", "floats", [Ve, ze]);
                    }
                  else if (
                    t.inputs.length >= 3 &&
                    this._allData[t.inputs[1]].tensor !== void 0 &&
                    this._allData[t.inputs[2]].tensor !== void 0
                  )
                    e.attributes.set("activation_params", "floats", [
                      this._allData[t.inputs[1]].tensor.floatData[0],
                      this._allData[t.inputs[2]].tensor.floatData[0],
                    ]);
                  else continue;
                e.attributes.set("activation", "string", t.opType),
                  this.deleteNode(o[0]);
              }
            }
        }
      });
  });
var Dp,
  vg,
  eo,
  Lp = O(() => {
    "use strict";
    wn();
    Ep();
    Pr();
    Dp = rr(sr());
    Y();
    (vg = F.experimental.fbs),
      (eo = class {
        constructor() {}
        load(e, o, t) {
          let r;
          if (!t)
            try {
              this.loadFromOnnxFormat(e, o);
              return;
            } catch (n) {
              if (t !== void 0) throw n;
              r = n;
            }
          try {
            this.loadFromOrtFormat(e, o);
          } catch (n) {
            throw t !== void 0
              ? n
              : new Error(`Failed to load model as ONNX format: ${r}
as ORT format: ${n}`);
          }
        }
        loadFromOnnxFormat(e, o) {
          let t = Dp.onnx.ModelProto.decode(e);
          if (Rt.longToNumber(t.irVersion) < 3)
            throw new Error("only support ONNX model with IR_VERSION>=3");
          (this._opsets = t.opsetImport.map((n) => ({
            domain: n.domain,
            version: Rt.longToNumber(n.version),
          }))),
            (this._graph = Wi.from(t.graph, o));
        }
        loadFromOrtFormat(e, o) {
          let t = new w.ByteBuffer(e),
            r = vg.InferenceSession.getRootAsInferenceSession(t).model();
          if (Rt.longToNumber(r.irVersion()) < 3)
            throw new Error("only support ONNX model with IR_VERSION>=3");
          this._opsets = [];
          for (let s = 0; s < r.opsetImportLength(); s++) {
            let a = r.opsetImport(s);
            this._opsets.push({
              domain: a?.domain(),
              version: Rt.longToNumber(a.version()),
            });
          }
          this._graph = Wi.from(r.graph(), o);
        }
        get graph() {
          return this._graph;
        }
        get opsets() {
          return this._opsets;
        }
      });
  });
var ro,
  $p = O(() => {
    "use strict";
    Sp();
    Ap();
    Ut();
    Lp();
    ro = class {
      constructor(e = {}) {
        (this._initialized = !1),
          (this.backendHint = e.backendHint),
          (this.profiler = xn.create(e.profiler)),
          (this.context = {
            profiler: this.profiler,
            graphInputTypes: [],
            graphInputDims: [],
          });
      }
      get inputNames() {
        return this._model.graph.getInputNames();
      }
      get outputNames() {
        return this._model.graph.getOutputNames();
      }
      startProfiling() {
        this.profiler.start();
      }
      endProfiling() {
        this.profiler.stop();
      }
      async loadModel(e, o, t) {
        await this.profiler.event("session", "Session.loadModel", async () => {
          let r = await Mi(this.backendHint);
          if (
            ((this.sessionHandler = r.createSessionHandler(this.context)),
            (this._model = new eo()),
            typeof e == "string")
          ) {
            let n = e.endsWith(".ort");
            {
              let a = await (await fetch(e)).arrayBuffer();
              this.initialize(new Uint8Array(a), n);
            }
          } else if (ArrayBuffer.isView(e)) this.initialize(e);
          else {
            let n = new Uint8Array(e, o || 0, t || e.byteLength);
            this.initialize(n);
          }
        });
      }
      initialize(e, o) {
        if (this._initialized) throw new Error("already initialized");
        this.profiler.event("session", "Session.initialize", () => {
          let t = this.sessionHandler.transformGraph
            ? this.sessionHandler
            : void 0;
          this._model.load(e, t, o),
            this.sessionHandler.onGraphInitialized &&
              this.sessionHandler.onGraphInitialized(this._model.graph),
            this.initializeOps(this._model.graph),
            (this._executionPlan = new Zn(
              this._model.graph,
              this._ops,
              this.profiler
            ));
        }),
          (this._initialized = !0);
      }
      async run(e) {
        if (!this._initialized) throw new Error("session not initialized yet");
        return this.profiler.event("session", "Session.run", async () => {
          let o = this.normalizeAndValidateInputs(e),
            t = await this._executionPlan.execute(this.sessionHandler, o);
          return this.createOutput(t);
        });
      }
      normalizeAndValidateInputs(e) {
        let o = this._model.graph.getInputNames();
        if (Array.isArray(e)) {
          if (e.length !== o.length)
            throw new Error(
              `incorrect input array length: expected ${o.length} but got ${e.length}`
            );
        } else {
          if (e.size !== o.length)
            throw new Error(
              `incorrect input map size: expected ${o.length} but got ${e.size}`
            );
          let t = new Array(e.size),
            r = 0;
          for (let n = 0; n < o.length; ++n) {
            let s = e.get(o[n]);
            if (!s) throw new Error(`missing input tensor for: '${name}'`);
            t[r++] = s;
          }
          e = t;
        }
        if (
          !this.context.graphInputTypes ||
          this.context.graphInputTypes.length === 0 ||
          !this.context.graphInputDims ||
          this.context.graphInputDims.length === 0
        ) {
          let t = this._model.graph.getInputIndices(),
            r = this._model.graph.getValues(),
            n = new Array(t.length);
          for (let s = 0; s < t.length; ++s) {
            let a = r[t[s]];
            (n[s] = a.type.shape.dims),
              this.context.graphInputTypes.push(a.type.tensorType),
              this.context.graphInputDims.push(e[s].dims);
          }
          this.validateInputTensorDims(n, e, !0);
        } else this.validateInputTensorDims(this.context.graphInputDims, e, !1);
        return (
          this.validateInputTensorTypes(this.context.graphInputTypes, e), e
        );
      }
      validateInputTensorTypes(e, o) {
        for (let t = 0; t < o.length; t++) {
          let r = e[t],
            n = o[t].type;
          if (r !== n)
            throw new Error(
              `input tensor[${t}] check failed: expected type '${r}' but got ${n}`
            );
        }
      }
      validateInputTensorDims(e, o, t) {
        for (let r = 0; r < o.length; r++) {
          let n = e[r],
            s = o[r].dims;
          if (!this.compareTensorDims(n, s, t))
            throw new Error(
              `input tensor[${r}] check failed: expected shape '[${n.join(
                ","
              )}]' but got [${s.join(",")}]`
            );
        }
      }
      compareTensorDims(e, o, t) {
        if (e.length !== o.length) return !1;
        for (let r = 0; r < e.length; ++r)
          if (e[r] !== o[r] && (!t || e[r] !== 0)) return !1;
        return !0;
      }
      createOutput(e) {
        let o = this._model.graph.getOutputNames();
        if (e.length !== o.length)
          throw new Error(
            "expected number of outputs do not match number of generated outputs"
          );
        let t = new Map();
        for (let r = 0; r < o.length; ++r) t.set(o[r], e[r]);
        return t;
      }
      initializeOps(e) {
        let o = e.getNodes();
        this._ops = new Array(o.length);
        for (let t = 0; t < o.length; t++)
          this._ops[t] = this.sessionHandler.resolve(
            o[t],
            this._model.opsets,
            e
          );
      }
    };
  });
var no,
  kp = O(() => {
    "use strict";
    Yt();
    We();
    no = class {
      constructor(e) {
        this.session = e;
        (this.inputNames = this.session.inputNames),
          (this.outputNames = this.session.outputNames);
      }
      async dispose() {}
      async run(e, o, t) {
        let r = new Map();
        for (let a in e)
          if (Object.hasOwnProperty.call(e, a)) {
            let u = e[a];
            r.set(a, new bt(u.dims, u.type, void 0, void 0, u.data));
          }
        let n = await this.session.run(r),
          s = {};
        return (
          n.forEach((a, u) => {
            s[u] = new yt(a.type, a.data, a.dims);
          }),
          s
        );
      }
      startProfiling() {
        this.session.startProfiling();
      }
      endProfiling() {
        this.session.endProfiling();
      }
    };
  });
var Bp = {};
Or(Bp, { onnxjsBackend: () => Ig });
var Hi,
  Ig,
  Fp = O(() => {
    "use strict";
    $p();
    kp();
    (Hi = class {
      async init() {}
      async createInferenceSessionHandler(e, o) {
        let t = new ro(o);
        return (
          typeof e == "string" ? await t.loadModel(e) : await t.loadModel(e),
          new no(t)
        );
      }
    }),
      (Ig = new Hi());
  });
var oo = O(() => {
  "use strict";
});
var Rp = {};
Or(Rp, { default: () => _g });
var Cp,
  Np,
  _g,
  Gp = O(() => {
    "use strict";
    qi();
    Ke();
    Vr();
    (Cp = "ort-wasm-proxy-worker"), (Np = globalThis.self?.name === Cp);
    Np &&
      (self.onmessage = (i) => {
        let { type: e, in: o } = i.data;
        try {
          switch (e) {
            case "init-wasm":
              io(o.wasm).then(
                () => {
                  ao(o).then(
                    () => {
                      postMessage({ type: e });
                    },
                    (t) => {
                      postMessage({ type: e, err: t });
                    }
                  );
                },
                (t) => {
                  postMessage({ type: e, err: t });
                }
              );
              break;
            case "init-ep": {
              let { epName: t, env: r } = o;
              so(r, t).then(
                () => {
                  postMessage({ type: e });
                },
                (n) => {
                  postMessage({ type: e, err: n });
                }
              );
              break;
            }
            case "copy-from": {
              let { buffer: t } = o,
                r = zr(t);
              postMessage({ type: e, out: r });
              break;
            }
            case "create": {
              let { model: t, options: r } = o;
              uo(t, r).then(
                (n) => {
                  postMessage({ type: e, out: n });
                },
                (n) => {
                  postMessage({ type: e, err: n });
                }
              );
              break;
            }
            case "release":
              lo(o), postMessage({ type: e });
              break;
            case "run": {
              let {
                sessionId: t,
                inputIndices: r,
                inputs: n,
                outputIndices: s,
                options: a,
              } = o;
              fo(t, r, n, s, new Array(s.length).fill(null), a).then(
                (u) => {
                  u.some((l) => l[3] !== "cpu")
                    ? postMessage({
                        type: e,
                        err: "Proxy does not support non-cpu tensor location.",
                      })
                    : postMessage({ type: e, out: u }, po([...n, ...u]));
                },
                (u) => {
                  postMessage({ type: e, err: u });
                }
              );
              break;
            }
            case "end-profiling":
              co(o), postMessage({ type: e });
              break;
            default:
          }
        } catch (t) {
          postMessage({ type: e, err: t });
        }
      });
    _g = Np ? null : (i) => new Worker(i ?? br, { type: "module", name: Cp });
  });
var Up = {};
Or(Up, { default: () => Og });
var ji,
  Mp,
  Og,
  Vp = O(() => {
    "use strict";
    (Mp =
      ((ji = import.meta.url),
      async function (i = {}) {
        function e() {
          return C.buffer != oe.buffer && it(), oe;
        }
        function o() {
          return C.buffer != oe.buffer && it(), be;
        }
        function t() {
          return C.buffer != oe.buffer && it(), Z;
        }
        function r() {
          return C.buffer != oe.buffer && it(), ge;
        }
        function n() {
          return C.buffer != oe.buffer && it(), ae;
        }
        var s,
          a,
          u = Object.assign({}, i),
          l = new Promise((c, m) => {
            (s = c), (a = m);
          }),
          f = typeof window == "object",
          p = typeof importScripts == "function",
          d = p && self.name == "em-pthread";
        (u.mountExternalData = (c, m) => {
          c.startsWith("./") && (c = c.substring(2)),
            (u.Ua || (u.Ua = new Map())).set(c, m);
        }),
          (u.unmountExternalData = () => {
            delete u.Ua;
          });
        var y,
          T,
          v =
            globalThis.SharedArrayBuffer ??
            new WebAssembly.Memory({ initial: 0, maximum: 0, shared: !0 })
              .buffer.constructor,
          S = Object.assign({}, u),
          L = "./this.program",
          P = (c, m) => {
            throw m;
          },
          A = "";
        (f || p) &&
          (p
            ? (A = self.location.href)
            : typeof document < "u" &&
              document.currentScript &&
              (A = document.currentScript.src),
          ji && (A = ji),
          (A = A.startsWith("blob:")
            ? ""
            : A.substr(0, A.replace(/[?#].*/, "").lastIndexOf("/") + 1)),
          p &&
            (T = (c) => {
              var m = new XMLHttpRequest();
              return (
                m.open("GET", c, !1),
                (m.responseType = "arraybuffer"),
                m.send(null),
                new Uint8Array(m.response)
              );
            }),
          (y = (c, m, g) => {
            var x = new XMLHttpRequest();
            x.open("GET", c, !0),
              (x.responseType = "arraybuffer"),
              (x.onload = () => {
                x.status == 200 || (x.status == 0 && x.response)
                  ? m(x.response)
                  : g();
              }),
              (x.onerror = g),
              x.send(null);
          }));
        var M,
          V = console.log.bind(console),
          lt = console.error.bind(console),
          wt = V,
          et = lt;
        if ((Object.assign(u, S), (S = null), d)) {
          let c = function (m) {
            try {
              var g = m.data,
                x = g.cmd;
              if (x === "load") {
                let I = [];
                (self.onmessage = (E) => I.push(E)),
                  (self.startWorker = () => {
                    postMessage({ cmd: "loaded" });
                    for (let E of I) c(E);
                    self.onmessage = c;
                  });
                for (let E of g.handlers)
                  (u[E] && !u[E].proxy) ||
                    ((u[E] = (...R) => {
                      postMessage({ Za: "callHandler", kb: E, args: R });
                    }),
                    E == "print" && (wt = u[E]),
                    E == "printErr" && (et = u[E]));
                (C = g.wasmMemory), it(), Dt(g.wasmModule);
              } else if (x === "run") {
                $o(g.pthread_ptr, 0, 0, 1, 0, 0),
                  Ao(g.pthread_ptr),
                  md(),
                  aa(),
                  (_t ||= !0);
                try {
                  bd(g.start_routine, g.arg);
                } catch (I) {
                  if (I != "unwind") throw I;
                }
              } else
                x === "cancel"
                  ? er() && nn(-1)
                  : g.target !== "setimmediate" &&
                    (x === "checkMailbox"
                      ? _t && tn()
                      : x &&
                        (et(`worker: received unknown command ${x}`), et(g)));
            } catch (I) {
              throw (Ha(), I);
            }
          };
          var Vg = c,
            Dt,
            _t = !1;
          (et = function (...m) {
            (m = m.join(" ")), console.error(m);
          }),
            (self.alert = function (...m) {
              postMessage({ Za: "alert", text: m.join(" "), nb: er() });
            }),
            (u.instantiateWasm = (m, g) =>
              new Promise((x) => {
                Dt = (I) => {
                  (I = new WebAssembly.Instance(I, Yr())), g(I), x();
                };
              })),
            (self.onunhandledrejection = (m) => {
              throw m.reason || m;
            }),
            (self.onmessage = c);
        }
        u.wasmBinary && (M = u.wasmBinary);
        var C,
          Kr,
          we,
          oe,
          be,
          Z,
          ge,
          ie,
          ae,
          se = !1;
        function it() {
          var c = C.buffer;
          (u.HEAP8 = oe = new Int8Array(c)),
            (u.HEAP16 = new Int16Array(c)),
            (u.HEAPU8 = be = new Uint8Array(c)),
            (u.HEAPU16 = new Uint16Array(c)),
            (u.HEAP32 = Z = new Int32Array(c)),
            (u.HEAPU32 = ge = new Uint32Array(c)),
            (u.HEAPF32 = new Float32Array(c)),
            (u.HEAPF64 = ae = new Float64Array(c)),
            (u.HEAP64 = ie = new BigInt64Array(c)),
            (u.HEAPU64 = new BigUint64Array(c));
        }
        if (!d) {
          if (
            !(
              (C = new WebAssembly.Memory({
                initial: 256,
                maximum: 65536,
                shared: !0,
              })).buffer instanceof v
            )
          )
            throw (
              (et(
                "requested a shared WebAssembly.Memory but the returned buffer is not a SharedArrayBuffer, indicating that while the browser has SharedArrayBuffer it does not have WebAssembly threads support - you may need to set a flag"
              ),
              Error("bad memory"))
            );
          it();
        }
        var Lt = [],
          Jr = [],
          Ye = [],
          ue = 0,
          Ze = null,
          De = null;
        function le() {
          if (
            --ue == 0 &&
            (Ze !== null && (clearInterval(Ze), (Ze = null)), De)
          ) {
            var c = De;
            (De = null), c();
          }
        }
        function Mt(c) {
          throw (
            (et((c = "Aborted(" + c + ")")),
            (se = !0),
            (we = 1),
            (c = new WebAssembly.RuntimeError(
              c + ". Build with -sASSERTIONS for more info."
            )),
            a(c),
            c)
          );
        }
        var ve,
          gt = (c) => c.startsWith("data:application/octet-stream;base64,"),
          Ot = (c) => c.startsWith("file://");
        function Jt(c) {
          if (c == ve && M) return new Uint8Array(M);
          if (T) return T(c);
          throw "both async and sync fetching of the wasm failed";
        }
        function wr(c, m, g) {
          return (function (x) {
            if (!M && (f || p)) {
              if (typeof fetch == "function" && !Ot(x))
                return fetch(x, { credentials: "same-origin" })
                  .then((I) => {
                    if (!I.ok)
                      throw `failed to load wasm binary file at '${x}'`;
                    return I.arrayBuffer();
                  })
                  .catch(() => Jt(x));
              if (y)
                return new Promise((I, E) => {
                  y(x, (R) => I(new Uint8Array(R)), E);
                });
            }
            return Promise.resolve().then(() => Jt(x));
          })(c)
            .then((x) => WebAssembly.instantiate(x, m))
            .then(g, (x) => {
              et(`failed to asynchronously prepare wasm: ${x}`), Mt(x);
            });
        }
        function Yr() {
          return {
            a: {
              j: hd,
              b: yd,
              E: ca,
              g: ha,
              V: ma,
              A: ya,
              C: xa,
              W: Ta,
              T: wa,
              L: va,
              S: Ia,
              o: _a,
              B: Oa,
              y: Sa,
              U: Aa,
              z: Pa,
              _: xd,
              Z: Td,
              P: wd,
              w: vd,
              F: Id,
              k: _d,
              O: Ao,
              Y: Od,
              I: Sd,
              J: Ad,
              K: Pd,
              G: La,
              H: $a,
              v: Ed,
              q: Dd,
              l: Ld,
              p: $d,
              e: kd,
              X: Bd,
              x: Fd,
              d: ka,
              f: Cd,
              i: Nd,
              u: Rd,
              t: Gd,
              s: Md,
              Q: Ca,
              R: Na,
              D: So,
              h: Ra,
              n: Ga,
              M: Ma,
              m: Ua,
              a: C,
              r: Oo,
              N: Wa,
              c: zd,
            },
          };
        }
        var ea = {
          837620: (c, m, g, x, I) => {
            if (u === void 0 || !u.Ua) return 1;
            if (
              ((c = Ir(c >>> 0)).startsWith("./") && (c = c.substring(2)),
              !(c = u.Ua.get(c)))
            )
              return 2;
            if (((x >>>= 0), (m >>>= 0) + (g >>>= 0) > c.byteLength)) return 3;
            try {
              let E = c.subarray(m, m + g);
              switch (I) {
                case 0:
                  o().set(E, x >>> 0);
                  break;
                case 1:
                  u.mb(x, E);
                  break;
                default:
                  return 4;
              }
              return 0;
            } catch {
              return 4;
            }
          },
          838303: () => typeof wasmOffsetConverter < "u",
        };
        function hd() {
          return typeof wasmOffsetConverter < "u";
        }
        function Io(c) {
          (this.name = "ExitStatus"),
            (this.message = `Program terminated with exit(${c})`),
            (this.status = c);
        }
        var _o = (c) => {
            c.terminate(), (c.onmessage = () => {});
          },
          ra = (c) => {
            Ie.length == 0 && (ua(), sa(Ie[0]));
            var m = Ie.pop();
            if (!m) return 6;
            Le.push(m), (fe[c.Ra] = m), (m.Ra = c.Ra);
            var g = {
              cmd: "run",
              start_routine: c.cb,
              arg: c.ab,
              pthread_ptr: c.Ra,
            };
            return m.postMessage(g, c.ib), 0;
          },
          vr = 0,
          st = (c, m, ...g) => {
            for (
              var x = 2 * g.length,
                I = Fo(),
                E = Bo(8 * x),
                R = E >>> 3,
                at = 0;
              at < g.length;
              at++
            ) {
              var Pt = g[at];
              typeof Pt == "bigint"
                ? ((ie[R + 2 * at] = 1n), (ie[R + 2 * at + 1] = Pt))
                : ((ie[R + 2 * at] = 0n), (n()[(R + 2 * at + 1) >>> 0] = Pt));
            }
            return (c = qa(c, 0, x, E, m)), on(I), c;
          };
        function Oo(c) {
          if (d) return st(0, 1, c);
          if (((we = c), !(0 < vr))) {
            for (var m of Le) _o(m);
            for (m of Ie) _o(m);
            (Ie = []), (Le = []), (fe = []), (se = !0);
          }
          P(c, new Io(c));
        }
        function na(c) {
          if (d) return st(1, 0, c);
          So(c);
        }
        var So = (c) => {
            if (((we = c), d)) throw (na(c), "unwind");
            Oo(c);
          },
          Ie = [],
          Le = [],
          oa = [],
          fe = {},
          ia = (c) => {
            var m = c.Ra;
            delete fe[m],
              Ie.push(c),
              Le.splice(Le.indexOf(c), 1),
              (c.Ra = 0),
              ko(m);
          };
        function aa() {
          oa.forEach((c) => c());
        }
        var sa = (c) =>
          new Promise((m) => {
            (c.onmessage = (I) => {
              var E = (I = I.data).cmd;
              if (I.targetThread && I.targetThread != er()) {
                var R = fe[I.targetThread];
                R
                  ? R.postMessage(I, I.transferList)
                  : et(
                      `Internal error! Worker sent a message "${E}" to target pthread ${I.targetThread}, but that thread no longer exists!`
                    );
              } else
                E === "checkMailbox"
                  ? tn()
                  : E === "spawnThread"
                  ? ra(I)
                  : E === "cleanupThread"
                  ? ia(fe[I.thread])
                  : E === "killThread"
                  ? ((I = I.thread),
                    (E = fe[I]),
                    delete fe[I],
                    _o(E),
                    ko(I),
                    Le.splice(Le.indexOf(E), 1),
                    (E.Ra = 0))
                  : E === "cancelThread"
                  ? fe[I.thread].postMessage({ cmd: "cancel" })
                  : E === "loaded"
                  ? ((c.loaded = !0), m(c))
                  : E === "alert"
                  ? alert(`Thread ${I.threadId}: ${I.text}`)
                  : I.target === "setimmediate"
                  ? c.postMessage(I)
                  : E === "callHandler"
                  ? u[I.handler](...I.args)
                  : E && et(`worker sent an unknown command ${E}`);
            }),
              (c.onerror = (I) => {
                throw (
                  (et(
                    `worker sent an error! ${I.filename}:${I.lineno}: ${I.message}`
                  ),
                  I)
                );
              });
            var g,
              x = [];
            for (g of []) u.hasOwnProperty(g) && x.push(g);
            c.postMessage({
              cmd: "load",
              handlers: x,
              wasmMemory: C,
              wasmModule: Kr,
            });
          });
        function ua() {
          var c = new Worker(new URL(import.meta.url), {
            type: "module",
            workerData: "em-pthread",
            name: "em-pthread",
          });
          Ie.push(c);
        }
        var la,
          Zr = (c) => {
            for (; 0 < c.length; ) c.shift()(u);
          },
          md = () => {
            var c = er(),
              m = r()[((c + 52) >>> 2) >>> 0];
            (c = r()[((c + 56) >>> 2) >>> 0]), Xa(m, m - c), on(m);
          },
          Qr = [],
          bd = (c, m) => {
            vr = 0;
            var g = Qr[c];
            g ||
              (c >= Qr.length && (Qr.length = c + 1), (Qr[c] = g = la.get(c))),
              (c = g(m)),
              0 < vr ? (we = c) : nn(c);
          };
        class gd {
          constructor(m) {
            this.Xa = m - 24;
          }
        }
        function yd(c, m, g) {
          var x = new gd((c >>>= 0));
          throw (
            ((m >>>= 0),
            (g >>>= 0),
            (r()[((x.Xa + 16) >>> 2) >>> 0] = 0),
            (r()[((x.Xa + 4) >>> 2) >>> 0] = m),
            (r()[((x.Xa + 8) >>> 2) >>> 0] = g),
            c)
          );
        }
        function fa(c, m, g, x) {
          return d ? st(2, 1, c, m, g, x) : ca(c, m, g, x);
        }
        function ca(c, m, g, x) {
          if (((c >>>= 0), (m >>>= 0), (g >>>= 0), (x >>>= 0), v === void 0))
            return (
              et(
                "Current environment does not support SharedArrayBuffer, pthreads are not available!"
              ),
              6
            );
          var I = [];
          return d && I.length === 0
            ? fa(c, m, g, x)
            : ((c = { cb: g, Ra: c, ab: x, ib: I }),
              d ? ((c.Za = "spawnThread"), postMessage(c, I), 0) : ra(c));
        }
        var pa = typeof TextDecoder < "u" ? new TextDecoder("utf8") : void 0,
          da = (c, m, g) => {
            var x = (m >>>= 0) + g;
            for (g = m; c[g] && !(g >= x); ) ++g;
            if (16 < g - m && c.buffer && pa)
              return pa.decode(
                c.buffer instanceof v ? c.slice(m, g) : c.subarray(m, g)
              );
            for (x = ""; m < g; ) {
              var I = c[m++];
              if (128 & I) {
                var E = 63 & c[m++];
                if ((224 & I) == 192)
                  x += String.fromCharCode(((31 & I) << 6) | E);
                else {
                  var R = 63 & c[m++];
                  65536 >
                  (I =
                    (240 & I) == 224
                      ? ((15 & I) << 12) | (E << 6) | R
                      : ((7 & I) << 18) | (E << 12) | (R << 6) | (63 & c[m++]))
                    ? (x += String.fromCharCode(I))
                    : ((I -= 65536),
                      (x += String.fromCharCode(
                        55296 | (I >> 10),
                        56320 | (1023 & I)
                      )));
                }
              } else x += String.fromCharCode(I);
            }
            return x;
          },
          Ir = (c, m) => ((c >>>= 0) ? da(o(), c, m) : "");
        function ha(c, m, g) {
          return d ? st(3, 1, c, m, g) : 0;
        }
        function ma(c, m) {
          if (d) return st(4, 1, c, m);
        }
        var ba = (c) => {
            for (var m = 0, g = 0; g < c.length; ++g) {
              var x = c.charCodeAt(g);
              127 >= x
                ? m++
                : 2047 >= x
                ? (m += 2)
                : 55296 <= x && 57343 >= x
                ? ((m += 4), ++g)
                : (m += 3);
            }
            return m;
          },
          ga = (c, m, g, x) => {
            if (!(0 < x)) return 0;
            var I = (g >>>= 0);
            x = g + x - 1;
            for (var E = 0; E < c.length; ++E) {
              var R = c.charCodeAt(E);
              if (
                (55296 <= R &&
                  57343 >= R &&
                  (R =
                    (65536 + ((1023 & R) << 10)) | (1023 & c.charCodeAt(++E))),
                127 >= R)
              ) {
                if (g >= x) break;
                m[g++ >>> 0] = R;
              } else {
                if (2047 >= R) {
                  if (g + 1 >= x) break;
                  m[g++ >>> 0] = 192 | (R >> 6);
                } else {
                  if (65535 >= R) {
                    if (g + 2 >= x) break;
                    m[g++ >>> 0] = 224 | (R >> 12);
                  } else {
                    if (g + 3 >= x) break;
                    (m[g++ >>> 0] = 240 | (R >> 18)),
                      (m[g++ >>> 0] = 128 | ((R >> 12) & 63));
                  }
                  m[g++ >>> 0] = 128 | ((R >> 6) & 63);
                }
                m[g++ >>> 0] = 128 | (63 & R);
              }
            }
            return (m[g >>> 0] = 0), g - I;
          },
          _r = (c, m, g) => ga(c, o(), m, g);
        function ya(c, m) {
          if (d) return st(5, 1, c, m);
        }
        function xa(c, m, g) {
          if (d) return st(6, 1, c, m, g);
        }
        function Ta(c, m, g) {
          return d ? st(7, 1, c, m, g) : 0;
        }
        function wa(c, m) {
          if (d) return st(8, 1, c, m);
        }
        function va(c, m, g) {
          if (d) return st(9, 1, c, m, g);
        }
        function Ia(c, m, g, x) {
          if (d) return st(10, 1, c, m, g, x);
        }
        function _a(c, m, g, x) {
          if (d) return st(11, 1, c, m, g, x);
        }
        function Oa(c, m, g, x) {
          if (d) return st(12, 1, c, m, g, x);
        }
        function Sa(c) {
          if (d) return st(13, 1, c);
        }
        function Aa(c, m) {
          if (d) return st(14, 1, c, m);
        }
        function Pa(c, m, g) {
          if (d) return st(15, 1, c, m, g);
        }
        var xd = () => {
            Mt("");
          },
          Td = () => 1;
        function wd(c) {
          $o(c >>> 0, !p, 1, !f, 131072, !1), aa();
        }
        function Ao(c) {
          (c >>>= 0),
            typeof Atomics.jb == "function" &&
              (Atomics.jb(t(), c >>> 2, c).value.then(tn),
              (c += 128),
              Atomics.store(t(), c >>> 2, 1));
        }
        var tn = () => {
          var c = er();
          if (c && (Ao(c), (c = ja), !se))
            try {
              if ((c(), !(0 < vr)))
                try {
                  d ? nn(we) : So(we);
                } catch (m) {
                  m instanceof Io || m == "unwind" || P(1, m);
                }
            } catch (m) {
              m instanceof Io || m == "unwind" || P(1, m);
            }
        };
        function vd(c, m) {
          (c >>>= 0) == m >>> 0
            ? setTimeout(tn)
            : d
            ? postMessage({ targetThread: c, cmd: "checkMailbox" })
            : (c = fe[c]) && c.postMessage({ cmd: "checkMailbox" });
        }
        var Po = [];
        function Id(c, m, g, x, I) {
          for (
            m >>>= 0, x /= 2, Po.length = x, g = (I >>> 0) >>> 3, I = 0;
            I < x;
            I++
          )
            Po[I] = ie[g + 2 * I]
              ? ie[g + 2 * I + 1]
              : n()[(g + 2 * I + 1) >>> 0];
          return (m ? ea[m] : Wd[c])(...Po);
        }
        function _d(c) {
          (c >>>= 0),
            d ? postMessage({ cmd: "cleanupThread", thread: c }) : ia(fe[c]);
        }
        function Od(c) {}
        function Sd(c, m) {
          (c = -9007199254740992 > c || 9007199254740992 < c ? NaN : Number(c)),
            (m >>>= 0),
            (c = new Date(1e3 * c)),
            (t()[(m >>> 2) >>> 0] = c.getUTCSeconds()),
            (t()[((m + 4) >>> 2) >>> 0] = c.getUTCMinutes()),
            (t()[((m + 8) >>> 2) >>> 0] = c.getUTCHours()),
            (t()[((m + 12) >>> 2) >>> 0] = c.getUTCDate()),
            (t()[((m + 16) >>> 2) >>> 0] = c.getUTCMonth()),
            (t()[((m + 20) >>> 2) >>> 0] = c.getUTCFullYear() - 1900),
            (t()[((m + 24) >>> 2) >>> 0] = c.getUTCDay()),
            (c =
              ((c.getTime() - Date.UTC(c.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) /
                864e5) |
              0),
            (t()[((m + 28) >>> 2) >>> 0] = c);
        }
        var Qe = (c) => c % 4 == 0 && (c % 100 != 0 || c % 400 == 0),
          Ea = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335],
          Da = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
        function Ad(c, m) {
          (c = -9007199254740992 > c || 9007199254740992 < c ? NaN : Number(c)),
            (m >>>= 0),
            (c = new Date(1e3 * c)),
            (t()[(m >>> 2) >>> 0] = c.getSeconds()),
            (t()[((m + 4) >>> 2) >>> 0] = c.getMinutes()),
            (t()[((m + 8) >>> 2) >>> 0] = c.getHours()),
            (t()[((m + 12) >>> 2) >>> 0] = c.getDate()),
            (t()[((m + 16) >>> 2) >>> 0] = c.getMonth()),
            (t()[((m + 20) >>> 2) >>> 0] = c.getFullYear() - 1900),
            (t()[((m + 24) >>> 2) >>> 0] = c.getDay());
          var g =
            ((Qe(c.getFullYear()) ? Ea : Da)[c.getMonth()] + c.getDate() - 1) |
            0;
          (t()[((m + 28) >>> 2) >>> 0] = g),
            (t()[((m + 36) >>> 2) >>> 0] = -60 * c.getTimezoneOffset()),
            (g = new Date(c.getFullYear(), 6, 1).getTimezoneOffset());
          var x = new Date(c.getFullYear(), 0, 1).getTimezoneOffset();
          (c = 0 | (g != x && c.getTimezoneOffset() == Math.min(x, g))),
            (t()[((m + 32) >>> 2) >>> 0] = c);
        }
        function Pd(c) {
          c >>>= 0;
          var m = new Date(
              t()[((c + 20) >>> 2) >>> 0] + 1900,
              t()[((c + 16) >>> 2) >>> 0],
              t()[((c + 12) >>> 2) >>> 0],
              t()[((c + 8) >>> 2) >>> 0],
              t()[((c + 4) >>> 2) >>> 0],
              t()[(c >>> 2) >>> 0],
              0
            ),
            g = t()[((c + 32) >>> 2) >>> 0],
            x = m.getTimezoneOffset(),
            I = new Date(m.getFullYear(), 6, 1).getTimezoneOffset(),
            E = new Date(m.getFullYear(), 0, 1).getTimezoneOffset(),
            R = Math.min(E, I);
          return (
            0 > g
              ? (t()[((c + 32) >>> 2) >>> 0] = +(I != E && R == x))
              : 0 < g != (R == x) &&
                ((I = Math.max(E, I)),
                m.setTime(m.getTime() + 6e4 * ((0 < g ? R : I) - x))),
            (t()[((c + 24) >>> 2) >>> 0] = m.getDay()),
            (g =
              ((Qe(m.getFullYear()) ? Ea : Da)[m.getMonth()] +
                m.getDate() -
                1) |
              0),
            (t()[((c + 28) >>> 2) >>> 0] = g),
            (t()[(c >>> 2) >>> 0] = m.getSeconds()),
            (t()[((c + 4) >>> 2) >>> 0] = m.getMinutes()),
            (t()[((c + 8) >>> 2) >>> 0] = m.getHours()),
            (t()[((c + 12) >>> 2) >>> 0] = m.getDate()),
            (t()[((c + 16) >>> 2) >>> 0] = m.getMonth()),
            (t()[((c + 20) >>> 2) >>> 0] = m.getYear()),
            (c = m.getTime()),
            BigInt(isNaN(c) ? -1 : c / 1e3)
          );
        }
        function La(c, m, g, x, I, E, R) {
          return d ? st(16, 1, c, m, g, x, I, E, R) : -52;
        }
        function $a(c, m, g, x, I, E) {
          if (d) return st(17, 1, c, m, g, x, I, E);
        }
        function Ed(c, m, g, x) {
          (c >>>= 0), (m >>>= 0), (g >>>= 0), (x >>>= 0);
          var I = new Date().getFullYear(),
            E = new Date(I, 0, 1),
            R = new Date(I, 6, 1);
          I = E.getTimezoneOffset();
          var at = R.getTimezoneOffset(),
            Pt = Math.max(I, at);
          (r()[(c >>> 2) >>> 0] = 60 * Pt),
            (t()[(m >>> 2) >>> 0] = +(I != at)),
            (E = (c = ($t) =>
              $t
                .toLocaleTimeString(void 0, {
                  hour12: !1,
                  timeZoneName: "short",
                })
                .split(" ")[1])(E)),
            (R = c(R)),
            at < I
              ? (_r(E, g, 17), _r(R, x, 17))
              : (_r(E, x, 17), _r(R, g, 17));
        }
        var Eo = [];
        function Dd(c, m, g) {
          (c >>>= 0), (m >>>= 0), (g >>>= 0), (Eo.length = 0);
          for (var x; (x = o()[m++ >>> 0]); ) {
            var I = x != 105;
            (g += (I &= x != 112) && g % 8 ? 4 : 0),
              Eo.push(
                x == 112
                  ? r()[(g >>> 2) >>> 0]
                  : x == 106
                  ? ie[g >>> 3]
                  : x == 105
                  ? t()[(g >>> 2) >>> 0]
                  : n()[(g >>> 3) >>> 0]
              ),
              (g += I ? 8 : 4);
          }
          return ea[c](...Eo);
        }
        var Ld = () => {},
          $d = () => Date.now();
        function kd(c, m) {
          return et(Ir(c >>> 0, m >>> 0));
        }
        var ka,
          Bd = () => {
            throw ((vr += 1), "unwind");
          };
        function Fd() {
          return 4294901760;
        }
        ka = () => performance.timeOrigin + performance.now();
        var Cd = () => navigator.hardwareConcurrency;
        function Nd() {
          return (
            Mt(
              "Cannot use emscripten_pc_get_function without -sUSE_OFFSET_CONVERTER"
            ),
            0
          );
        }
        function Rd(c) {
          c >>>= 0;
          var m = o().length;
          if (c <= m || 4294901760 < c) return !1;
          for (var g = 1; 4 >= g; g *= 2) {
            var x = m * (1 + 0.2 / g);
            x = Math.min(x, c + 100663296);
            var I = Math;
            x = Math.max(c, x);
            t: {
              I =
                (I.min.call(
                  I,
                  4294901760,
                  x + ((65536 - (x % 65536)) % 65536)
                ) -
                  C.buffer.byteLength +
                  65535) /
                65536;
              try {
                C.grow(I), it();
                var E = 1;
                break t;
              } catch {}
              E = void 0;
            }
            if (E) return !0;
          }
          return !1;
        }
        var en = () => (
            Mt(
              "Cannot use convertFrameToPC (needed by __builtin_return_address) without -sUSE_OFFSET_CONVERTER"
            ),
            0
          ),
          tr = {},
          Ba = (c) => {
            c.forEach((m) => {
              var g = en();
              g && (tr[g] = m);
            });
          };
        function Gd() {
          var c = Error().stack.toString().split(`
`);
          return (
            c[0] == "Error" && c.shift(),
            Ba(c),
            (tr.$a = en()),
            (tr.bb = c),
            tr.$a
          );
        }
        function Md(c, m, g) {
          if (((c >>>= 0), (m >>>= 0), tr.$a == c)) var x = tr.bb;
          else
            (x = Error().stack.toString().split(`
`))[0] == "Error" && x.shift(),
              Ba(x);
          for (var I = 3; x[I] && en() != c; ) ++I;
          for (c = 0; c < g && x[c + I]; ++c)
            t()[((m + 4 * c) >>> 2) >>> 0] = en();
          return c;
        }
        var Do,
          Lo = {},
          Fa = () => {
            if (!Do) {
              var c,
                m = {
                  USER: "web_user",
                  LOGNAME: "web_user",
                  PATH: "/",
                  PWD: "/",
                  HOME: "/home/web_user",
                  LANG:
                    (
                      (typeof navigator == "object" &&
                        navigator.languages &&
                        navigator.languages[0]) ||
                      "C"
                    ).replace("-", "_") + ".UTF-8",
                  _: L || "./this.program",
                };
              for (c in Lo) Lo[c] === void 0 ? delete m[c] : (m[c] = Lo[c]);
              var g = [];
              for (c in m) g.push(`${c}=${m[c]}`);
              Do = g;
            }
            return Do;
          };
        function Ca(c, m) {
          if (d) return st(18, 1, c, m);
          (c >>>= 0), (m >>>= 0);
          var g = 0;
          return (
            Fa().forEach((x, I) => {
              var E = m + g;
              for (
                I = r()[((c + 4 * I) >>> 2) >>> 0] = E, E = 0;
                E < x.length;
                ++E
              )
                e()[I++ >>> 0] = x.charCodeAt(E);
              (e()[I >>> 0] = 0), (g += x.length + 1);
            }),
            0
          );
        }
        function Na(c, m) {
          if (d) return st(19, 1, c, m);
          (c >>>= 0), (m >>>= 0);
          var g = Fa();
          r()[(c >>> 2) >>> 0] = g.length;
          var x = 0;
          return (
            g.forEach((I) => (x += I.length + 1)), (r()[(m >>> 2) >>> 0] = x), 0
          );
        }
        function Ra(c) {
          return d ? st(20, 1, c) : 52;
        }
        function Ga(c, m, g, x) {
          return d ? st(21, 1, c, m, g, x) : 52;
        }
        function Ma(c, m, g, x) {
          return d ? st(22, 1, c, m, g, x) : 70;
        }
        var Ud = [null, [], []];
        function Ua(c, m, g, x) {
          if (d) return st(23, 1, c, m, g, x);
          (m >>>= 0), (g >>>= 0), (x >>>= 0);
          for (var I = 0, E = 0; E < g; E++) {
            var R = r()[(m >>> 2) >>> 0],
              at = r()[((m + 4) >>> 2) >>> 0];
            m += 8;
            for (var Pt = 0; Pt < at; Pt++) {
              var $t = o()[(R + Pt) >>> 0],
                Ft = Ud[c];
              $t === 0 || $t === 10
                ? ((c === 1 ? wt : et)(da(Ft, 0)), (Ft.length = 0))
                : Ft.push($t);
            }
            I += at;
          }
          return (r()[(x >>> 2) >>> 0] = I), 0;
        }
        var Va = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
          za = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
          Vd = (c, m) => {
            e().set(c, m >>> 0);
          };
        function Wa(c, m, g, x) {
          function I(_, Q, ft) {
            for (
              _ = typeof _ == "number" ? _.toString() : _ || "";
              _.length < Q;

            )
              _ = ft[0] + _;
            return _;
          }
          function E(_, Q) {
            return I(_, Q, "0");
          }
          function R(_, Q) {
            function ft(Za) {
              return 0 > Za ? -1 : 0 < Za ? 1 : 0;
            }
            var $e;
            return (
              ($e = ft(_.getFullYear() - Q.getFullYear())) === 0 &&
                ($e = ft(_.getMonth() - Q.getMonth())) === 0 &&
                ($e = ft(_.getDate() - Q.getDate())),
              $e
            );
          }
          function at(_) {
            switch (_.getDay()) {
              case 0:
                return new Date(_.getFullYear() - 1, 11, 29);
              case 1:
                return _;
              case 2:
                return new Date(_.getFullYear(), 0, 3);
              case 3:
                return new Date(_.getFullYear(), 0, 2);
              case 4:
                return new Date(_.getFullYear(), 0, 1);
              case 5:
                return new Date(_.getFullYear() - 1, 11, 31);
              case 6:
                return new Date(_.getFullYear() - 1, 11, 30);
            }
          }
          function Pt(_) {
            var Q = _.Sa;
            for (_ = new Date(new Date(_.Ta + 1900, 0, 1).getTime()); 0 < Q; ) {
              var ft = _.getMonth(),
                $e = (Qe(_.getFullYear()) ? Va : za)[ft];
              if (!(Q > $e - _.getDate())) {
                _.setDate(_.getDate() + Q);
                break;
              }
              (Q -= $e - _.getDate() + 1),
                _.setDate(1),
                11 > ft
                  ? _.setMonth(ft + 1)
                  : (_.setMonth(0), _.setFullYear(_.getFullYear() + 1));
            }
            return (
              (ft = new Date(_.getFullYear() + 1, 0, 4)),
              (Q = at(new Date(_.getFullYear(), 0, 4))),
              (ft = at(ft)),
              0 >= R(Q, _)
                ? 0 >= R(ft, _)
                  ? _.getFullYear() + 1
                  : _.getFullYear()
                : _.getFullYear() - 1
            );
          }
          (c >>>= 0), (m >>>= 0), (g >>>= 0), (x >>>= 0);
          var $t = r()[((x + 40) >>> 2) >>> 0];
          for (var Ft in ((x = {
            gb: t()[(x >>> 2) >>> 0],
            fb: t()[((x + 4) >>> 2) >>> 0],
            Va: t()[((x + 8) >>> 2) >>> 0],
            Ya: t()[((x + 12) >>> 2) >>> 0],
            Wa: t()[((x + 16) >>> 2) >>> 0],
            Ta: t()[((x + 20) >>> 2) >>> 0],
            Qa: t()[((x + 24) >>> 2) >>> 0],
            Sa: t()[((x + 28) >>> 2) >>> 0],
            ob: t()[((x + 32) >>> 2) >>> 0],
            eb: t()[((x + 36) >>> 2) >>> 0],
            hb: $t ? Ir($t) : "",
          }),
          (g = Ir(g)),
          ($t = {
            "%c": "%a %b %d %H:%M:%S %Y",
            "%D": "%m/%d/%y",
            "%F": "%Y-%m-%d",
            "%h": "%b",
            "%r": "%I:%M:%S %p",
            "%R": "%H:%M",
            "%T": "%H:%M:%S",
            "%x": "%m/%d/%y",
            "%X": "%H:%M:%S",
            "%Ec": "%c",
            "%EC": "%C",
            "%Ex": "%m/%d/%y",
            "%EX": "%H:%M:%S",
            "%Ey": "%y",
            "%EY": "%Y",
            "%Od": "%d",
            "%Oe": "%e",
            "%OH": "%H",
            "%OI": "%I",
            "%Om": "%m",
            "%OM": "%M",
            "%OS": "%S",
            "%Ou": "%u",
            "%OU": "%U",
            "%OV": "%V",
            "%Ow": "%w",
            "%OW": "%W",
            "%Oy": "%y",
          })))
            g = g.replace(new RegExp(Ft, "g"), $t[Ft]);
          var Ja =
              "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(
                " "
              ),
            Ya =
              "January February March April May June July August September October November December".split(
                " "
              );
          for (Ft in (($t = {
            "%a": (_) => Ja[_.Qa].substring(0, 3),
            "%A": (_) => Ja[_.Qa],
            "%b": (_) => Ya[_.Wa].substring(0, 3),
            "%B": (_) => Ya[_.Wa],
            "%C": (_) => E(((_.Ta + 1900) / 100) | 0, 2),
            "%d": (_) => E(_.Ya, 2),
            "%e": (_) => I(_.Ya, 2, " "),
            "%g": (_) => Pt(_).toString().substring(2),
            "%G": Pt,
            "%H": (_) => E(_.Va, 2),
            "%I": (_) => (
              (_ = _.Va) == 0 ? (_ = 12) : 12 < _ && (_ -= 12), E(_, 2)
            ),
            "%j": (_) => {
              for (
                var Q = 0, ft = 0;
                ft <= _.Wa - 1;
                Q += (Qe(_.Ta + 1900) ? Va : za)[ft++]
              );
              return E(_.Ya + Q, 3);
            },
            "%m": (_) => E(_.Wa + 1, 2),
            "%M": (_) => E(_.fb, 2),
            "%n": () => `
`,
            "%p": (_) => (0 <= _.Va && 12 > _.Va ? "AM" : "PM"),
            "%S": (_) => E(_.gb, 2),
            "%t": () => "	",
            "%u": (_) => _.Qa || 7,
            "%U": (_) => E(Math.floor((_.Sa + 7 - _.Qa) / 7), 2),
            "%V": (_) => {
              var Q = Math.floor((_.Sa + 7 - ((_.Qa + 6) % 7)) / 7);
              if ((2 >= (_.Qa + 371 - _.Sa - 2) % 7 && Q++, Q))
                Q == 53 &&
                  ((ft = (_.Qa + 371 - _.Sa) % 7) == 4 ||
                    (ft == 3 && Qe(_.Ta)) ||
                    (Q = 1));
              else {
                Q = 52;
                var ft = (_.Qa + 7 - _.Sa - 1) % 7;
                (ft == 4 || (ft == 5 && Qe((_.Ta % 400) - 1))) && Q++;
              }
              return E(Q, 2);
            },
            "%w": (_) => _.Qa,
            "%W": (_) => E(Math.floor((_.Sa + 7 - ((_.Qa + 6) % 7)) / 7), 2),
            "%y": (_) => (_.Ta + 1900).toString().substring(2),
            "%Y": (_) => _.Ta + 1900,
            "%z": (_) => {
              var Q = 0 <= (_ = _.eb);
              return (
                (_ = Math.abs(_) / 60),
                (Q ? "+" : "-") +
                  ("0000" + ((_ / 60) * 100 + (_ % 60))).slice(-4)
              );
            },
            "%Z": (_) => _.hb,
            "%%": () => "%",
          }),
          (g = g.replace(/%%/g, "\0\0")),
          $t))
            g.includes(Ft) && (g = g.replace(new RegExp(Ft, "g"), $t[Ft](x)));
          return (
            (Ft = (function (_) {
              var Q = Array(ba(_) + 1);
              return ga(_, Q, 0, Q.length), Q;
            })((g = g.replace(/\0\0/g, "%")))),
            Ft.length > m ? 0 : (Vd(Ft, c), Ft.length - 1)
          );
        }
        function zd(c, m, g, x) {
          return Wa(c >>> 0, m >>> 0, g >>> 0, x >>> 0);
        }
        d ||
          (function () {
            for (var c = u.numThreads - 1; c--; ) ua();
            Lt.unshift(() => {
              ue++,
                (function (m) {
                  d ? m() : Promise.all(Ie.map(sa)).then(m);
                })(() => le());
            });
          })();
        var Wd = [
            Oo,
            na,
            fa,
            ha,
            ma,
            ya,
            xa,
            Ta,
            wa,
            va,
            Ia,
            _a,
            Oa,
            Sa,
            Aa,
            Pa,
            La,
            $a,
            Ca,
            Na,
            Ra,
            Ga,
            Ma,
            Ua,
          ],
          U = (function () {
            function c(g, x) {
              return (
                (U = g.exports),
                (U = (function () {
                  var I = U,
                    E = (at) => () => at() >>> 0,
                    R = (at) => (Pt) => at(Pt) >>> 0;
                  return (
                    ((I = Object.assign({}, I)).Ba = E(I.Ba)),
                    (I.Ca = R(I.Ca)),
                    (I.emscripten_main_runtime_thread_id = E(
                      I.emscripten_main_runtime_thread_id
                    )),
                    (I.Oa = R(I.Oa)),
                    (I.Pa = E(I.Pa)),
                    I
                  );
                })()),
                oa.push(U.Ea),
                (la = U.Fa),
                Jr.unshift(U.$),
                (Kr = x),
                le(),
                U
              );
            }
            var m = Yr();
            if ((ue++, u.instantiateWasm))
              try {
                return u.instantiateWasm(m, c);
              } catch (g) {
                et(`Module.instantiateWasm callback failed with error: ${g}`),
                  a(g);
              }
            return (
              (ve ||= u.locateFile
                ? gt("ort-wasm-simd-threaded.wasm")
                  ? "ort-wasm-simd-threaded.wasm"
                  : u.locateFile
                  ? u.locateFile("ort-wasm-simd-threaded.wasm", A)
                  : A + "ort-wasm-simd-threaded.wasm"
                : new URL("ort-wasm-simd-threaded.wasm", import.meta.url).href),
              (function (g, x) {
                var I = ve;
                return M ||
                  typeof WebAssembly.instantiateStreaming != "function" ||
                  gt(I) ||
                  Ot(I) ||
                  typeof fetch != "function"
                  ? wr(I, g, x)
                  : fetch(I, { credentials: "same-origin" }).then((E) =>
                      WebAssembly.instantiateStreaming(E, g).then(
                        x,
                        function (R) {
                          return (
                            et(`wasm streaming compile failed: ${R}`),
                            et("falling back to ArrayBuffer instantiation"),
                            wr(I, g, x)
                          );
                        }
                      )
                    );
              })(m, function (g) {
                c(g.instance, g.module);
              }).catch(a),
              {}
            );
          })();
        (u._OrtInit = (c, m) => (u._OrtInit = U.aa)(c, m)),
          (u._OrtGetLastError = (c, m) => (u._OrtGetLastError = U.ba)(c, m)),
          (u._OrtCreateSessionOptions = (c, m, g, x, I, E, R, at, Pt, $t) =>
            (u._OrtCreateSessionOptions = U.ca)(
              c,
              m,
              g,
              x,
              I,
              E,
              R,
              at,
              Pt,
              $t
            )),
          (u._OrtAppendExecutionProvider = (c, m) =>
            (u._OrtAppendExecutionProvider = U.da)(c, m)),
          (u._OrtAddFreeDimensionOverride = (c, m, g) =>
            (u._OrtAddFreeDimensionOverride = U.ea)(c, m, g)),
          (u._OrtAddSessionConfigEntry = (c, m, g) =>
            (u._OrtAddSessionConfigEntry = U.fa)(c, m, g)),
          (u._OrtReleaseSessionOptions = (c) =>
            (u._OrtReleaseSessionOptions = U.ga)(c)),
          (u._OrtCreateSession = (c, m, g) =>
            (u._OrtCreateSession = U.ha)(c, m, g)),
          (u._OrtReleaseSession = (c) => (u._OrtReleaseSession = U.ia)(c)),
          (u._OrtGetInputOutputCount = (c, m, g) =>
            (u._OrtGetInputOutputCount = U.ja)(c, m, g)),
          (u._OrtGetInputName = (c, m) => (u._OrtGetInputName = U.ka)(c, m)),
          (u._OrtGetOutputName = (c, m) => (u._OrtGetOutputName = U.la)(c, m)),
          (u._OrtFree = (c) => (u._OrtFree = U.ma)(c)),
          (u._OrtCreateTensor = (c, m, g, x, I, E) =>
            (u._OrtCreateTensor = U.na)(c, m, g, x, I, E)),
          (u._OrtGetTensorData = (c, m, g, x, I) =>
            (u._OrtGetTensorData = U.oa)(c, m, g, x, I)),
          (u._OrtReleaseTensor = (c) => (u._OrtReleaseTensor = U.pa)(c)),
          (u._OrtCreateRunOptions = (c, m, g, x) =>
            (u._OrtCreateRunOptions = U.qa)(c, m, g, x)),
          (u._OrtAddRunConfigEntry = (c, m, g) =>
            (u._OrtAddRunConfigEntry = U.ra)(c, m, g)),
          (u._OrtReleaseRunOptions = (c) =>
            (u._OrtReleaseRunOptions = U.sa)(c)),
          (u._OrtCreateBinding = (c) => (u._OrtCreateBinding = U.ta)(c)),
          (u._OrtBindInput = (c, m, g) => (u._OrtBindInput = U.ua)(c, m, g)),
          (u._OrtBindOutput = (c, m, g, x) =>
            (u._OrtBindOutput = U.va)(c, m, g, x)),
          (u._OrtClearBoundOutputs = (c) =>
            (u._OrtClearBoundOutputs = U.wa)(c)),
          (u._OrtReleaseBinding = (c) => (u._OrtReleaseBinding = U.xa)(c)),
          (u._OrtRunWithBinding = (c, m, g, x, I) =>
            (u._OrtRunWithBinding = U.ya)(c, m, g, x, I)),
          (u._OrtRun = (c, m, g, x, I, E, R, at) =>
            (u._OrtRun = U.za)(c, m, g, x, I, E, R, at)),
          (u._OrtEndProfiling = (c) => (u._OrtEndProfiling = U.Aa)(c));
        var er = () => (er = U.Ba)();
        (u._malloc = (c) => (u._malloc = U.Ca)(c)),
          (u._free = (c) => (u._free = U.Da)(c));
        var rn,
          $o = (c, m, g, x, I, E) => ($o = U.Ga)(c, m, g, x, I, E),
          Ha = () => (Ha = U.Ha)(),
          qa = (c, m, g, x, I) => (qa = U.Ia)(c, m, g, x, I),
          ko = (c) => (ko = U.Ja)(c),
          nn = (c) => (nn = U.Ka)(c),
          ja = () => (ja = U.La)(),
          Xa = (c, m) => (Xa = U.Ma)(c, m),
          on = (c) => (on = U.Na)(c),
          Bo = (c) => (Bo = U.Oa)(c),
          Fo = () => (Fo = U.Pa)();
        function Ka() {
          0 < ue ||
            (d
              ? (s(u), d || Zr(Jr), startWorker(u))
              : (Zr(Lt),
                0 < ue ||
                  rn ||
                  ((rn = !0),
                  (u.calledRun = !0),
                  se || (d || Zr(Jr), s(u), d || Zr(Ye)))));
        }
        return (
          (u.___start_em_js = 838360),
          (u.___stop_em_js = 838421),
          (u.stackSave = () => Fo()),
          (u.stackRestore = (c) => on(c)),
          (u.stackAlloc = (c) => Bo(c)),
          (u.UTF8ToString = Ir),
          (u.stringToUTF8 = _r),
          (u.lengthBytesUTF8 = ba),
          (De = function c() {
            rn || Ka(), rn || (De = c);
          }),
          Ka(),
          l
        );
      })),
      (Og = Mp);
    globalThis.self?.name === "em-pthread" && Mp();
  });
var br,
  Sg,
  Ag,
  Pg,
  zp,
  Wp,
  Eg,
  Hp,
  Vr = O(() => {
    "use strict";
    oo();
    (br = !1
      ? void 0
      : import.meta.url ??
        (typeof document < "u"
          ? document.currentScript?.src
          : typeof self < "u"
          ? self.location?.href
          : void 0)),
      (Sg = !1 || typeof location > "u" ? void 0 : location.origin),
      (Ag = (i, e) => {
        try {
          let o = e ?? br;
          return (o ? new URL(i, o) : new URL(i)).origin === Sg;
        } catch {
          return !1;
        }
      }),
      (Pg = async (i) => {
        let o = await (await fetch(i, { credentials: "same-origin" })).blob();
        return URL.createObjectURL(o);
      }),
      (zp = (Gp(), sn(Rp)).default),
      (Wp = async () => {
        if (!br)
          throw new Error(
            "Failed to load proxy worker: cannot determine the script source URL."
          );
        if (Ag(br)) return [void 0, zp()];
        let i = await Pg(br);
        return [i, zp(i)];
      }),
      (Eg = (Vp(), sn(Up)).default),
      (Hp = async (i, e, o) => [void 0, Eg]);
  });
var Xi,
  Ki,
  ho,
  qp,
  Dg,
  Lg,
  io,
  xt,
  Ke = O(() => {
    "use strict";
    Vr();
    (Ki = !1),
      (ho = !1),
      (qp = !1),
      (Dg = () => {
        if (typeof SharedArrayBuffer > "u") return !1;
        try {
          return (
            typeof MessageChannel < "u" &&
              new MessageChannel().port1.postMessage(new SharedArrayBuffer(1)),
            WebAssembly.validate(
              new Uint8Array([
                0, 97, 115, 109, 1, 0, 0, 0, 1, 4, 1, 96, 0, 0, 3, 2, 1, 0, 5,
                4, 1, 3, 1, 1, 10, 11, 1, 9, 0, 65, 0, 254, 16, 2, 0, 26, 11,
              ])
            )
          );
        } catch {
          return !1;
        }
      }),
      (Lg = () => {
        try {
          return WebAssembly.validate(
            new Uint8Array([
              0, 97, 115, 109, 1, 0, 0, 0, 1, 4, 1, 96, 0, 0, 3, 2, 1, 0, 10,
              30, 1, 28, 0, 65, 0, 253, 15, 253, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 253, 186, 1, 26, 11,
            ])
          );
        } catch {
          return !1;
        }
      }),
      (io = async (i) => {
        if (Ki) return Promise.resolve();
        if (ho)
          throw new Error(
            "multiple calls to 'initializeWebAssembly()' detected."
          );
        if (qp)
          throw new Error("previous call to 'initializeWebAssembly()' failed.");
        ho = !0;
        let e = i.initTimeout,
          o = i.numThreads;
        if (!Lg())
          throw new Error(
            "WebAssembly SIMD is not supported in the current environment."
          );
        let t = Dg();
        o > 1 &&
          !t &&
          (typeof self < "u" &&
            !self.crossOriginIsolated &&
            console.warn(
              "env.wasm.numThreads is set to " +
                o +
                ", but this will not work unless you enable crossOriginIsolated mode. See https://web.dev/cross-origin-isolation-guide/ for more info."
            ),
          console.warn(
            "WebAssembly multi-threading is not supported in the current environment. Falling back to single-threading."
          ),
          (i.numThreads = o = 1));
        let r = i.wasmPaths,
          n = typeof r == "string" ? r : void 0,
          s = r?.mjs,
          a = s?.href ?? s,
          u = r?.wasm,
          l = u?.href ?? u,
          f = i.wasmBinary,
          [p, d] = await Hp(a, n, o > 1),
          y = !1,
          T = [];
        if (
          (e > 0 &&
            T.push(
              new Promise((v) => {
                setTimeout(() => {
                  (y = !0), v();
                }, e);
              })
            ),
          T.push(
            new Promise((v, S) => {
              let L = { numThreads: o };
              f
                ? (L.wasmBinary = f)
                : (l || n) && (L.locateFile = (P, A) => l ?? (n ?? A) + P),
                d(L).then(
                  (P) => {
                    (ho = !1),
                      (Ki = !0),
                      (Xi = P),
                      v(),
                      p && URL.revokeObjectURL(p);
                  },
                  (P) => {
                    (ho = !1), (qp = !0), S(P);
                  }
                );
            })
          ),
          await Promise.race(T),
          y)
        )
          throw new Error(
            `WebAssembly backend initializing failed due to timeout: ${e}ms`
          );
      }),
      (xt = () => {
        if (Ki && Xi) return Xi;
        throw new Error("WebAssembly is not initialized yet.");
      });
  });
var Tt,
  Wr,
  ht,
  mo = O(() => {
    "use strict";
    Ke();
    (Tt = (i, e) => {
      let o = xt(),
        t = o.lengthBytesUTF8(i) + 1,
        r = o._malloc(t);
      return o.stringToUTF8(i, r, t), e.push(r), r;
    }),
      (Wr = (i, e, o, t) => {
        if (typeof i == "object" && i !== null) {
          if (o.has(i)) throw new Error("Circular reference in options");
          o.add(i);
        }
        Object.entries(i).forEach(([r, n]) => {
          let s = e ? e + r : r;
          if (typeof n == "object") Wr(n, s + ".", o, t);
          else if (typeof n == "string" || typeof n == "number")
            t(s, n.toString());
          else if (typeof n == "boolean") t(s, n ? "1" : "0");
          else throw new Error(`Can't handle extra config type: ${typeof n}`);
        });
      }),
      (ht = (i) => {
        let e = xt(),
          o = e.stackSave();
        try {
          let t = e.stackAlloc(8);
          e._OrtGetLastError(t, t + 4);
          let r = e.HEAP32[t / 4],
            n = e.HEAPU32[t / 4 + 1],
            s = n ? e.UTF8ToString(n) : "";
          throw new Error(`${i} ERROR_CODE: ${r}, ERROR_MESSAGE: ${s}`);
        } finally {
          e.stackRestore(o);
        }
      });
  });
var jp,
  Xp = O(() => {
    "use strict";
    Ke();
    mo();
    jp = (i) => {
      let e = xt(),
        o = 0,
        t = [],
        r = i || {};
      try {
        if (i?.logSeverityLevel === void 0) r.logSeverityLevel = 2;
        else if (
          typeof i.logSeverityLevel != "number" ||
          !Number.isInteger(i.logSeverityLevel) ||
          i.logSeverityLevel < 0 ||
          i.logSeverityLevel > 4
        )
          throw new Error(
            `log serverity level is not valid: ${i.logSeverityLevel}`
          );
        if (i?.logVerbosityLevel === void 0) r.logVerbosityLevel = 0;
        else if (
          typeof i.logVerbosityLevel != "number" ||
          !Number.isInteger(i.logVerbosityLevel)
        )
          throw new Error(
            `log verbosity level is not valid: ${i.logVerbosityLevel}`
          );
        i?.terminate === void 0 && (r.terminate = !1);
        let n = 0;
        return (
          i?.tag !== void 0 && (n = Tt(i.tag, t)),
          (o = e._OrtCreateRunOptions(
            r.logSeverityLevel,
            r.logVerbosityLevel,
            !!r.terminate,
            n
          )),
          o === 0 && ht("Can't create run options."),
          i?.extra !== void 0 &&
            Wr(i.extra, "", new WeakSet(), (s, a) => {
              let u = Tt(s, t),
                l = Tt(a, t);
              e._OrtAddRunConfigEntry(o, u, l) !== 0 &&
                ht(`Can't set a run config entry: ${s} - ${a}.`);
            }),
          [o, t]
        );
      } catch (n) {
        throw (
          (o !== 0 && e._OrtReleaseRunOptions(o),
          t.forEach((s) => e._free(s)),
          n)
        );
      }
    };
  });
var $g,
  kg,
  Bg,
  Fg,
  Kp,
  Jp = O(() => {
    "use strict";
    Ke();
    mo();
    ($g = (i) => {
      switch (i) {
        case "disabled":
          return 0;
        case "basic":
          return 1;
        case "extended":
          return 2;
        case "all":
          return 99;
        default:
          throw new Error(`unsupported graph optimization level: ${i}`);
      }
    }),
      (kg = (i) => {
        switch (i) {
          case "sequential":
            return 0;
          case "parallel":
            return 1;
          default:
            throw new Error(`unsupported execution mode: ${i}`);
        }
      }),
      (Bg = (i) => {
        i.extra || (i.extra = {}), i.extra.session || (i.extra.session = {});
        let e = i.extra.session;
        e.use_ort_model_bytes_directly ||
          (e.use_ort_model_bytes_directly = "1"),
          i.executionProviders &&
            i.executionProviders.some(
              (o) => (typeof o == "string" ? o : o.name) === "webgpu"
            ) &&
            (i.enableMemPattern = !1);
      }),
      (Fg = (i, e, o) => {
        for (let t of e) {
          let r = typeof t == "string" ? t : t.name;
          switch (r) {
            case "webnn":
              if (((r = "WEBNN"), typeof t != "string")) {
                let a = t?.deviceType;
                if (a) {
                  let u = Tt("deviceType", o),
                    l = Tt(a, o);
                  xt()._OrtAddSessionConfigEntry(i, u, l) !== 0 &&
                    ht(
                      `Can't set a session config entry: 'deviceType' - ${a}.`
                    );
                }
              }
              break;
            case "webgpu":
              if (((r = "JS"), typeof t != "string")) {
                let s = t;
                if (s?.preferredLayout) {
                  if (
                    s.preferredLayout !== "NCHW" &&
                    s.preferredLayout !== "NHWC"
                  )
                    throw new Error(
                      `preferredLayout must be either 'NCHW' or 'NHWC': ${s.preferredLayout}`
                    );
                  let a = Tt("preferredLayout", o),
                    u = Tt(s.preferredLayout, o);
                  xt()._OrtAddSessionConfigEntry(i, a, u) !== 0 &&
                    ht(
                      `Can't set a session config entry: 'preferredLayout' - ${s.preferredLayout}.`
                    );
                }
              }
              break;
            case "wasm":
            case "cpu":
              continue;
            default:
              throw new Error(`not supported execution provider: ${r}`);
          }
          let n = Tt(r, o);
          xt()._OrtAppendExecutionProvider(i, n) !== 0 &&
            ht(`Can't append execution provider: ${r}.`);
        }
      }),
      (Kp = (i) => {
        let e = xt(),
          o = 0,
          t = [],
          r = i || {};
        Bg(r);
        try {
          let n = $g(r.graphOptimizationLevel ?? "all"),
            s = kg(r.executionMode ?? "sequential"),
            a = typeof r.logId == "string" ? Tt(r.logId, t) : 0,
            u = r.logSeverityLevel ?? 2;
          if (!Number.isInteger(u) || u < 0 || u > 4)
            throw new Error(`log serverity level is not valid: ${u}`);
          let l = r.logVerbosityLevel ?? 0;
          if (!Number.isInteger(l) || l < 0 || l > 4)
            throw new Error(`log verbosity level is not valid: ${l}`);
          let f =
            typeof r.optimizedModelFilePath == "string"
              ? Tt(r.optimizedModelFilePath, t)
              : 0;
          if (
            ((o = e._OrtCreateSessionOptions(
              n,
              !!r.enableCpuMemArena,
              !!r.enableMemPattern,
              s,
              !!r.enableProfiling,
              0,
              a,
              u,
              l,
              f
            )),
            o === 0 && ht("Can't create session options."),
            r.executionProviders && Fg(o, r.executionProviders, t),
            r.enableGraphCapture !== void 0)
          ) {
            if (typeof r.enableGraphCapture != "boolean")
              throw new Error(
                `enableGraphCapture must be a boolean value: ${r.enableGraphCapture}`
              );
            let p = Tt("enableGraphCapture", t),
              d = Tt(r.enableGraphCapture.toString(), t);
            e._OrtAddSessionConfigEntry(o, p, d) !== 0 &&
              ht(
                `Can't set a session config entry: 'enableGraphCapture' - ${r.enableGraphCapture}.`
              );
          }
          if (r.freeDimensionOverrides)
            for (let [p, d] of Object.entries(r.freeDimensionOverrides)) {
              if (typeof p != "string")
                throw new Error(
                  `free dimension override name must be a string: ${p}`
                );
              if (typeof d != "number" || !Number.isInteger(d) || d < 0)
                throw new Error(
                  `free dimension override value must be a non-negative integer: ${d}`
                );
              let y = Tt(p, t);
              e._OrtAddFreeDimensionOverride(o, y, d) !== 0 &&
                ht(`Can't set a free dimension override: ${p} - ${d}.`);
            }
          return (
            r.extra !== void 0 &&
              Wr(r.extra, "", new WeakSet(), (p, d) => {
                let y = Tt(p, t),
                  T = Tt(d, t);
                e._OrtAddSessionConfigEntry(o, y, T) !== 0 &&
                  ht(`Can't set a session config entry: ${p} - ${d}.`);
              }),
            [o, t]
          );
        } catch (n) {
          throw (
            (o !== 0 && e._OrtReleaseSessionOptions(o),
            t.forEach((s) => e._free(s)),
            n)
          );
        }
      });
  });
var Hr,
  Yp,
  qr,
  Zp,
  Qp,
  bo,
  go,
  td,
  Ji = O(() => {
    "use strict";
    (Hr = (i) => {
      switch (i) {
        case "int8":
          return 3;
        case "uint8":
          return 2;
        case "bool":
          return 9;
        case "int16":
          return 5;
        case "uint16":
          return 4;
        case "int32":
          return 6;
        case "uint32":
          return 12;
        case "float16":
          return 10;
        case "float32":
          return 1;
        case "float64":
          return 11;
        case "string":
          return 8;
        case "int64":
          return 7;
        case "uint64":
          return 13;
        case "int4":
          return 22;
        case "uint4":
          return 21;
        default:
          throw new Error(`unsupported data type: ${i}`);
      }
    }),
      (Yp = (i) => {
        switch (i) {
          case 3:
            return "int8";
          case 2:
            return "uint8";
          case 9:
            return "bool";
          case 5:
            return "int16";
          case 4:
            return "uint16";
          case 6:
            return "int32";
          case 12:
            return "uint32";
          case 10:
            return "float16";
          case 1:
            return "float32";
          case 11:
            return "float64";
          case 8:
            return "string";
          case 7:
            return "int64";
          case 13:
            return "uint64";
          case 22:
            return "int4";
          case 21:
            return "uint4";
          default:
            throw new Error(`unsupported data type: ${i}`);
        }
      }),
      (qr = (i, e) => {
        let o = [
            -1, 4, 1, 1, 2, 2, 4, 8, -1, 1, 2, 8, 4, 8, -1, -1, -1, -1, -1, -1,
            -1, 0.5, 0.5,
          ][i],
          t = typeof e == "number" ? e : e.reduce((r, n) => r * n, 1);
        return o > 0 ? Math.ceil(t * o) : void 0;
      }),
      (Zp = (i) => {
        switch (i) {
          case "float16":
            return typeof Float16Array < "u" && Float16Array.from
              ? Float16Array
              : Uint16Array;
          case "float32":
            return Float32Array;
          case "uint8":
            return Uint8Array;
          case "int8":
            return Int8Array;
          case "uint16":
            return Uint16Array;
          case "int16":
            return Int16Array;
          case "int32":
            return Int32Array;
          case "bool":
            return Uint8Array;
          case "float64":
            return Float64Array;
          case "uint32":
            return Uint32Array;
          case "int64":
            return BigInt64Array;
          case "uint64":
            return BigUint64Array;
          default:
            throw new Error(`unsupported type: ${i}`);
        }
      }),
      (Qp = (i) => {
        switch (i) {
          case "verbose":
            return 0;
          case "info":
            return 1;
          case "warning":
            return 2;
          case "error":
            return 3;
          case "fatal":
            return 4;
          default:
            throw new Error(`unsupported logging level: ${i}`);
        }
      }),
      (bo = (i) =>
        i === "float32" ||
        i === "float16" ||
        i === "int32" ||
        i === "int64" ||
        i === "uint32" ||
        i === "uint8" ||
        i === "bool" ||
        i === "uint4" ||
        i === "int4"),
      (go = (i) =>
        i === "float32" ||
        i === "float16" ||
        i === "int32" ||
        i === "int64" ||
        i === "uint32" ||
        i === "uint64" ||
        i === "int8" ||
        i === "uint8" ||
        i === "bool"),
      (td = (i) => {
        switch (i) {
          case "none":
            return 0;
          case "cpu":
            return 1;
          case "cpu-pinned":
            return 2;
          case "texture":
            return 3;
          case "gpu-buffer":
            return 4;
          case "ml-tensor":
            return 5;
          default:
            throw new Error(`unsupported data location: ${i}`);
        }
      });
  });
var jr,
  Yi = O(() => {
    "use strict";
    oo();
    jr = async (i) => {
      if (typeof i == "string")
        if (!1)
          try {
            let { readFile: e } = Co("node:fs/promises");
            return new Uint8Array(await e(i));
          } catch (e) {
            if (e.code === "ERR_FS_FILE_TOO_LARGE") {
              let { createReadStream: o } = Co("node:fs"),
                t = o(i),
                r = [];
              for await (let n of t) r.push(n);
              return new Uint8Array(Buffer.concat(r));
            }
            throw e;
          }
        else {
          let e = await fetch(i);
          if (!e.ok) throw new Error(`failed to load external data file: ${i}`);
          let o = e.headers.get("Content-Length"),
            t = o ? parseInt(o, 10) : 0;
          if (t < 1073741824) return new Uint8Array(await e.arrayBuffer());
          {
            if (!e.body)
              throw new Error(
                `failed to load external data file: ${i}, no response body.`
              );
            let r = e.body.getReader(),
              n;
            try {
              n = new ArrayBuffer(t);
            } catch (a) {
              if (a instanceof RangeError) {
                let u = Math.ceil(t / 65536);
                n = new WebAssembly.Memory({ initial: u, maximum: u }).buffer;
              } else throw a;
            }
            let s = 0;
            for (;;) {
              let { done: a, value: u } = await r.read();
              if (a) break;
              let l = u.byteLength;
              new Uint8Array(n, s, l).set(u), (s += l);
            }
            return new Uint8Array(n, 0, t);
          }
        }
      else
        return i instanceof Blob
          ? new Uint8Array(await i.arrayBuffer())
          : i instanceof Uint8Array
          ? i
          : new Uint8Array(i);
    };
  });
var Cg,
  ao,
  so,
  yr,
  Ng,
  zr,
  uo,
  lo,
  ed,
  fo,
  co,
  po,
  qi = O(() => {
    "use strict";
    Xp();
    Jp();
    Ji();
    Ke();
    mo();
    Yi();
    (Cg = (i, e) => {
      xt()._OrtInit(i, e) !== 0 && ht("Can't initialize onnxruntime.");
    }),
      (ao = async (i) => {
        Cg(i.wasm.numThreads, Qp(i.logLevel));
      }),
      (so = async (i, e) => {}),
      (yr = new Map()),
      (Ng = (i) => {
        let e = xt(),
          o = e.stackSave();
        try {
          let t = e.stackAlloc(8);
          return (
            e._OrtGetInputOutputCount(i, t, t + 4) !== 0 &&
              ht("Can't get session input/output count."),
            [e.HEAP32[t / 4], e.HEAP32[t / 4 + 1]]
          );
        } finally {
          e.stackRestore(o);
        }
      }),
      (zr = (i) => {
        let e = xt(),
          o = e._malloc(i.byteLength);
        if (o === 0)
          throw new Error(
            `Can't create a session. failed to allocate a buffer of size ${i.byteLength}.`
          );
        return e.HEAPU8.set(i, o), [o, i.byteLength];
      }),
      (uo = async (i, e) => {
        let o,
          t,
          r = xt();
        Array.isArray(i)
          ? ([o, t] = i)
          : i.buffer === r.HEAPU8.buffer
          ? ([o, t] = [i.byteOffset, i.byteLength])
          : ([o, t] = zr(i));
        let n = 0,
          s = 0,
          a = 0,
          u = [],
          l = [],
          f = [];
        try {
          if ((([s, u] = Kp(e)), e?.externalData && r.mountExternalData)) {
            let P = [];
            for (let A of e.externalData) {
              let M = typeof A == "string" ? A : A.path;
              P.push(
                jr(typeof A == "string" ? A : A.data).then((V) => {
                  r.mountExternalData(M, V);
                })
              );
            }
            await Promise.all(P);
          }
          for (let P of e?.executionProviders ?? [])
            if ((typeof P == "string" ? P : P.name) === "webnn") {
              if (((r.shouldTransferToMLTensor = !1), r.currentContext))
                throw new Error("WebNN execution provider is already set.");
              if (typeof P != "string") {
                let M = P,
                  V = M?.context,
                  lt = M?.gpuDevice,
                  wt = M?.deviceType,
                  et = M?.numThreads,
                  Dt = M?.powerPreference;
                V
                  ? (r.currentContext = V)
                  : lt
                  ? (r.currentContext = await navigator.ml.createContext(lt))
                  : (r.currentContext = await navigator.ml.createContext({
                      deviceType: wt,
                      numThreads: et,
                      powerPreference: Dt,
                    }));
              } else r.currentContext = await navigator.ml.createContext();
              break;
            }
          (n = await r._OrtCreateSession(o, t, s)),
            n === 0 && ht("Can't create a session."),
            r.currentContext &&
              (r.jsepRegisterMLContext(n, r.currentContext),
              (r.currentContext = void 0),
              (r.shouldTransferToMLTensor = !0));
          let [p, d] = Ng(n),
            y = !!e?.enableGraphCapture,
            T = [],
            v = [],
            S = [];
          for (let P = 0; P < p; P++) {
            let A = r._OrtGetInputName(n, P);
            A === 0 && ht("Can't get an input name."),
              l.push(A),
              T.push(r.UTF8ToString(A));
          }
          for (let P = 0; P < d; P++) {
            let A = r._OrtGetOutputName(n, P);
            A === 0 && ht("Can't get an output name."), f.push(A);
            let M = r.UTF8ToString(A);
            v.push(M);
          }
          let L = null;
          return yr.set(n, [n, l, f, L, y, !1]), [n, T, v];
        } catch (p) {
          throw (
            (l.forEach((d) => r._OrtFree(d)),
            f.forEach((d) => r._OrtFree(d)),
            a !== 0 && r._OrtReleaseBinding(a),
            n !== 0 && r._OrtReleaseSession(n),
            p)
          );
        } finally {
          r._free(o),
            s !== 0 && r._OrtReleaseSessionOptions(s),
            u.forEach((p) => r._free(p)),
            r.unmountExternalData?.();
        }
      }),
      (lo = (i) => {
        let e = xt(),
          o = yr.get(i);
        if (!o)
          throw new Error(`cannot release session. invalid session id: ${i}`);
        let [t, r, n, s, a] = o;
        s &&
          (a && e._OrtClearBoundOutputs(s.handle),
          e._OrtReleaseBinding(s.handle)),
          e.jsepOnReleaseSession?.(i),
          r.forEach((u) => e._OrtFree(u)),
          n.forEach((u) => e._OrtFree(u)),
          e._OrtReleaseSession(t),
          yr.delete(i);
      }),
      (ed = (i, e, o, t, r, n = !1) => {
        if (!i) {
          e.push(0);
          return;
        }
        let s = xt(),
          a = i[0],
          u = i[1],
          l = i[3],
          f,
          p;
        if (a === "string" && (l === "gpu-buffer" || l === "ml-tensor"))
          throw new Error("String tensor is not supported on GPU.");
        if (n && l !== "gpu-buffer")
          throw new Error(
            `External buffer must be provided for input/output index ${r} when enableGraphCapture is true.`
          );
        if (l === "gpu-buffer") {
          let T = i[2].gpuBuffer;
          p = qr(Hr(a), u);
          let v = s.jsepRegisterBuffer;
          if (!v)
            throw new Error(
              'Tensor location "gpu-buffer" is not supported without using WebGPU.'
            );
          f = v(t, r, T, p);
        } else if (l === "ml-tensor") {
          let T = i[2].mlTensor;
          p = qr(Hr(a), u);
          let v = s.jsepRegisterMLTensor;
          if (!v)
            throw new Error(
              'Tensor location "ml-tensor" is not supported without using WebNN.'
            );
          f = v(T, Hr(a), u);
        } else {
          let T = i[2];
          if (Array.isArray(T)) {
            (p = 4 * T.length), (f = s._malloc(p)), o.push(f);
            let v = f / 4;
            for (let S = 0; S < T.length; S++) {
              if (typeof T[S] != "string")
                throw new TypeError(
                  `tensor data at index ${S} is not a string`
                );
              s.HEAPU32[v++] = Tt(T[S], o);
            }
          } else
            (p = T.byteLength),
              (f = s._malloc(p)),
              o.push(f),
              s.HEAPU8.set(new Uint8Array(T.buffer, T.byteOffset, p), f);
        }
        let d = s.stackSave(),
          y = s.stackAlloc(4 * u.length);
        try {
          let T = y / 4;
          u.forEach((S) => (s.HEAP32[T++] = S));
          let v = s._OrtCreateTensor(Hr(a), f, p, y, u.length, td(l));
          v === 0 &&
            ht(
              `Can't create tensor for input/output. session=${t}, index=${r}.`
            ),
            e.push(v);
        } finally {
          s.stackRestore(d);
        }
      }),
      (fo = async (i, e, o, t, r, n) => {
        let s = xt(),
          a = yr.get(i);
        if (!a)
          throw new Error(`cannot run inference. invalid session id: ${i}`);
        let u = a[0],
          l = a[1],
          f = a[2],
          p = a[3],
          d = a[4],
          y = a[5],
          T = e.length,
          v = t.length,
          S = 0,
          L = [],
          P = [],
          A = [],
          M = [],
          V = s.stackSave(),
          lt = s.stackAlloc(T * 4),
          wt = s.stackAlloc(T * 4),
          et = s.stackAlloc(v * 4),
          Dt = s.stackAlloc(v * 4);
        try {
          s.jsepOnRunStart?.(u), ([S, L] = jp(n));
          for (let Z = 0; Z < T; Z++) ed(o[Z], P, M, i, e[Z], d);
          for (let Z = 0; Z < v; Z++) ed(r[Z], A, M, i, T + t[Z], d);
          let _t = lt / 4,
            C = wt / 4,
            Kr = et / 4,
            we = Dt / 4;
          for (let Z = 0; Z < T; Z++)
            (s.HEAPU32[_t++] = P[Z]), (s.HEAPU32[C++] = l[e[Z]]);
          for (let Z = 0; Z < v; Z++)
            (s.HEAPU32[Kr++] = A[Z]), (s.HEAPU32[we++] = f[t[Z]]);
          let oe;
          (oe = await s._OrtRun(u, wt, lt, T, Dt, v, et, S)),
            oe !== 0 && ht("failed to call OrtRun().");
          let be = [];
          for (let Z = 0; Z < v; Z++) {
            let ge = s.HEAPU32[et / 4 + Z];
            if (ge === A[Z]) {
              be.push(r[Z]);
              continue;
            }
            let ie = s.stackSave(),
              ae = s.stackAlloc(4 * 4),
              se = !1,
              it,
              Lt = 0;
            try {
              s._OrtGetTensorData(ge, ae, ae + 4, ae + 8, ae + 12) !== 0 &&
                ht(`Can't access output tensor data on index ${Z}.`);
              let Ye = ae / 4,
                ue = s.HEAPU32[Ye++];
              Lt = s.HEAPU32[Ye++];
              let Ze = s.HEAPU32[Ye++],
                De = s.HEAPU32[Ye++],
                le = [];
              for (let gt = 0; gt < De; gt++) le.push(s.HEAPU32[Ze / 4 + gt]);
              s._OrtFree(Ze);
              let Mt = le.reduce((gt, Ot) => gt * Ot, 1);
              it = Yp(ue);
              let ve = p?.outputPreferredLocations[t[Z]];
              if (it === "string") {
                if (ve === "gpu-buffer" || ve === "ml-tensor")
                  throw new Error("String tensor is not supported on GPU.");
                let gt = [],
                  Ot = Lt / 4;
                for (let Jt = 0; Jt < Mt; Jt++) {
                  let wr = s.HEAPU32[Ot++],
                    Yr = Jt === Mt - 1 ? void 0 : s.HEAPU32[Ot] - wr;
                  gt.push(s.UTF8ToString(wr, Yr));
                }
                be.push([it, le, gt, "cpu"]);
              } else if (ve === "gpu-buffer" && Mt > 0) {
                let gt = s.jsepGetBuffer;
                if (!gt)
                  throw new Error(
                    'preferredLocation "gpu-buffer" is not supported without using WebGPU.'
                  );
                let Ot = gt(Lt),
                  Jt = qr(ue, Mt);
                if (Jt === void 0 || !bo(it))
                  throw new Error(`Unsupported data type: ${it}`);
                (se = !0),
                  be.push([
                    it,
                    le,
                    {
                      gpuBuffer: Ot,
                      download: s.jsepCreateDownloader(Ot, Jt, it),
                      dispose: () => {
                        s._OrtReleaseTensor(ge);
                      },
                    },
                    "gpu-buffer",
                  ]);
              } else if (ve === "ml-tensor" && Mt > 0) {
                let gt = s.jsepEnsureTensor;
                if (!gt)
                  throw new Error(
                    'preferredLocation "ml-tensor" is not supported without using WebNN.'
                  );
                if (qr(ue, Mt) === void 0 || !go(it))
                  throw new Error(`Unsupported data type: ${it}`);
                let Jt = await gt(Lt, ue, le, !1);
                (se = !0),
                  be.push([
                    it,
                    le,
                    {
                      mlTensor: Jt,
                      download: s.jsepCreateMLTensorDownloader(Lt, it),
                      dispose: () => {
                        s.jsepReleaseTensorId(Lt), s._OrtReleaseTensor(ge);
                      },
                    },
                    "ml-tensor",
                  ]);
              } else {
                let gt = Zp(it),
                  Ot = new gt(Mt);
                new Uint8Array(Ot.buffer, Ot.byteOffset, Ot.byteLength).set(
                  s.HEAPU8.subarray(Lt, Lt + Ot.byteLength)
                ),
                  be.push([it, le, Ot, "cpu"]);
              }
            } finally {
              s.stackRestore(ie),
                it === "string" && Lt && s._free(Lt),
                se || s._OrtReleaseTensor(ge);
            }
          }
          return (
            p &&
              !d &&
              (s._OrtClearBoundOutputs(p.handle),
              yr.set(i, [u, l, f, p, d, !1])),
            be
          );
        } finally {
          s.stackRestore(V),
            P.forEach((_t) => s._OrtReleaseTensor(_t)),
            A.forEach((_t) => s._OrtReleaseTensor(_t)),
            M.forEach((_t) => s._free(_t)),
            S !== 0 && s._OrtReleaseRunOptions(S),
            L.forEach((_t) => s._free(_t));
        }
      }),
      (co = (i) => {
        let e = xt(),
          o = yr.get(i);
        if (!o) throw new Error("invalid session id");
        let t = o[0],
          r = e._OrtEndProfiling(t);
        r === 0 && ht("Can't get an profile file name."), e._OrtFree(r);
      }),
      (po = (i) => {
        let e = [];
        for (let o of i) {
          let t = o[2];
          !Array.isArray(t) && "buffer" in t && e.push(t.buffer);
        }
        return e;
      });
  });
var Je,
  Kt,
  Xr,
  xo,
  To,
  yo,
  Zi,
  Qi,
  xr,
  Tr,
  Gg,
  rd,
  nd,
  od,
  id,
  ad,
  sd,
  ud,
  ta = O(() => {
    "use strict";
    Yt();
    qi();
    Ke();
    Vr();
    (Je = () => !!z.wasm.proxy && typeof document < "u"),
      (Xr = !1),
      (xo = !1),
      (To = !1),
      (Qi = new Map()),
      (xr = (i, e) => {
        let o = Qi.get(i);
        o ? o.push(e) : Qi.set(i, [e]);
      }),
      (Tr = () => {
        if (Xr || !xo || To || !Kt) throw new Error("worker not ready");
      }),
      (Gg = (i) => {
        switch (i.data.type) {
          case "init-wasm":
            (Xr = !1),
              i.data.err
                ? ((To = !0), Zi[1](i.data.err))
                : ((xo = !0), Zi[0]()),
              yo && (URL.revokeObjectURL(yo), (yo = void 0));
            break;
          case "init-ep":
          case "copy-from":
          case "create":
          case "release":
          case "run":
          case "end-profiling": {
            let e = Qi.get(i.data.type);
            i.data.err ? e.shift()[1](i.data.err) : e.shift()[0](i.data.out);
            break;
          }
          default:
        }
      }),
      (rd = async () => {
        if (!xo) {
          if (Xr) throw new Error("multiple calls to 'initWasm()' detected.");
          if (To) throw new Error("previous call to 'initWasm()' failed.");
          if (((Xr = !0), Je()))
            return new Promise((i, e) => {
              Kt?.terminate(),
                Wp().then(([o, t]) => {
                  try {
                    (Kt = t),
                      (Kt.onerror = (n) => e(n)),
                      (Kt.onmessage = Gg),
                      (Zi = [i, e]);
                    let r = { type: "init-wasm", in: z };
                    Kt.postMessage(r), (yo = o);
                  } catch (r) {
                    e(r);
                  }
                }, e);
            });
          try {
            await io(z.wasm), await ao(z), (xo = !0);
          } catch (i) {
            throw ((To = !0), i);
          } finally {
            Xr = !1;
          }
        }
      }),
      (nd = async (i) => {
        if (Je())
          return (
            Tr(),
            new Promise((e, o) => {
              xr("init-ep", [e, o]);
              let t = { type: "init-ep", in: { epName: i, env: z } };
              Kt.postMessage(t);
            })
          );
        await so(z, i);
      }),
      (od = async (i) =>
        Je()
          ? (Tr(),
            new Promise((e, o) => {
              xr("copy-from", [e, o]);
              let t = { type: "copy-from", in: { buffer: i } };
              Kt.postMessage(t, [i.buffer]);
            }))
          : zr(i)),
      (id = async (i, e) => {
        if (Je()) {
          if (e?.preferredOutputLocation)
            throw new Error(
              'session option "preferredOutputLocation" is not supported for proxy.'
            );
          return (
            Tr(),
            new Promise((o, t) => {
              xr("create", [o, t]);
              let r = { type: "create", in: { model: i, options: { ...e } } },
                n = [];
              i instanceof Uint8Array && n.push(i.buffer), Kt.postMessage(r, n);
            })
          );
        } else return uo(i, e);
      }),
      (ad = async (i) => {
        if (Je())
          return (
            Tr(),
            new Promise((e, o) => {
              xr("release", [e, o]);
              let t = { type: "release", in: i };
              Kt.postMessage(t);
            })
          );
        lo(i);
      }),
      (sd = async (i, e, o, t, r, n) => {
        if (Je()) {
          if (o.some((s) => s[3] !== "cpu"))
            throw new Error("input tensor on GPU is not supported for proxy.");
          if (r.some((s) => s))
            throw new Error(
              "pre-allocated output tensor is not supported for proxy."
            );
          return (
            Tr(),
            new Promise((s, a) => {
              xr("run", [s, a]);
              let u = o,
                l = {
                  type: "run",
                  in: {
                    sessionId: i,
                    inputIndices: e,
                    inputs: u,
                    outputIndices: t,
                    options: n,
                  },
                };
              Kt.postMessage(l, po(u));
            })
          );
        } else return fo(i, e, o, t, r, n);
      }),
      (ud = async (i) => {
        if (Je())
          return (
            Tr(),
            new Promise((e, o) => {
              xr("end-profiling", [e, o]);
              let t = { type: "end-profiling", in: i };
              Kt.postMessage(t);
            })
          );
        co(i);
      });
  });
var ld,
  Mg,
  wo,
  fd = O(() => {
    "use strict";
    Yt();
    ta();
    Ji();
    oo();
    Yi();
    (ld = (i, e) => {
      switch (i.location) {
        case "cpu":
          return [i.type, i.dims, i.data, "cpu"];
        case "gpu-buffer":
          return [i.type, i.dims, { gpuBuffer: i.gpuBuffer }, "gpu-buffer"];
        case "ml-tensor":
          return [i.type, i.dims, { mlTensor: i.mlTensor }, "ml-tensor"];
        default:
          throw new Error(`invalid data location: ${i.location} for ${e()}`);
      }
    }),
      (Mg = (i) => {
        switch (i[3]) {
          case "cpu":
            return new yt(i[0], i[2], i[1]);
          case "gpu-buffer": {
            let e = i[0];
            if (!bo(e))
              throw new Error(
                `not supported data type: ${e} for deserializing GPU tensor`
              );
            let { gpuBuffer: o, download: t, dispose: r } = i[2];
            return yt.fromGpuBuffer(o, {
              dataType: e,
              dims: i[1],
              download: t,
              dispose: r,
            });
          }
          case "ml-tensor": {
            let e = i[0];
            if (!go(e))
              throw new Error(
                `not supported data type: ${e} for deserializing MLTensor tensor`
              );
            let { mlTensor: o, download: t, dispose: r } = i[2];
            return yt.fromMLTensor(o, {
              dataType: e,
              dims: i[1],
              download: t,
              dispose: r,
            });
          }
          default:
            throw new Error(`invalid data location: ${i[3]}`);
        }
      }),
      (wo = class {
        async fetchModelAndCopyToWasmMemory(e) {
          return od(await jr(e));
        }
        async loadModel(e, o) {
          Fe();
          let t;
          typeof e == "string"
            ? !1
              ? (t = await jr(e))
              : (t = await this.fetchModelAndCopyToWasmMemory(e))
            : (t = e),
            ([this.sessionId, this.inputNames, this.outputNames] = await id(
              t,
              o
            )),
            Ce();
        }
        async dispose() {
          return ad(this.sessionId);
        }
        async run(e, o, t) {
          Fe();
          let r = [],
            n = [];
          Object.entries(e).forEach((d) => {
            let y = d[0],
              T = d[1],
              v = this.inputNames.indexOf(y);
            if (v === -1) throw new Error(`invalid input '${y}'`);
            r.push(T), n.push(v);
          });
          let s = [],
            a = [];
          Object.entries(o).forEach((d) => {
            let y = d[0],
              T = d[1],
              v = this.outputNames.indexOf(y);
            if (v === -1) throw new Error(`invalid output '${y}'`);
            s.push(T), a.push(v);
          });
          let u = r.map((d, y) =>
              ld(d, () => `input "${this.inputNames[n[y]]}"`)
            ),
            l = s.map((d, y) =>
              d ? ld(d, () => `output "${this.outputNames[a[y]]}"`) : null
            ),
            f = await sd(this.sessionId, n, u, a, l, t),
            p = {};
          for (let d = 0; d < f.length; d++)
            p[this.outputNames[a[d]]] = s[d] ?? Mg(f[d]);
          return Ce(), p;
        }
        startProfiling() {}
        endProfiling() {
          ud(this.sessionId);
        }
      });
  });
var pd = {};
Or(pd, {
  OnnxruntimeWebAssemblyBackend: () => vo,
  initializeFlags: () => cd,
  wasmBackend: () => Ug,
});
var cd,
  vo,
  Ug,
  dd = O(() => {
    "use strict";
    Yt();
    ta();
    fd();
    Vr();
    (cd = () => {
      if (
        ((typeof z.wasm.initTimeout != "number" || z.wasm.initTimeout < 0) &&
          (z.wasm.initTimeout = 0),
        z.wasm.simd === !1 &&
          console.warn(
            'Deprecated property "env.wasm.simd" is set to false. non-SIMD build is no longer provided, and this setting will be ignored.'
          ),
        typeof z.wasm.proxy != "boolean" && (z.wasm.proxy = !1),
        typeof z.wasm.trace != "boolean" && (z.wasm.trace = !1),
        typeof z.wasm.numThreads != "number" ||
          !Number.isInteger(z.wasm.numThreads) ||
          z.wasm.numThreads <= 0)
      )
        if (typeof self < "u" && !self.crossOriginIsolated)
          z.wasm.numThreads = 1;
        else {
          let i =
            typeof navigator > "u"
              ? Co("node:os").cpus().length
              : navigator.hardwareConcurrency;
          z.wasm.numThreads = Math.min(4, Math.ceil((i || 1) / 2));
        }
    }),
      (vo = class {
        async init(e) {
          cd(), await rd(), await nd(e);
        }
        async createInferenceSessionHandler(e, o) {
          let t = new wo();
          return await t.loadModel(e, o), Promise.resolve(t);
        }
      }),
      (Ug = new vo());
  });
Yt();
Yt();
Yt();
var Ds = "1.20.1";
var mO = Mo;
{
  let i = (Fp(), sn(Bp)).onnxjsBackend;
  nr("webgl", i, -10);
}
{
  let i = (dd(), sn(pd)).wasmBackend;
  nr("cpu", i, 10), nr("wasm", i, 10);
}
Object.defineProperty(z.versions, "web", { value: Ds, enumerable: !0 });
export {
  Yd as InferenceSession,
  Ts as TRACE,
  Fe as TRACE_FUNC_BEGIN,
  Ce as TRACE_FUNC_END,
  yt as Tensor,
  Qd as TrainingSession,
  mO as default,
  z as env,
  nr as registerBackend,
};
/*! Bundled license information:

long/index.js:
  (**
   * @license
   * Copyright 2009 The Closure Library Authors
   * Copyright 2020 Daniel Wirtz / The long.js Authors.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *     http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *
   * SPDX-License-Identifier: Apache-2.0
   *)
*/
//# sourceMappingURL=ort.bundle.min.mjs.map
