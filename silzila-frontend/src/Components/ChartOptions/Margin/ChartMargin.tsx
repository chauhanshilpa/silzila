// This component is used to set margin for all charts
// Top, bottom, lift & right margins can be individually changed

import React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import {
	updateCalendarStyleOptions,
	updateChartMargins,
} from "../../../redux/ChartPoperties/ChartControlsActions";
import {
	ChartControl,
	ChartControlStateProps,
} from "../../../redux/ChartPoperties/ChartControlsInterface";
import {
	ChartPropertiesProps,
	ChartPropertiesStateProps,
} from "../../../redux/ChartPoperties/ChartPropertiesInterfaces";

import {
	TabTileStateProps,
	TabTileStateProps2,
} from "../../../redux/TabTile/TabTilePropsInterfaces";
import { MinMaxProps } from "../Legend/ChartLegend";
import SliderWithInput from "../SliderWithInput";

interface ChartMarginProps {
	chartControl: ChartControl;
	tabTileProps: TabTileStateProps;
	chartProperties: ChartPropertiesProps;

	updateMargin: (propKey: number | string, option: string, value: any) => void;
	updateCalendarStyleOptions: (propKey: number | string, option: string, value: any) => void;
}

const ChartMargin = ({
	// state
	chartControl,
	tabTileProps,
	chartProperties,

	// dispatch
	updateMargin,
	updateCalendarStyleOptions,
}: ChartMarginProps) => {
	var propKey: number = parseFloat(
		`${tabTileProps.selectedTabId}.${tabTileProps.selectedTileId}`
	);

	const marginMinMax: MinMaxProps = { min: 0, max: 50, step: 1 };

	const marginOptionsForCharts = () => {
		switch (chartProperties.properties[propKey].chartType) {
			case "pie":
			case "gauge":
				return (
					<React.Fragment>
						<div className="optionDescription">RADIUS:</div>
						<SliderWithInput
							percent={true}
							sliderValue={chartControl.properties[propKey].chartMargin.radius}
							sliderMinMax={{
								min: 10,
								max: 100,
								step: 1,
							}}
							changeValue={value => {
								updateMargin(propKey, "radius", value);
							}}
						/>
					</React.Fragment>
				);

			case "donut":
			case "rose":
				return (
					<React.Fragment>
						<div className="optionDescription">INNER RADIUS:</div>
						<SliderWithInput
							percent={true}
							sliderValue={chartControl.properties[propKey].chartMargin.innerRadius}
							sliderMinMax={{
								min: 0,
								max: 90,
								step: 1,
							}}
							changeValue={value => {
								updateMargin(propKey, "innerRadius", value);
							}}
						/>
						<div className="optionDescription">OUTER RADIUS:</div>
						<SliderWithInput
							percent={true}
							sliderValue={chartControl.properties[propKey].chartMargin.outerRadius}
							sliderMinMax={{
								min: 10,
								max: 100,
								step: 1,
							}}
							changeValue={value => {
								updateMargin(propKey, "outerRadius", value);
							}}
						/>
					</React.Fragment>
				);

			case "funnel":
				return (
					<React.Fragment>
						<div className="optionDescription">MARGIN RESIZE:</div>
						<div className="optionDescription">Top:</div>
						<SliderWithInput
							percent={true}
							sliderValue={chartControl.properties[propKey].chartMargin.top}
							sliderMinMax={marginMinMax}
							changeValue={value => updateMargin(propKey, "top", value)}
						/>
						<div className="optionDescription">Bottom:</div>
						<SliderWithInput
							percent={true}
							sliderValue={chartControl.properties[propKey].chartMargin.bottom}
							sliderMinMax={marginMinMax}
							changeValue={value => updateMargin(propKey, "bottom", value)}
						/>
						<div className="optionDescription">Left:</div>
						<SliderWithInput
							percent={true}
							sliderValue={chartControl.properties[propKey].chartMargin.funnelLeft}
							sliderMinMax={marginMinMax}
							changeValue={value => updateMargin(propKey, "funnelLeft", value)}
						/>
						<div className="optionDescription">Right:</div>
						<SliderWithInput
							percent={true}
							sliderValue={chartControl.properties[propKey].chartMargin.funnelRight}
							sliderMinMax={marginMinMax}
							changeValue={value => updateMargin(propKey, "funnelRight", value)}
						/>
					</React.Fragment>
				);
			case "calendar":
				return (
					<React.Fragment>
						<div className="optionDescription">MARGIN RESIZE:</div>
						<div className="optionDescription">Calender Height:</div>
						<SliderWithInput
							percent={true}
							sliderValue={chartControl.properties[propKey].chartMargin.top}
							sliderMinMax={{ min: 10, max: 80, step: 1 }}
							changeValue={value => updateMargin(propKey, "top", value)}
						/>

						<div className="optionDescription">Right:</div>
						<SliderWithInput
							percent={true}
							sliderValue={chartControl.properties[propKey].chartMargin.right}
							sliderMinMax={{ min: 10, max: 100, step: 1 }}
							changeValue={value => updateMargin(propKey, "right", value)}
						/>
						<div className="optionDescription">Left:</div>
						<SliderWithInput
							percent={true}
							sliderValue={chartControl.properties[propKey].chartMargin.left}
							sliderMinMax={{ min: 10, max: 100, step: 1 }}
							changeValue={value => updateMargin(propKey, "left", value)}
						/>
						<div className="optionDescription">Calendar gap</div>
						<SliderWithInput
							percent={true}
							sliderValue={
								chartControl.properties[propKey].calendarStyleOptions.calendarGap
							}
							sliderMinMax={{ min: 10, max: 80, step: 1 }}
							changeValue={value =>
								updateCalendarStyleOptions(propKey, "calendarGap", value)
							}
						/>
					</React.Fragment>
				);
			case "multibar":
			case "stackedBar":
			case "line":
			case "area":
			case "scatterPlot":
			case "heatmap":
			case "crosstab":
			case "boxPlot":
			case "treeMap":
			case "sankey":
				return (
					<React.Fragment>
						<div className="optionDescription">MARGIN RESIZE:</div>
						<div className="optionDescription">Top:</div>
						<SliderWithInput
							percent={true}
							sliderValue={chartControl.properties[propKey].chartMargin.top}
							sliderMinMax={marginMinMax}
							changeValue={(value: number) => updateMargin(propKey, "top", value)}
						/>
						<div className="optionDescription">Right:</div>
						<SliderWithInput
							percent={true}
							sliderValue={chartControl.properties[propKey].chartMargin.right}
							sliderMinMax={marginMinMax}
							changeValue={(value: number) => updateMargin(propKey, "right", value)}
						/>
						<div className="optionDescription"> Bottom:</div>
						<SliderWithInput
							percent={true}
							sliderValue={chartControl.properties[propKey].chartMargin.bottom}
							sliderMinMax={marginMinMax}
							changeValue={(value: number) => updateMargin(propKey, "bottom", value)}
						/>
						<div className="optionDescription">Left:</div>
						<SliderWithInput
							percent={true}
							sliderValue={chartControl.properties[propKey].chartMargin.left}
							sliderMinMax={marginMinMax}
							changeValue={(value: number) => updateMargin(propKey, "left", value)}
						/>
					</React.Fragment>
				);
		}
	};

	return <div className="optionsInfo">{marginOptionsForCharts()}</div>;
};

const mapStateToProps = (
	state: ChartControlStateProps & TabTileStateProps2 & ChartPropertiesStateProps
) => {
	return {
		chartControl: state.chartControls,
		tabTileProps: state.tabTileProps,
		chartProperties: state.chartProperties,
	};
};

const mapDispatchToProps = (dispatch: Dispatch<any>) => {
	return {
		updateMargin: (propKey: number | string, option: string, value: any) =>
			dispatch(updateChartMargins(propKey, option, value)),
		updateCalendarStyleOptions: (propKey: number | string, option: string, value: any) =>
			dispatch(updateCalendarStyleOptions(propKey, option, value)),
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(ChartMargin);