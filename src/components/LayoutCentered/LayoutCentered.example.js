import LayoutCentered from './LayoutCentered';

// Example content only, the layout itself renders no text.
const Content = () => (
  <div style={{ background: 'white', border: '1px solid #ddd', borderRadius: 8, padding: 24 }}>
    Example
  </div>
);

const topbar = <div style={{ height: 48, background: 'white' }} />;

export const Narrow = {
  component: LayoutCentered,
  props: { variant: 'narrow', topbar, children: <Content /> },
  group: 'layouts',
};

export const Form = {
  component: LayoutCentered,
  props: { variant: 'form', topbar, children: <Content /> },
  group: 'layouts',
};

export const Wide = {
  component: LayoutCentered,
  props: { variant: 'wide', topbar, children: <Content /> },
  group: 'layouts',
};
