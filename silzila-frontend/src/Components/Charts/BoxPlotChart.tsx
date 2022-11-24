import ReactEcharts from "echarts-for-react";
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import {
	ChartControl,
	ChartControlsProps,
	ChartControlStateProps,
} from "../../redux/ChartPoperties/ChartControlsInterface";
import {
	ChartPropertiesProps,
	ChartPropertiesStateProps,
} from "../../redux/ChartPoperties/ChartPropertiesInterfaces";
import { formatChartYAxisValue } from "../ChartOptions/Format/NumberFormatter";
interface BoxPlotChartProps {
	propKey: string | number;
	graphDimension: any;
	chartArea?: any;
	graphTileSize: number;

	//state
	chartControlState: ChartControl;
	chartProperty: ChartPropertiesProps;
}

const BoxPlotChart = ({
	// props
	propKey,
	graphDimension,
	chartArea,
	graphTileSize,

	//state
	chartControlState,
	chartProperty,
}: BoxPlotChartProps) => {
	var chartControl: ChartControlsProps = chartControlState.properties[propKey];

	let chartData: any = chartControl.chartData ? chartControl.chartData.result : "";

	const [dimensionData, setDimensionData] = useState<any>([]);
	const [sourceData, setSourceData] = useState<any[]>([]);

	// to track  the axis swap and assign axis name accordingly
	const axisName1: string = chartControl.boxPlotChartControls.flipAxis ? "yAxis" : "xAxis";
	const axisName2: string = !chartControl.boxPlotChartControls.flipAxis ? "yAxis" : "xAxis";

	useEffect(() => {
		if (chartData) {
			// distribution value
			var dimValue: string =
				chartProperty.properties[propKey].chartAxes[1].fields[0].fieldname;

			var dimArray = chartData.map((el: any) => {
				return el[dimValue];
			});
			// setDimensionData([...new Set(dimArray)]);

			var measureValue = `${chartProperty.properties[propKey].chartAxes[3].fields[0].fieldname}__${chartProperty.properties[propKey].chartAxes[3].fields[0].agg}`;

			var arrayPoints: any[] = [];

			// getting array points

			// [...new Set(dimArray)].map(el => {
			// 	var temp = [];
			// 	chartData.map(elm => {
			// 		if (el === elm[dimValue]) {
			// 			// console.log(elm[measureValue], el);
			// 			temp.push(elm[measureValue]);
			// 		}
			// 	});

			// 	arrayPoints.push(temp);
			// });

			setSourceData(arrayPoints);
		}
	}, [chartData, chartControl]);

	const RenderChart = () => {
		return (
			<ReactEcharts
				opts={{ renderer: "svg" }}
				theme={chartControl.colorScheme}
				style={{
					padding: "5px",
					width: graphDimension.width,
					height: graphDimension.height,
					overflow: "hidden",
					margin: "auto",
					border: chartArea
						? "none"
						: graphTileSize
						? "none"
						: "1px solid rgb(238,238,238)",
				}}
				option={{
					animation: false,
					legend: {
						type: "scroll",
						show: chartControl.legendOptions?.showLegend,
						itemHeight: chartControl.legendOptions?.symbolHeight,
						itemWidth: chartControl.legendOptions?.symbolWidth,
						itemGap: chartControl.legendOptions?.itemGap,

						left: chartControl.legendOptions?.position?.left,
						top: chartControl.legendOptions?.position?.top,
						orient: chartControl.legendOptions?.orientation,
					},
					grid: {
						left: chartControl.chartMargin.left + "%",
						right: chartControl.chartMargin.right + "%",
						top: chartControl.chartMargin.top + "%",
						bottom: chartControl.chartMargin.bottom + "%",
					},

					tooltip: {
						show: chartControl.mouseOver.enable,
						trigger: "item",
						// just formating data to shown in tooltiop in required formate
						formatter: function (params: any) {
							if (params.seriesName === "boxplot") {
								return `${params.name} <br/> ${params.seriesName} <br/> <table>
								<th>

								<tr>
								<td align="left">min &nbsp</td>
								<td align="right">${params.value[1]}</td>
								</tr>

								<tr>
								<td align="left">Q1 &nbsp</td>
								<td align="right">${params.value[2]}</td>
								</tr>

								<tr>
								<td align="left">median &nbsp</td>
								<td align="right">${params.value[3]}</td>
								</tr>

								<tr>
								<td align="left">Q2 &nbsp</td>
								<td align="right">${params.value[4]}</td>
								</tr>

								<tr>
								<td align="left">max &nbsp</td>
								<td align="right">${params.value[5]}</td>
								</tr>

								</th>
								 </table>`;
							} else {
								return `${params.name} <br/> ${params.seriesName} <br/> ${params.value[1]}`;
							}
						},
					},

					dataset: [
						{
							source: sourceData,
						},
						{
							transform: {
								type: "boxplot",
								//to  show dimension value as axes value
								config: {
									itemNameFormatter: function (params: any) {
										return dimensionData[params.value];
									},
								},
								print: true,
							},
						},
						{
							fromDatasetIndex: 1,
							fromTransformResult: 1,
						},
					],

					[axisName1]: {
						type: "category",
						position: chartControl.axisOptions.xAxis.position,

						axisLine: {
							onZero: chartControl.axisOptions.xAxis.onZero,
						},

						show: chartControl.axisOptions.xAxis.showLabel,

						name: chartControl.axisOptions.xAxis.name,
						nameLocation: chartControl.axisOptions.xAxis.nameLocation,
						nameGap: chartControl.axisOptions.xAxis.nameGap,
						nameTextStyle: {
							fontSize: chartControl.axisOptions.xAxis.nameSize,
							color: chartControl.axisOptions.xAxis.nameColor,
						},

						axisTick: {
							alignWithLabel: true,
							length:
								chartControl.axisOptions.xAxis.position === "top"
									? chartControl.axisOptions.xAxis.tickSizeTop
									: chartControl.axisOptions.xAxis.tickSizeBottom,
						},
						axisLabel: {
							rotate:
								chartControl.axisOptions.xAxis.position === "top"
									? chartControl.axisOptions.xAxis.tickRotationTop
									: chartControl.axisOptions.xAxis.tickRotationBottom,
							margin:
								chartControl.axisOptions.xAxis.position === "top"
									? chartControl.axisOptions.xAxis.tickPaddingTop
									: chartControl.axisOptions.xAxis.tickPaddingBottom,
						},
					},
					[axisName2]: {
						type: "value",
						splitLine: {
							show: chartControl.axisOptions?.ySplitLine,
						},
						min: chartControl.axisOptions.axisMinMax.enableMin
							? chartControl.axisOptions.axisMinMax.minValue
							: null,
						max: chartControl.axisOptions.axisMinMax.enableMax
							? chartControl.axisOptions.axisMinMax.maxValue
							: null,
						inverse: chartControl.axisOptions.inverse,
						position: chartControl.axisOptions.yAxis.position,
						show: chartControl.axisOptions.yAxis.showLabel,

						name: chartControl.axisOptions.yAxis.name,
						nameLocation: chartControl.axisOptions.yAxis.nameLocation,
						nameGap: chartControl.axisOptions.yAxis.nameGap,
						nameTextStyle: {
							fontSize: chartControl.axisOptions.yAxis.nameSize,
							color: chartControl.axisOptions.yAxis.nameColor,
						},
						axisTick: {
							alignWithLabel: true,
							length:
								chartControl.axisOptions.yAxis.position === "left"
									? chartControl.axisOptions.yAxis.tickSizeLeft
									: chartControl.axisOptions.yAxis.tickSizeRight,
						},
						axisLabel: {
							rotate:
								chartControl.axisOptions.yAxis.position === "left"
									? chartControl.axisOptions.yAxis.tickRotationLeft
									: chartControl.axisOptions.yAxis.tickRotationRight,
							margin:
								chartControl.axisOptions.yAxis.position === "left"
									? chartControl.axisOptions.yAxis.tickPaddingLeft
									: chartControl.axisOptions.yAxis.tickPaddingRight,

							formatter: (value: any) => {
								var formattedValue = formatChartYAxisValue(chartControl, value);
								return formattedValue;
							},
						},
					},

					dataZoom: [
						{
							show: false,
							type: "slider",
							start: 0,
							end: 100,
							xAxisIndex: [0],
							top: "90%",
						},
					],
					series: [
						{
							name: "boxplot",
							type: "boxplot",
							datasetIndex: 1,
							colorBy: chartControl.boxPlotChartControls.colorBy,
							boxWidth: [
								chartControl.boxPlotChartControls.minBoxWidth,
								chartControl.boxPlotChartControls.maxBoxWidth,
							],
							itemStyle: {
								borderWidth: chartControl.boxPlotChartControls.boxborderWidth,
							},
						},
						{
							name: "outlier",
							type: "scatter",
							datasetIndex: 2,
						},
					],
				}}
			/>
		);
	};

	return <>{chartData ? <RenderChart /> : ""}</>;
};
const mapStateToProps = (state: ChartControlStateProps & ChartPropertiesStateProps) => {
	return {
		chartControlState: state.chartControls,
		chartProperty: state.chartProperties,
	};
};

export default connect(mapStateToProps, null)(BoxPlotChart);