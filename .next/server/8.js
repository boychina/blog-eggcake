exports.ids = [8];
exports.modules = {

/***/ "cshl":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return WordCloud; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("cDcd");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var canvas__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("SrvH");
/* harmony import */ var canvas__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(canvas__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var d3_cloud__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("DXHa");
/* harmony import */ var d3_cloud__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(d3_cloud__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("YLtl");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__("b1qR");
/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(next_link__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__("nZwT");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_ant_design_icons__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _config_constant__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__("374s");

var __jsx = react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }








const layout = d3_cloud__WEBPACK_IMPORTED_MODULE_2___default()().size([330, 300]).canvas(() => Object(canvas__WEBPACK_IMPORTED_MODULE_1__["createCanvas"])(330, 300)).padding(2).rotate(() => ~~(Math.random() * 2) * 90).fontSize(d => d.size);
function WordCloud({
  title,
  tags
}) {
  if (!tags || !Object.keys(tags).length) return null;
  const {
    0: hoveringWord,
    1: setHoveringWord
  } = Object(react__WEBPACK_IMPORTED_MODULE_0__["useState"])('');
  let maxSize = 1;
  Object.values(tags).forEach(({
    value
  }) => {
    if (value > maxSize) {
      maxSize = value;
    }
  });
  const words = Object(react__WEBPACK_IMPORTED_MODULE_0__["useMemo"])(() => {
    //构建传入layout的words
    let result = [];
    Object.keys(tags).forEach(word => {
      const wordObj = tags[word];
      result.push(_objectSpread(_objectSpread({}, wordObj), {}, {
        text: word,
        size: Math.log(wordObj.value) * 4 / (Math.log(maxSize) - Math.log(1)) * 4 + 20
      }));
    });
    layout.words(result);
    layout.start();
    return result;
  }, []);
  return __jsx("div", null, __jsx("div", {
    className: "flex items-center",
    style: {
      padding: "12px 0"
    }
  }, __jsx(_ant_design_icons__WEBPACK_IMPORTED_MODULE_5__["SendOutlined"], null), __jsx("span", {
    className: "ml-1"
  }, title)), __jsx("svg", {
    width: "330",
    height: "300",
    className: "mx-auto md:m-0"
  }, __jsx("g", {
    transform: "translate(160, 150)"
  }, Object(lodash__WEBPACK_IMPORTED_MODULE_3__["sortBy"])(words, ['value']).map((word, index) => __jsx(next_link__WEBPACK_IMPORTED_MODULE_4___default.a, {
    as: `/tag/${word.text}`,
    href: "/tag/[tag]",
    key: word.text
  }, __jsx("text", {
    textAnchor: "middle",
    fill: hoveringWord === word.text ? '#1890ff' : _config_constant__WEBPACK_IMPORTED_MODULE_6__[/* COLORS */ "a"][index % 11],
    transform: `translate(${word.x}, ${word.y})rotate(${word.rotate})`,
    style: {
      fontSize: word.size
    },
    onMouseOver: () => setHoveringWord(word.text),
    onMouseLeave: () => setHoveringWord('')
  }, __jsx("a", null, word.text)))))));
}

/***/ })

};;