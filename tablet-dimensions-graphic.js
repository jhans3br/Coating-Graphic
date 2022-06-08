import { LitElement, html, css } from 'lit-element';
import { connect } from 'pwa-helpers/connect-mixin.js';
import { store } from '../features/store/store.js';
import {tabletLengthCupRadius} from '../features/tablet/tablet-computed-state.js';

// SVG Path function
const svg = {
  // padding around the edge of svg
  padding: 1.5,
  // the end cap of the dimension line
  cap: 2,
  // target width of svg
  width: 24,
  height: 18,
  // max length of tablet
  // we use 0.02 meters = 20 mm;
  maxHeight: 0.02,
  // scale: 1050,
  // the value to multiple other dimensions by to scale
  get scale() {
    return (this.height - 2 * this.padding) / this.maxHeight;
  },
  // center starting point
  get centerX() {
    return this.width / 2;
  },
  // center starting point
  get centerY() {
    return this.height / 2;
  },
};
const computePathTopTablet = (shape, width, length) => {
  let path;

  switch (shape) {
    case 'round':
      // Path is designed to fit in a 50 by 50 pixel box
      // scale is used to shrink or grow the value as needed
      // to draw the tablet we use radius so we scale it and divide by 2
      const scaledRadius = (length / 2) * svg.scale;
      // TOP VIEW
      path =
        `m ${svg.centerX} ${svg.centerY} m ${scaledRadius} 0` +
        ` a ${scaledRadius} ${scaledRadius} 0 0 0 ${-scaledRadius * 2} 0` +
        ` a ${scaledRadius} ${scaledRadius} 0 0 0 ${scaledRadius * 2} 0 z`;
      break;

    case 'oval':
      // Path is designed to fit in a 50 by 50 pixel box
      // scale is used to shrink or grow the value as needed
      // to draw the tablet we use radius so we scale it and divide by 2
      const r1 = (length / 2) * svg.scale;
      const r2 = (width / 2) * svg.scale;
      // TOP VIEW
      path =
        `m ${svg.centerX} ${svg.centerY} m ${r1} 0` +
        ` a ${r1} ${r2} 0 0 0 ${-r1 * 2} 0` +
        ` a ${r1} ${r2} 0 0 0 ${r1 * 2} 0 z`;
      break;

    case 'caplet':
      // Path is designed to fit in a 50 by 50 pixel box
      // scale is used to shrink or grow the value as needed
      const scaledWidth = width * svg.scale;
      const scaledBody = (length - width) * svg.scale;

      path =
        `m ${svg.centerX} ${svg.centerY} m ${scaledBody / 2} ${
          scaledWidth / 2
        } l ${-scaledBody} 0` +
        ` a ${scaledWidth / 2} ${
          scaledWidth / 2
        } 0 0 1 0 ${-scaledWidth} l ${scaledBody} 0` +
        ` a ${scaledWidth / 2} ${scaledWidth / 2} 0 0 1 0 ${scaledWidth} z`;
      break;
  }

  return path;
};
const computePathTopLine = (line, shape, width, length) => {
  switch (line) {
    case 'width':
      return computePathWidthLine(length, width);
    case 'length':
      return computePathLengthLine(shape, length, width);
    default:
      return '';
  }
};
const computePathLengthLine = (shape, length, width) => {
  if (shape === 'round') {
    width = length;
  }

  const scaledLength = length * svg.scale;
  const scaledWidth = width * svg.scale;

  return (
    `M ${svg.centerX - scaledLength / 2} ${
      svg.centerY + scaledWidth / 2 + svg.padding
    } l 0 ${svg.cap} m 0 ${-svg.cap / 2} l ${scaledLength} 0` +
    ` m 0 ${-svg.cap / 2} l 0 ${svg.cap}`
  );
};
const computePathWidthLine = (length, width) => {
  const scaledLength = length * svg.scale;
  const scaledWidth = width * svg.scale;

  return (
    `M ${svg.centerX + scaledLength / 2 + svg.padding} ${
      svg.centerY - scaledWidth / 2
    } l ${svg.cap} 0` +
    ` m ${-svg.cap / 2} 0` +
    ` l 0 ${scaledWidth} m ${svg.cap / 2} 0` +
    ` l ${-svg.cap} 0`
  );
};
const computePathSideTablet = (shape, length, cupRadius, bandThickness) => {
  const scaledLength = length * svg.scale;
  const scaledBand = bandThickness * svg.scale;
  const scaledCup = cupRadius * svg.scale;

  // TOP ARC
  return (
    `m ${svg.centerX} ${svg.centerY} m ${-scaledLength / 2} ${
      -scaledBand / 2
    } a ${scaledCup} ${scaledCup} 0 0 1 ${scaledLength} 0` +
    ` l 0 ${scaledBand} a ${scaledCup} ${scaledCup} 0 0 1 ${-scaledLength} 0` +
    ` l 0 ${-scaledBand} l ${scaledLength} 0` +
    ` m 0 ${scaledBand} l ${-scaledLength} 0`
  );
};
const computePathSideLine = (line, totalThickness, bandThickness, length) => {
  switch (line) {
    case 'total':
      return computePathThicknessLine(totalThickness, length);
    case 'band':
      return computePathThicknessLine(bandThickness, length);
    default:
      return '';
  }
};
const computePathThicknessLine = (thickness, length) => {
  // Path is designed to fit in a 50 by 50 pixel box
  // scale is used to shrink or grow the value as needed
  // to draw the tablet we use radius so we scale it and divide by 2

  const scaledLength = length * svg.scale;
  const scaledThickness = thickness * svg.scale;

  return (
    `M ${svg.centerX + scaledLength / 2 + svg.padding} ${
      svg.centerY - scaledThickness / 2
    } l ${svg.cap} 0` +
    ` m ${-svg.cap / 2} 0` +
    ` l 0 ${scaledThickness} m ${svg.cap / 2} 0` +
    ` l ${-svg.cap} 0`
  );
};
const computePathCupThicknessLine = (cup, total, length) => {
  // Path is designed to fit in a 50 by 50 pixel box
  // scale is used to shrink or grow the value as needed
  // to draw the tablet we use radius so we scale it and divide by 2

  const scaledLength = length * svg.scale;
  const scaledTotal = total * svg.scale;
  const scaledCup = cup * svg.scale;

  return (
    `M ${svg.centerX + scaledLength / 2 + svg.padding} ${
      svg.centerY - scaledTotal / 2
    } l ${svg.cap} 0` +
    ` m ${-svg.cap / 2} 0` +
    ` l 0 ${scaledCup} m ${svg.cap / 2} 0` +
    ` l ${-svg.cap} 0`
  );
};

class TabletDimensionsGraphic extends connect(store)(LitElement) {
  static get properties() {
    return {
      line: { type: String },
      lengthCupRadius: { type: Number, attribute: false }
    };
  }

  stateChanged(state) {
    this.shape = state.tablet.shape;
    this.length = state.tablet.length;
    this.width = state.tablet.width;
    this.totalThickness = state.tablet.totalThickness;
    this.lengthCupRadius = tabletLengthCupRadius(state);
    this.bandThickness = state.tablet.bandThickness;
  }

  static get styles() {
    return css`
      :host {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 24px;
        align-items: center;
        justify-content: space-around;
        min-height: 200px;
        --tablet-fill-color: var(--app-light-color);
        --tablet-outline-color: var(--app-primary-color);
        --tablet-opacity: 0.8;
      }
      .tablet-graphic {
        align-self: end;
        height: 100%;
        max-height: 196px;
        width: 100%;
        fill: var(--tablet-fill-color);
        fill-opacity: var(--tablet-opacity, 0.8);
        stroke: var(--tablet-outline-color);
        stroke-width: 0.35px;
        stroke-linejoin: round;
      }
      .label {
        font-size: 16px;
        color: var(--text-light-color);
        align-self: start;
        justify-self: center;
        white-space: nowrap;
      }
    `;
  }

  render() {
    return html`
      <svg class="tablet-graphic" viewbox="0 0 24 18">
        <path
          d=${computePathTopTablet(
            this.shape,
            this.width,
            this.length
          )}
        ></path>
        <path
          d=${computePathTopLine(
            this.line,
            this.shape,
            this.width,
            this.length
          )}
        ></path>
      </svg>
      <svg class="tablet-graphic" viewbox="0 0 24 18">
        <path
          d=${computePathSideTablet(
            this.shape,
            this.length,
            this.lengthCupRadius,
            this.bandThickness
          )}
        ></path>
        <path
          d=${computePathSideLine(
            this.line,
            this.totalThickness,
            this.bandThickness,
            this.length
          )}
        ></path>
      </svg>
      <div class="label">Top View</div>
      <div class="label">Side View</div>
    `;
  }
}

customElements.define('tablet-dimensions-graphic', TabletDimensionsGraphic);
