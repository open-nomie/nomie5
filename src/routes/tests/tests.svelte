<script>
  import dayjs from "dayjs";
  import Avatar from "../../components/avatar/avatar.svelte";

  import ButtonGroup from "../../components/button-group/button-group.svelte";
  import Button from "../../components/button/button.svelte";
  import Calendar from "../../components/calendar/calendar.svelte";
  import DateTime from "../../components/calendar/date-time";
  import Card from "../../components/card/card.svelte";
  import DatePicker from "../../components/date-picker/date-picker.svelte";
  import DateTimeBar from "../../components/date-time-bar/date-time-bar.svelte";
  import Divider from "../../components/divider/divider.svelte";
  import Icon from "../../components/icon/icon.svelte";
  import Input from "../../components/input/input.svelte";
  import PositivityBar from "../../components/positivity-bar/positivity-bar.svelte";
  import PositivitySelector from "../../components/positivity-selector/positivity-selector.svelte";
  import Row from "../../components/row/row.svelte";
  import Spinner from "../../components/spinner/spinner.svelte";
  import Text from "../../components/text/text.svelte";
  import ToolbarGrid from "../../components/toolbar/toolbar-grid.svelte";
  import Toolbar from "../../components/toolbar/toolbar.svelte";
  import Empty from "../../containers/empty/empty.svelte";
  import Layout from "../../containers/layout/layout.svelte";
  import Streak from "../../containers/steak/streak.svelte";
  import { Device } from "../../store/device-store";
  import { Interact } from "../../store/interact";

  let date = dayjs();
</script>

<Layout>

  <header slot="header">
    <ToolbarGrid>
      <div slot="main">
        <Text bold center>Nomie UI Test {$Device.platform}</Text>
      </div>
    </ToolbarGrid>
  </header>

  <div class="p-4">
    <Text size="sm" faded>A set of base components for quick testing... I should be using Storybook, but have yet to do so.</Text>

    <hr class="divider center my-2" />

    <Card title="Confetti" className="mb-3" pad>

      <Button
        block
        on:click={() => {
          Interact.confetti({ title: '🚚 Oh yea!', message: 'Nice job my friend!', timeout: 5000 });
        }}>
        Test
      </Button>

    </Card>

    <Card title="Inputs" pad className="mb-3">
      <Input type="text" placeholder="My Label" value="Normal" />
      <Input type="text" solo placeholder="My Label" value="Solo" />
      <Input
        type="textarea"
        rows="2"
        solo
        placeholder="My Label"
        label="Textarea"
        value="A set of base components for quick testing... I should be using Storybook, but have yet to do so." />
    </Card>
    <Card title="List Item Inputs" className="mb-3">
      <Input type="text" listItem placeholder="My Label" value="List Item" />
      <Divider inset />
      <Input type="text" listItem placeholder="Phone Number" value="444-444-4444" />
      <Divider inset />
      <Input type="textarea" rows={4} listItem placeholder="My Label" value="List Item" />
    </Card>

    <Card title="Empty" pad>
      <Empty title="Nothing Found" description="You could do something else" emoji="😂" />
    </Card>

    <hr class="divider center my-2" />

    <Card title="Avatar" pad>

      <Row className="mb-3">
        <Avatar label="Brandon Corbin" size={70} />
        <Avatar label="Brandon Corbin" size={32} />
        <Avatar label="Brandon Corbin" size={24} />
        <Avatar label="Brandon Corbin" size={16} />
      </Row>

      <Row className="mb-3">
        <Avatar emoji="🥳" size={70} />
        <Avatar emoji="🥳" size={32} />
        <Avatar emoji="🥳" size={24} />
        <Avatar emoji="🥳" size={16} />
      </Row>

      <Row>
        <Avatar src="https://placehold.it/60x60" size={70} />
        <Avatar src="https://placehold.it/60x60" size={32} />
        <Avatar src="https://placehold.it/60x60" size={24} />
        <Avatar src="https://placehold.it/60x60" size={16} />
      </Row>

    </Card>

    <hr class="divider center my-3" />

    <Text size="lg" leading3 className="mb-2">Positivity</Text>

    <Card title="Posivity Selector" pad className="mb-3">
      <PositivitySelector size="sm" className="mb-2" />
      <PositivitySelector size="md" className="mb-2" />
      <PositivitySelector size="lg" className="mb-2" />
    </Card>

    <Card title="PositivityBar" pad>
      <PositivityBar size="sm" />
    </Card>

    <hr class="divider center my-2" />

    <Text size="lg" leading3>Date Time Bar</Text>

    <DatePicker date={dayjs()} className="mb-2" on:change={(evt) => {}} />

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
    <Button block color="light">
      <Spinner size="14" />
      Button Block
    </Button>
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
