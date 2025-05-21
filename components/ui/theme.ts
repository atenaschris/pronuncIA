import { createTheme, TextProps } from '@rneui/themed';

// Create the theme with both light and dark mode configurations
export const theme = createTheme({
  lightColors: {
    primary: '#0a7ea4',
    secondary: '#4ecdc4',
    background: '#ffffff',
    white: '#ffffff',
    black: '#000000',
    grey0: '#393e42',
    grey1: '#43484d',
    grey2: '#5e6977',
    grey3: '#86939e',
    grey4: '#bdc6cf',
    grey5: '#e1e8ee',
    greyOutline: '#bbb',
    searchBg: '#f5f5f5',
    success: '#52c41a',
    error: '#ff190c',
    warning: '#faad14',
    disabled: 'hsl(208, 8%, 90%)',
  },
  darkColors: {
    primary: '#2196f3',
    secondary: '#00bcd4',
    background: '#121212',
    white: '#ffffff',
    black: '#000000',
    grey0: '#fafafa',
    grey1: '#f5f5f5',
    grey2: '#eeeeee',
    grey3: '#e0e0e0',
    grey4: '#bdbdbd',
    grey5: '#9e9e9e',
    greyOutline: '#757575',
    searchBg: '#1e1e1e',
    success: '#4caf50',
    error: '#f44336',
    warning: '#ff9800',
    disabled: 'hsl(208, 8%, 30%)',
  },
  components: {
    Button: {
      buttonStyle: {
        borderRadius: 30,
        paddingVertical: 12,
        paddingHorizontal: 24,
      },
      titleStyle: {
        fontWeight: 'bold',
      },
    },
    Card: {
      containerStyle: {
        borderRadius: 12,
        padding: 16,
      },
    },
    Input: {
      inputContainerStyle: {
        borderBottomWidth: 1,
      },
    },
    Text: (props: TextProps) => ({
      style: {
        fontSize: props.h1 ? 32
          : props.h2 ? 28
          : props.h3 ? 24
          : props.h4 ? 20
          : props.h5 ? 16
          : props.h6 ? 14
          : undefined,
        ...(props.h5Style as object || {}),
        ...(props.h6Style as object || {}),
      textAlign: 'center',
      }
    })
  },
});
