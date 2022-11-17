import NextImage from 'next/image';
import { chakra } from '@chakra-ui/react';

export const Image = chakra(NextImage, {
  baseStyle: { objectFit: 'cover' },
  shouldForwardProp: (prop) => ['width', 'height', 'src', 'alt', 'quality', 'placeholder', 'blurDataURL', 'loader', 'fill'].includes(prop),
});
