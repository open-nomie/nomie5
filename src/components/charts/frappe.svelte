<script>
  import FusionCharts from "fusioncharts";
  import Charts from "fusioncharts/fusioncharts.charts";
  import FusionTheme from "fusioncharts/themes/fusioncharts.theme.fusion";
  import SvelteFC, { fcRoot } from "svelte-fusioncharts";

  // Always set FusionCharts as the first parameter
  fcRoot(FusionCharts, Charts, FusionTheme);

  export let title = null;

  //STEP 2 : preparing the chart Data
  const chartData = [
    { label: "Venezuela", value: "290" },
    { label: "Saudi", value: "260" },
    { label: "Canada", value: "180" },
    { label: "Iran", value: "-120" },
    { label: "Russia", value: "115" },
    { label: "UAE", value: "100" },
    { label: "US", value: "30" },
    { label: "China", value: "30" }
  ];

  //STEP 3: Create your configuration object
  const chartConfigs = {
    type: "column2d", //Select the chart type
    width: "100%", //Set the width of the chart
    height: 400, //Set the height of the chart
    dataFormat: "json", //Set the input dataFormat to json
    dataSource: {
      chart: {
        caption: title,
        subCaption: "In MMbbl = One Million barrels",
        xAxisName: "Country", //Assign a relevant name to your x-axis
        yAxisName: "Reserves (MMbbl)", //Assign a relevant name to your y-axis
        numberSuffix: "K",
        theme: "fusion" //Apply a theme to your chart
      },
      //Include chartData from STEP 2
      data: chartData
    }
  };
</script>

<SvelteFC {...chartConfigs} />
