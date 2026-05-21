<script>
  let {
    button = null,
    axis = null,
    type = "xbox",
    size = "w-6 h-6",
  } = $props();

  let imagePath = $derived.by(() => {
    const maps = {
      xbox: {
        folder: "Xbox Series",
        prefix: "xbox",
        btns: {
          0: "xbox_button_a",
          1: "xbox_button_b",
          2: "xbox_button_x",
          3: "xbox_button_y",
          4: "xbox_lb",
          5: "xbox_rb",
          6: "xbox_lt",
          7: "xbox_rt",
          8: "xbox_button_view",
          9: "xbox_button_menu",
          10: "xbox_stick_l_press",
          11: "xbox_stick_r_press",
          12: "xbox_dpad_up",
          13: "xbox_dpad_down",
          14: "xbox_dpad_left",
          15: "xbox_dpad_right",
        },
      },
      playstation: {
        folder: "PlayStation Series",
        prefix: "playstation",
        btns: {
          0: "playstation_button_cross",
          1: "playstation_button_circle",
          2: "playstation_button_square",
          3: "playstation_button_triangle",
          4: "playstation_trigger_l1",
          5: "playstation_trigger_r1",
          6: "playstation_trigger_l2",
          7: "playstation_trigger_r2",
          8: "playstation5_button_create",
          9: "playstation5_button_options",
          10: "playstation_stick_l_press",
          11: "playstation_stick_r_press",
          12: "playstation_dpad_up",
          13: "playstation_dpad_down",
          14: "playstation_dpad_left",
          15: "playstation_dpad_right",
        },
      },
      nintendo: {
        folder: "Nintendo Switch 2",
        prefix: "switch",
        btns: {
          0: "switch_button_b",
          1: "switch_button_a",
          2: "switch_button_y",
          3: "switch_button_x",
          4: "switch_button_l",
          5: "switch_button_r",
          6: "switch_button_zl",
          7: "switch_button_zr",
          8: "switch_button_minus",
          9: "switch_button_plus",
          10: "switch_stick_l_press",
          11: "switch_stick_r_press",
          12: "switch_dpad_up",
          13: "switch_dpad_down",
          14: "switch_dpad_left",
          15: "switch_dpad_right",
        },
      },
    };

    const config = maps[type] || maps.xbox;
    let baseName = "xbox_button_a";

    if (button !== null) {
      baseName = config.btns[button] || config.btns[0];
    } else if (axis !== null) {
      const stick = axis.index < 2 ? "stick_l" : "stick_r";
      const isX = axis.index === 0 || axis.index === 2;
      const dir = isX
        ? axis.direction > 0
          ? "right"
          : "left"
        : axis.direction > 0
          ? "down"
          : "up";
      baseName = `${config.prefix}_${stick}_${dir}`;
    }

    const outlines = [
      "xbox_button_a",
      "xbox_button_b",
      "xbox_button_x",
      "xbox_button_y",
      "xbox_lb",
      "xbox_rb",
      "xbox_lt",
      "xbox_rt",
      "xbox_button_view",
      "xbox_button_menu",
      "xbox_dpad_up",
      "xbox_dpad_down",
      "xbox_dpad_left",
      "xbox_dpad_right",
      "playstation_button_cross",
      "playstation_button_circle",
      "playstation_button_square",
      "playstation_button_triangle",
      "playstation_trigger_l1",
      "playstation_trigger_r1",
      "playstation_trigger_l2",
      "playstation_trigger_r2",
      "playstation5_button_create",
      "playstation5_button_options",
      "playstation_dpad_up",
      "playstation_dpad_down",
      "playstation_dpad_left",
      "playstation_dpad_right",
      "switch_button_b",
      "switch_button_a",
      "switch_button_y",
      "switch_button_x",
      "switch_button_l",
      "switch_button_r",
      "switch_button_zl",
      "switch_button_zr",
      "switch_button_minus",
      "switch_button_plus",
      "switch_dpad_up",
      "switch_dpad_down",
      "switch_dpad_left",
      "switch_dpad_right",
    ];

    const suffix = outlines.includes(baseName) ? "_outline" : "";

    return `/assets/kenney_input-prompts_1.4/${config.folder}/Vector/${baseName}${suffix}.svg`;
  });
</script>

<img
  src={imagePath}
  alt="Button"
  class="{size} object-contain select-none"
  style="filter: grayscale(100%) brightness(0) invert(1);"
  draggable="false"
/>
