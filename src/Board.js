import React from 'react';
import './Board.css';
import classnames from 'classnames';

// timing constants

// how often bases update - eventually should be once/minute?
const BASE_TICK_INTERVAL = 500;

// how often mines update - eventually once every five minutes?
const MINE_TICK_INTERVAL = BASE_TICK_INTERVAL * 5;

class Board extends React.Component{
  constructor (props) {
    super(props);
    this.state = {
      selectedNodeId: null,
      playerPoints: 0,
      playerMPH: 6.0,
      board: [
        {
          name: "Cool Base 1",
          drillers: 0,
          isMine: false,
          isPlayerControlled: true,
          index: 0,
        }, null, null, null, null, null, null, null,
        null, null, null, null, null, null, null, null,
        null, null, null, null, null, null, null, null,
        null, null, null, null, {
          name: "Cool Base 2",
          drillers: 0,
          isMine: false,
          isPlayerControlled: false,
          index: 28,
        }, null, null, null,
        null, null, null, null, null, null, null, null,
        null, null, null, null, null, null, {
          name: "Cool Base 3",
          drillers: 0,
          isMine: false,
          isPlayerControlled: false,
          index: 46,
        }, null,
        null, null, null, null, null, null, null, null,
        null, {
          name: "Cool Base 4",
          drillers: 0,
          isMine: false,
          isPlayerControlled: false,
          index: 57,
        }, null, null, null, null, null, null,
      ]
    }
  }

  selectNode = number => {
    console.log("number", number)
    this.setState({
      selectedNodeId: number,
    })
  }

  onTick = baseIndex => {
    let newBoard = this.state.board;
    let updatedBase = newBoard[baseIndex];
    updatedBase.drillers += 1;
    newBoard[baseIndex] = updatedBase;
    this.setState({
      board: newBoard,
    })
  }

  onMineTick = () => {
    this.setState({
      playerPoints: this.state.playerPoints + 1,
    })
  }

  renderRow = rowNumber => {
    let row=[];
    for (let i=0; i<=7; i++) {
      const index = (rowNumber * 8) + i;
      if (this.state.board[index]) {
        const base = this.state.board[index];
        row.push(
          <Node
            key={index}
            onClick={() => this.selectNode(index)}
            selected={index === this.state.selectedNodeId}
            boosted={index === this.state.selectedNodeId}
            onTick={() => this.onTick(index)}
            onMineTick={this.onMineTick}
            playerMPH={this.state.playerMPH}
            rowNumber={index}
            playerControlled={base.isPlayerControlled}
            isMine={base.isMine}
            drillers={base.drillers}
          />
        )
      } else {
        row.push(
          <div className="water" />
        )
      }
    }
    return <div key={rowNumber} className="chess_row">{row}</div>
  }

  renderSidebar = () => {
    const selectedBase = this.state.board[this.state.selectedNodeId] || {};
    return (
      <div className="sidebar">
        <div>
          PLAYER POINTS: {this.state.playerPoints}
          {selectedBase.name}
        </div>
        {this.renderMineButton(selectedBase)}
        {this.renderAttackButtons(selectedBase)}
      </div>
    )
  }

  renderMineButton = base => {
    if (base.isMine) return;
    return (
      <button
        onClick={() => this.makeMine(base.index)}
        disabled={base.drillers < 20}
      >
        MAKE MINE
      </button>
    );
  }

  makeMine = baseIndex => {
    let newBoard = this.state.board;
    let updatedBase = newBoard[baseIndex];
    updatedBase.drillers -= 20;
    updatedBase.isMine = true;
    newBoard[baseIndex] = updatedBase;
    this.setState({
      board: newBoard,
    })
  }

  renderAttackButtons = base => {
    return `ATTACK BUTTONS FOR ${base.name}`
  }

  render() {
   let rows = []
   for(var i=0;i<=7;i++){
     rows.push(
        this.renderRow(i)
      )
   }
   return (
    <div className="container">
      <div className="chess_board">
        {rows}
      </div>
      {this.renderSidebar()}
    </div>
   );
  }
}

class Node extends React.Component {

  componentDidMount = () => {
    if (this.props.playerControlled || this.props.opponentControlled) {
      // generate points if the mine is controlled
      if (this.props.isMine) {
        if (this.props.boosted) {
          // increase production if the node is being boosted
          this.timerId = setInterval(this.props.onMineTick, MINE_TICK_INTERVAL / 2);
        } else {
          this.timerId = setInterval(this.props.onMineTick, MINE_TICK_INTERVAL);
        }
      } else {
        // produce drillers if the node is controlled
        if (this.props.boosted) {
          // increase production if the node is being boosted
          this.timerId = setInterval(this.props.onTick, BASE_TICK_INTERVAL / 2);
        } else {
          this.timerId = setInterval(this.props.onTick, BASE_TICK_INTERVAL);
        }
      }
    }
  }

  componentWillReceiveProps = nextProps => {
    if (nextProps.playerControlled || nextProps.opponentControlled) {
      // if the node is changing boosted or mine status,
      // clear and reset the timer
      if (
        this.props.boosted !== nextProps.boosted ||
        this.props.isMine !== nextProps.isMine
        ) {
        clearInterval(this.timerId);
        if (nextProps.boosted) {
          // the node is boosted - ticks are accelerated
          this.timerId = nextProps.isMine ?
            this.timerId = setInterval(this.props.onMineTick, MINE_TICK_INTERVAL / 2) :
            this.timerId = setInterval(this.props.onTick, BASE_TICK_INTERVAL / 2)
        } else {
          // the node is not boosted, ticks are at normal pace
          this.timerId = nextProps.isMine ?
            this.timerId = setInterval(this.props.onMineTick, MINE_TICK_INTERVAL) :
            this.timerId = setInterval(this.props.onTick, BASE_TICK_INTERVAL)
        }
      }
    }
  }

  render() {
    return (
      <div
        className={classnames({
          node: true,
          selected: this.props.selected,
          playerControlled: this.props.playerControlled,
          opponentControlled: this.props.opponentControlled,
          mine: this.props.isMine,
        })}
        onClick={this.props.onClick}>
        {this.props.drillers}
      </div>
    )
  }
}

export default Board;