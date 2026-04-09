import { add, distance, dot, float, Fn, hash, If, Loop, max, uv, vec2, vec3, vec4 } from 'three/tsl'

// Output a seed according to the grid position
// Different for each cell according to subdivision
const gridSeed = Fn(([ position, subdivision ]) =>
{
	return position.x.mod(subdivision).mul(subdivision).add(position.y.mod(subdivision))
})

// Output a [0-1] point position according to seed
const seedPoint = Fn(([ seed ]) =>
{
	return vec2(
		hash(seed),
		hash(seed.add(123.456)),
	)
})

const pointsDistance = Fn(([ pointA, pointB ]) =>
{
	// Euclidean
	return distance(pointA, pointB)

	//  // Manhattan
	// return add(
	// 	pointB.x.sub(pointA.x).abs(),
	// 	pointB.y.sub(pointA.y).abs()
	// )

	//  // Chebyshev
	// return max(
	// 	pointB.x.sub(pointA.x).abs(),
	// 	pointB.y.sub(pointA.y).abs()
	// )
})

// Convert seed to [0-1] range
export const normalizeSeed = Fn(([ seed, subdivision ]) =>
{
	return seed.div(subdivision.pow(2).sub(1))
})

// Voronoi
// - Grid-base
// - Repeating
export const voronoi = Fn(([position = uv(), subdivision = 1, seed = 0]) =>
{
	const gridPosition = position.mul(subdivision)
	const cellPosition = gridPosition.floor()
	
	// Closest point
	const pointPosition = vec2()
	const pointDistance = float(1e6)
	const pointSeed = float(0)

	// Second closest point (for edge distance)
	const secondPointPosition = vec2()
	const secondPointDistance = float(1e6)

	// Loop to check current cell and 8 neighbours
	Loop({ start: float(-1), end: float(1), type: 'float', condition: '<=', name: 'iX' }, ({ iX }) =>
	{
		Loop({ start: float(-1), end: float(1), type: 'float', condition: '<=', name: 'iY' }, ({ iY }) =>
		{
			const currentGridPosition = cellPosition.add(vec2(iX, iY))
			const currentPointSeed = gridSeed(currentGridPosition, subdivision)
			const currentPointPosition = currentGridPosition.add(seedPoint(currentPointSeed))
			const currentPointDistance = pointsDistance(currentPointPosition, gridPosition)

			If(currentPointDistance.lessThan(pointDistance), () =>
			{
				secondPointPosition.assign(pointPosition)
				secondPointDistance.assign(pointDistance)

				pointPosition.assign(currentPointPosition)
				pointDistance.assign(currentPointDistance)
				pointSeed.assign(currentPointSeed)
			}).ElseIf(currentPointDistance.lessThan(secondPointDistance), () =>
			{
				secondPointPosition.assign(currentPointPosition)
				secondPointDistance.assign(currentPointDistance)
			})
		})
	})

	// // Edge distance approximation
	// const edgeDistance = secondPointDistance.sub(pointDistance).abs()

	// Exact edge distance
	const direction = secondPointPosition.sub(pointPosition).normalize()
	const middlePoint = pointPosition.add(secondPointPosition).mul(0.5)
	const edgeDistance = dot(gridPosition.sub(middlePoint), direction).abs()

	return vec4(pointDistance, edgeDistance, pointSeed, 1)
})

