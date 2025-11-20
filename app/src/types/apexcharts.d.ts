declare module 'apexcharts' {
  export interface ApexOptions {
    chart?: any;
    plotOptions?: any;
    colors?: any;
    series?: any;
    xaxis?: any;
    yaxis?: any;
    stroke?: any;
    grid?: any;
    markers?: any;
    tooltip?: any;
    fill?: any;
    labels?: any;
    legend?: any;
    title?: any;
    subtitle?: any;
    dataLabels?: any;
  }
}

declare module 'react-apexcharts' {
  import { ApexOptions } from 'apexcharts';
  import React from 'react';

  interface Props {
    type?: string;
    series: any;
    width?: string | number;
    height?: string | number;
    options?: ApexOptions;
  }

  export default class ReactApexChart extends React.Component<Props> {}
}
