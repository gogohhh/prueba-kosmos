import React, { useRef, useState, useEffect } from "react";
import Moveable from "react-moveable";

const App = () => {
  const [images, setImages] = useState([]);
  const [moveableComponents, setMoveableComponents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [randomimage, setRandomImage] = useState()

  const addMoveable = () => {
    // Create a new moveable component and add it to the array
    const COLORS = ["red", "blue", "yellow", "green", "purple"];
    var num = Math.random() * (1000 - 1)
    num = Math.floor(num)
    setRandomImage(images[num].url) //Seteamos la url de la imagen random
    setMoveableComponents([
      ...moveableComponents,
      {
        id: Math.floor(Math.random() * Date.now()),
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        updateEnd: true,
        urlimage: images[num].url
      },
    ]);
  };

  //Funcion para eliminar el componente seleccionado
  const deleteMoveable = () => {
    //Advertencia si no se selecciona ningun componente
    if (!selected || selected === null) {
      alert("Seleccione el componente que quiere eliminar");
      return;
    }
    const updatedMoveables = moveableComponents.filter(
      (moveable) => moveable.id !== selected
    );
    setMoveableComponents(updatedMoveables);
  };

  //Funcion para mover el componente dentro del contenedor
  const updateMoveable = (id, newComponent, updateEnd = false) => {
    const updatedMoveables = moveableComponents.map((moveable, i) => {
      if (moveable.id === id) {
        return { id, ...newComponent, updateEnd };
      }
      return moveable;
    });
    setMoveableComponents(updatedMoveables);
  };

  //Funcion para redimensionar el componente
  const handleResizeStart = (index, e) => {
    console.log("e", e.direction);
    // Check if the resize is coming from the left handle
    const [handlePosX, handlePosY] = e.direction;
    // 0 => center
    // -1 => top or left
    // 1 => bottom or right

    // -1, -1
    // -1, 0
    // -1, 1
    if (handlePosX === -1) {
      console.log("width", moveableComponents, e);
      // Save the initial left and width values of the moveable component
      const initialLeft = e.left;
      const initialWidth = e.width;

      // Set up the onResize event handler to update the left value based on the change in width
    }
  };

  //Funcion para obtener las imagenes de la api
  const getImages = async () => {
    try {
    const data = await fetch('https://jsonplaceholder.typicode.com/photos')
      .then(response => response.json())
      setImages(data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getImages();
  }, []);

  return (
    <main style={{ height : "100vh", width: "100vw" }}>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px'
      }}>
        <button style={
          {
            marginRight: '20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)',
            textTransform: 'uppercase',
            fontWeight: 'bold',
            padding: '16px 32px',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
          }
        } onClick={addMoveable}>Add Moveable</button>
        <button style={{
            marginRight: '20px',
            backgroundColor: '#FA1010',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)',
            textTransform: 'uppercase',
            fontWeight: 'bold',
            padding: '16px 32px',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
          }} onClick={deleteMoveable}>Delete Moveable</button>
      </div>
      <div
        id="parent"
        style={{
          marginTop: "20px",
          position: "relative",
          background: "black",
          height: "80vh",
          width: "80vw",
          margin: "0 auto",
        }}
      >
        {moveableComponents.map((item, index) => (
          <Component
            {...item}
            key={index}
            updateMoveable={updateMoveable}
            handleResizeStart={handleResizeStart}
            setSelected={setSelected}
            isSelected={selected === item.id}
            imagenseteada={randomimage}
          />
        ))}
      </div>
    </main>
  );
};

export default App;

const Component = ({
  updateMoveable,
  top,
  left,
  width,
  height,
  index,
  color,
  id,
  setSelected,
  isSelected = false,
  updateEnd,
  imagenseteada,
}) => {
  const ref = useRef();

  const [nodoReferencia, setNodoReferencia] = useState({
    top,
    left,
    width,
    height,
    index,
    color,
    id,
  });

  let parent = document.getElementById("parent");
  let parentBounds = parent?.getBoundingClientRect();
  
  const onResize = async (e) => {
    // ACTUALIZAR ALTO Y ANCHO
    let newWidth = e.width;
    let newHeight = e.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    updateMoveable(id, {
      top,
      left,
      width: newWidth,
      height: newHeight,
      color,
    });

    // ACTUALIZAR NODO REFERENCIA
    const beforeTranslate = e.drag.beforeTranslate;

    ref.current.style.width = `${e.width}px`;
    ref.current.style.height = `${e.height}px`;

    let translateX = beforeTranslate[0];
    let translateY = beforeTranslate[1];

    ref.current.style.transform = `translate(${translateX}px, ${translateY}px)`;

    setNodoReferencia({
      ...nodoReferencia,
      translateX,
      translateY,
      top: top + translateY < 0 ? 0 : top + translateY,
      left: left + translateX < 0 ? 0 : left + translateX,
    });
  };

  const onResizeEnd = async (e) => {
    let newWidth = e.lastEvent?.width;
    let newHeight = e.lastEvent?.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    const { lastEvent } = e;
    const { drag } = lastEvent;
    const { beforeTranslate } = drag;

    const absoluteTop = top + beforeTranslate[1];
    const absoluteLeft = left + beforeTranslate[0];

    updateMoveable(
      id,
      {
        top: absoluteTop,
        left: absoluteLeft,
        width: newWidth,
        height: newHeight,
        color,
      },
      true
    );
  };

  return (
    <>
      <div
        ref={ref}
        className="draggable"
        id={"component-" + id}
        style={{
          position: "absolute",
          top: top,
          left: left,
          width: width,
          height: height,
          backgroundImage: `url(${imagenseteada})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          //background: color,
        }}
        onClick={() => setSelected(id)}
      />

      <Moveable
        target={isSelected && ref.current}
        resizable
        draggable
        onDrag={(e) => {
          updateMoveable(id, {
            top: e.top,
            left: e.left,
            width,
            height,
            color,
          });
        }}
        onResize={onResize}
        onResizeEnd={onResizeEnd}
        keepRatio={false}
        throttleResize={1}
        renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
        edge={false}
        zoom={1}
        origin={false}
        padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
      >
      </Moveable>
    </>
  );
};
