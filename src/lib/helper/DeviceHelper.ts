export default class DeviceHelper {
  static get isTouchDevice(): boolean { return 'ontouchstart' in window; }

  static preventZoom() {
    document.on('touchmove', (e): void => {
      e = e.originalEvent || e;
      e.preventDefault();
    }, {passive : false});
  }
}
