interface PaintOptions {
  xPos?: number;
  yPos?: number;
}

function paintShape(opts: PaintOptions) {
  console.log('bbb' + opts.xPos);
}

export default paintShape;
