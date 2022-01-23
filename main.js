const points = [];
const pointRadius = 6;
let canvas, ctx, draggingPoint, equationContainer, coefs;
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function onLoad() {
	canvas = document.getElementById('canvas');
	canvas.width = 800;
	canvas.height = 800;
	ctx = canvas.getContext('2d');

	canvas.addEventListener('mousedown', canvasMouseDown);
	canvas.addEventListener('mouseup', canvasMouseUp);
	canvas.addEventListener('mousemove', canvasMouseMove);

	equationContainer = document.getElementById('equation-container');
}

function canvasMouseMove(event) {
	// console.log(event);
	const p = {
		x: event.layerX,
		y: event.layerY,
	};
	if (draggingPoint) {
		draggingPoint.x = p.x;
		draggingPoint.y = p.y;
		computeCoefs();
		paint();
	}
}

function canvasMouseDown(event) {
	const p = {
		x: event.layerX,
		y: event.layerY,
	};
	for (const point of points) {
		const d = dist(p, point);
		// console.log(d);
		if (d < pointRadius) {
			draggingPoint = point;
			break;
		}
	}
}

function canvasMouseUp(event) {
	const p = {
		x: event.layerX,
		y: event.layerY,
	};
	if (draggingPoint) {
		// console.log('dragging', draggingPoint);
		draggingPoint.x = p.x;
		draggingPoint.y = p.y;
		draggingPoint = null;
	} else {
		points.push(p);
	}

	computeCoefs();
	paint();

	if (coefs) {
		const secs = 2;
		const arrayBuffer = audioCtx.createBuffer(
			1,
			audioCtx.sampleRate * secs,
			audioCtx.sampleRate
		);

		const audioSource = audioCtx.createBufferSource();
		audioSource.buffer = arrayBuffer;
		audioSource.connect(audioCtx.destination);
		audioSource.start();

		const buffer = arrayBuffer.getChannelData(0);
		let i = 0;
		for (let x = 0; x < canvas.width; x += canvas.width / arrayBuffer.length) {
			const a =
				(i * 2 * Math.PI * (canvas.height - f(x))) / audioCtx.sampleRate;
			buffer[i++] = Math.sin(a);
		}
		// console.log(buffer);
	}
}

function paint() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	ctx.fillStyle = '#00a';
	for (const point of points) {
		ctx.beginPath();
		ctx.arc(point.x, point.y, pointRadius, 0, 2 * Math.PI);
		ctx.fill();
	}
	if (coefs) {
		for (const r of coefs) {
			if (isNaN(r)) {
				return;
			}
		}
		// console.log(coefs);

		ctx.strokeStyle = '#000';
		ctx.beginPath();
		for (let x = 0; x < canvas.width; x++) {
			const y = f(x);
			if (x == 0) {
				ctx.moveTo(x, y);
			} else {
				ctx.lineTo(x, y);
			}
			// console.log(x, y);
		}
		ctx.stroke();

		let html = '<span class="variable">y</span> = ';
		for (let i = 0; i < coefs.length; i++) {
			let coef = -coefs[i][0];
			if (i == coefs.length - 1) {
				coef += canvas.height;
			}
			if (coef == 0) {
				continue;
			}
			const sign = Math.sign(coef);
			if (i > 0 || sign < 0) {
				html += `<span class="sign">${sign < 0 ? '-' : '+'}</span>`;
			}
			let magnitude = 0;
			if (Math.abs(coef) < 0.1) {
				// console.log('coef', coef);
				do {
					magnitude++;
					// console.log(magnitude, coef.toFixed(magnitude));
				} while (
					parseFloat(
						Math.abs(coef)
							.toString()
							.substring(0, magnitude + 2)
					) == 0
				);
				// const adjusted = coef * Math.pow(10, magnitude);
				// console.log('magnitude', coef, magnitude, adjusted.toFixed(2));
			}
			html += Math.abs(coef).toFixed(magnitude + 2);
			const pow = coefs.length - i - 1;
			if (pow > 0) {
				html += '<span class="variable">x</span>';
				if (pow > 1) {
					html += `<span class="exponent">${pow}</span>`;
				}
			}
		}
		equationContainer.innerHTML = html;
	}
}

function dist(p1, p2) {
	const dx = p1.x - p2.x;
	const dy = p1.y - p2.y;
	return Math.sqrt(dx * dx + dy * dy);
}

function computeCoefs() {
	if (points.length > 1) {
		const m1 = matMake(points.length, points.length);
		for (let i = 0; i < m1.length; i++) {
			for (let j = 0; j < m1.length; j++) {
				m1[i][m1.length - j - 1] = Math.pow(points[i].x, j);
			}
		}
		// console.log(m1);
		const m2 = matMake(points.length, 1);
		for (let i = 0; i < m2.length; i++) {
			m2[i][0] = points[i].y;
		}
		// console.log(m2);
		const m1Inv = matInverse(m1);
		coefs = matProduct(m1Inv, m2);
	}
}

function f(x) {
	let y = 0;
	for (let i = 0; i < coefs.length; i++) {
		y += coefs[i][0] * Math.pow(x, coefs.length - i - 1);
	}
	return y;
}
