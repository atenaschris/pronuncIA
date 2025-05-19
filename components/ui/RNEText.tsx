import { Text, TextProps } from '@rneui/themed';
import React from 'react';

export type RNETextProps = TextProps;

/**
 * Base React Native Elements Text component
 */
export function RNEText({ style, ...rest }: RNETextProps) {
  return <Text style={[{ textAlign: 'center' }, style]} {...rest} />;
}

/**
 * Props specific to H1 heading component
 */
export interface H1Props extends Omit<RNETextProps, 'h1' | 'h1Style' | 'h2' | 'h2Style' | 'h3' | 'h3Style' | 'h4' | 'h4Style' | 'h5' | 'h5Style' | 'h6' | 'h6Style'> {
  style?: RNETextProps['h1Style'];
}

/**
 * H1 heading component with predefined styles
 */
export function H1({ style, ...rest }: H1Props) {
  return <RNEText h1 h1Style={style} {...rest} />;
}

/**
 * Props specific to H2 heading component
 */
export interface H2Props extends Omit<RNETextProps, 'h1' | 'h1Style' | 'h2' | 'h2Style' | 'h3' | 'h3Style' | 'h4' | 'h4Style' | 'h5' | 'h5Style' | 'h6' | 'h6Style'> {
  style?: RNETextProps['h2Style'];
}

/**
 * H2 heading component with predefined styles
 */
export function H2({ style, ...rest }: H2Props) {
  return <RNEText h2 h2Style={style} {...rest} />;
}

/**
 * Props specific to H3 heading component
 */
export interface H3Props extends Omit<RNETextProps, 'h1' | 'h1Style' | 'h2' | 'h2Style' | 'h3' | 'h3Style' | 'h4' | 'h4Style' | 'h5' | 'h5Style' | 'h6' | 'h6Style'> {
  style?: RNETextProps['h3Style'];
}

/**
 * H3 heading component with predefined styles
 */
export function H3({ style, ...rest }: H3Props) {
  return <RNEText h3 h3Style={style} {...rest} />;
}

/**
 * Props specific to H4 heading component
 */
export interface H4Props extends Omit<RNETextProps, 'h1' | 'h1Style' | 'h2' | 'h2Style' | 'h3' | 'h3Style' | 'h4' | 'h4Style' | 'h5' | 'h5Style' | 'h6' | 'h6Style'> {
  style?: RNETextProps['h4Style'];
}

/**
 * H4 heading component with predefined styles
 */
export function H4({ style, ...rest }: H4Props) {
  return <RNEText h4 h4Style={style} {...rest} />;
}

/**
 * Props specific to H5 heading component
 */
export interface H5Props extends Omit<RNETextProps, 'h1' | 'h1Style' | 'h2' | 'h2Style' | 'h3' | 'h3Style' | 'h4' | 'h4Style' | 'h5' | 'h5Style' | 'h6' | 'h6Style'> {
  style?: RNETextProps['h5Style'];
}

/**
 * H5 heading component with predefined styles
 */
export function H5({ style, ...rest }: H5Props) {
  return <RNEText h5 h5Style={style} {...rest} />;
}

/**
 * Props specific to H6 heading component
 */
export interface H6Props extends Omit<RNETextProps, 'h1' | 'h1Style' | 'h2' | 'h2Style' | 'h3' | 'h3Style' | 'h4' | 'h4Style' | 'h5' | 'h5Style' | 'h6' | 'h6Style'> {
  style?: RNETextProps['h6Style'];
}

/**
 * H6 heading component with predefined styles
 */
export function H6({ style, ...rest }: H6Props) {
  return <RNEText h6 h6Style={style} {...rest} />;
}