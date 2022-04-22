import formatDate from 'utils/formatDate';
import { render, screen } from 'utils/test-utils';
import MyDate, { MyDateProps } from './MyDate';

describe('MyDate', () => {
  const setup = (props: Partial<MyDateProps> = {}) => {
    const initialProps: MyDateProps = {
      date: '2020-12-29 13:10:40',
    };
    const utils = render(<MyDate {...initialProps} {...props} />);
    return {
      initialProps,
      ...utils,
    };
  };

  it('renders properly', () => {
    const { initialProps } = setup();
    const { date } = initialProps;
    expect(screen.getByText(formatDate(date))).toBeInTheDocument();
    expect(
      screen.getByText(formatDate(date, { type: 'short' }))
    ).toBeInTheDocument();
  });
});