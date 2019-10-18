const N = 1000;
const MAX_DELAY = 5000;

const sum = x => {
	return x.reduce((a, b) => a + b, 0);
};

const mean = x => {
	return sum(x) / x.length;
};

const sem = (x, x_mean) => {
	const n = x.length;
	const sq_diffs = x.map(v => {
		const diff = v - x_mean;
		return diff * diff;
	});

	return Math.sqrt(sum(sq_diffs) / (n * (n - 1)));
};

const printMean = x => {
	const _mean = Math.round(mean(x) * 1000) / 1000;
	const _sem = Math.round(sem(x, _mean) * 1000) / 1000;
	return _mean + " ± " + _sem;
};

let delays = new Array(N).fill(0).map(v => MAX_DELAY * Math.random());
let spansTC = new Array(N);
let spansAA = new Array(N);

const away = (i, delay) => {
	return new Promise(resolve => {
		setTimeout(resolve.bind(null, i), delay);
	});
};

const tc = (i, delay) => {
	const startTC = performance.now();
	return away(i, delay)
		.then(i => {
			spansTC[i] = performance.now() - startTC - delay;
		})
		.catch(i => {
			console.error("TC error in " + i);
		});
};

const aa = async (i, delay) => {
	const startAA = performance.now();
	try {
		await away(i, delay);
		spansAA[i] = performance.now() - startAA - delay;
	} catch (error) {
		console.error("AA error in " + i);
	}
};

for (let i = 0; i < N; i++) {
	const delay = delays[i];
	[first, second] = delay <= MAX_DELAY / 2 ? [tc, aa] : [aa, tc];
	first(i, delays[i]);
	second(i, delays[i]);
}

setTimeout(() => {
	console.log("meanSpansTC: " + printMean(spansTC));
	console.log("meanSpansAA: " + printMean(spansAA));
}, MAX_DELAY + 500);