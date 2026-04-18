export function getCameraFocusPosition({ cameraPosition, targetPosition, node }) {
	const x = node?.x ?? 0;
	const y = node?.y ?? 0;
	const z = node?.z ?? 0;
	const currentCamera = cameraPosition ?? { x: 0, y: 0, z: 620 };
	const currentTarget = targetPosition ?? { x: 0, y: 0, z: 0 };
	const delta = {
		x: currentCamera.x - currentTarget.x,
		y: currentCamera.y - currentTarget.y,
		z: currentCamera.z - currentTarget.z,
	};

	return {
		x: x + delta.x,
		y: y + delta.y,
		z: z + delta.z,
	};
}
