import 'dart:math';

import 'package:cycletowork/src/data/chart_data.dart';
import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:intl/intl.dart';


enum ChartType {
  co2,
  distance,
  speed,
  altitude,
}

enum ChartScaleType {
  week,
  month,
  year,
  time,
}

class Chart extends StatelessWidget {
  final ChartType type;
  final ChartScaleType scaleType;
  final double height;
  final List<ChartData> chartData;

  const Chart({
    super.key,
    this.height = 130,
    required this.type,
    required this.chartData,
    required this.scaleType,
  });

  get minXValue =>
      chartData.isNotEmpty ? chartData.map((point) => point.x).reduce(min) : 0;

  get maxXValue =>
      chartData.isNotEmpty ? chartData.map((point) => point.x).reduce(max) : 0;

  get maxYValue =>
      chartData.isNotEmpty ? chartData.map((point) => point.y).reduce(max) : 0;

  FlGridData get gridData =>
      const FlGridData(show: true, drawVerticalLine: false);

  LineTouchData get lineTouchData1 => LineTouchData(
        handleBuiltInTouches: true,
        touchTooltipData: LineTouchTooltipData(
          getTooltipColor: (touchedSpot) => Colors.blueGrey.withOpacity(0.8),
        ),
      );

  String formatXAxis(double value, TitleMeta meta) {
    // x axis is time values
    if (type == ChartType.speed || type == ChartType.altitude) {
      if (value % meta.appliedInterval == 0) {
        var date = DateTime.fromMillisecondsSinceEpoch(value.ceil());
        return DateFormat.Hm().format(date);
      }
      return "";
    }
    switch (scaleType) {
      case ChartScaleType.week:
        if (value == 0) {
          return "L";
        } else if (value == 1) {
          return "M";
        } else if (value == 2) {
          return "M";
        } else if (value == 3) {
          return "G";
        } else if (value == 4) {
          return "V";
        } else if (value == 5) {
          return "S";
        } else if (value == 6) {
          return "D";
        }
        return "L";

      case ChartScaleType.month:
        return 'S ${(value + 1).toStringAsFixed(0)}';

      case ChartScaleType.year:
        if (value == 0) {
          return "G";
        } else if (value == 1) {
          return "F";
        } else if (value == 2) {
          return "M";
        } else if (value == 3) {
          return "A";
        } else if (value == 4) {
          return "M";
        } else if (value == 5) {
          return "G";
        } else if (value == 6) {
          return "L";
        } else if (value == 7) {
          return "A";
        } else if (value == 8) {
          return "S";
        } else if (value == 9) {
          return "O";
        } else if (value == 10) {
          return "N";
        } else if (value == 11) {
          return "D";
        }
        return "";
      case ChartScaleType.time:
        return value.toString();
    }
  }

  FlTitlesData get titlesData => FlTitlesData(
        bottomTitles: AxisTitles(
          sideTitles: SideTitles(
            showTitles: true,
            reservedSize: 32,
            getTitlesWidget: (value, meta) {
              var formattedValue = formatXAxis(value, meta);
              return SideTitleWidget(
                axisSide: meta.axisSide,
                child: Text(
                  formattedValue,
                ),
              );
            },
          ),
        ),
        rightTitles: const AxisTitles(
          sideTitles: SideTitles(showTitles: false),
        ),
        topTitles: const AxisTitles(
          sideTitles: SideTitles(showTitles: false),
        ),
        leftTitles: const AxisTitles(
          sideTitles: SideTitles(
            showTitles: true,
            reservedSize: 48,
          ),
        ),
      );

  FlBorderData get borderData => FlBorderData(
        show: true,
        border: const Border(
          bottom: BorderSide(color: Colors.blue, width: 4),
          left: BorderSide(color: Colors.transparent),
          right: BorderSide(color: Colors.transparent),
          top: BorderSide(color: Colors.transparent),
        ),
      );

  List<FlSpot> get spots =>
      chartData.map((element) => FlSpot(element.x, element.y)).toList();

  LineChartBarData get lineBarsData1 => LineChartBarData(
        isCurved: false,
        color: Colors.black,
        barWidth: 4,
        isStrokeCapRound: true,
        dotData: const FlDotData(show: false),
        belowBarData: BarAreaData(show: false),
        spots: spots,
      );

  LineChartData get data => LineChartData(
        lineTouchData: lineTouchData1,
        gridData: gridData,
        titlesData: titlesData,
        borderData: borderData,
        lineBarsData: [lineBarsData1],
      );

  Widget leftTitleWidgets(double value, TitleMeta meta) {
    const style = TextStyle(
      fontWeight: FontWeight.bold,
      fontSize: 14,
    );

    if (maxYValue == 0) {
      return Container();
    }

    var text = "${value.floor()}";

    return Text(text, style: style, textAlign: TextAlign.center);
  }

  SideTitles leftTitles() => SideTitles(
        getTitlesWidget: leftTitleWidgets,
        showTitles: true,
        // interval: 1,
        reservedSize: 40,
      );

  @override
  Widget build(BuildContext context) {
    return AspectRatio(
      aspectRatio: 1.23,
      child: Stack(
        children: <Widget>[
          Column(
            children: <Widget>[
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: LineChart(
                    data,
                    curve: Curves.ease,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

/*
  @override
  Widget build(BuildContext context) {
    var scale = context.read<AppData>().scale;
    var maxValue =
        chartData.isNotEmpty ? chartData.map((x) => x.y).reduce(max) : 0;

    if (type == ChartType.speed || type == ChartType.altitude) {
      return SizedBox(
        height: height * scale,
        child: charts.TimeSeriesChart(
          _getChatTimeSeriesList(context, chartData, type),
          animate: true,
          defaultRenderer: charts.LineRendererConfig(
            includePoints: true,
            includeArea: true,
            includeLine: true,
            roundEndCaps: true,
            stacked: true,
          ),
          primaryMeasureAxis: charts.NumericAxisSpec(
            tickProviderSpec: const charts.BasicNumericTickProviderSpec(
              desiredMinTickCount: 3,
              dataIsInWholeNumbers: false,
            ),
            viewport: type == ChartType.speed
                ? charts.NumericExtents(0, max(60, maxValue.ceil() + 10))
                : const charts.NumericExtents(0, 1000),
          ),
          //   domainAxis: charts.NumericAxisSpec(
          //   tickProviderSpec: charts.BasicNumericTickProviderSpec(
          //     desiredTickCount: scaleType == ChartScaleType.week
          //         ? 7
          //         : scaleType == ChartScaleType.month
          //             ? 4 // (dayOfMonth / 7).toInt()
          //             : 12,
          //   ),
          //   tickFormatterSpec: formatterY,
          // ),
          customSeriesRenderers: [
            charts.PointRendererConfig(
              customRendererId: 'customPoint',
            ),
          ],
          dateTimeFactory: const charts.LocalDateTimeFactory(),
        ),
      );
    }

    return SizedBox(
      height: height * scale,
      child: charts.LineChart(
        _getChatSeriesList(context, chartData, type),
        animate: true,
        defaultRenderer: charts.LineRendererConfig(
          includePoints: true,
          includeArea: true,
          includeLine: true,
          roundEndCaps: true,
          stacked: true,
        ),
        primaryMeasureAxis: charts.NumericAxisSpec(
          tickProviderSpec: const charts.BasicNumericTickProviderSpec(
            desiredMinTickCount: 3,
            dataIsInWholeNumbers: false,
          ),
          viewport: type == ChartType.co2
              ? charts.NumericExtents(0.0, maxValue.ceil() + 1)
              : charts.NumericExtents(0, max(60, maxValue.ceil() + 10)),
        ),
        domainAxis: charts.NumericAxisSpec(
          tickProviderSpec: charts.BasicNumericTickProviderSpec(
            desiredTickCount: scaleType == ChartScaleType.week
                ? 7
                : scaleType == ChartScaleType.month
                    ? 4 // (dayOfMonth / 7).toInt()
                    : 12,
          ),
          tickFormatterSpec: formatterY,
        ),
      ),
    );
  }

  List<charts.Series<dynamic, num>> _getChatSeriesList(
    BuildContext context,
    List<ChartData> chartData,
    ChartType type,
  ) {
    var secondaryColor = Theme.of(context).colorScheme.secondary;
    final colorSchemeExtension =
        Theme.of(context).extension<ColorSchemeExtension>()!;
    final successColor = colorSchemeExtension.success;

    final color = type == ChartType.co2 ? secondaryColor : successColor;

    return [
      charts.Series<ChartData, int>(
        id: 'chart$type',
        colorFn: (_, __) => charts.Color(
          r: color.red,
          g: color.green,
          b: color.blue,
        ),
        domainFn: (ChartData sales, _) => sales.x,
        measureFn: (ChartData sales, _) => sales.y,
        data: chartData,
      ),
    ];
  }

  List<charts.Series<dynamic, DateTime>> _getChatTimeSeriesList(
    BuildContext context,
    List<ChartData> chartData,
    ChartType type,
  ) {
    var secondaryColor = Theme.of(context).colorScheme.secondary;
    final colorSchemeExtension =
        Theme.of(context).extension<ColorSchemeExtension>()!;
    final successColor = colorSchemeExtension.success;

    final color = type == ChartType.speed ? secondaryColor : successColor;

    return [
      charts.Series<ChartData, DateTime>(
        id: 'chart$type',
        colorFn: (_, __) => charts.Color(
          r: color.red,
          g: color.green,
          b: color.blue,
        ),
        domainFn: (ChartData sales, _) => sales.x,
        measureFn: (ChartData sales, _) => sales.y,
        data: chartData,
      ),
    ];
  }
  */
}
