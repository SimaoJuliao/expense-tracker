import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { error: boolean; }

export class ChartErrorBoundary extends Component<Props, State> {
  state: State = { error: false };
  static getDerivedStateFromError(): State { return { error: true }; }
  render() {
    if (this.state.error) {
      return <p className="text-sm text-muted-foreground py-4 text-center">Chart unavailable</p>;
    }
    return this.props.children;
  }
}
