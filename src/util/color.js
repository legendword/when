export const textColor = (backgroundHex) => {
  // adopted from https://stackoverflow.com/questions/12043187/how-to-check-if-hex-color-is-too-black
  var c = backgroundHex.substring(1);
  var rgb = parseInt(c, 16);
  var r = (rgb >> 16) & 0xff;
  var g = (rgb >> 8) & 0xff;
  var b = (rgb >> 0) & 0xff;

  var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709

  const threshold = 180; // 0: darkest, 255: brightest
  if (luma < threshold) {
    // background is dark
    return "#ffffff";
  } else {
    return "#000000";
  }
};
