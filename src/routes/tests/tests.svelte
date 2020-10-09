<script>
  import ButtonGroup from "../../components/button-group/button-group.svelte";
  import Button from "../../components/button/button.svelte";
  import Icon from "../../components/icon/icon.svelte";
  import Text from "../../components/text/text.svelte";
</script>

<div class="p-4">
  <Text size="lg">UI Tests</Text>
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
