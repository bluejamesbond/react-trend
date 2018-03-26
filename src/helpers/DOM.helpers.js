import {
  moveToOpt,
  getDistanceBetween,
  checkForCollinearPoints,
} from './math.helpers';

export const buildLinearPath = data => (
  data.reduce((path, { x, y }, index) => {
    // The very first instruction needs to be a "move".
    // The rest will be a "line".
    const isFirstInstruction = index === 0;
    const instruction = isFirstInstruction ? 'M' : 'L';

    return `${path}${instruction} ${x},${y}\n`;
  }, '')
);

export const buildSmoothPath = (data, { radius }) => {
  let firstPoint = data[0];
  let points = Array(data.length);
  
  points[0] = `M ${firstPoint.x},${firstPoint.y}`;

  for (let i = 1, length = data.length; i < length; i++) {
    const point = data[i];
    const next = data[i + 1];
    const prev = data[i - 1] || firstPoint;

    const isCollinear = next && checkForCollinearPoints(prev, point, next);

    if (!next || isCollinear) {
      // The very last line in the sequence can just be a regular line.
      points[i] = `L ${point.x},${point.y}`;
      continue;
    }

    const distanceFromPrev = getDistanceBetween(prev, point);
    const distanceFromNext = getDistanceBetween(next, point);
    const threshold = Math.min(distanceFromPrev, distanceFromNext);

    const isTooCloseForRadius = (threshold / 2) < radius;

    const radiusForPoint = isTooCloseForRadius ? threshold / 2 : radius;

    const before = moveToOpt(prev, point, radiusForPoint);
    const after = moveToOpt(next, point, radiusForPoint);
    
    points[i] = `L ${before[0]},${before[1]}\nS ${point.x},${point.y} ${after[0]},${after[1]}`;
  }
  
  return points.join('\n');
};

// Taken from Khan Academy's Aphrodite
// https://github.com/Khan/aphrodite/blob/master/src/inject.js
let styleTag;
export const injectStyleTag = (cssContents) => {
  if (styleTag == null) {
    // Try to find a style tag with the `data-react-trend` attribute first.
    styleTag = document.querySelector('style[data-react-trend]');

    // If that doesn't work, generate a new style tag.
    if (styleTag == null) {
      // Taken from
      // http://stackoverflow.com/questions/524696/how-to-create-a-style-tag-with-javascript
      const head = document.head || document.getElementsByTagName('head')[0];
      styleTag = document.createElement('style');

      styleTag.type = 'text/css';
      styleTag.setAttribute('data-react-trend', '');
      head.appendChild(styleTag);
    }
  }

  styleTag.appendChild(document.createTextNode(cssContents));
};
