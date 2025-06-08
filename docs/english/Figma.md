When working with the Figma MCP:

Always join a channel before sending commands
Get document overview using get_document_info first
Check current selection with get_selection before modifications
Use appropriate creation tools based on needs:
create_frame for containers
create_rectangle for basic shapes
create_text for text elements
Verify changes using get_node_info
Use component instances when possible for consistency
Handle errors appropriately as all commands can throw exceptions
For large designs:
Use chunking parameters in scan_text_nodes
Monitor progress through WebSocket updates
Implement appropriate error handling
For text operations:
Use batch operations when possible
Consider structural relationships
Verify changes with targeted exports
For converting legacy annotations:
Scan text nodes to identify numbered markers and descriptions
Use scan_nodes_by_types to find UI elements that annotations refer to
Match markers with their target elements using path, name, or proximity
Categorize annotations appropriately with get_annotations
Create native annotations with set_multiple_annotations in batches
Verify all annotations are properly linked to their targets
Delete legacy annotation nodes after successful conversion
Visualize prototype noodles as FigJam connectors:
Use get_reactions to extract prototype flows,
set a default connector with set_default_connector,
and generate connector lines with create_connections for clear visual flow mapping.
