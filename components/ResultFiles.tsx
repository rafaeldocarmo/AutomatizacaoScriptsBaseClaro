 "use client";

import styles from "../app/page.module.css";
import txtIcon from "../app/assets/txt.png";
import downloadIcon from "../app/assets/download.png";
import Image from "next/image";


type Props = {
  insertUrl: string;
  deleteUrl: string;
};

export default function ResultFiles({ insertUrl, deleteUrl }: Props) {
  return (
    <div className={styles.result}>
      <p className={styles.resultInfo}>
        Seus scripts foram gerados. Baixe os arquivos abaixo e utilize-os no banco.
      </p>
      <div className={styles.filesGrid}>
        <FileCard name="insert.txt" href={insertUrl} description="Contém todos os INSERTs gerados." />
        <FileCard name="delete.txt" href={deleteUrl} description="Contém todos os DELETEs gerados." />
      </div>
    </div>
  );
}

function FileCard(props: { name: string; href: string; description: string }) {
  const { name, href, description } = props;
  return (
    <article className={styles.fileCard}>
      <a href={href} download={name}>
      <Image src={txtIcon} alt="Texto" className={styles.fileCardIcon} />
      <div className={styles.fileCardContent}>
        <h3 className={styles.fileName}>{name}</h3>
        <Image src={downloadIcon} alt="Baixar" className={styles.downloadButton} />
      </div>
      </a>
    </article>
  );
}

