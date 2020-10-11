<script>
  import dayjs from "dayjs";

  import ButtonGroup from "../../components/button-group/button-group.svelte";
  import Button from "../../components/button/button.svelte";
  import Calendar from "../../components/calendar/calendar.svelte";
  import DateTime from "../../components/calendar/date-time";
  import Card from "../../components/card/card.svelte";
  import DateTimeBar from "../../components/date-time-bar/date-time-bar.svelte";
  import Icon from "../../components/icon/icon.svelte";
  import Text from "../../components/text/text.svelte";
  import ToolbarGrid from "../../components/toolbar/toolbar-grid.svelte";
  import Toolbar from "../../components/toolbar/toolbar.svelte";
  import Layout from "../../containers/layout/layout.svelte";
  import Streak from "../../containers/steak/streak.svelte";

  let date = dayjs();
</script>

<Layout>

  <header slot="header">
    <ToolbarGrid>
      <div slot="main">
        <Text bold center>Nomie UI Test</Text>
      </div>
    </ToolbarGrid>
  </header>

  <div class="p-4">
    <Text size="sm" faded>A set of base components for quick testing... I should be using Storybook, but have yet to do so.</Text>

    <hr class="divider center my-2" />

    <Text size="lg" leading3>Date Time Bar</Text>

    <DateTimeBar
      opened
      style="padding:0px;"
      bind:date
      on:change={(evt) => {
        console.log('New Date', evt.detail.format('ddd MMM Do YYYY hh:mm a'));
      }} />

    <hr class="divider center my-2" />

    <Text size="lg" leading3 className="mb-2">Streaks</Text>

    <Card pad className="mb-2" title="Streak Week">
      <Streak term="#mood" view="week" />
    </Card>
    <Card pad className="mb-2" title="Streak Month & Quater">
      <Streak term="#mood" />
      <Streak term="#mood" view="quarter" />
    </Card>
    <Card pad className="mb-2" title="Streak Year">
      <Streak term="#mood" view="year" />
    </Card>
    <!-- <Streak term="#cider" view="quarter" />
    <Streak term="#sleep OR #mood" view="year" /> -->

    <hr class="divider center my-2" />

    <Text size="lg" leading3 className="mb-2">Calendar</Text>

    <Card className="mb-2" title="<Calendar />">
      <Calendar />
    </Card>

    <Text size="lg" leading3 className="my-2">Buttons</Text>
    <hr class="divider center my-2" />
    <Button size="lg">Large Button</Button>
    <hr class="divider center my-2" />
    <Button size="md" shape="round" color="danger">Medium Button</Button>
    <hr class="divider center my-2" />
    <Button size="sm">Small Button</Button>
    <hr class="divider center my-2" />
    <Button size="xs">XSmall Button</Button>
    <hr class="divider center my-2" />
    <Button block>Button Block</Button>
    <hr class="divider center my-2" />
    <div class="n-row">
      <Button icon className="mr-2" color="primary">
        <Icon name="chevronUp" />
      </Button>
      <Button size="sm" icon className="mr-2">
        <Icon name="chevronUp" />
      </Button>
      <Button size="xs" shape="circle" color="dark" className="mr-2">
        <Icon name="chevronUp" />
      </Button>
      <Button size="xs" shape="circle" color="light" className="mr-2">
        <Icon name="chevronUp" />
      </Button>
      <Button size="sm" shape="circle" color="danger" className="mr-2">
        <Icon name="chevronUp" />
      </Button>
      <Button size="md" shape="circle" color="success" className="mr-2">
        <Icon name="chevronUp" />
      </Button>
      <Button size="lg" shape="circle" color="orange" className="mr-2">
        <Icon name="chevronUp" />
      </Button>
    </div>

    <hr class="divider my-2" />

    <Button text>Text</Button>
    <Button text size="sm" color="success">Text Sm</Button>
    <Button text size="xs">Text XS</Button>

    <hr class="divider my-2" />
    <ButtonGroup>
      <Button>Button 0</Button>
      <Button className="active">Button 1</Button>
      <Button>Button 2</Button>
    </ButtonGroup>
  </div>

</Layout>
