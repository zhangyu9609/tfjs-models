/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

import * as tf from '@tensorflow/tfjs-core';

// The hand bounding box.
export type Box = {
  startPoint: [number, number],
  endPoint: [number, number],
  landmarks?: Array<[number, number]>
};

export function getBoxSize(box: Box): [number, number] {
  return [
    Math.abs(box.endPoint[0] - box.startPoint[0]),
    Math.abs(box.endPoint[1] - box.startPoint[1])
  ];
}

export function getBoxCenter(box: Box): [number, number] {
  return [
    box.startPoint[0] + (box.endPoint[0] - box.startPoint[0]) / 2,
    box.startPoint[1] + (box.endPoint[1] - box.startPoint[1]) / 2
  ];
}

export function cutBoxFromImageAndResize(
    box: Box, image: tf.Tensor4D, cropSize: [number, number]): tf.Tensor4D {
  const h = image.shape[1];
  const w = image.shape[2];

  const boxes = [[
    box.startPoint[1] / h, box.startPoint[0] / w, box.endPoint[1] / h,
    box.endPoint[0] / w
  ]];

  return tf.image.cropAndResize(image, boxes, [0], cropSize);
}

export function scaleBoxCoordinates(box: Box, factor: [number, number]): Box {
  const startPoint: [number, number] =
      [box.startPoint[0] * factor[0], box.startPoint[1] * factor[1]];
  const endPoint: [number, number] =
      [box.endPoint[0] * factor[0], box.endPoint[1] * factor[1]];
  const landmarks: Array<[number, number]> =
      box.landmarks.map((coord: [number, number]) => {
        const scaledCoord: [number, number] =
            [coord[0] * factor[0], coord[1] * factor[1]];
        return scaledCoord;
      });

  return {startPoint, endPoint, landmarks};
}

export function enlargeBox(box: Box, factor = 1.5): Box {
  const center = getBoxCenter(box);
  const size = getBoxSize(box);

  const newSize = [factor * size[0] / 2, factor * size[1] / 2];
  const startPoint: [number, number] =
      [center[0] - newSize[0], center[1] - newSize[1]];
  const endPoint: [number, number] =
      [center[0] + newSize[0], center[1] + newSize[1]];

  return {startPoint, endPoint, landmarks: box.landmarks};
}
