function drawScatterPlotChart(data) {
  // consts
  const CHART_HEIGHT = 400
  const CHART_WIDTH = 600
  const margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
  }
  const color = d3.scaleOrdinal(d3.schemeSet1)

  const svgContainer = d3
    .select('.chart-container')
    .append('svg')
    .attr('width', CHART_WIDTH)
    .attr('height', CHART_HEIGHT)

  data.forEach((item) => {
    const time = new Date(1970, 0, 1, 0)
    const [minutes, seconds] = item.Time.split(':')

    time.setMinutes(minutes)
    time.setSeconds(seconds)

    item.Time = time
  })

  console.log(data)

  // Make scales
  const xScale = d3
    .scaleLinear()
    .domain([d3.min(data, (d) => d.Year - 1), d3.max(data, (d) => d.Year + 1)])
    .range([margin.left, CHART_WIDTH - margin.right])

  const yScale = d3
    .scaleTime()
    .domain(d3.extent(data, (d) => d.Time))
    .range([margin.top, CHART_HEIGHT - margin.bottom])
    .nice()

  // Make Axis
  const xAxis = d3.axisBottom().scale(xScale).tickFormat(d3.format('d'))
  svgContainer
    .append('g')
    .call(xAxis)
    .attr('transform', `translate(0, ${CHART_HEIGHT - margin.bottom})`)
    .attr('id', 'x-axis')

  const yAxis = d3.axisLeft().tickFormat(d3.timeFormat('%M:%S')).scale(yScale)
  svgContainer
    .append('g')
    .call(yAxis)
    .attr('transform', `translate(${margin.left}, 0)`)
    .attr('id', 'y-axis')
    .append('text')
    .text('Race time (in minutes)')
    .attr('fill', 'black')
    .attr('transform', 'rotate(-90)')
    .attr('y', 6)
    .attr('x', -margin.top)
    .attr('dy', '.5em')

  // make dots
  svgContainer
    .selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('cx', (data) => xScale(data.Year))
    .attr('cy', (data) => yScale(data.Time))
    .attr('r', 5)
    .attr('class', 'dot')
    .attr('data-xvalue', (data) => data.Year)
    .attr('data-yvalue', (data) => data.Time)
    .attr('fill', (data) => color(data.Doping))

  // make legend
  const legContainer = svgContainer.append('g').attr('id', 'legend')

  const legend = legContainer
    .select('#legend')
    .data(color.domain())
    .enter()
    .append('g')
    .attr('class', 'legend-label')
    .attr('transform', (d, i) => `translate(0, ${CHART_HEIGHT / 2 - i * 20})`)

  // make legend squares
  legend
    .append('rect')
    .attr('x', CHART_WIDTH - 18)
    .attr('width', 18)
    .attr('height', 18)
    .style('fill', color)

  // make legend text
  legend
    .append('text')
    .attr('x', CHART_WIDTH - 24)
    .attr('y', 9)
    .attr('dy', '.35em')
    .text((d) => (d ? 'Riders with alleged doping' : 'No doping'))
}

async function getData() {
  const req = await fetch(
    'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json'
  )
  const res = await req.json()

  return res
}

getData()
  .then((data) => drawScatterPlotChart(data))
  .catch(console.error)
