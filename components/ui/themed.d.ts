import '@rneui/themed';

declare module '@rneui/themed' {
  export interface TextProps {
    h5?: boolean;
    h6?: boolean;
    h5Style?: TextProps['style'];
    h6Style?: TextProps['style'];
  }

  export interface ComponentTheme {
    Text: Partial<TextProps>;
  }
}