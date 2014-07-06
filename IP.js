var getindex = function(ip)
{
		var [] o = ip.split("\\.");
	//	System.out.println(o[0]+" "+o[1]+" "+o[2]+" "+o[3]);
		Long integer_ip =   ( 16777216 * parseInt(o[0]))
				             + ( 65536 * parseInt(o[1]))
				             + ( 256 * parseInt(o[2]))
				             + parseInt(o[3]);
		
		for(int i =0;i<N;i++)
		{
		//	System.out.println(i);
			if(integer_ip>=left[i]&&integer_ip<=right[i])
			{
				return i;
			}
		}
		return  20925;
}