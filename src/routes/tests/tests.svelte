<script>
  import ProgressBar from '../../components/progress-bar/progress-bar.svelte'
  import dayjs from 'dayjs'
  import { swipe } from '../../actions/swipe'
  import Avatar from '../../components/avatar/avatar.svelte'

  import ButtonGroup from '../../components/button-group/button-group.svelte'
  import Button from '../../components/button/button.svelte'
  import Calendar from '../../components/calendar/calendar.svelte'
  import DateTime from '../../components/calendar/date-time'
  import Card from '../../components/card/card.svelte'
  import DatePicker from '../../components/date-picker/date-picker.svelte'
  import DateTimeBar from '../../components/date-time-bar/date-time-bar.svelte'
  import Divider from '../../components/divider/divider.svelte'
  import Grid from '../../components/grid/grid.svelte'
  import Icon from '../../components/icon/icon.svelte'
  import Input from '../../components/input/input.svelte'
  import ListItem from '../../components/list-item/list-item.svelte'
  import List from '../../components/list/list.svelte'
  import PositivityBar from '../../components/positivity-bar/positivity-bar.svelte'
  import PositivitySelector from '../../components/positivity-selector/positivity-selector.svelte'
  import Row from '../../components/row/row.svelte'
  import Spinner from '../../components/spinner/spinner.svelte'
  import Sponsors from '../../components/sponsors/sponsors.svelte'
  import Swipeable from '../../components/swipeable/swipeable.svelte'
  import Text from '../../components/text/text.svelte'
  import ToolbarGrid from '../../components/toolbar/toolbar-grid.svelte'
  import Toolbar from '../../components/toolbar/toolbar.svelte'
  import TrackerSmallBlock from '../../components/tracker-small-block/tracker-small-block.svelte'
  import Empty from '../../components/empty/empty.svelte'
  import Layout from '../../containers/layout/layout.svelte'
  import Streak from '../../containers/steak/streak.svelte'
  import Person from '../../modules/person/person'
  import TrackableElement from '../../modules/trackable-element/trackable-element'
  import { Device } from '../../store/device-store'
  import { Interact } from '../../store/interact'
  import ImageCapture from '../../components/image-capture.svelte'
  import FileUploader from '../../components/file-uploader/file-uploader.svelte'

  let date = dayjs()
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
    <Text size="sm" faded className="mb-4">
      A set of base components for quick testing... I should be using Storybook,
      but have yet to do so.
    </Text>

    <List className="p-4 ">

      <FileUploader />

      <ImageCapture />

    </List>

    <List className="p-4 ">

      <ProgressBar percentage={50} />

    </List>

    <List title="Swiper Test">
      <Swipeable
        on:right={() => {
          Interact.alert('Right!', 'You swiped right')
        }}
        on:left={() => {
          Interact.alert('Left!', 'You swiped left')
        }}>
        <div class="p-3 bg-solid text-inverse">Swipe me</div>
        <div slot="left">I'm left</div>
        <div slot="right">I'm right</div>
      </Swipeable>
    </List>

    <List title="Tracker Small Block {$Device.size}" outside pad>
      <Grid columns={['sm', 'xs'].indexOf($Device.size) > -1 ? 2 : 4}>
        <TrackerSmallBlock
          className="m-2"
          element={new TrackableElement({
            id: 'bob',
            type: 'person',
            raw: 'bob',
          })} />
        <TrackerSmallBlock
          className="m-2"
          element={new TrackableElement({
            id: 'bob',
            type: 'person',
            raw: 'bob',
          })} />
        <TrackerSmallBlock
          className="m-2"
          value="44:32:21"
          element={new TrackableElement({
            id: 'chunk',
            type: 'person',
            raw: 'chunk',
          })}
          solo />
        <TrackerSmallBlock
          className="m-2"
          value="$33.234"
          element={new TrackableElement({
            id: 'solo',
            type: 'tracker',
            raw: 'solo',
          })}
          solo />
        <TrackerSmallBlock
          className="m-2"
          value="$33.234"
          element={new TrackableElement({
            id: 'Sanders',
            type: 'person',
            raw: 'Sanders',
          })}
          solo />
      </Grid>
    </List>

    <List title="Title Inset" outside>
      <ListItem clickable>Item 1</ListItem>
      <ListItem clickable>Item 2</ListItem>
    </List>

    <List title="Title Not">
      <ListItem clickable>Item 1</ListItem>
      <ListItem clickable>Item 2</ListItem>
    </List>

    <Card title="Form Elements" className="p-2">
      <Input type="select" label="Option Name">
        <option>Option 1</option>
        <option>Option 2</option>
      </Input>
    </Card>

    <Card title="Sponsors" className="mb-3">
      <Sponsors />
    </Card>

    <Card title="Avatar Emoji" pad className="mb-3">

      <Row className="px-2">
        <Avatar size={50} emoji="🌮🙆" />
        <Avatar size={50} emoji="🧁" />
        <Avatar size={50} emoji="🩰🥈🥇" />
        <Avatar size={50} emoji="BC" />
      </Row>
    </Card>

    <Card title="Avatar Label" pad>
      <Row className="mb-3">
        <Avatar label="Will Reed" size={62} />
        <Avatar label="Bob Ross" size={48} />
        <Avatar label="Frank Mark 3ie" size={36} />
        <Avatar label="Lilly Pilly" size={24} />
        <Avatar label="Dezzy Man" size={20} />
        <Avatar label="Tiny" size={16} />
      </Row>
    </Card>

    <hr class="my-3 divider center" />

    <hr class="my-2 divider center" />

    <Card title="Confetti" className="mb-3" pad>

      <Button
        block
        on:click={() => {
          Interact.confetti({
            title: '🚚 Oh yea!',
            message: 'Nice job my friend!',
            timeout: 5000,
          })
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
        value="A set of base components for quick testing... I should be using
        Storybook, but have yet to do so." />
    </Card>
    <Card title="List Item Inputs" className="mb-3">
      <Input type="text" listItem placeholder="My Label" value="List Item" />
      <Divider inset />
      <Input
        type="text"
        listItem
        placeholder="Phone Number"
        value="444-444-4444" />
      <Divider inset />
      <Input
        type="textarea"
        rows={4}
        listItem
        placeholder="My Label"
        value="List Item" />
    </Card>

    <Card title="Empty" pad>
      <Empty
        title="Nothing Found"
        description="You could do something else"
        emoji="😂" />
    </Card>

    <hr class="my-2 divider center" />

    <Text size="lg" leading3 className="mb-2">Positivity</Text>

    <Card title="Posivity Selector" pad className="mb-3">
      <PositivitySelector size="sm" className="mb-2" />
      <PositivitySelector size="md" className="mb-2" />
      <PositivitySelector size="lg" className="mb-2" />
    </Card>

    <Card title="PositivityBar" pad>
      <PositivityBar size="sm" />
    </Card>

    <hr class="my-2 divider center" />

    <Text size="lg" leading3>Date Time Bar</Text>

    <DatePicker date={dayjs()} className="mb-2" on:change={(evt) => {}} />

    <hr class="my-2 divider center" />

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

    <hr class="my-2 divider center" />

    <Text size="lg" leading3 className="mb-2">Calendar</Text>

    <Card className="mb-2" title="<Calendar />">
      <Calendar />
    </Card>

    <Text size="lg" leading3 className="my-2">Buttons</Text>
    <hr class="my-2 divider center" />
    <Button size="lg">Large Button</Button>
    <hr class="my-2 divider center" />
    <Button size="md" shape="round" color="danger">Medium Button</Button>
    <hr class="my-2 divider center" />
    <Button size="sm">Small Button</Button>
    <hr class="my-2 divider center" />
    <Button size="xs">XSmall Button</Button>
    <hr class="my-2 divider center" />
    <Button block color="light">
      <Spinner size={14} />
      Button Block
    </Button>
    <hr class="my-2 divider center" />
    <div class="flex">
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

    <hr class="my-2 divider" />

    <Button text>Text</Button>
    <Button text size="sm" color="success">Text Sm</Button>
    <Button text size="xs">Text XS</Button>

    <hr class="my-2 divider" />
    <ButtonGroup>
      <Button>Button 0</Button>
      <Button className="active">Button 1</Button>
      <Button>Button 2</Button>
    </ButtonGroup>
  </div>

</Layout>
