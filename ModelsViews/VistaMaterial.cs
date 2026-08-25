namespace ApiMateriales2026MaximilianoRojas.ModelsViews
{
    public class VistaMaterial
    {
        public int MaterialID { get; set;}
        public string? Descripcion {get; set;}
        public int RubroID {get; set;}
        public string? RubroNombre {get; set;}
        public decimal PrecioCosto {get; set;}
        public bool Eliminado {get; set;}
    }
}