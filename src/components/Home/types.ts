import { Vector3 } from 'three';

export interface Partner {
  image: string;
  description: string;
  location: string;
  soon?: boolean;
  coords: Vector3;
}

export interface Props {
  partners: Array<Partner>;
}
