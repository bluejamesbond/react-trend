import { moveToOpt, getDistanceBetween, checkForCollinearPoints } from './math.helpers';

export var buildLinearPath = function buildLinearPath(data) {
  return data.reduce(function (path, _ref, index) {
    var x = _ref.x,
        y = _ref.y;

    // The very first instruction needs to be a "move".
    // The rest will be a "line".
    var isFirstInstruction = index === 0;
    var instruction = isFirstInstruction ? 'M' : 'L';

    return '' + path + instruction + ' ' + x + ',' + y + '\n';
  }, '');
};

export var buildSmoothPath = function buildSmoothPath(data, _ref2) {
  var radius = _ref2.radius;

  var firstPoint = data[0];
  var points = Array(data.length);

  points[0] = 'M ' + firstPoint.x + ',' + firstPoint.y;

  for (var i = 1, length = data.length; i < length; i++) {
    var next = data[i + 1];
    var prev = data[i - 1] || firstPoint;

    var isCollinear = next && checkForCollinearPoints(prev, point, next);

    if (!next || isCollinear) {
      // The very last line in the sequence can just be a regular line.
      points[i] = 'L ' + point.x + ',' + point.y;
      continue;
    }

    var distanceFromPrev = getDistanceBetween(prev, point);
    var distanceFromNext = getDistanceBetween(next, point);
    var threshold = Math.min(distanceFromPrev, distanceFromNext);

    var isTooCloseForRadius = threshold / 2 < radius;

    var radiusForPoint = isTooCloseForRadius ? threshold / 2 : radius;

    var before = moveToOpt(prev, point, radiusForPoint);
    var after = moveToOpt(next, point, radiusForPoint);

    points[i] = 'L ' + before[0] + ',' + before[1] + '\nS ' + point.x + ',' + point.y + ' ' + after[0] + ',' + after[1];
  }

  return points.join('\n');
};

// Taken from Khan Academy's Aphrodite
// https://github.com/Khan/aphrodite/blob/master/src/inject.js
var styleTag = void 0;
export var injectStyleTag = function injectStyleTag(cssContents) {
  if (styleTag == null) {
    // Try to find a style tag with the `data-react-trend` attribute first.
    styleTag = document.querySelector('style[data-react-trend]');

    // If that doesn't work, generate a new style tag.
    if (styleTag == null) {
      // Taken from
      // http://stackoverflow.com/questions/524696/how-to-create-a-style-tag-with-javascript
      var head = document.head || document.getElementsByTagName('head')[0];
      styleTag = document.createElement('style');

      styleTag.type = 'text/css';
      styleTag.setAttribute('data-react-trend', '');
      head.appendChild(styleTag);
    }
  }

  styleTag.appendChild(document.createTextNode(cssContents));
};